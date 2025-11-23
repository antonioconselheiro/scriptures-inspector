FROM node:20

RUN npm install husky eslint typescript @angular/cli -g
RUN npm install npx -g --force

RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /scriptures-inspector

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true
ENV CHROME_BIN=/usr/bin/chromium

EXPOSE 4205

# The run the start script
CMD [ "/bin/bash" ]
