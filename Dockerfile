FROM python:3.11-slim-buster

WORKDIR /application

COPY application/ ./
RUN pip install -r requirements.txt

CMD ["gunicorn", "--chdir", "/application", "application:application", "--bind", "0.0.0.0:5000"]