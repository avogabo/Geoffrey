import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Tv, Film, Sparkles, FolderTree, ArrowLeft, CalendarDays, Clapperboard } from 'lucide-react';
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

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (selected) {
    return <DetailView item={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div className="app-shell">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="badge"><Sparkles size={14} /> Media Catalog MVP</span>
          <h1>Tu colección, pero bonita.</h1>
          <p>
            Catálogo visual moderno alimentado por tu árbol de media, pensado para web + búsqueda desde Telegram.
          </p>
          <div className="stats-row">
            <div className="stat"><strong>{catalog?.count ?? 0}</strong><span>títulos indexados</span></div>
            <div className="stat"><strong>{items.filter((x) => x.type === 'series').length}</strong><span>series</span></div>
            <div className="stat"><strong>{items.filter((x) => x.type === 'movie').length}</strong><span>películas</span></div>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Bosch, Fallout, 4K, 2024..." />
          </div>
        </div>
      </section>

      <section className="section-header">
        <h2>Catálogo</h2>
        <p>{filtered.length} resultados · fuente: {catalog?.generatedFrom ?? 'cargando...'}</p>
      </section>

      <section className="card-grid">
        {filtered.slice(0, 24).map((item, index) => (
          <MediaCard key={item.id} item={item} index={index} onOpen={() => setSelectedId(item.id)} />
        ))}
      </section>
    </div>
  );
}

function MediaCard({ item, index, onOpen }: { item: MediaItem; index: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      className="media-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onOpen}
    >
      <div className="poster poster-fallback">
        <div>
          {item.type === 'series' ? <Tv size={28} /> : <Film size={28} />}
          <span>{item.title}</span>
        </div>
      </div>
      <div className="card-body">
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
    <div className="detail-shell">
      <section className="detail-hero">
        <div className="detail-overlay" />
        <div className="detail-inner">
          <button className="back-button" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
          <div className="detail-layout">
            <div className="detail-poster poster-fallback">
              <div>
                {item.type === 'series' ? <Tv size={36} /> : <Film size={36} />}
                <span>{item.title}</span>
              </div>
            </div>
            <div className="detail-copy">
              <span className="badge">{item.type === 'series' ? 'Serie' : 'Película'}</span>
              <h1>{item.title}</h1>
              <div className="detail-meta-row">
                <span><CalendarDays size={16} /> {item.year ?? 's/f'}</span>
                <span><Clapperboard size={16} /> {item.quality}</span>
                <span>{item.type === 'series' ? `${item.seasonCount ?? 0} temporadas` : 'película'}</span>
              </div>
              <p className="detail-synopsis">{item.synopsis}</p>
              <div className="detail-chip-row">
                {item.paths.slice(0, 3).map((path) => (
                  <span key={path} className="path-chip">{path}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-content">
        {item.seasons.length > 0 ? (
          <>
            <h2>Temporadas</h2>
            <div className="season-grid">
              {item.seasons.map((season) => (
                <article key={season.season} className="season-card">
                  <h3>Temporada {season.season}</h3>
                  <p>{season.episodeCount} episodios</p>
                  <ul>
                    {season.episodes.slice(0, 6).map((episode) => (
                      <li key={episode}>{episode}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>Archivos</h2>
            <div className="season-grid">
              <article className="season-card">
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
    </div>
  );
}

export default App;
