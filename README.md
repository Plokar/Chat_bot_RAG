# Chat_bot_RAG
It is a dynamic flask web application that uses groq and my own RAG module for PDF and WEB pages.

The app also includes Text2Speach and Speach2Text, but it doesn't work properly yet.

# .ENV
Should be put on the same level as compose.yaml

      GROQ_API_KEY=""
      DG_API_KEY=""
      Form_key="your-secret-key"
      DB_URL="postgresql://postgres:postgres@postgres:5432/oltp_db"
      SECRET_KEY="5e9f4d3e7c2b1a8f6b4e3d1c9a7f5e2b"

# WHOLE APP IS IN DOCKER! 
Firstly you need to download docker desktop for using this app

# FEATURES
1) Login system with sessions
2) Generating messages and storing them in db
3) Restore chat history
4) Remembering the previous topic
5) Text extraction from PDF and WEB pages
6) Storing extracted text in db for each user separately
7) Vectorizing the extracted content and saving it to db (the vectorization is also saved to vectorizer.pkl file for future use)
8) Vectorizing the prompt and using cosine similarity to find the nearest paragraph index
9) Find the paragraphs from the returned index


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


  
