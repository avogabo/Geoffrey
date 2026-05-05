FROM golang:1.24 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/geoffrey ./cmd/geoffrey

FROM gcr.io/distroless/static-debian12
WORKDIR /app
COPY --from=build /out/geoffrey /app/geoffrey
ENV GEOFFREY_DATA_DIR=/data
ENTRYPOINT ["/app/geoffrey"]
