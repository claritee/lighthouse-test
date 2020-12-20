FROM node:13.12.0-buster-slim 

RUN apt-get update && \
    apt-get install -y chromium

ENV HOME /app
ENV HEADLESS true
WORKDIR $HOME

COPY . .

RUN echo "--- Installing dependencies" && yarn
CMD echo "--- Running lighthouse" && node auth-json.js
