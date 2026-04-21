import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import './App.css'

type View = 'studio' | 'gallery' | 'enhance' | 'profile'
type Modal = 'privacy' | 'cloud' | 'export' | null

const assets = {
  people: [
    `${import.meta.env.BASE_URL}people/person-01.jpg`,
    `${import.meta.env.BASE_URL}people/person-02.jpg`,
    `${import.meta.env.BASE_URL}people/person-03.jpg`,
    `${import.meta.env.BASE_URL}people/person-04.jpg`,
    `${import.meta.env.BASE_URL}people/person-05.jpg`,
    `${import.meta.env.BASE_URL}people/person-06.jpg`,
    `${import.meta.env.BASE_URL}people/person-07.jpg`,
    `${import.meta.env.BASE_URL}people/person-08.jpg`,
  ],
}

const navItems: Array<{ id: View; label: string; icon: ReactNode }> = [
  { id: 'studio', label: 'Studio', icon: <StudioIcon /> },
  { id: 'gallery', label: 'Gallery', icon: <GalleryIcon /> },
  { id: 'enhance', label: 'Enhance', icon: <SparkIcon /> },
  { id: 'profile', label: 'Profile', icon: <UserIcon /> },
]

const presets = [
  {
    name: 'Tuscan Dusk',
    tone: 'Warm editorial',
    strength: 72,
  },
  {
    name: 'Noir Bloom',
    tone: 'Soft contrast',
    strength: 58,
  },
  {
    name: 'Porcelain Skin',
    tone: 'Fine texture',
    strength: 64,
  },
]

function shuffledPeople() {
  return [...assets.people]
    .map((image) => ({ image, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ image }) => image)
}

const adjustments = [
  ['Skin texture', 72],
  ['Studio light', 64],
  ['Tone warmth', 42],
  ['Local detail', 18],
] as const

function App() {
  const [booting, setBooting] = useState(true)
  const [view, setView] = useState<View>('studio')
  const [modal, setModal] = useState<Modal>(null)
  const [selectedPreset, setSelectedPreset] = useState(presets[0].name)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [compare, setCompare] = useState<'after' | 'before'>('after')
  const [panelOpen, setPanelOpen] = useState<'local' | 'cloud'>('cloud')
  const [people] = useState(shuffledPeople)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooting(false)
      setModal('privacy')
    }, 1350)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isProcessing) return

    setProgress(0)
    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(timer)
          window.setTimeout(() => setIsProcessing(false), 300)
          return 100
        }
        return Math.min(current + 7, 100)
      })
    }, 150)

    return () => window.clearInterval(timer)
  }, [isProcessing])

  const selected = useMemo(
    () => presets.find((preset) => preset.name === selectedPreset) ?? presets[0],
    [selectedPreset],
  )

  function startCloudProcess() {
    setModal(null)
    setView('enhance')
    setPanelOpen('cloud')
    setIsProcessing(true)
  }

  return (
    <main className="app-shell">
      {booting && (
        <LoadingScreen
          onSkip={() => {
            setBooting(false)
            setModal('privacy')
          }}
        />
      )}

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

        <div className="session-card">
          <span>Current session</span>
          <strong>Portrait_0421</strong>
          <small>Cloud ready - local cache active</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Atelier</p>
            <h1>{pageTitle(view)}</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" type="button" onClick={() => setModal('privacy')}>
              Data policy
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
                onSelect={(name) => setSelectedPreset(name)}
                people={people}
                selected={selectedPreset}
              />
            ) : view === 'profile' ? (
              <ProfileView people={people} setView={setView} />
            ) : (
              <EditorCanvas
                compare={compare}
                isProcessing={isProcessing}
                people={people}
                progress={progress}
                selected={selected}
                setCompare={setCompare}
              />
            )}
          </section>

          <aside className="inspector" aria-label="Editing inspector">
            {view === 'profile' ? (
              <ProfileInspector people={people} setModal={setModal} />
            ) : view === 'gallery' ? (
              <GalleryInspector people={people} selected={selected} setView={setView} />
            ) : (
              <EnhanceInspector
                panelOpen={panelOpen}
                people={people}
                selected={selected}
                selectedPreset={selectedPreset}
                setModal={setModal}
                setPanelOpen={setPanelOpen}
                setSelectedPreset={setSelectedPreset}
                startLocal={() => {
                  setPanelOpen('local')
                  setIsProcessing(true)
                }}
              />
            )}
          </aside>
        </div>
      </section>

      {modal && (
        <ModalLayer modal={modal} onClose={() => setModal(null)} onStartCloud={startCloudProcess} />
      )}
    </main>
  )
}

