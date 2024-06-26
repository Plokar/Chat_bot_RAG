from flask import Flask, request, send_file, render_template, jsonify, Response
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, create_engine
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import tempfile
import os
import io
import json


from Speak2Text import speach2text, text2speach
from chat_bot import ChatBot

##################################################################
##################################################################


app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')
login_manager = LoginManager()
login_manager.init_app(app)
bot = ChatBot()

#CSRF je sračk...
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL')
app.config['WTF_CSRF_ENABLED'] = False

db = SQLAlchemy()
db.init_app(app)

with app.app_context():
    Session = sessionmaker(bind=db.engine)
    session = Session()
Base = declarative_base()

current_season_id = None

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)
##################################################################
####   set up database   ####
##################################################################

class Document(db.Model):
    __tablename__ = 'pdf'
    __table_args__ = {'schema': 'oltp'}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    path = db.Column(db.Text)
    data = db.Column(db.LargeBinary)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    season_id = db.Column(db.Integer, db.ForeignKey('oltp.seasons.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('oltp.users.id'))

class Vector(db.Model):
    __tablename__ = 'vector'
    __table_args__ = {'schema': 'oltp'}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    data = db.Column(db.LargeBinary)
    paragraphs = db.Column(db.JSON)
    vectorizer = db.Column(db.LargeBinary)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    season_id = db.Column(db.Integer, db.ForeignKey('oltp.seasons.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('oltp.users.id'))

class Message(db.Model):
    __tablename__ = 'messages'
    __table_args__ = {'schema': 'oltp'}
    id = db.Column(db.Integer, primary_key=True)
    prompt = db.Column(db.String(4096), nullable=False)
    response = db.Column(db.String(4096), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    season_id = db.Column(db.Integer, db.ForeignKey('oltp.seasons.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('oltp.users.id'))
    user_con = db.relationship('User', backref=db.backref('user_messages', lazy='dynamic'))

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'oltp'}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True)
    password = db.Column(db.Text)
    messages = db.relationship('Message', backref='user')
    documents = db.relationship('Document', backref='user')
    vector = db.relationship('Vector', backref='user')

    @staticmethod
    def get(user_id):
        return User.query.get(user_id)


class Season(db.Model):
    __tablename__ = 'seasons'
    __table_args__ = {'schema': 'oltp'}
    id = db.Column(db.Integer, primary_key=True)
    content_summary = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('oltp.users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    messages = db.relationship("Message", backref="season")
    documents = db.relationship('Document', backref='season')
    vector = db.relationship('Vector', backref='season')


with app.app_context():
    db.create_all()

##################################################################
####   app routes   ####
##################################################################
@app.route('/') #základní stránka
def index():
    return render_template('login.html', ) 

@app.route('/chatbot')
def app_chatbot():
    return render_template('index.html')

@app.route('/api-seasons', methods=['GET'])
def api_seasons():
    seasons = Season.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': season.id, 'content_summary': season.content_summary} for season in seasons])

##################################################################
####   chat bot   ####
##################################################################

@app.route('/new-season', methods=['POST'])
def get_season():
    global current_season_id
    bot.new_season()
    season_name = request.form['name_history']
    new_season = Season(content_summary=season_name, user_id = current_user.id)
    session.add(new_season)
    session.commit()
    current_season_id = new_season.id
    return str(current_season_id)

@app.route('/get-text', methods=['POST']) #chatbox 
def get_text():
    global current_season_id
    text = request.form['user_text']
    response = bot.chat(text)
    now = datetime.now()
    if current_season_id is not None:
        message = Message(prompt=text, response=response, date=now, season_id=current_season_id, user_id=current_user.id)
        session.add(message)
        session.commit()
    return response

@app.route('/get-text/rag', methods=['POST'])
def get_text_rag():
    from vektor_save_pdf import RAG
    global current_season_id
    text = request.form['user_text'] 
    most_relevant_from_pdf = RAG(text, current_user.id) #returning all of the text 
    most_relevant_from_pdf = str(most_relevant_from_pdf)
    response = bot.chat(text, most_relevant_from_pdf)
    print(most_relevant_from_pdf)
    if current_season_id is not None:
        now = datetime.now()
        message = Message(prompt=text, response=response, date=now, season_id=current_season_id, user_id=current_user.id)
        db.session.add(message)
        db.session.commit()
    return response

##################################################################
####   login   ####
##################################################################
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Username and password are required.'}), 400

    user = User.query.filter_by(username=username).first()

    if user:
        if check_password_hash(user.password, password):
            login_user(user)
            return jsonify({'message': 'Logged in successfully.'}), 200
        else:
            return jsonify({'message': 'Invalid password.'}), 401
    else:
        new_user = User(username=username, password=generate_password_hash(password))
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({'message': 'Registered and logged in successfully.'}), 200
    

##################################################################
####   historie k frontedu   ####
##################################################################

@app.route('/api/history', methods=['POST']) #Getting data from database for histori
def history():
    global current_season_id
    season_id = request.form['season_id']
    current_season_id = season_id
    messages = session.query(Message.date, Message.prompt, Message.response).filter(Message.season_id == season_id).all()
    return jsonify([{'timestamp': message[0], 'prompt': message[1], 'response': message[2]} for message in messages])

@app.route('/api/delete-season', methods=['POST']) #Method for deleting histori via id from database
def delete_message():
    message_id = request.form['season_id']
    session.query(Message).filter_by(season_id=message_id).delete()
    session.commit()
    return '', 204

##################################################################
####   uplloding pdf into the database   ####
##################################################################

@app.route('/upload/file', methods=['POST']) #uploding pdf file to the server
def upload_file():
    from vektor_save_pdf import vektor_pdf
    if 'file_upload' in request.files:
        global current_season_id
        now = datetime.now()
        file = request.files['file_upload']
        if file.filename != '':
            file_stream = io.BytesIO()
            file.save(file_stream)
            file_stream.seek(0)
            if file_stream.getbuffer().nbytes == 0:
                raise ValueError("The uploaded file is empty")
            file_data = file.read()  
            response = vektor_pdf(file_stream, file.filename, current_season_id, current_user.id, now )
            if response == 'Same_file':
                return jsonify(message="Stejná složka je již nahrána"), 400
            elif response == 'success':
                new_file = Document(name=file.filename, data=file_data, season_id=current_season_id, user_id=current_user.id, created_at=now) 
                db.session.add(new_file)  
                db.session.commit()
                return jsonify(message="Soubor byl úspěšně nahrán"), 200
            
    return '', 204

##################################################################
####   uploading webpage into the database   ####
##################################################################

@app.route('/upload/webpage', methods=['POST'])
def upload_web():
    from vektor_save_pdf import RAG_WEB_SAVE
    global current_season_id
    now = datetime.now()
    web_page = request.form['webpage_url']
    if web_page != '':
        response, webpage_name = RAG_WEB_SAVE(web_page, current_user.id,now, current_season_id  )
        if response == 'Same_file':
            return jsonify(message="Stejná stránka je již nahrána"), 400
        elif response == 'success':
            new_file = Document(name=webpage_name, path=web_page, season_id=current_season_id, user_id=current_user.id, created_at=now) 
            db.session.add(new_file)
            db.session.commit()
            return jsonify(message="Stránka byla úspěšně nahrána"), 200

##################################################################
####   work with database   ####
##################################################################

@app.route('/api/file_sql', methods=['GET']) #Showing uploded files in the database
def file_sql():
    files = Document.query.filter(Document.user_id == current_user.id).all()
    return jsonify([{'text': file.name} for file in files])

@app.route('/api/file_delete', methods=['POST'])
@login_required
def file_delete():
    file_id = request.form['file_name']
    Document.query.filter_by(name=file_id, user_id=current_user.id).delete()
    Vector.query.filter_by(name=file_id, user_id=current_user.id).delete()
    db.session.commit()
    return '', 204

##################################################################
####   speach/text 2 speach/text   ####
##################################################################

@app.route('/process-audio', methods=['POST']) #sound asistant
def process_audio():
    audio_data = request.files['audio'].read()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        tmp.write(audio_data)
        tmp.flush()

    text = speach2text(tmp.name)
    generated_answer = bot.chat(f"{text} ") #here you can put manual prompt
    generated_speach = text2speach(generated_answer)
    response_data = {
        "audio": (open(generated_speach, 'rb'), 'audio/wav'),
        "json": (json.dumps({"text": generated_answer}), 'application/json')
    }
    boundary = "BOUNDARY"
    headers = {"Content-Type": f"multipart/mixed; boundary={boundary}"}

    def generate():
        for key, value in response_data.items():
            yield f"--{boundary}\r\n"
            yield f"Content-Type: {value[1]}\r\n\r\n"
            yield from value[0]
            yield "\r\n"
        yield f"--{boundary}--\r\n"

    return Response(generate(), headers=headers)

@app.route('/speach-text', methods=['POST']) #sound to text
def text_to_speech():
    audio_data = request.files['audio'].read()
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        tmp.write(audio_data)
        tmp.flush()

    generated_speach = speach2text(tmp.name)
    return jsonify(text = generated_speach)



if __name__ == '__main__':
    app.run(debug=True, port=8080)
