package main

import (
	"log"

	"github.com/avogabo/geoffrey/internal/app"
	"github.com/avogabo/geoffrey/internal/config"
)

func main() {
	cfg := config.Load()
	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("geoffrey: init failed: %v", err)
	}
	if err := application.Run(); err != nil {
		log.Fatalf("geoffrey: runtime failed: %v", err)
	}
}
