import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './App.css'

type View = 'studio' | 'gallery' | 'enhance' | 'profile'
type Modal = 'privacy' | 'cloud' | 'export' | 'import' | 'preset' | null
type Tool = 'retouch' | 'crop' | 'lighting' | 'layers'
type ProcessMode = 'cloud' | 'local'
type CompareMode = 'after' | 'before' | 'split'

type Preset = {
  name: string
  tone: string
  strength: number
  tag: string
  favorite: boolean
}

type Adjustment = {
  key: string
  label: string
  value: number
  min: number
  max: number
  suffix?: string
}

const people = [
  `${import.meta.env.BASE_URL}people/person-01.jpg`,
  `${import.meta.env.BASE_URL}people/person-02.jpg`,
  `${import.meta.env.BASE_URL}people/person-03.jpg`,
  `${import.meta.env.BASE_URL}people/person-04.jpg`,
  `${import.meta.env.BASE_URL}people/person-05.jpg`,
  `${import.meta.env.BASE_URL}people/person-06.jpg`,
  `${import.meta.env.BASE_URL}people/person-07.jpg`,
  `${import.meta.env.BASE_URL}people/person-08.jpg`,
]

const navItems: Array<{ id: View; label: string; icon: ReactNode }> = [
  { id: 'studio', label: 'Studio', icon: <StudioIcon /> },
  { id: 'gallery', label: 'Gallery', icon: <GalleryIcon /> },
  { id: 'enhance', label: 'Enhance', icon: <SparkIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
]

const presets: Preset[] = [
  { name: 'Tuscan Dusk', tone: 'Warm editorial', strength: 72, tag: 'Color', favorite: true },
  { name: 'Noir Bloom', tone: 'Soft contrast', strength: 58, tag: 'Light', favorite: false },
  { name: 'Porcelain Skin', tone: 'Fine texture', strength: 64, tag: 'Skin', favorite: true },
  { name: 'Morning Veil', tone: 'Clean daylight', strength: 49, tag: 'Natural', favorite: false },
  { name: 'Velvet Print', tone: 'Film matte', strength: 81, tag: 'Film', favorite: true },
  { name: 'Glass Studio', tone: 'Cool clarity', strength: 54, tag: 'Studio', favorite: false },
]

const baseAdjustments: Adjustment[] = [
  { key: 'texture', label: 'Skin texture', value: 72, min: 0, max: 100, suffix: '%' },
  { key: 'light', label: 'Studio light', value: 64, min: 0, max: 100, suffix: '%' },
  { key: 'warmth', label: 'Tone warmth', value: 42, min: -50, max: 50 },
  { key: 'detail', label: 'Local detail', value: 18, min: 0, max: 100, suffix: '%' },
  { key: 'smooth', label: 'Blemish smoothing', value: 34, min: 0, max: 100, suffix: '%' },
  { key: 'grain', label: 'Fine grain', value: 12, min: 0, max: 40 },
]

const historyItems = [
  'Imported portrait set',
  'Applied Porcelain Skin',
  'Balanced highlights',
  'Saved local snapshot',
]

const collections = ['Client selects', 'Warm portraits', 'Editorial tests', 'Private cache']

function shuffledPeople() {
  return [...people]
    .map((image) => ({ image, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ image }) => image)
}

function App() {
  const [booting, setBooting] = useState(true)
  const [view, setView] = useState<View>('studio')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedPreset, setSelectedPreset] = useState(presets[0].name)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTool, setActiveTool] = useState<Tool>('retouch')
  const [processMode, setProcessMode] = useState<ProcessMode>('cloud')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compare, setCompare] = useState<CompareMode>('after')
  const [cloudEnabled, setCloudEnabled] = useState(false)
  const [exportFormat, setExportFormat] = useState('PNG')
  const [resolution, setResolution] = useState('2x')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [images] = useState(shuffledPeople)
  const [adjustments, setAdjustments] = useState(baseAdjustments)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooting(false)
      setModal('privacy')
    }, 950)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isProcessing) return

    setProgress(0)
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer)
          window.setTimeout(() => setIsProcessing(false), 360)
          return 100
        }
        return Math.min(current + (processMode === 'cloud' ? 8 : 5), 100)
      })
    }, 130)

    return () => window.clearInterval(timer)
  }, [isProcessing, processMode])

  const selected = useMemo(
    () => presets.find((preset) => preset.name === selectedPreset) ?? presets[0],
    [selectedPreset],
  )

  const visiblePresets = favoritesOnly ? presets.filter((preset) => preset.favorite) : presets
  const selectedPortrait = images[selectedImage % images.length]

  function updateAdjustment(key: string, value: number) {
    setAdjustments((current) =>
      current.map((adjustment) =>
        adjustment.key === key ? { ...adjustment, value } : adjustment,
      ),
    )
  }

  function startProcess(mode: ProcessMode) {
    setProcessMode(mode)
    setView('enhance')
    setModal(null)
    setIsProcessing(true)
    if (mode === 'cloud') setCloudEnabled(true)
  }

  return (
    <main className="app-shell">
      {booting && <LoadingScreen onSkip={() => setBooting(false)} />}

      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <SparkIcon />
          <div>
            <strong>Silk Studio</strong>
            <span>Atelier workspace</span>
          </div>
        </div>

        <nav className="nav-stack">
          {navItems.map((item) => (
            <button
              className={item.id === view ? 'nav-item active' : 'nav-item'}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <SessionCard
          cloudEnabled={cloudEnabled}
          images={images}
          progress={progress}
          selectedImage={selectedImage}
        />
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Atelier</p>
            <h1>{pageTitle(view)}</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={() => setModal('import')}>
              <ImportIcon />
              Import
            </button>
            <button className="ghost-button" type="button" onClick={() => setModal('privacy')}>
              <ShieldIcon />
              Policy
            </button>
            <button className="primary-button" type="button" onClick={() => setModal('export')}>
              Export
              <ArrowIcon />
            </button>
          </div>
        </header>

        <div className="main-grid">
          <section className="canvas-column">
            {view === 'gallery' ? (
              <GalleryView
                favoritesOnly={favoritesOnly}
                images={images}
                onSelect={(name) => {
                  setSelectedPreset(name)
                  setView('studio')
                }}
                selected={selectedPreset}
                setFavoritesOnly={setFavoritesOnly}
                visiblePresets={visiblePresets}
              />
            ) : view === 'profile' ? (
              <ProfileView images={images} setView={setView} />
            ) : view === 'enhance' ? (
              <EnhanceView
                cloudEnabled={cloudEnabled}
                images={images}
                isProcessing={isProcessing}
                processMode={processMode}
                progress={progress}
                selected={selected}
                selectedImage={selectedImage}
                selectedPortrait={selectedPortrait}
                setProcessMode={setProcessMode}
                setSelectedImage={setSelectedImage}
                startProcess={startProcess}
              />
            ) : (
              <StudioView
                activeTool={activeTool}
                compare={compare}
                images={images}
                isProcessing={isProcessing}
                progress={progress}
                selected={selected}
                selectedImage={selectedImage}
                selectedPortrait={selectedPortrait}
                setActiveTool={setActiveTool}
                setCompare={setCompare}
                setSelectedImage={setSelectedImage}
              />
            )}
          </section>

          <aside className="inspector" aria-label="Editing inspector">
            {view === 'profile' ? (
              <ProfileInspector images={images} setModal={setModal} />
            ) : view === 'gallery' ? (
              <GalleryInspector selected={selected} setModal={setModal} setView={setView} />
            ) : view === 'enhance' ? (
              <EnhanceInspector
                adjustments={adjustments}
                cloudEnabled={cloudEnabled}
                processMode={processMode}
                selected={selected}
                selectedPreset={selectedPreset}
                setModal={setModal}
                setProcessMode={setProcessMode}
                setSelectedPreset={setSelectedPreset}
                startProcess={startProcess}
                updateAdjustment={updateAdjustment}
              />
            ) : (
              <StudioInspector
                activeTool={activeTool}
                adjustments={adjustments}
                selected={selected}
                selectedPreset={selectedPreset}
                setModal={setModal}
                setSelectedPreset={setSelectedPreset}
                updateAdjustment={updateAdjustment}
              />
            )}
          </aside>
        </div>
      </section>

      {modal && (
        <ModalLayer
          exportFormat={exportFormat}
          modal={modal}
          onClose={() => setModal(null)}
          resolution={resolution}
          setExportFormat={setExportFormat}
          setResolution={setResolution}
          startProcess={startProcess}
        />
      )}
    </main>
  )
}

function SessionCard({
  cloudEnabled,
  images,
  progress,
  selectedImage,
}: {
  cloudEnabled: boolean
  images: string[]
  progress: number
  selectedImage: number
}) {
  return (
    <div className="session-card">
      <span>Current session</span>
      <strong>Portrait_0421</strong>
      <small>{cloudEnabled ? 'Cloud ready - encrypted queue active' : 'Local cache active'}</small>
      <div className="session-thumbs" aria-label="Session portraits">
        {images.slice(0, 4).map((image, index) => (
          <img className={index === selectedImage ? 'active' : ''} key={image} src={image} alt="" />
        ))}
      </div>
      <div className="mini-progress">
        <span style={{ width: `${progress || 38}%` }} />
      </div>
    </div>
  )
}

function LoadingScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <button className="loading-screen" onClick={onSkip} type="button">
      <span className="loading-mark">
        <SparkIcon />
      </span>
      <strong>Silk Studio</strong>
      <span>Preparing secure portrait workspace...</span>
      <span className="loading-ring" />
      <span className="loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="loading-meta">
        <span>
          <small>Engine</small>
          Precision stack online
        </span>
        <span>
          <small>Cache</small>
          Local portraits ready
        </span>
      </span>
    </button>
  )
}

