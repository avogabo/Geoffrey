export type MediaItem = {
  id: string;
  type: 'movie' | 'series';
  title: string;
  year: number;
  quality: '4K' | '1080p' | '720p';
  genres: string[];
  synopsis: string;
  poster: string;
  backdrop: string;
  seasons?: number;
};

export const featured: MediaItem[] = [
  {
    id: 'fallout-2024',
    type: 'series',
    title: 'Fallout',
    year: 2024,
    quality: '4K',
    genres: ['Sci-Fi', 'Adventure'],
    synopsis: 'Un catálogo moderno privado con estética de plataforma, conectado a tu colección real.',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1400&q=80',
    seasons: 2,
  },
  {
    id: 'bosch-2015',
    type: 'series',
    title: 'Bosch',
    year: 2015,
    quality: '1080p',
    genres: ['Crime', 'Drama'],
    synopsis: 'Ejemplo de ficha con temporadas, calidad inferida y navegación visual.',
    poster: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=80',
    seasons: 7,
  },
  {
    id: 'dune-2021',
    type: 'movie',
    title: 'Dune',
    year: 2021,
    quality: '4K',
    genres: ['Sci-Fi', 'Epic'],
    synopsis: 'Ejemplo de película con metadata visual y estilo moderno.',
    poster: 'https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?auto=format&fit=crop&w=800&q=80',
    backdrop: 'https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=1400&q=80',
  },
];
