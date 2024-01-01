FROM python:3.11-slim-buster

WORKDIR /application

COPY application/ ./
RUN pip install -r requirements.txt

CMD [ "python", "application.py" ]