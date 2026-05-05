package config

import (
	"os"
)

type Config struct {
	TelegramBotToken   string
	LLMProvider        string
	LLMAPIKey          string
	LLMModel           string
	PlexBaseURL        string
	PlexToken          string
	PlexDefaultLibrary string
	TimeZone           string
	DataDir            string
	LogLevel           string
}

func Load() Config {
	return Config{
		TelegramBotToken:   os.Getenv("TELEGRAM_BOT_TOKEN"),
		LLMProvider:        getenv("LLM_PROVIDER", "openai"),
		LLMAPIKey:          os.Getenv("LLM_API_KEY"),
		LLMModel:           getenv("LLM_MODEL", "gpt-4o-mini"),
		PlexBaseURL:        os.Getenv("PLEX_BASE_URL"),
		PlexToken:          os.Getenv("PLEX_TOKEN"),
		PlexDefaultLibrary: getenv("PLEX_DEFAULT_LIBRARY", "Películas"),
		TimeZone:           getenv("TZ", "UTC"),
		DataDir:            getenv("GEOFFREY_DATA_DIR", "/data"),
		LogLevel:           getenv("GEOFFREY_LOG_LEVEL", "info"),
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
