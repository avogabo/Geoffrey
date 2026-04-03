import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Tv, Film, Sparkles, FolderTree, ArrowLeft, CalendarDays, Clapperboard, Layers3, Star } from 'lucide-react';
import './App.css';
import type { CatalogData, MediaItem } from './types';

function App() {
  const [catalog, setCatalog] = useState<CatalogData | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/catalog.json')
      .then((r) => r.json())
      .then(setCatalog)
      .catch(console.error);
  }, []);

  const items = catalog?.items ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, String(item.year ?? ''), item.type, item.quality, ...item.paths]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);
  const featured = filtered.slice(0, 18);

  return (
    <div className="app-shell premium-shell">
      <AnimatePresence mode="wait">
        {selected ? (
          <DetailView key={selected.id} item={selected} onBack={() => setSelectedId(null)} />
        ) : (
          <motion.div key="catalog" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <section className="hero premium-hero">
              <div className="hero-overlay premium-overlay" />
              <div className="hero-content premium-content">
                <span className="badge hero-badge"><Sparkles size={14} /> Toodles Media Catalog</span>
                <h1>Tu colección con pinta de plataforma seria.</h1>
                <p>
                  Catálogo visual conectado a tu colección real, con navegación bonita, detalle por título y pensado para futura búsqueda desde Telegram.
                </p>
                <div className="stats-row premium-stats">
                  <StatCard value={catalog?.count ?? 0} label="títulos" />
                  <StatCard value={items.filter((x) => x.type === 'series').length} label="series" />
                  <StatCard value={items.filter((x) => x.type === 'movie').length} label="películas" />
                </div>
                <div className="search-box premium-search">
                  <Search size={18} />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Bosch, Fallout, 4K, 2024..." />
                </div>
              </div>
            </section>

            <section className="section-header premium-header">
              <div>
                <h2>Catálogo</h2>
                <p>{filtered.length} resultados · fuente: {catalog?.generatedFrom ?? 'cargando...'}</p>
              </div>
            </section>

            <section className="card-grid premium-grid">
              {featured.map((item, index) => (
                <MediaCard key={item.id} item={item} index={index} onOpen={() => setSelectedId(item.id)} />
              ))}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="stat premium-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MediaCard({ item, index, onOpen }: { item: MediaItem; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      className="media-card premium-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.025 }}
      onClick={onOpen}
    >
      <div className="poster poster-fallback premium-poster">
        <div>
          {item.type === 'series' ? <Tv size={28} /> : <Film size={28} />}
          <span>{item.title}</span>
        </div>
      </div>
      <div className="card-body premium-card-body">
        <div className="card-topline">
          <span className="type-pill">{item.type === 'series' ? <Tv size={14} /> : <Film size={14} />}{item.type}</span>
          <span className="quality">{item.quality}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="meta">{item.year ?? 's/f'} · {item.type === 'series' ? `${item.seasonCount ?? 0} temporadas` : 'película'}</p>
        <p className="synopsis">{item.synopsis}</p>
        <div className="path-box">
          <FolderTree size={14} />
          <span>{item.paths[0]}</span>
        </div>
      </div>
    </motion.button>
  );
}

function DetailView({ item, onBack }: { item: MediaItem; onBack: () => void }) {
  return (
    <motion.div className="detail-shell premium-detail-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="detail-hero premium-detail-hero">
        <div className="detail-overlay premium-detail-overlay" />
        <div className="detail-inner">
          <button className="back-button premium-back" onClick={onBack}><ArrowLeft size={16} /> Volver al catálogo</button>
          <div className="detail-layout premium-detail-layout">
            <div className="detail-poster poster-fallback premium-detail-poster">
              <div>
                {item.type === 'series' ? <Tv size={40} /> : <Film size={40} />}
                <span>{item.title}</span>
              </div>
            </div>
            <div className="detail-copy premium-detail-copy">
              <div className="detail-kicker-row">
                <span className="badge">{item.type === 'series' ? 'Serie' : 'Película'}</span>
                <span className="rating-pill"><Star size={14} /> colección</span>
              </div>
              <h1>{item.title}</h1>
              <div className="detail-meta-row premium-detail-meta">
                <span><CalendarDays size={16} /> {item.year ?? 's/f'}</span>
                <span><Clapperboard size={16} /> {item.quality}</span>
                <span><Layers3 size={16} /> {item.type === 'series' ? `${item.seasonCount ?? 0} temporadas` : 'película'}</span>
              </div>
              <p className="detail-synopsis">{item.synopsis}</p>
              <div className="detail-chip-row">
                {item.paths.slice(0, 4).map((path) => (
                  <span key={path} className="path-chip">{path}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-content premium-detail-content">
        {item.seasons.length > 0 ? (
          <>
            <div className="detail-section-header">
              <h2>Temporadas</h2>
              <p>{item.seasonCount} temporadas indexadas</p>
            </div>
            <div className="season-grid premium-season-grid">
              {item.seasons.map((season) => (
                <article key={season.season} className="season-card premium-season-card">
                  <h3>Temporada {season.season}</h3>
                  <p>{season.episodeCount} episodios</p>
                  <ul>
                    {season.episodes.slice(0, 8).map((episode) => (
                      <li key={episode}>{episode}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="detail-section-header">
              <h2>Archivos</h2>
              <p>Variantes detectadas</p>
            </div>
            <div className="season-grid premium-season-grid">
              <article className="season-card premium-season-card">
                <ul>
                  {item.variants.map((file) => (
                    <li key={file}>{file}</li>
                  ))}
                </ul>
              </article>
            </div>
          </>
        )}
      </section>
    </motion.div>
  );
}

export default App;
