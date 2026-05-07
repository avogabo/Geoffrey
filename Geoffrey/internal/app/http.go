package app

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"sort"
	"strings"
)

type server struct {
	app *App
}

type libraryDTO struct {
	Key   string `json:"key"`
	Title string `json:"title"`
	Type  string `json:"type"`
}

type collectionDTO struct {
	RatingKey  string `json:"ratingKey"`
	Title      string `json:"title"`
	Type       string `json:"type"`
	ChildCount int    `json:"childCount"`
	Temporary  bool   `json:"temporary"`
	ExpiresAt  string `json:"expiresAt,omitempty"`
	ThumbURL   string `json:"thumbUrl,omitempty"`
	ArtURL     string `json:"artUrl,omitempty"`
}

type recipeDTO struct {
	ID                 string   `json:"id"`
	Name               string   `json:"name"`
	PromptAliases      []string `json:"promptAliases"`
	InclusionRules     []string `json:"inclusionRules"`
	ExclusionRules     []string `json:"exclusionRules"`
	OrderingRules      []string `json:"orderingRules"`
	TemporaryByDefault bool     `json:"temporaryByDefault"`
}

type createCollectionRequest struct {
	LibraryKey   string   `json:"libraryKey"`
	Name         string   `json:"name"`
	Titles       []string `json:"titles"`
	SourcePrompt string   `json:"sourcePrompt"`
	Temporary    bool     `json:"temporary"`
	ExpiresAt    string   `json:"expiresAt"`
	PosterURL    string   `json:"posterUrl"`
	PosterBase64 string   `json:"posterBase64"`
}

type settingsDTO struct {
	PlexBaseURL        string `json:"plexBaseUrl"`
	PlexDefaultLibrary string `json:"plexDefaultLibrary"`
	DataDir            string `json:"dataDir"`
	TelegramEnabled    bool   `json:"telegramEnabled"`
	TimeZone           string `json:"timeZone"`
}

func (a *App) RunHTTP() error {
	mux := http.NewServeMux()
	api := &server{app: a}
	mux.HandleFunc("/api/health", api.handleHealth)
	mux.HandleFunc("/api/libraries", api.handleLibraries)
	mux.HandleFunc("/api/collections", api.handleCollections)
	mux.HandleFunc("/api/search", api.handleSearch)
	mux.HandleFunc("/api/ideas", api.handleIdeas)
	mux.HandleFunc("/api/recipes", api.handleRecipes)
	mux.HandleFunc("/api/settings", api.handleSettings)
	mux.HandleFunc("/api/poster/upload", api.handlePosterUpload)
	mux.HandleFunc("/api/plex/image", api.handlePlexImage)
	mux.HandleFunc("/api/collections/", api.handleCollectionDelete)
	mux.Handle("/", http.FileServer(http.Dir("/app/web")))
	addr := ":8080"
	log.Printf("geoffrey: ui listening on %s", addr)
	return http.ListenAndServe(addr, withCORS(mux))
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *server) handleHealth(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s *server) handleLibraries(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	libs, err := s.app.Libraries()
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	items := make([]libraryDTO, 0, len(libs))
	for _, lib := range libs {
		items = append(items, libraryDTO{Key: lib.Key, Title: lib.Title, Type: lib.Type})
	}
	sort.Slice(items, func(i, j int) bool { return items[i].Title < items[j].Title })
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (s *server) handleCollections(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		libraryKey := strings.TrimSpace(r.URL.Query().Get("library"))
		if libraryKey == "" {
			writeError(w, http.StatusBadRequest, "library query is required")
			return
		}
		collections, err := s.app.Collections(libraryKey)
		if err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}
		history := s.app.memory.Data.History
		metaByName := map[string]struct{ temp bool; expires string }{}
		for _, item := range history {
			metaByName[strings.ToLower(item.Library+"::"+item.Name)] = struct{ temp bool; expires string }{temp: item.Temporary, expires: item.ExpiresAt}
		}
		items := make([]collectionDTO, 0, len(collections))
		for _, item := range collections {
			meta := metaByName[strings.ToLower(libraryKey+"::"+item.Title)]
			items = append(items, collectionDTO{RatingKey: item.RatingKey, Title: item.Title, Type: item.Type, ChildCount: item.ChildCount, Temporary: meta.temp, ExpiresAt: meta.expires, ThumbURL: proxyImageURL(item.Thumb), ArtURL: proxyImageURL(item.Art)})
		}
		sort.Slice(items, func(i, j int) bool { return strings.ToLower(items[i].Title) < strings.ToLower(items[j].Title) })
		writeJSON(w, http.StatusOK, map[string]any{"items": items})
	case http.MethodPost:
		var req createCollectionRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, http.StatusBadRequest, "invalid json")
			return
		}
		req.Name = strings.TrimSpace(req.Name)
		req.LibraryKey = strings.TrimSpace(req.LibraryKey)
		if req.Name == "" || req.LibraryKey == "" {
			writeError(w, http.StatusBadRequest, "name and libraryKey are required")
			return
		}
		if err := s.app.CreateCollectionFromTitles(req.LibraryKey, req.Name, req.Titles, req.SourcePrompt, req.Temporary, req.ExpiresAt); err != nil {
			writeError(w, http.StatusBadGateway, err.Error())
			return
		}
		if req.PosterURL != "" || req.PosterBase64 != "" {
			if err := s.app.ApplyCollectionPoster(req.LibraryKey, req.Name, req.PosterURL, req.PosterBase64); err != nil {
				log.Printf("geoffrey: poster apply warning for %s: %v", req.Name, err)
			}
		}
		writeJSON(w, http.StatusCreated, map[string]any{"ok": true})
	default:
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *server) handleCollectionDelete(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	path := strings.TrimPrefix(r.URL.Path, "/api/collections/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 {
		writeError(w, http.StatusBadRequest, "expected /api/collections/{libraryKey}/{name}")
		return
	}
	libraryKey := parts[0]
	name, err := urlPathUnescape(parts[1])
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid collection name")
		return
	}
	if err := s.app.DeleteCollectionByName(libraryKey, name); err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (s *server) handleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	libraryKey := strings.TrimSpace(r.URL.Query().Get("library"))
	query := strings.TrimSpace(r.URL.Query().Get("q"))
	if libraryKey == "" || query == "" {
		writeError(w, http.StatusBadRequest, "library and q are required")
		return
	}
	items, err := s.app.Search(libraryKey, query)
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (s *server) handleIdeas(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	libraryKey := strings.TrimSpace(r.URL.Query().Get("library"))
	idea := strings.TrimSpace(r.URL.Query().Get("idea"))
	if libraryKey == "" || idea == "" {
		writeError(w, http.StatusBadRequest, "library and idea are required")
		return
	}
	suggestion, err := s.app.SuggestFromIdea(libraryKey, idea)
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, suggestion)
}

