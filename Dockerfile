# Zabojnik s strežnikom (bb serve). Uporaben za Render, Koyeb, Fly.io, Google Cloud Run ali svoj VPS.
#   docker build -t kuhinja-cali .
#   docker run -p 8080:8080 -v kuhinja-storage:/app/storage kuhinja-cali
FROM debian:bookworm-slim

ARG BB_VERSION=1.13.229

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -sL https://raw.githubusercontent.com/babashka/babashka/master/install \
    | bash -s -- --version "${BB_VERSION}" --static \
 && apt-get purge -y curl \
 && apt-get autoremove -y \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY bb.edn ./
COPY src ./src
COPY resources ./resources
COPY public ./public

RUN bb build \
 && useradd --system --uid 10001 kuhinja \
 && mkdir -p storage \
 && chown -R kuhinja storage public/data public/slike

USER kuhinja

# V zabojniku mora strežnik poslušati na vseh vmesnikih; PORT lahko nastavi gostitelj.
ENV HOST=0.0.0.0 \
    PORT=8080

EXPOSE 8080
VOLUME ["/app/storage"]

CMD ["bb", "serve"]
