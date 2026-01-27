FROM rust:1.92-bookworm

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true
ENV RUST_BACKTRACE=1
ENV CHROME_BIN=/usr/bin/chromium
ENV PATH="/root/.cargo/bin:${PATH}"

RUN apt update && apt install -y \
    curl wget file ca-certificates gnupg chromium \
    build-essential pkg-config libxdo-dev libssl-dev libwebkit2gtk-4.1-0 libwebkit2gtk-4.1-dev \
    libglib2.0-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g @angular/cli eslint typescript @tauri-apps/cli

WORKDIR /scriptures-inspector

RUN rustc --version && cargo --version && \
    node --version && npm --version && \
    pkg-config --modversion webkit2gtk-4.1 && \
    pkg-config --modversion gtk+-3.0 && \
    pkg-config --modversion ayatana-appindicator3-0.1 && \
    pkg-config --modversion librsvg-2.0

EXPOSE 4205

CMD ["/bin/bash"]
