from PyPDF2 import PdfReader
from sklearn.metrics.pairwise import cosine_similarity
from langchain.text_splitter import RecursiveCharacterTextSplitter
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from bs4 import BeautifulSoup 
import pickle
import heapq
import os
import numpy as np
import requests
from app import db, Vector



##################################################################
##################################################################

def create_index(file_stream):
    #controling if file_stream is not empty 
    if file_stream.getbuffer().nbytes == 0:
        raise ValueError("The uploaded file is empty")
    

    #reding file_stream and dividing to paragraphs
    pdf_file_reader = PdfReader(file_stream)
    text = ""
    for page in pdf_file_reader.pages:
        text += page.extract_text()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=200,
        length_function=len,
        add_start_index=True,
    )
    paragraphs = splitter.split_text(text)
    #print(f"{paragraphs} paragrafy z create index ")  
    
    #training vectorizeru on to  paragraphs
    documents = [TaggedDocument(doc.split(), [i]) for i, doc in enumerate(paragraphs)]
    
    #loding existing model, if it exists 
    if os.path.exists('vectorizer.pkl'):
        with open('vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)
            vectorizer.build_vocab(documents, update=True)
    else:
        vectorizer = Doc2Vec(vector_size=5, window=2, min_count=1, workers=4)
        vectorizer.build_vocab(documents)

    vectorizer.train(documents, total_examples=vectorizer.corpus_count, epochs=vectorizer.epochs)

    #joining keys into one array 
    index = {}
    for i in range(len(documents)):
        index[i] = vectorizer.infer_vector(documents[i].words)

    #saving vectorizer
    with open('vectorizer.pkl', 'wb') as f: 
        pickle.dump(vectorizer, f)

    return index, paragraphs

def create_index_web(url):
    web = requests.get(url)
    if web.status_code == 200:
        soup = BeautifulSoup(web.text, 'html.parser')

        text = ""
        for p in soup.find_all('p'):
            text += p.text

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=200,
            length_function=len,
            add_start_index=True,
        )
        paragraphs = splitter.split_text(text)

        documents = [TaggedDocument(doc.split(), [i]) for i, doc in enumerate(paragraphs) if doc is not None]

        #loading existing model, if it exist 
        if os.path.exists('vectorizer.pkl'):
            with open('vectorizer.pkl', 'rb') as f:
                vectorizer = pickle.load(f)
                vectorizer.build_vocab(documents, update=True)
        else:
            vectorizer = Doc2Vec(vector_size=5, window=2, min_count=1, workers=4)
            vectorizer.build_vocab(documents)

        vectorizer.train(documents, total_examples=vectorizer.corpus_count, epochs=vectorizer.epochs)

        #joining keys into one array  
        index = {}
        for i in range(len(documents)):
            index[i] = vectorizer.infer_vector(documents[i].words)

        #saving vectorizer
        with open('vectorizer.pkl', 'wb') as f: 
            pickle.dump(vectorizer, f)

        return index, paragraphs


##################################################################

#1) devolve query on to the vector
def search(query, index_list, vectorizer):
    #contoling if vectorizer is not trained 
    if vectorizer is None:
        raise ValueError("Vectorizer is not initialized.")
    
    #devolve query on to the vektor
    prompt_vector = vectorizer.infer_vector(query.split())

    #Getting similiratis and averege with index
    similarities = {}
    for index_dict in index_list:
        for i, vector in index_dict.items():
            sim = cosine_similarity([prompt_vector], [vector])
            similarities[i] = sim[0][0]

    #Getting 3 most similiar index
    most_similar = heapq.nlargest(3, similarities, key=similarities.get)
    return most_similar

#2) find paragraphs in the text (its not used)
def get_paragraph(index, paragraphs):
    for i in range(len(paragraphs[0])):
        if index < len(paragraphs[0][i]):
            return paragraphs[0][i][index]
    raise IndexError(f"Index {index} out of range. delka par: {len(paragraphs[0])}")

    
##################################################################
####   called funcions   ####
##################################################################

#converting pdf conten in to the vectors

#zde je error out of index nejspíše je to problém  s vektorizrem protože jeden nahraný soubor funguje
def vektor_pdf(file_stream, filename, current_season_id, current_user, now):
    #Adding contol if the same file is not in database 
    if Vector.query.filter_by(name=filename).first():
        return 'Same_file'
    else:
        index, paragraphs = create_index(file_stream)  


        #serializaci dat (converting data on to binary form)
        binary_data = pickle.dumps(index) 

        #sending data to the database
        new_vector = Vector(name=filename, data=binary_data, paragraphs=paragraphs, season_id=current_season_id, user_id=current_user, created_at=now )
        db.session.add(new_vector)
        db.session.commit()
        return 'success'

#function for RAG
def RAG(prompt, current_user):
    with open('vectorizer.pkl', 'rb') as f:
        vectorizer = pickle.load(f)

    #loading index from database but its in binary form
    binary_data_list = Vector.query.filter(Vector.user_id == current_user).with_entities(Vector.data).all()
    #converting indexs from binary form
    index_list = [pickle.loads(binary_data[0]) for binary_data in binary_data_list]
    #raise IndexError(f"Index {index_list} out of range. delka par:")

    
    #paragraphs from database
    paragraphs = Vector.query.filter(Vector.user_id == current_user).with_entities(Vector.paragraphs).all()
    #paragraphs:
    #       *list
    #           *n-tice
    #               *list
    #                   *string
    
    
    #finding paragraphs in the text by indexs
    proh = search(prompt, index_list, vectorizer)

    pole_paragraph = []  #paragrpahs[0][i][idx] = i =rozdílné knihy; idx = paragraphy z těch knich

    for tuple_item in paragraphs:
        for idx in proh:
            if idx < len(tuple_item[0]):
                pole_paragraph.append(tuple_item[0][idx])

    text = ' '.join(pole_paragraph)
    return text

#function for RAG_WEB
##################################################################
def RAG_WEB_SAVE(url, current_user, now, current_season_id):
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        webpage_name = soup.title.string

    if Vector.query.filter_by(name=webpage_name).first():
        return 'Same_file', None
    else:
        index, paragraphs = create_index_web(url)
        
        #serializaci dat (converting data on to binary form)
        binary_data = pickle.dumps(index) 

        #sending data to the database
        new_vector = Vector(name=webpage_name, data=binary_data, paragraphs=paragraphs, season_id=current_season_id, user_id=current_user, created_at=now )
        db.session.add(new_vector)
        db.session.commit()
        return 'success', webpage_name
