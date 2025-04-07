# pull the official base image
FROM python:3.12.7

# set work directory
WORKDIR /app

# set environment variables
ENV PYTHONUNBUFFERED 1

# install system dependencies for OpenCV, ZBar, and other required libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libzbar0 \
    zbar-tools \
    cron \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y gettext


# upgrade pip
RUN pip install --upgrade pip

# copy requirements and install Python dependencies
COPY ./requirements.txt /app
COPY ./docker-entrypoint.sh /app
RUN pip install -r requirements.txt

RUN chmod +x /app/docker-entrypoint.sh

# copy project
COPY . /app
# expose the application port
EXPOSE 5009

ENTRYPOINT ["/app/docker-entrypoint.sh"]


# run migrations, execute sql_loader.py, and start the server
CMD python manage.py makemigrations && python manage.py migrate && python sql_loader.py && uvicorn LMS.asgi:application --host 0.0.0.0 --port 5009 --reload

