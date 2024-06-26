
import os

from deepgram import (
    DeepgramClient,
    PrerecordedOptions,
    FileSource,
    SpeakOptions,
)


API_KEY = os.getenv("DG_API_KEY")



#it takes filename for file and then its extracting text
#its returning transcript which is context of the file with filename
def speach2text(filename):
    try:
        
        deepgram = DeepgramClient(API_KEY)

        with open(filename, "rb") as file:
            buffer_data = file.read()

        payload: FileSource = {
            "buffer": buffer_data,
        }
        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
        )


        response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)
        transcript = response['results']['channels'][0]['alternatives'][0]['transcript']
        return transcript

    except Exception as e:
        print(f"Exception: {e}")



#It takes text which it changes into audio file
#its returning filename with path for file (name) 
def text2speach(text):
    try:
        filename = "output.wav"
        deepgram = DeepgramClient(api_key=os.getenv("DG_API_KEY"))

        options = SpeakOptions(
            model="aura-asteria-en",
            encoding="linear16",
            container="wav"
        )

        
        response = deepgram.speak.v("1").save(filename, text, options)
        return filename

    except Exception as e:
        print(f"Exception: {e}")
        return f"Error: {e}"
