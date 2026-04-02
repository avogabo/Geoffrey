export type SeasonInfo = {
  season: number;
  episodeCount: number;
  episodes: string[];
};

export type MediaItem = {
  id: string;
  title: string;
  year: number | null;
  type: 'movie' | 'series';
  quality: '4K' | '1080p' | '720p';
  genres: string[];
  synopsis: string;
  poster: string | null;
  backdrop: string | null;
  seasonCount?: number;
  seasons: SeasonInfo[];
  paths: string[];
  variants: string[];
};

export type CatalogData = {
  generatedFrom: string;
  count: number;
  items: MediaItem[];
};
