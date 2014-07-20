FROM ubuntu:precise

RUN apt-get update
RUN apt-get install -y python-pip python-dev wget ca-certificates && apt-get clean

RUN wget -O - http://s3pository.heroku.com/node/v0.10.29/node-v0.10.29-linux-x64.tar.gz | tar xz -C /usr/local --strip-components 1
RUN /usr/local/bin/npm install -g grunt-cli

ADD . /app
WORKDIR /app

RUN pip install -r requirements.txt
RUN pip install -r dev-requirements.txt
RUN npm install
RUN grunt

RUN invoke initdb
RUN invoke json.import 'demo/*'

EXPOSE 5000
CMD invoke run
