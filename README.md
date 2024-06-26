# Chat_bot_RAG
Is dynamick flask web aplication which use groq and my own build RAG module for PDF and WEB pages.

in the aplication is also included Text2Speach and Speach2Text bud  as of now it doesnt work proprly.

# WHOLE APP IS IN DOCKER! 
Firstly you need to download docker desktop for using this app

# FUNCTIONALITIES
1) Login system with sessions
2) Genereting messages and saving them to db
3) Recreating chat history
4) Remembering previouse topic
5) Extracting text from PDF and WEB pages
6) Saving extracted text to db for every user separatly
7) Vectorize the extracted content and save it to the db (also Vectorizer is stored in vectorizer.pkl for future use)
8) Vectorize the prompt and via cosine similarity find closest index of paragraphs
9) Find the paragraphs from returned index 


# HOW TO USE
  < FIRST START >
  
  1) After downloading the repository and the docker desktop you need to navigate to Final02 (cd Final02)
  2) Then you need to open .env file and put there API keys (Groq is for LLM and DG is for Text2Speach and Speach2Text)
  4) Then you simply need to build the docker (docker compose build)
  5) After that you can start the app (docker compose up)
  6) After starting the app you will see login screen where you can simply log (Inside the app is complex system for remembering users and building users previouse conversation)
  7) After successful login you need to click on plus (+) button on the center top that will create a new chat session with bot
  8) Then you can chat!

  < RAG >
  
  1) For using the RAG module you need to firstly upload your PDF file or URL for WEB page (you can do that in button 'upload')
  2) Then you need to activate the RAG (Red button on the left with RAG layble) 
  3) ENJOY! 

# WHERE TO GET API KEYS
  < GROQ >
  
  1) For API Key you need to go to https://groq.com/ and register there
  2) After that you can go to GroqCloud (on the bottom)
  3) There you can find collum API Keys
    
  < DEEPGRAM >

  1) For API Key you need to go to https://deepgram.com/ and register there
  2) There you can find API Keys
    
# DEEPGRAM IS NOT FOR FREE 
  but you get 200$ for start


  
