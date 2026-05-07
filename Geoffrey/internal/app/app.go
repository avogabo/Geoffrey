package app

import (
	"fmt"
	"log"

	"github.com/avogabo/geoffrey/internal/config"
	"github.com/avogabo/geoffrey/internal/memory"
	"github.com/avogabo/geoffrey/internal/plex"
	"github.com/avogabo/geoffrey/internal/tmdb"
)

type App struct {
	cfg    config.Config
	memory *memory.Store
	plex   *plex.Client
	tmdb   *tmdb.Client
}

func New(cfg config.Config) (*App, error) {
	store, err := memory.Open(cfg.DataDir)
	if err != nil {
		return nil, err
	}
	client := plex.New(cfg.PlexBaseURL, cfg.PlexToken)
	tmdbClient := tmdb.New(cfg.TMDBAPIKey)
	return &App{cfg: cfg, memory: store, plex: client, tmdb: tmdbClient}, nil
}

func (a *App) Run() error {
	libs, err := a.plex.Libraries()
	if err != nil {
		return err
	}
	log.Printf("geoffrey: ready, detected %d plex libraries", len(libs))
	for _, lib := range libs {
		log.Printf("geoffrey: plex library key=%s type=%s title=%s", lib.Key, lib.Type, lib.Title)
	}
	if a.memory.Data.UserPreferences.DefaultMovieLibrary == "" {
		a.memory.Data.UserPreferences.DefaultMovieLibrary = a.cfg.PlexDefaultLibrary
	}
	if len(a.memory.Data.Recipes) == 0 {
		a.memory.Data.Recipes = memory.DefaultRecipes()
	}
	if err := a.memory.Save(); err != nil {
		return fmt.Errorf("save memory: %w", err)
	}
	a.StartSchedulers()
	return a.RunHTTP()
}