function StudioView({
  activeTool,
  compare,
  images,
  isProcessing,
  progress,
  selected,
  selectedImage,
  selectedPortrait,
  setActiveTool,
  setCompare,
  setSelectedImage,
}: {
  activeTool: Tool
  compare: CompareMode
  images: string[]
  isProcessing: boolean
  progress: number
  selected: Preset
  selectedImage: number
  selectedPortrait: string
  setActiveTool: (tool: Tool) => void
  setCompare: (value: CompareMode) => void
  setSelectedImage: (index: number) => void
}) {
  return (
    <div className="editor-surface">
      <div className="canvas-toolbar">
        <div>
          <span className="status-dot" />
          Live preview
        </div>
        <div className="segmented">
          {(['before', 'split', 'after'] as const).map((mode) => (
            <button
              className={compare === mode ? 'active' : ''}
              key={mode}
              onClick={() => setCompare(mode)}
              type="button"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="queue-rail" aria-label="Portrait queue">
        {images.slice(0, 5).map((image, index) => (
          <button
            className={selectedImage === index ? 'queue-thumb active' : 'queue-thumb'}
            key={image}
            onClick={() => setSelectedImage(index)}
            type="button"
          >
            <img alt="" src={image} />
          </button>
        ))}
      </div>

      <div className={portraitClass(compare, activeTool)}>
        <img alt="Portrait being edited" src={selectedPortrait} />
        <div className="portrait-gradient" />
        {compare === 'split' && <div className="split-divider"><span /></div>}
        <div className="retouch-slider" style={{ '--value': `${selected.strength}%` } as CSSProperties}>
          <span />
        </div>
        <div className="canvas-badge">
          <SparkIcon />
          {selected.name}
        </div>
        {isProcessing && (
          <div className="processing-overlay">
            <span className="loading-ring small" />
            <strong>{progress}%</strong>
            <small>Processing secure enhancement</small>
          </div>
        )}
      </div>

      <div className="history-strip" aria-label="Edit history">
        {historyItems.map((item, index) => (
          <span key={item}>
            <small>{String(index + 1).padStart(2, '0')}</small>
            {item}
          </span>
        ))}
      </div>

      <div className="tool-dock" aria-label="Canvas tools">
        <ToolButton activeTool={activeTool} icon={<BrushIcon />} id="retouch" setActiveTool={setActiveTool} title="Retouch" />
        <ToolButton activeTool={activeTool} icon={<CropIcon />} id="crop" setActiveTool={setActiveTool} title="Crop" />
        <ToolButton activeTool={activeTool} icon={<SparkIcon />} id="lighting" setActiveTool={setActiveTool} title="Lighting" />
        <ToolButton activeTool={activeTool} icon={<LayersIcon />} id="layers" setActiveTool={setActiveTool} title="Layers" />
      </div>
    </div>
  )
}

function ToolButton({
  activeTool,
  icon,
  id,
  setActiveTool,
  title,
}: {
  activeTool: Tool
  icon: ReactNode
  id: Tool
  setActiveTool: (tool: Tool) => void
  title: string
}) {
  return (
    <button
      className={activeTool === id ? 'active' : ''}
      onClick={() => setActiveTool(id)}
      title={title}
      type="button"
    >
      {icon}
    </button>
  )
}

function EnhanceView({
  cloudEnabled,
  images,
  isProcessing,
  processMode,
  progress,
  selected,
  selectedImage,
  selectedPortrait,
  setProcessMode,
  setSelectedImage,
  startProcess,
}: {
  cloudEnabled: boolean
  images: string[]
  isProcessing: boolean
  processMode: ProcessMode
  progress: number
  selected: Preset
  selectedImage: number
  selectedPortrait: string
  setProcessMode: (value: ProcessMode) => void
  setSelectedImage: (index: number) => void
  startProcess: (mode: ProcessMode) => void
}) {
  return (
    <div className="enhance-lab">
      <section className="ai-hero">
        <div className="ai-copy">
          <p className="eyebrow">AI enhancement</p>
          <h2>Automatic portrait pipeline</h2>
          <p>
            Run a guided enhancement pass across skin texture, light recovery, tone matching,
            and export readiness.
          </p>
          <div className="ai-mode-switch">
            {(['cloud', 'local'] as const).map((mode) => (
              <button
                className={processMode === mode ? 'active' : ''}
                key={mode}
                onClick={() => setProcessMode(mode)}
                type="button"
              >
                {mode === 'cloud' ? 'Cloud AI' : 'Local pass'}
              </button>
            ))}
          </div>
        </div>
        <div className="ai-preview">
          <img alt="AI enhancement preview" src={selectedPortrait} />
          <span className="ai-score">
            <strong>{selected.strength}</strong>
            quality score
          </span>
          {isProcessing && (
            <div className="ai-progress">
              <span style={{ width: `${progress}%` }} />
              <strong>{progress}%</strong>
            </div>
          )}
        </div>
      </section>

      <section className="pipeline-grid" aria-label="Enhancement pipeline">
        {[
          ['01', 'Face map', 'Detect facial areas and protect identity metadata.'],
          ['02', 'Texture pass', 'Reduce blemishes while keeping natural pores.'],
          ['03', 'Relight', 'Recover highlights and balance skin tone.'],
          ['04', 'Export check', 'Prepare web and archive versions.'],
        ].map(([step, title, body]) => (
          <article className="pipeline-step" key={step}>
            <span>{step}</span>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="batch-queue">
        <div>
          <p className="eyebrow">Batch queue</p>
          <h3>{cloudEnabled ? 'Cloud queue ready' : 'Local queue waiting'}</h3>
        </div>
        <div className="batch-strip">
          {images.slice(0, 6).map((image, index) => (
            <button
              className={selectedImage === index ? 'active' : ''}
              key={image}
              onClick={() => setSelectedImage(index)}
              type="button"
            >
              <img alt="" src={image} />
              <span>{index === selectedImage ? 'Target' : 'Queued'}</span>
            </button>
          ))}
        </div>
        <button className="primary-button wide" onClick={() => startProcess(processMode)} type="button">
          Run automatic enhancement
          <ArrowIcon />
        </button>
      </section>
    </div>
  )
}

function StudioInspector({
  activeTool,
  adjustments,
  selected,
  selectedPreset,
  setModal,
  setSelectedPreset,
  updateAdjustment,
}: {
  activeTool: Tool
  adjustments: Adjustment[]
  selected: Preset
  selectedPreset: string
  setModal: (modal: Modal) => void
  setSelectedPreset: (name: string) => void
  updateAdjustment: (key: string, value: number) => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Studio</p>
        <h2>Manual controls</h2>
      </div>

      <div className="mode-card">
        <span className="mode-status">Selected tool</span>
        <strong>{activeToolLabel(activeTool)}</strong>
        <small>Brush, crop, light, and layer changes stay editable inside this session.</small>
      </div>

      <div className="preset-strip">
        {presets.slice(0, 4).map((preset, index) => (
          <button
            className={preset.name === selectedPreset ? 'preset-chip active' : 'preset-chip'}
            key={preset.name}
            onClick={() => setSelectedPreset(preset.name)}
            type="button"
          >
            <span className="preset-index">{index + 1}</span>
            <span>
              <strong>{preset.name}</strong>
              <small>{preset.tone}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="control-list">
        {adjustments.map((adjustment) => (
          <label className="range-control" key={adjustment.key}>
            <span>
              {adjustment.label}
              <strong>
                {adjustment.value}
                {adjustment.suffix ?? ''}
              </strong>
            </span>
            <input
              max={adjustment.max}
              min={adjustment.min}
              onChange={(event) => updateAdjustment(adjustment.key, Number(event.target.value))}
              type="range"
              value={adjustment.value}
            />
          </label>
        ))}
      </div>

      <div className="layer-stack">
        {['Original portrait', selected.name, 'Brush mask', 'Export crop'].map((layer, index) => (
          <button className={index === 1 ? 'active' : ''} key={layer} type="button">
            <LayersIcon />
            <span>
              <strong>{layer}</strong>
              <small>{index === 0 ? 'Locked base' : 'Editable layer'}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="quality-panel">
        <span>{selected.tag} preset</span>
        <strong>{selected.name}</strong>
        <p>{selected.tone}. Apply as an editable look, then tune each layer by hand.</p>
      </div>

      <button className="ghost-button wide" onClick={() => setModal('preset')} type="button">
        Save custom preset
      </button>
    </>
  )
}

function EnhanceInspector({
  adjustments,
  cloudEnabled,
  processMode,
  selected,
  selectedPreset,
  setModal,
  setProcessMode,
  setSelectedPreset,
  startProcess,
  updateAdjustment,
}: {
  adjustments: Adjustment[]
  cloudEnabled: boolean
  processMode: ProcessMode
  selected: Preset
  selectedPreset: string
  setModal: (modal: Modal) => void
  setProcessMode: (value: ProcessMode) => void
  setSelectedPreset: (name: string) => void
  startProcess: (mode: ProcessMode) => void
  updateAdjustment: (key: string, value: number) => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">AI run</p>
        <h2>Enhancement recipe</h2>
      </div>

      <div className="mode-card ai">
        <span className="mode-status">{cloudEnabled ? 'Cloud enabled' : 'Consent required'}</span>
        <strong>{processMode === 'cloud' ? 'High fidelity cloud' : 'Private local pass'}</strong>
        <small>
          AI enhancement is an automatic pipeline, separate from manual studio layers.
        </small>
      </div>

      <div className="panel-tabs">
        <button
          className={processMode === 'cloud' ? 'active' : ''}
          onClick={() => setProcessMode('cloud')}
          type="button"
        >
          Cloud AI
        </button>
        <button
          className={processMode === 'local' ? 'active' : ''}
          onClick={() => setProcessMode('local')}
          type="button"
        >
          Local
        </button>
      </div>

      <div className="preset-strip compact">
        {presets.slice(0, 4).map((preset, index) => (
          <button
            className={preset.name === selectedPreset ? 'preset-chip active' : 'preset-chip'}
            key={preset.name}
            onClick={() => setSelectedPreset(preset.name)}
            type="button"
          >
            <span className="preset-index">{index + 1}</span>
            <span>
              <strong>{preset.name}</strong>
              <small>{preset.tag} model</small>
            </span>
          </button>
        ))}
      </div>

      <div className="ai-checklist">
        {['Face-safe crop', 'Skin texture guard', 'Relight preview', 'Metadata cleanup'].map((item) => (
          <span key={item}>
            <CheckIcon />
            {item}
          </span>
        ))}
      </div>

      <div className="control-list">
        {adjustments.slice(0, 4).map((adjustment) => (
          <label className="range-control" key={adjustment.key}>
            <span>
              {adjustment.label}
              <strong>
                {adjustment.value}
                {adjustment.suffix ?? ''}
              </strong>
            </span>
            <input
              max={adjustment.max}
              min={adjustment.min}
              onChange={(event) => updateAdjustment(adjustment.key, Number(event.target.value))}
              type="range"
              value={adjustment.value}
            />
          </label>
        ))}
      </div>

      <div className="quality-panel ai">
        <span>Selected recipe</span>
        <strong>{selected.name}</strong>
        <p>{selected.tone}. Optimized for one-click portrait processing and batch consistency.</p>
      </div>

      <button className="primary-button wide" onClick={() => startProcess(processMode)} type="button">
        Run {processMode === 'cloud' ? 'cloud' : 'local'} process
        <ArrowIcon />
      </button>
      <button className="ghost-button wide" onClick={() => setModal('cloud')} type="button">
        Review processing mode
      </button>
    </>
  )
}

function GalleryView({
  favoritesOnly,
  images,
  onSelect,
  selected,
  setFavoritesOnly,
  visiblePresets,
}: {
  favoritesOnly: boolean
  images: string[]
  onSelect: (name: string) => void
  selected: string
  setFavoritesOnly: (value: boolean) => void
  visiblePresets: Preset[]
}) {
  return (
    <div className="gallery-shell">
      <div className="gallery-controls">
        <div>
          <p className="eyebrow">Creative gallery</p>
          <h2>Preset library</h2>
        </div>
        <label className="toggle-control">
          <input
            checked={favoritesOnly}
            onChange={(event) => setFavoritesOnly(event.target.checked)}
            type="checkbox"
          />
          Favorites
        </label>
      </div>
      <div className="gallery-grid">
        {visiblePresets.map((preset, index) => (
          <button
            className={selected === preset.name ? 'gallery-tile active' : 'gallery-tile'}
            key={preset.name}
            onClick={() => onSelect(preset.name)}
            type="button"
          >
            <img alt={preset.name} src={images[(index + 1) % images.length]} />
            <span>
              <strong>{preset.name}</strong>
              <small>{preset.favorite ? 'Favorite' : preset.tone}</small>
            </span>
          </button>
        ))}
        <button className="new-tile" type="button">
          <PlusIcon />
          New preset
        </button>
      </div>
    </div>
  )
}

function GalleryInspector({
  selected,
  setModal,
  setView,
}: {
  selected: Preset
  setModal: (modal: Modal) => void
  setView: (view: View) => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Gallery</p>
        <h2>Selected look</h2>
      </div>
      <div className="detail-list strong-list">
        <span>
          Strength
          <strong>{selected.strength}%</strong>
        </span>
        <span>
          Type
          <strong>{selected.tag}</strong>
        </span>
        <span>
          Status
          <strong>{selected.favorite ? 'Favorite' : 'Ready'}</strong>
        </span>
      </div>
      <div className="collection-list">
        {collections.map((collection) => (
          <button key={collection} type="button">
            <FolderIcon />
            {collection}
          </button>
        ))}
      </div>
      <button className="primary-button wide" onClick={() => setView('studio')} type="button">
        Apply in studio
        <ArrowIcon />
      </button>
      <button className="ghost-button wide" onClick={() => setModal('preset')} type="button">
        Duplicate preset
      </button>
    </>
  )
}

function ProfileView({ images, setView }: { images: string[]; setView: (view: View) => void }) {
  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <img alt="Elena Vance" src={images[4]} />
        <h2>Elena Vance</h2>
        <p>Visual Storyteller & Editor</p>
        <div className="profile-stats">
          <span>
            <strong>1,284</strong>
            Total edits
          </span>
          <span>
            <strong>18</strong>
            Presets
          </span>
          <span>
            <strong>4</strong>
            Queues
          </span>
        </div>
      </section>

      <section className="settings-list">
        {['Workspace preferences', 'Export defaults', 'Cloud security', 'Feedback'].map((item) => (
          <button key={item} type="button">
            <span>{item}</span>
            <ArrowIcon />
          </button>
        ))}
      </section>

      <button className="ghost-button danger" onClick={() => setView('studio')} type="button">
        Sign out
      </button>
    </div>
  )
}

function ProfileInspector({
  images,
  setModal,
}: {
  images: string[]
  setModal: (modal: Modal) => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Account</p>
        <h2>Studio edition</h2>
      </div>
      <div className="profile-card">
        <img alt="" src={images[5]} />
        <strong>18 presets synced</strong>
        <span>Last cloud run: today 09:42</span>
      </div>
      <div className="detail-list">
        <span>
          Storage
          <strong>2.4 GB</strong>
        </span>
        <span>
          Security
          <strong>End-to-end</strong>
        </span>
        <span>
          Build
          <strong>2.1.0</strong>
        </span>
      </div>
      <button className="primary-button wide" type="button" onClick={() => setModal('privacy')}>
        Review data policy
      </button>
    </>
  )
}

function ModalLayer({
  exportFormat,
  modal,
  onClose,
  resolution,
  setExportFormat,
  setResolution,
  startProcess,
}: {
  exportFormat: string
  modal: Modal
  onClose: () => void
  resolution: string
  setExportFormat: (value: string) => void
  setResolution: (value: string) => void
  startProcess: (mode: ProcessMode) => void
}) {
  const content = modalContent(modal)

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="close-button" onClick={onClose} type="button" aria-label="Close">
          <CloseIcon />
        </button>
        <span className="modal-icon">{content.icon}</span>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="modal-title">{content.title}</h2>
        <p>{content.body}</p>

        {modal === 'cloud' && (
          <div className="trust-row">
            <span>Encrypted</span>
            <span>4-8 seconds</span>
          </div>
        )}

        {modal === 'export' && (
          <div className="modal-options">
            <label>
              Format
              <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value)}>
                <option>PNG</option>
                <option>JPG</option>
                <option>TIFF</option>
              </select>
            </label>
            <label>
              Size
              <select value={resolution} onChange={(event) => setResolution(event.target.value)}>
                <option>1x</option>
                <option>2x</option>
                <option>4x</option>
              </select>
            </label>
          </div>
        )}

        {modal === 'import' && (
          <div className="drop-zone">
            <ImportIcon />
            <strong>8 local portraits ready</strong>
            <span>Using the images already stored in this project.</span>
          </div>
        )}

        <button
          className="primary-button wide"
          onClick={modal === 'cloud' ? () => startProcess('cloud') : onClose}
          type="button"
        >
          {content.primary}
          <ArrowIcon />
        </button>
        <button className="ghost-button wide" onClick={onClose} type="button">
          {content.secondary}
        </button>
      </section>
    </div>
  )
}

function modalContent(modal: Modal) {
  return {
    privacy: {
      eyebrow: 'Data exposure warning',
      title: 'Your image stays under your control.',
      body:
        'Cloud enhancement sends only the selected portrait through an encrypted request. Local processing keeps edits private on this device.',
      primary: 'I understand',
      secondary: 'Keep local only',
      icon: <ShieldIcon />,
    },
    cloud: {
      eyebrow: 'Cloud AI request',
      title: 'Cloud AI Enhancement',
      body:
        'High-fidelity skin texture, professional lighting, and batch previews require secure cloud processing.',
      primary: 'Enable cloud processing',
      secondary: 'Process locally',
      icon: <CloudIcon />,
    },
    export: {
      eyebrow: 'Export ready',
      title: 'Create a finished portrait file.',
      body:
        'Export keeps the current preset, non-destructive settings, and a desktop-ready preview render.',
      primary: 'Prepare export',
      secondary: 'Cancel',
      icon: <DownloadIcon />,
    },
    import: {
      eyebrow: 'Import queue',
      title: 'Local portrait set is available.',
      body: 'The project is using your own stored images. You can rotate through them in the studio queue.',
      primary: 'Open queue',
      secondary: 'Cancel',
      icon: <ImportIcon />,
    },
    preset: {
      eyebrow: 'Preset manager',
      title: 'Save this look as a reusable preset.',
      body: 'The current adjustments, processing mode, and export preference will be grouped as a new studio look.',
      primary: 'Save preset',
      secondary: 'Cancel',
      icon: <LayersIcon />,
    },
  }[modal ?? 'privacy']
}

function portraitClass(compare: CompareMode, activeTool: Tool) {
  return ['portrait-frame', compare === 'before' ? 'before' : '', compare === 'split' ? 'split' : '', `tool-${activeTool}`]
    .filter(Boolean)
    .join(' ')
}

function activeToolLabel(tool: Tool) {
  return {
    retouch: 'Retouch brush',
    crop: 'Crop and framing',
    lighting: 'Lighting mixer',
    layers: 'Layer stack',
  }[tool]
}

function pageTitle(view: View) {
  return {
    studio: 'Studio workspace',
    gallery: 'Creative gallery',
    enhance: 'AI enhancement',
    profile: 'Profile',
  }[view]
}

function StudioIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 15.5 15.5 4l4.5 4.5L8.5 20H4v-4.5Z" />
      <path d="m14 5 5 5" />
    </svg>
  )
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m7 16 4-4 3 3 2-2 2 3" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 2 1.6 5.1L19 9l-5.4 1.9L12 16l-1.6-5.1L5 9l5.4-1.9L12 2Z" />
      <path d="m18 15 .8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15Z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.4-3.4 3.7-5 7-5s5.6 1.6 7 5" />
    </svg>
  )
}

function BrushIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 4 5 13l6 6 9-9a4.2 4.2 0 0 0-6-6Z" />
      <path d="M4 20c2 0 3-.8 3-3" />
    </svg>
  )
}

function CropIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3v15h15" />
      <path d="M3 6h15v15" />
    </svg>
  )
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 18h10.5a4.5 4.5 0 0 0 .8-8.9A6.5 6.5 0 0 0 5.8 11 3.6 3.6 0 0 0 7 18Z" />
      <path d="M12 15V8" />
      <path d="m9 11 3-3 3 3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 19 6v5c0 4.4-2.8 8.3-7 10-4.2-1.7-7-5.6-7-10V6l7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.8-4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4 10-10" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 17v3h16v-3" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m8 11 4 4 4-4" />
      <path d="M5 20h14" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
    </svg>
  )
}

export default App
