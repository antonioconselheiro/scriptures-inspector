FROM node:20

RUN npm install husky eslint typescript @angular/cli -g
RUN npm install npx -g --force

WORKDIR /scriptures-inspector

ENV LANG=C.UTF-8
ENV LANGUAGE=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV TZ=America/Sao_Paulo
ENV DEBUG_COLORS=true
ENV FORCE_COLOR=true

EXPOSE 4205

# The run the start script
CMD [ "/bin/bash" ]
