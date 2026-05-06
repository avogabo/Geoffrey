FROM node:22-alpine AS webbuild
WORKDIR /web
COPY web/package.json web/tsconfig.json web/tsconfig.app.json web/vite.config.ts ./
RUN npm install
COPY web ./
RUN npm run build

FROM golang:1.24 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -mod=mod -o /out/geoffrey ./cmd/geoffrey

FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=build /out/geoffrey /app/geoffrey
COPY --from=webbuild /web/dist /app/web
ENV GEOFFREY_DATA_DIR=/data
EXPOSE 8080
ENTRYPOINT ["/app/geoffrey"]