func (s *server) handleRecipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	recipes := s.app.Recipes()
	items := make([]recipeDTO, 0, len(recipes))
	for _, item := range recipes {
		items = append(items, recipeDTO{ID: item.ID, Name: item.Name, PromptAliases: item.PromptAliases, InclusionRules: item.InclusionRules, ExclusionRules: item.ExclusionRules, OrderingRules: item.OrderingRules, TemporaryByDefault: item.TemporaryByDefault})
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items})
}

func (s *server) handleSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	writeJSON(w, http.StatusOK, settingsDTO{PlexBaseURL: s.app.cfg.PlexBaseURL, PlexDefaultLibrary: s.app.cfg.PlexDefaultLibrary, DataDir: s.app.cfg.DataDir, TelegramEnabled: s.app.cfg.TelegramBotToken != "", TimeZone: s.app.cfg.TimeZone})
}

func (s *server) handlePlexImage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	path := strings.TrimSpace(r.URL.Query().Get("path"))
	if path == "" {
		writeError(w, http.StatusBadRequest, "path is required")
		return
	}
	resp, err := s.app.plex.FetchImage(path)
	if err != nil {
		writeError(w, http.StatusBadGateway, err.Error())
		return
	}
	defer resp.Body.Close()
	if ct := resp.Header.Get("Content-Type"); ct != "" {
		w.Header().Set("Content-Type", ct)
	}
	w.Header().Set("Cache-Control", "public, max-age=3600")
	w.WriteHeader(http.StatusOK)
	_, _ = io.Copy(w, resp.Body)
}

func (s *server) handlePosterUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if err := r.ParseMultipartForm(8 << 20); err != nil {
		writeError(w, http.StatusBadRequest, "invalid multipart upload")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "file is required")
		return
	}
	defer file.Close()
	data, err := fileToDataURL(file, header)
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"dataUrl": data, "filename": header.Filename})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]any{"error": msg})
}

func proxyImageURL(path string) string {
	if strings.TrimSpace(path) == "" {
		return ""
	}
	return "/api/plex/image?path=" + url.QueryEscape(path)
}

func fileToDataURL(file multipart.File, header *multipart.FileHeader) (string, error) {
	blob, err := io.ReadAll(io.LimitReader(file, 8<<20))
	if err != nil {
		return "", err
	}
	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = http.DetectContentType(blob)
	}
	return fmt.Sprintf("data:%s;base64,%s", mimeType, base64.StdEncoding.EncodeToString(blob)), nil
}

func urlPathUnescape(in string) (string, error) {
	return url.PathUnescape(in)
}
