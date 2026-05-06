package plex

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

func (c *Client) ImageURL(path string) string {
	path = strings.TrimSpace(path)
	if path == "" {
		return ""
	}
	if strings.HasPrefix(path, "http://") || strings.HasPrefix(path, "https://") {
		return path
	}
	base := strings.TrimRight(c.baseURL, "/")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return fmt.Sprintf("%s%s?X-Plex-Token=%s", base, path, url.QueryEscape(c.token))
}

func (c *Client) FetchImage(path string) (*http.Response, error) {
	u := c.ImageURL(path)
	if u == "" {
		return nil, fmt.Errorf("image path is required")
	}
	resp, err := c.http.Get(u)
	if err != nil {
		return nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		defer resp.Body.Close()
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 1024))
		return nil, fmt.Errorf("plex image fetch failed: %s %s", resp.Status, strings.TrimSpace(string(body)))
	}
	return resp, nil
}