function LoadingScreen({ onSkip }: { onSkip: () => void }) {
  return (
    <button className="loading-screen" onClick={onSkip} type="button">
      <span className="loading-mark">
        <SparkIcon />
      </span>
      <strong>Silk Studio</strong>
      <span>Developing your vision...</span>
      <span className="loading-ring" />
      <span className="loading-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="loading-meta">
        <span>
          <small>System status</small>
          Precision Engine Online
        </span>
        <span>
          <small>Version</small>
          2.0.4 Atelier Build
        </span>
      </span>
    </button>
  )
}

function EditorCanvas({
  compare,
  isProcessing,
  people,
  progress,
  selected,
  setCompare,
}: {
  compare: 'after' | 'before'
  isProcessing: boolean
  people: string[]
  progress: number
  selected: (typeof presets)[number]
  setCompare: (value: 'after' | 'before') => void
}) {
  return (
    <div className="editor-surface">
      <div className="canvas-toolbar">
        <div>
          <span className="status-dot" />
          Live preview
        </div>
        <div className="segmented">
          <button
            className={compare === 'before' ? 'active' : ''}
            onClick={() => setCompare('before')}
            type="button"
          >
            Before
          </button>
          <button
            className={compare === 'after' ? 'active' : ''}
            onClick={() => setCompare('after')}
            type="button"
          >
            After
          </button>
        </div>
      </div>

      <div className={compare === 'before' ? 'portrait-frame before' : 'portrait-frame'}>
        <img alt="Portrait being edited" src={people[0]} />
        <div className="portrait-gradient" />
        <div className="retouch-slider" style={{ '--value': `${selected.strength}%` } as CSSProperties}>
          <span />
        </div>
        {isProcessing && (
          <div className="processing-overlay">
            <span className="loading-ring small" />
            <strong>{progress}%</strong>
            <small>Processing secure enhancement</small>
          </div>
        )}
      </div>

      <div className="tool-dock" aria-label="Canvas tools">
        <button type="button" title="Retouch">
          <BrushIcon />
        </button>
        <button type="button" title="Crop">
          <CropIcon />
        </button>
        <button type="button" title="Lighting">
          <SparkIcon />
        </button>
        <button type="button" title="Layers">
          <LayersIcon />
        </button>
      </div>
    </div>
  )
}

function EnhanceInspector({
  panelOpen,
  people,
  selected,
  selectedPreset,
  setModal,
  setPanelOpen,
  setSelectedPreset,
  startLocal,
}: {
  panelOpen: 'local' | 'cloud'
  people: string[]
  selected: (typeof presets)[number]
  selectedPreset: string
  setModal: (modal: Modal) => void
  setPanelOpen: (value: 'local' | 'cloud') => void
  setSelectedPreset: (name: string) => void
  startLocal: () => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Enhance</p>
        <h2>Portrait controls</h2>
      </div>

      <div className="panel-tabs">
        <button
          className={panelOpen === 'cloud' ? 'active' : ''}
          onClick={() => setPanelOpen('cloud')}
          type="button"
        >
          Cloud AI
        </button>
        <button
          className={panelOpen === 'local' ? 'active' : ''}
          onClick={() => setPanelOpen('local')}
          type="button"
        >
          Local
        </button>
      </div>

      <div className="preset-strip">
        {presets.map((preset, index) => (
          <button
            className={preset.name === selectedPreset ? 'preset-chip active' : 'preset-chip'}
            key={preset.name}
            onClick={() => setSelectedPreset(preset.name)}
            type="button"
          >
            <img alt="" src={people[index + 1]} />
            <span>{preset.name}</span>
          </button>
        ))}
      </div>

      <div className="control-list">
        {adjustments.map(([label, value]) => (
          <label className="range-control" key={label}>
            <span>
              {label}
              <strong>{label === 'Tone warmth' ? value - 50 : value}</strong>
            </span>
            <input defaultValue={value} max="100" min="0" type="range" />
          </label>
        ))}
      </div>

      <div className="quality-panel">
        <span>{selected.tone}</span>
        <strong>{selected.name}</strong>
        <p>Secure cloud texture pass, studio relight, and a reversible local edit stack.</p>
      </div>

      <button className="primary-button wide" onClick={() => setModal('cloud')} type="button">
        Enable cloud processing
        <ArrowIcon />
      </button>
      <button className="ghost-button wide" onClick={startLocal} type="button">
        Process locally
      </button>
    </>
  )
}

