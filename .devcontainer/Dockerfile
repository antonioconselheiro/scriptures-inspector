FROM node:20

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true
ENV CI=TRUE
ENV CHROME_BIN=/usr/bin/chromium
ENV ELECTRON_ENABLE_LOGGING=true
ENV ELECTRON_DISABLE_SANDBOX=true
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null
ENV XAUTHORITY=/root/.Xauthority

RUN apt update && \
    apt install -y dbus libnss3 libnss3-dev libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 \
    libnspr4 libdbus-1-3 libcups2 libpci3 libdrm2 libexpat1 libpango-1.0-0 libharfbuzz0b \
    libxss1 libasound2 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libgdk-pixbuf2.0-0 xinit x11-xserver-utils libcanberra-gtk-module libcanberra-gtk3-module && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g @angular/cli eslint typescript @electron-forge/cli electron vite ts-node concurrently wait-on

# USER node
ENV HOME=/home/node
WORKDIR /scriptures-inspector

EXPOSE 4205

CMD ["/bin/bash"]
