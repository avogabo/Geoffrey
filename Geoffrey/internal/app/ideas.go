package app

import (
	"sort"
	"strings"

	"github.com/avogabo/geoffrey/internal/plex"
)

type IdeaSuggestion struct {
	RecipeID        string       `json:"recipeId,omitempty"`
	RecipeName      string       `json:"recipeName,omitempty"`
	MatchedAliases  []string     `json:"matchedAliases,omitempty"`
	SuggestedTitles []plex.Video `json:"suggestedTitles"`
	SearchTerms     []string     `json:"searchTerms"`
}

func (a *App) SuggestFromIdea(sectionKey, idea string) (IdeaSuggestion, error) {
	idea = strings.TrimSpace(strings.ToLower(idea))
	recipes := a.Recipes()
	suggestion := IdeaSuggestion{}
	seenTerms := map[string]bool{}
	for _, recipe := range recipes {
		var matched []string
		for _, alias := range recipe.PromptAliases {
			aliasNorm := strings.ToLower(strings.TrimSpace(alias))
			if aliasNorm == "" {
				continue
			}
			if strings.Contains(idea, aliasNorm) || strings.Contains(aliasNorm, idea) {
				matched = append(matched, alias)
			}
		}
		if len(matched) > 0 {
			suggestion.RecipeID = recipe.ID
			suggestion.RecipeName = recipe.Name
			suggestion.MatchedAliases = matched
			for _, term := range recipe.InclusionRules {
				clean := strings.TrimSpace(term)
				if clean != "" && !seenTerms[clean] {
					suggestion.SearchTerms = append(suggestion.SearchTerms, clean)
					seenTerms[clean] = true
				}
			}
			break
		}
	}
	if len(suggestion.SearchTerms) == 0 {
		for _, token := range tokenizeIdea(idea) {
			if len(token) < 3 || seenTerms[token] {
				continue
			}
			suggestion.SearchTerms = append(suggestion.SearchTerms, token)
			seenTerms[token] = true
		}
	}
	if len(suggestion.SearchTerms) == 0 {
		suggestion.SearchTerms = []string{idea}
	}

	unique := map[string]plex.Video{}
	for _, term := range suggestion.SearchTerms {
		results, err := a.Search(sectionKey, term)
		if err != nil {
			return suggestion, err
		}
		for _, item := range results {
			if item.RatingKey == "" || unique[item.RatingKey].RatingKey != "" {
				continue
			}
			unique[item.RatingKey] = item
		}
	}
	for _, item := range unique {
		suggestion.SuggestedTitles = append(suggestion.SuggestedTitles, item)
	}
	sort.Slice(suggestion.SuggestedTitles, func(i, j int) bool {
		return strings.ToLower(suggestion.SuggestedTitles[i].Title) < strings.ToLower(suggestion.SuggestedTitles[j].Title)
	})
	if len(suggestion.SuggestedTitles) > 18 {
		suggestion.SuggestedTitles = suggestion.SuggestedTitles[:18]
	}
	return suggestion, nil
}

func tokenizeIdea(idea string) []string {
	replacer := strings.NewReplacer(",", " ", ".", " ", ":", " ", ";", " ", "-", " ", "_", " ", "/", " ")
	idea = replacer.Replace(idea)
	parts := strings.Fields(idea)
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}
