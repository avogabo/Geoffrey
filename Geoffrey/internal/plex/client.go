package plex

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL string
	token   string
	http    *http.Client
}

type LibrariesResponse struct {
	Directories []Library `xml:"Directory"`
}

type Library struct {
	Key   string `xml:"key,attr"`
	Title string `xml:"title,attr"`
	Type  string `xml:"type,attr"`
}

func New(baseURL, token string) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		token:   token,
		http:    &http.Client{Timeout: 20 * time.Second},
	}
}

func (c *Client) Libraries() ([]Library, error) {
	if c.baseURL == "" || c.token == "" {
		return nil, fmt.Errorf("plex client not configured")
	}
	u := c.baseURL + "/library/sections"
	q := url.Values{}
	q.Set("X-Plex-Token", c.token)
	u += "?" + q.Encode()
	resp, err := c.http.Get(u)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("plex libraries failed: %s", resp.Status)
	}
	var out LibrariesResponse
	if err := xml.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	return out.Directories, nil
}
