FROM rust:1.75-bullseye

RUN apt update \ 
    && apt install -y chromium curl ca-certificates gnupg libwebkit2gtk-4.0-dev libgtk-3-dev libayatana-appindicator3-dev \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_VERSION v10.2.4
ENV NODE_VERSION v20.11.1
ENV NVM_DIR /usr/local/nvm
RUN mkdir $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN echo "source $NVM_DIR/nvm.sh && \
    nvm install $NODE_VERSION && \
    nvm alias default $NODE_VERSION && \
    nvm use default && \
    npm install eslint typescript @angular/cli -g && \
    npm install npx -g --force" | bash

WORKDIR /scriptures-inspector

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true
ENV CHROME_BIN=/usr/bin/chromium
ENV PATH="/root/.cargo/bin:${PATH}"

RUN rustc --version && cargo --version

EXPOSE 4205

# The run the start script
CMD [ "/bin/bash" ]
