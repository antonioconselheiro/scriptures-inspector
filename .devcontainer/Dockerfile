FROM node:20

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true
ENV CHROME_BIN=/usr/bin/chromium
ENV DISPLAY=:99

RUN apt update && \
    apt install -y libxss1 libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 \
    build-essential clang python-is-python3 2to3 dbus rpm wget libx11-xcb1 libxcb-dri3-0 \
    libasound2 dpkg fakeroot && \
    rm -rf /var/lib/apt/lists/*
    
RUN dpkg --add-architecture i386

RUN npm install -g @angular/cli eslint typescript @electron-forge/cli electron vite ts-node;

WORKDIR /scriptures-inspector

EXPOSE 4205

CMD ["/bin/bash"]
