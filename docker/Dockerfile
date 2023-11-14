FROM ubuntu:23.10

# Node installation instructions:
# https://github.com/nodesource/distributions#installation-instructions
ENV NODE_MAJOR=16

ENV DEBIAN_FRONTEND="noninteractive"

# Install node, npm and a few utilities used for debugging
RUN apt-get update \
    && apt-get install -y ca-certificates gnupg sudo curl wget build-essential git vim \
    && sudo mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list \
    && sudo apt-get update \
    && sudo apt-get install -y npm \
    && npm install -g yarn

# Build the app.
RUN git clone https://github.com/stylesuxx/esc-configurator.git \
    && cd esc-configurator \
    && yarn \
    # npm-update-check is skipped as it breaks the build.
    #&& yarn add npm-check-updates \
    #&& yarn npm-check-updates -u \
    && yarn global add serve \
    && yarn build

CMD ["serve", "-s", "/esc-configurator/build", "-l", "1234"]
