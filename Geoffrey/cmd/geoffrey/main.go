package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/avogabo/geoffrey/internal/app"
	"github.com/avogabo/geoffrey/internal/config"
	"github.com/avogabo/geoffrey/internal/plex"
)

func main() {
	mode := flag.String("mode", "serve", "serve|libraries|search|collections|create-collection|delete-collection|recipes")
	section := flag.String("section", "", "Plex library section key or library title")
	query := flag.String("query", "", "Search query")
	name := flag.String("name", "", "Collection name")
	titles := flag.String("titles", "", "Comma-separated titles")
	prompt := flag.String("prompt", "", "Source prompt text")
	flag.Parse()

	cfg := config.Load()
	application, err := app.New(cfg)
	if err != nil {
		log.Fatalf("geoffrey: init failed: %v", err)
	}

	switch *mode {
	case "serve":
		if err := application.Run(); err != nil {
			log.Fatalf("geoffrey: runtime failed: %v", err)
		}
	case "libraries":
		libs, err := application.Libraries()
		must(err)
		for _, lib := range libs {
			fmt.Printf("%s\t%s\t%s\n", lib.Key, lib.Type, lib.Title)
		}
	case "search":
		lib := resolveLibrary(application, *section)
		items, err := application.Search(lib.Key, *query)
		must(err)
		for _, item := range items {
			fmt.Printf("%s\t%s\t%s\t%d\n", item.RatingKey, item.Type, item.Title, item.Year)
		}
	case "collections":
		lib := resolveLibrary(application, *section)
		items, err := application.Collections(lib.Key)
		must(err)
		for _, item := range items {
			fmt.Printf("%s\t%s\t%s\t%d\n", item.RatingKey, item.Type, item.Title, item.ChildCount)
		}
	case "create-collection":
		lib := resolveLibrary(application, *section)
		titleList := splitCSV(*titles)
		must(application.CreateCollectionFromTitles(lib.Key, *name, titleList, *prompt, false, ""))
		fmt.Println("collection created")
	case "delete-collection":
		lib := resolveLibrary(application, *section)
		must(application.DeleteCollectionByName(lib.Key, *name))
		fmt.Println("collection deleted")
	case "recipes":
		for _, recipe := range application.Recipes() {
			fmt.Printf("%s\t%s\t%v\n", recipe.ID, recipe.Name, recipe.PromptAliases)
		}
	default:
		fmt.Fprintf(os.Stderr, "unknown mode: %s\n", *mode)
		os.Exit(2)
	}
}

func must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func splitCSV(in string) []string {
	if strings.TrimSpace(in) == "" {
		return nil
	}
	parts := strings.Split(in, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func resolveLibrary(application *app.App, input string) plex.Library {
	lib, err := application.ResolveLibrarySection(input)
	if err != nil {
		log.Fatal(err)
	}
	return lib
}