function GalleryView({
  onSelect,
  people,
  selected,
}: {
  onSelect: (name: string) => void
  people: string[]
  selected: string
}) {
  return (
    <div className="gallery-grid">
      {presets.map((preset, index) => (
        <button
          className={selected === preset.name ? 'gallery-tile active' : 'gallery-tile'}
          key={preset.name}
          onClick={() => onSelect(preset.name)}
          type="button"
        >
          <img alt={preset.name} src={people[index + 1]} />
          <span>
            <strong>{preset.name}</strong>
            <small>{index === 0 ? 'Applied recently' : preset.tone}</small>
          </span>
        </button>
      ))}
      <button className="new-tile" type="button">
        <PlusIcon />
        New preset
      </button>
    </div>
  )
}

function GalleryInspector({
  people,
  selected,
  setView,
}: {
  people: string[]
  selected: (typeof presets)[number]
  setView: (view: View) => void
}) {
  const selectedIndex = presets.findIndex((preset) => preset.name === selected.name)

  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Gallery</p>
        <h2>Selected look</h2>
      </div>
      <div className="preview-card">
        <img alt="" src={people[selectedIndex + 1]} />
        <strong>{selected.name}</strong>
        <span>{selected.tone}</span>
      </div>
      <div className="detail-list">
        <span>
          Strength
          <strong>{selected.strength}%</strong>
        </span>
        <span>
          Source
          <strong>Local portrait set</strong>
        </span>
        <span>
          Status
          <strong>Ready</strong>
        </span>
      </div>
      <button className="primary-button wide" onClick={() => setView('studio')} type="button">
        Apply in studio
        <ArrowIcon />
      </button>
    </>
  )
}

function ProfileView({ people, setView }: { people: string[]; setView: (view: View) => void }) {
  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <img alt="Elena Vance" src={people[4]} />
        <h2>Elena Vance</h2>
        <p>Visual Storyteller & Editor</p>
        <div className="profile-stats">
          <span>
            <strong>1,284</strong>
            Total edits
          </span>
          <span>
            <strong>12</strong>
            Custom presets
          </span>
          <span>
            <strong>48</strong>
            Collections
          </span>
        </div>
      </section>

      <section className="settings-list">
        {['Preferences', 'Feedback', 'Setting'].map((item) => (
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
  people,
  setModal,
}: {
  people: string[]
  setModal: (modal: Modal) => void
}) {
  return (
    <>
      <div className="inspector-header">
        <p className="eyebrow">Account</p>
        <h2>Studio edition</h2>
      </div>
      <div className="profile-card">
        <img alt="" src={people[5]} />
        <strong>12 presets synced</strong>
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
          <strong>2.0.4</strong>
        </span>
      </div>
      <button className="primary-button wide" type="button" onClick={() => setModal('privacy')}>
        Review data policy
      </button>
    </>
  )
}

function ModalLayer({
  modal,
  onClose,
  onStartCloud,
}: {
  modal: Modal
  onClose: () => void
  onStartCloud: () => void
}) {
  const content = {
    privacy: {
      eyebrow: 'Data exposure warning',
      title: 'Your image stays under your control.',
      body:
        'Cloud enhancement sends the selected portrait through a secure encrypted request. Local processing remains available for lower-quality private edits.',
      primary: 'I understand',
      secondary: 'Keep local only',
    },
    cloud: {
      eyebrow: 'Cloud AI request',
      title: 'Cloud AI Enhancement',
      body:
        'To provide high-fidelity skin texture and professional lighting, this portrait needs secure cloud-based processing.',
      primary: 'Enable cloud processing',
      secondary: 'Process locally',
    },
    export: {
      eyebrow: 'Export ready',
      title: 'Create a finished portrait file.',
      body:
        'Export keeps the current preset, non-destructive settings, and a desktop-ready 2x preview render.',
      primary: 'Prepare export',
      secondary: 'Cancel',
    },
  }[modal ?? 'privacy']

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button className="close-button" onClick={onClose} type="button" aria-label="Close">
          <CloseIcon />
        </button>
        <span className="modal-icon">
          <CloudIcon />
        </span>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="modal-title">{content.title}</h2>
        <p>{content.body}</p>
        {modal === 'cloud' && (
          <div className="trust-row">
            <span>End-to-end</span>
            <span>About 4 seconds</span>
          </div>
        )}
        <button
          className="primary-button wide"
          onClick={modal === 'cloud' ? onStartCloud : onClose}
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

export default App
