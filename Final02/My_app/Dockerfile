FROM python:3.12.3-alpine

RUN addgroup app && adduser -S -G app app 
#its creating user which can only start the aplication
USER app

WORKDIR /app
COPY requirements.txt ./


USER root

RUN apk update && apk add \
    build-base \
    gcc \
    && rm -rf /var/cache/apk/*
RUN pip install --no-cache-dir -r requirements.txt

RUN chown -R app:app .
#chown -R <user>:<group> <directory>
#chown -R app:app . - Its sets owner and group for all the files in the direct adress in app 

USER app



COPY . .

EXPOSE 8000

CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8000"]