from groq import Groq

class ChatBot:
    def __init__(self):
        self.client = Groq()
        self.messages = []

    def chat(self, prompt, data=None):
        new_message = {
            "role": "user",
            "content": prompt
        }
        self.messages.append(new_message)
        
        if data is not None:
            system_message = {
                "role": "system",
                "content": data
            }
            self.messages.insert(0, system_message)

        completion = self.client.chat.completions.create(
            model="llama3-8b-8192",
            messages=self.messages,
            temperature=1,
            max_tokens=1024,
            top_p=1,
            stream=True,
            stop=None,
        )

        replay = ''
        for chunk in completion:
            replay += chunk.choices[0].delta.content or ""
        return replay

    def new_season(self):
        self.messages = []

if __name__ == "__main__":
    bot = ChatBot()
    print(bot.chat("tell a joke"))
    bot.new_season()