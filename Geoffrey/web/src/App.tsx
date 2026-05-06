import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Check, Clapperboard, Clock3, ImagePlus, Library, LoaderCircle, Plus, Search, Sparkles, Trash2, Wand2 } from 'lucide-react'

type LibraryItem = { key: string; title: string; type: string }
type CollectionItem = { ratingKey: string; title: string; type: string; childCount: number; temporary: boolean; expiresAt?: string; thumbUrl?: string; artUrl?: string }
type SearchItem = { ratingKey: string; title: string; type: string; year: number; thumb?: string; art?: string }
type RecipeItem = { id: string; name: string; promptAliases: string[]; inclusionRules: string[]; exclusionRules: string[]; orderingRules: string[]; temporaryByDefault: boolean }
type Settings = { plexBaseUrl: string; plexDefaultLibrary: string; dataDir: string; telegramEnabled: boolean; timeZone: string }

type FormState = {
  name: string
  query: string
  sourcePrompt: string
  expiresAt: string
  temporary: boolean
  posterUrl: string
  posterBase64: string
}

const emptyForm: FormState = {
  name: '',
  query: '',
  sourcePrompt: '',
  expiresAt: '',
  temporary: false,
  posterUrl: '',
  posterBase64: '',
}

export default function App() {
  const [libraries, setLibraries] = useState<LibraryItem[]>([])
  const [selectedLibrary, setSelectedLibrary] = useState<string>('')
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [recipes, setRecipes] = useState<RecipeItem[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [searchResults, setSearchResults] = useState<SearchItem[]>([])
  const [selectedTitles, setSelectedTitles] = useState<SearchItem[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    if (!selectedLibrary) return
    void loadCollections(selectedLibrary)
  }, [selectedLibrary])

  const selectedLibraryMeta = libraries.find((item) => item.key === selectedLibrary)
  const posterPreview = form.posterBase64 || form.posterUrl
  const selectedCount = selectedTitles.length
  const canCreate = Boolean(selectedLibrary && form.name.trim() && selectedCount)

  const stats = useMemo(() => {
    const temporary = collections.filter((item) => item.temporary).length
    return {
      libraries: libraries.length,
      collections: collections.length,
      temporary,
    }
  }, [libraries, collections])

  async function bootstrap() {
    try {
      setLoading(true)
      const [librariesRes, recipesRes, settingsRes] = await Promise.all([
        fetchJSON<{ items: LibraryItem[] }>('/api/libraries'),
        fetchJSON<{ items: RecipeItem[] }>('/api/recipes'),
        fetchJSON<Settings>('/api/settings'),
      ])
      setLibraries(librariesRes.items)
      setRecipes(recipesRes.items)
      setSettings(settingsRes)
      const preferred = librariesRes.items.find((item) => item.title === settingsRes.plexDefaultLibrary)?.key ?? librariesRes.items[0]?.key ?? ''
      setSelectedLibrary(preferred)
    } catch (err) {
      setError(readError(err))
    } finally {
      setLoading(false)
    }
  }

  async function loadCollections(libraryKey: string) {
    try {
      const res = await fetchJSON<{ items: CollectionItem[] }>(`/api/collections?library=${encodeURIComponent(libraryKey)}`)
      setCollections(res.items)
    } catch (err) {
      setError(readError(err))
    }
  }

  async function runSearch() {
    if (!form.query.trim() || !selectedLibrary) return
    try {
      setWorking(true)
      setError('')
      setSuccess('')
      const res = await fetchJSON<{ items: SearchItem[] }>(`/api/search?library=${encodeURIComponent(selectedLibrary)}&q=${encodeURIComponent(form.query)}`)
      setSearchResults(res.items)
      if (!res.items.length) setSuccess('No he encontrado resultados con esa búsqueda.')
    } catch (err) {
      setError(readError(err))
    } finally {
      setWorking(false)
    }
  }

  function toggleTitle(item: SearchItem) {
    setSelectedTitles((current) => current.some((entry) => entry.ratingKey === item.ratingKey)
      ? current.filter((entry) => entry.ratingKey !== item.ratingKey)
      : [...current, item])
  }

  function applyRecipe(recipe: RecipeItem) {
    setForm((current) => ({
      ...current,
      name: recipe.name,
      sourcePrompt: recipe.promptAliases[0] ?? recipe.name,
      temporary: recipe.temporaryByDefault,
    }))
    setSuccess(`Receta cargada: ${recipe.name}`)
  }

  async function uploadPoster(file: File) {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/poster/upload', { method: 'POST', body })
    const payload = await res.json()
    if (!res.ok) throw new Error(payload.error ?? 'No se pudo subir el póster')
    setForm((current) => ({ ...current, posterBase64: payload.dataUrl, posterUrl: '' }))
    setSuccess(`Póster listo: ${payload.filename}`)
  }

  async function createCollection() {
    if (!selectedLibrary) return
    if (!form.name.trim()) {
      setError('Pon un nombre de colección.')
      return
    }
    if (!selectedTitles.length) {
      setError('Selecciona al menos un título.')
      return
    }
    try {
      setWorking(true)
      setError('')
      setSuccess('')
      await fetchJSON('/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          libraryKey: selectedLibrary,
          name: form.name,
          titles: selectedTitles.map((item) => item.title),
          sourcePrompt: form.sourcePrompt,
          temporary: form.temporary,
          expiresAt: form.expiresAt,
          posterUrl: form.posterUrl,
          posterBase64: form.posterBase64,
        }),
      })
      setSuccess(`Colección creada: ${form.name}`)
      setForm(emptyForm)
      setSearchResults([])
      setSelectedTitles([])
      await loadCollections(selectedLibrary)
    } catch (err) {
      setError(readError(err))
    } finally {
      setWorking(false)
    }
  }

  async function deleteCollection(item: CollectionItem) {
    if (!selectedLibrary) return
    if (!window.confirm(`Borrar la colección “${item.title}”?`)) return
    try {
      setWorking(true)
      setError('')
      setSuccess('')
      await fetchJSON(`/api/collections/${encodeURIComponent(selectedLibrary)}/${encodeURIComponent(item.title)}`, { method: 'DELETE' })
      setSuccess(`Colección borrada: ${item.title}`)
      await loadCollections(selectedLibrary)
    } catch (err) {
      setError(readError(err))
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="shell">
      <section className="hero panel">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={16} /> Geoffrey</span>
          <h1>Curador visual de colecciones Plex</h1>
          <p>Selecciona biblioteca, afina tu colección, decide si es temporal y remátala con póster. Geoffrey deja de hablar de colecciones y pasa a montarlas contigo.</p>
        </div>
        <div className="hero-stats">
          <Stat label="Bibliotecas" value={stats.libraries} icon={<Library size={18} />} />
          <Stat label="Colecciones" value={stats.collections} icon={<Clapperboard size={18} />} />
          <Stat label="Temporales" value={stats.temporary} icon={<Clock3 size={18} />} />
        </div>
      </section>

      {error ? <div className="banner error">{error}</div> : null}
      {success ? <div className="banner success">{success}</div> : null}

      <div className="layout">
        <aside className="panel sidebar">
          <div className="section-head"><h2>Bibliotecas</h2></div>
          <div className="library-list">
            {libraries.map((item) => (
              <button key={item.key} className={`library-row ${selectedLibrary === item.key ? 'active' : ''}`} onClick={() => setSelectedLibrary(item.key)}>
                <strong>{item.title}</strong>
                <span>{item.type}</span>
              </button>
            ))}
          </div>

          <div className="section-head top-gap"><h2>Recetas rápidas</h2></div>
          <div className="recipe-list">
            {recipes.map((recipe) => (
              <button key={recipe.id} className="recipe-card" onClick={() => applyRecipe(recipe)}>
                <strong>{recipe.name}</strong>
                <span>{recipe.promptAliases.slice(0, 2).join(' · ')}</span>
              </button>
            ))}
          </div>

          <div className="section-head top-gap"><h2>Checklist</h2></div>
          <div className="checklist">
            <ChecklistItem done={Boolean(selectedLibrary)} label="Biblioteca elegida" />
            <ChecklistItem done={Boolean(form.name.trim())} label="Nombre listo" />
            <ChecklistItem done={Boolean(selectedCount)} label={`${selectedCount || 0} títulos seleccionados`} />
            <ChecklistItem done={!form.temporary || Boolean(form.expiresAt)} label={form.temporary ? 'Temporal con fecha' : 'No temporal'} />
          </div>
        </aside>

        <main className="stack">
          <section className="panel compose-panel">
            <div className="section-head"><h2>Componer colección</h2><span>{selectedLibraryMeta ? `${selectedLibraryMeta.title} · ${selectedLibraryMeta.type}` : 'Elige una biblioteca'}</span></div>

            <div className="wizard-grid">
              <section className="builder-card soft-card">
                <div className="section-head compact"><h3>Paso 1, definición</h3><span>{settings?.plexDefaultLibrary ? `Por defecto: ${settings.plexDefaultLibrary}` : ''}</span></div>
                <div className="form-grid">
                  <label>
                    <span>Nombre</span>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Halloween de risa" />
                  </label>
                  <label>
                    <span>Idea / receta</span>
                    <input value={form.sourcePrompt} onChange={(e) => setForm({ ...form, sourcePrompt: e.target.value })} placeholder="Navidad TV acogedora" />
                  </label>
                  <label className="wide-field">
                    <span>Búsqueda Plex</span>
                    <div className="search-row">
                      <input value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} placeholder="Gremlins" />
                      <button className="primary" onClick={runSearch} disabled={working}><Search size={16} /> Buscar</button>
                    </div>
                  </label>
                  <label>
                    <span>Caduca el</span>
                    <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} disabled={!form.temporary} />
                  </label>
                </div>
                <div className="toggles">
                  <label className="check"><input type="checkbox" checked={form.temporary} onChange={(e) => setForm({ ...form, temporary: e.target.checked })} /> Temporal</label>
                </div>
              </section>

              <aside className="builder-card preview-card">
                <div className="section-head compact"><h3>Resumen antes de crear</h3><span>{canCreate ? 'Listo para crear' : 'Faltan pasos'}</span></div>
                <Poster src={posterPreview} alt={form.name || 'Poster preview'} />
                <div className="summary-grid">
                  <SummaryItem label="Nombre" value={form.name || 'Sin definir'} />
                  <SummaryItem label="Biblioteca" value={selectedLibraryMeta?.title || 'Sin elegir'} />
                  <SummaryItem label="Títulos" value={selectedCount ? `${selectedCount} seleccionados` : 'Ninguno'} />
                  <SummaryItem label="Tipo" value={form.temporary ? `Temporal${form.expiresAt ? ` hasta ${form.expiresAt}` : ''}` : 'Permanente'} />
                </div>
                <div className="summary-tags">
                  {selectedTitles.slice(0, 4).map((item) => <span key={item.ratingKey} className="tag">{item.title}</span>)}
                  {selectedTitles.length > 4 ? <span className="tag muted">+{selectedTitles.length - 4} más</span> : null}
                </div>
                <button className="primary wide" onClick={createCollection} disabled={working || !canCreate}><Plus size={16} /> Crear colección</button>
              </aside>
            </div>

            <div className="poster-box">
              <div>
                <h3>Póster</h3>
                <p>V1 cerrada con dos vías prácticas: URL directa o imagen subida. Lo suficiente para curar sin liarse con scraping todavía.</p>
              </div>
              <label>
                <span>URL del póster</span>
                <input value={form.posterUrl} onChange={(e) => setForm({ ...form, posterUrl: e.target.value, posterBase64: '' })} placeholder="https://..." />
              </label>
              <label className="upload">
                <span><ImagePlus size={16} /> Subir póster</span>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadPoster(file) }} />
              </label>
            </div>

            <div className="section-head top-gap"><h2>Resultados</h2><span>{selectedCount} seleccionados</span></div>
            <div className="results-grid">
              {loading ? <Loader /> : searchResults.map((item) => (
                <button key={item.ratingKey} className={`result-card ${selectedTitles.some((entry) => entry.ratingKey === item.ratingKey) ? 'selected' : ''}`} onClick={() => toggleTitle(item)}>
                  <Poster src={item.thumb ? `/api/plex/image?path=${encodeURIComponent(item.thumb)}` : ''} alt={item.title} compact />
                  <strong>{item.title}</strong>
                  <span>{item.type} · {item.year || 's/f'}</span>
                  <span className="pick-state">{selectedTitles.some((entry) => entry.ratingKey === item.ratingKey) ? 'Quitar' : 'Añadir'}</span>
                </button>
              ))}
              {!loading && !searchResults.length ? <div className="empty">Busca títulos y selecciónalos aquí.</div> : null}
            </div>
          </section>

          <section className="panel">
            <div className="section-head"><h2>Colecciones existentes</h2><span>{selectedLibraryMeta?.title ?? 'Sin biblioteca'}</span></div>
            <div className="collection-list">
              {collections.map((item) => (
                <div key={item.ratingKey} className="collection-row visual">
                  <Poster src={item.thumbUrl || item.artUrl || ''} alt={item.title} />
                  <div className="collection-copy">
                    <strong>{item.title}</strong>
                    <span>{item.childCount} elementos {item.temporary ? `· temporal ${item.expiresAt || ''}` : ''}</span>
                  </div>
                  <button className="ghost danger" onClick={() => deleteCollection(item)}><Trash2 size={16} /> Borrar</button>
                </div>
              ))}
              {!collections.length ? <div className="empty">No hay colecciones aún en esta biblioteca.</div> : null}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return <div className="stat"><span>{icon}{label}</span><strong>{value}</strong></div>
}

function Loader() {
  return <div className="empty"><LoaderCircle className="spin" size={18} /> Cargando…</div>
}

function Poster({ src, alt, compact = false }: { src: string; alt: string; compact?: boolean }) {
  if (!src) return <div className={`poster ${compact ? 'compact' : ''} placeholder`}><Clapperboard size={compact ? 18 : 24} /></div>
  return <img className={`poster ${compact ? 'compact' : ''}`} src={src} alt={alt} loading="lazy" />
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return <div className="summary-item"><span>{label}</span><strong>{value}</strong></div>
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  return <div className={`check-item ${done ? 'done' : ''}`}>{done ? <Check size={16} /> : <Wand2 size={16} />}<span>{label}</span></div>
}

async function fetchJSON<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error ?? 'Request failed')
  return payload as T
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : 'Algo falló'
}
