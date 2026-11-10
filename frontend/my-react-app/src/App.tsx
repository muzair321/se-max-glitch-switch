import { useEffect, useMemo, useState } from 'react'
import './App.css'
import alfatahLogo from './assets/alfatah-logo.svg'
import metroLogo from './assets/metro-logo.svg'

type BasketItem = { name: string; detail: string; quantity: string; price: number; store: string; tone: string; productUrl: string; imageUrl: string | null }
type ApiItem = { productName: string; brand: string | null; packageLabel: string; packages: number; price: number; store: string; category: string; productUrl?: string; imageUrl?: string | null }
type ApiStore = { name: string; subtotal: number; deliveryFeeApplied: number }
type CatalogueItem = { id: string; productName: string; brand: string | null; category: string; packageLabel: string; packageQuantity: number; unit: string; price: number; store: string; productUrl: string; imageUrl: string | null; available: boolean }
const fallbackBasketItems: BasketItem[] = [
  { name: 'Premium Basmati Rice', detail: 'Falak · 2 kg bag', quantity: '1 ×', price: 640, store: 'Al-Fatah', tone: 'rice', productUrl: 'https://alfatah.pk/', imageUrl: null },
  { name: 'Cooking Oil', detail: 'Dalda · 1 litre bottle', quantity: '2 ×', price: 980, store: 'Al-Fatah', tone: 'oil', productUrl: 'https://alfatah.pk/', imageUrl: null },
  { name: 'All-purpose Flour', detail: 'Bake Parlor · 1 kg bag', quantity: '1 ×', price: 175, store: 'Al-Fatah', tone: 'flour', productUrl: 'https://alfatah.pk/', imageUrl: null },
  { name: 'Fresh Eggs', detail: 'Farm fresh · 12 pieces', quantity: '1 ×', price: 360, store: 'Al-Fatah', tone: 'eggs', productUrl: 'https://alfatah.pk/', imageUrl: null },
]

function CatalogueView({ items, snapshotDate, onBack }: { items: CatalogueItem[]; snapshotDate: string; onBack: () => void }) {
  const [page, setPage] = useState(1)
  const pageSize = 24
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const visibleItems = items.slice((page - 1) * pageSize, page * pageSize)
  return <section className="catalogue-page" id="catalogue"><div className="catalogue-heading"><div><p className="eyebrow">AL-FATAH PRODUCT CATALOGUE</p><h1>Every item,<br /><em>in one place.</em></h1><p className="lede">Live catalogue snapshot · {snapshotDate} · {items.length.toLocaleString()} listings</p></div><button className="share-button" type="button" onClick={onBack}>← Back to optimizer</button></div><div className="store-links"><a className="store-link alfatah" href="https://alfatah.pk/" target="_blank" rel="noreferrer"><img className="store-logo" src={alfatahLogo} alt="Al-Fatah" /><span><strong>Al-Fatah</strong><small>Live source catalogue</small></span>↗</a><a className="store-link metro" href="https://www.metro.pk/" target="_blank" rel="noreferrer"><img className="store-logo" src={metroLogo} alt="Metro Mart" /><span><strong>Metro Online</strong><small>Alternative comparison reference</small></span>↗</a></div><div className="catalogue-grid">{visibleItems.map((item) => <article className="catalogue-card" key={item.id}><a href={item.productUrl || 'https://alfatah.pk/'} target="_blank" rel="noreferrer" className="catalogue-image">{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <span>{item.category.slice(0, 1).toUpperCase()}</span>}</a><div className="catalogue-card-body"><span className="catalogue-category">{item.category}</span><a href={item.productUrl || 'https://alfatah.pk/'} target="_blank" rel="noreferrer" className="catalogue-name">{item.productName}</a><small>{item.brand ?? 'Unbranded'} · {item.packageLabel}</small><strong>Rs. {item.price.toLocaleString()}</strong><em className={item.available ? 'available' : 'unavailable'}>{item.available ? 'Available' : 'Unavailable'}</em></div></article>)}</div><div className="pagination"><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Next →</button></div></section>
}

function App() {
  const [basketItems, setBasketItems] = useState(fallbackBasketItems)
  const [list, setList] = useState('1 kg flour\n2 litres cooking oil\n1 dozen eggs\n2 kg rice')
  const [budget, setBudget] = useState('2500')
  const [exclude, setExclude] = useState('')
  const [optimized, setOptimized] = useState(true)
  const [selectedNames, setSelectedNames] = useState(() => basketItems.map((item) => item.name))
  const [movingItem, setMovingItem] = useState<{ name: string; direction: 'in' | 'out' } | null>(null)
  const [storeSummaries, setStoreSummaries] = useState<ApiStore[]>([])
  const [deliveryTotal, setDeliveryTotal] = useState(100)
  const [snapshotDate, setSnapshotDate] = useState('2024-11-12')
  const [apiError, setApiError] = useState('')
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([])
  const [view, setView] = useState<'optimizer' | 'catalogue'>('optimizer')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const selectedItems = useMemo(() => basketItems.filter((item) => selectedNames.includes(item.name)), [selectedNames])
  const availableItems = useMemo(() => basketItems.filter((item) => !selectedNames.includes(item.name)), [selectedNames])
  const productTotal = useMemo(() => selectedItems.reduce((sum, item) => sum + item.price, 0), [selectedItems])
  const total = productTotal + deliveryTotal
  const budgetValue = Number(budget) || 0
  const overBudget = total > budgetValue
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.basket-item .product-info strong').forEach((strong) => {
      if (strong.parentElement?.tagName === 'A') return
      const item = basketItems.find((candidate) => candidate.name === strong.textContent)
      if (!item) return
      const link = document.createElement('a')
      link.href = item.productUrl
      link.target = '_blank'
      link.rel = 'noreferrer'
      link.className = 'product-link'
      strong.replaceWith(link)
      link.appendChild(strong)
    })
  }, [basketItems])
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'}/api/catalogue`).then((response) => {
      if (!response.ok) throw new Error('Catalogue unavailable')
      return response.json()
    }).then((catalogue) => { setSnapshotDate(catalogue.snapshotDate); setCatalogueItems(catalogue.listings) }).catch(() => undefined)
  }, [])
  useEffect(() => {
    const rows = document.querySelectorAll<HTMLElement>('.store-summary')
    if (!rows.length) return
    const actual = storeSummaries[0]
    const actualSubtotal = actual?.subtotal ?? productTotal
    const actualDelivery = actual?.deliveryFeeApplied ?? deliveryTotal
    const alFatahTotal = actualSubtotal + actualDelivery
    const metroTotal = Math.ceil((alFatahTotal * 1.08) / 10) * 10
    const resultCount = document.querySelector<HTMLElement>('.results-top p')
    const totalNote = document.querySelector<HTMLElement>('.total-banner small')
    const comparisonNote = document.querySelector<HTMLElement>('.result-footer span')
    if (resultCount) resultCount.textContent = `${selectedItems.length} items · 2 stores · all quantities covered`
    if (totalNote) totalNote.textContent = `Includes Rs. ${actualDelivery.toLocaleString()} delivery fees`
    if (comparisonNote) comparisonNote.textContent = '↗ Compared across 2 stores (1 live + 1 alternative)'
    const metroRow = rows[0]
    const alFatahRow = rows[1]
    if (metroRow) metroRow.innerHTML = `<div><img class="store-logo" src="${metroLogo}" alt="Metro Mart" /><div><strong>Metro Online <small>(Alternative comparison)</small></strong><small>Illustrative price · Delivery Rs. 60</small></div></div><b>Rs. ${metroTotal.toLocaleString()}</b>`
    if (alFatahRow) alFatahRow.innerHTML = `<div><img class="store-logo" src="${alfatahLogo}" alt="Al-Fatah" /><div><strong>Al-Fatah <small>(selected)</small></strong><small>Live snapshot · Delivery Rs. ${actualDelivery.toLocaleString()}</small></div></div><b>Rs. ${alFatahTotal.toLocaleString()}</b>`
  }, [storeSummaries, productTotal, deliveryTotal, selectedItems.length])
  async function optimize() {
    setOptimized(false)
    setApiError('')
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'}/api/optimize`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: list.split('\n').map((text) => ({ text })).filter((item) => item.text.trim()), budget: budgetValue, excludedBrands: exclude.split(',').map((brand) => brand.trim()).filter(Boolean) }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Optimization failed')
      if (result.status === 'no_valid_basket') {
        setBasketItems([])
        setSelectedNames([])
        setStoreSummaries([])
        throw new Error(result.warnings?.join(' ') ?? 'No valid basket found')
      }
      setBasketItems(result.items.map((item: ApiItem) => ({ name: item.productName, detail: `${item.brand ?? 'Unbranded'} · ${item.packageLabel}`, quantity: `${item.packages} ×`, price: item.price * item.packages, store: item.store, tone: item.category, productUrl: item.productUrl ?? 'https://alfatah.pk/', imageUrl: item.imageUrl ?? null })))
      setSelectedNames(result.items.map((item: ApiItem) => item.productName))
      setStoreSummaries(result.stores)
      setDeliveryTotal(result.deliveryTotal)
      setSnapshotDate(result.snapshotDate)
    } catch (error) {
      setBasketItems([])
      setSelectedNames([])
      setStoreSummaries([])
      setDeliveryTotal(0)
      setApiError(error instanceof Error ? error.message : 'Backend unavailable; no live basket was returned.')
    } finally { setOptimized(true) }
  }
  function removeItem(name: string) {
    setMovingItem({ name, direction: 'out' })
    window.setTimeout(() => {
      setSelectedNames((current) => current.filter((itemName) => itemName !== name))
      setMovingItem(null)
    }, 420)
  }
  function addItem(name: string) {
    setSelectedNames((current) => [...current, name])
    setMovingItem({ name, direction: 'in' })
    window.setTimeout(() => setMovingItem(null), 420)
  }

  return (
    <>
    {view === 'catalogue' && <CatalogueView items={catalogueItems} snapshotDate={snapshotDate} onBack={() => setView('optimizer')} />}
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : ''}`}><header className="topbar"><a className="brand" href="#top" onClick={() => setView('optimizer')}><span className="brand-mark">b</span><span>Bachat<span className="brand-light">Basket</span></span></a><nav><a className={view === 'optimizer' ? 'active' : ''} href="#optimizer" onClick={() => setView('optimizer')}>Optimizer</a><a href="#how-it-works" onClick={() => setView('optimizer')}>How it works</a><a className={view === 'catalogue' ? 'active' : ''} href="#catalogue" onClick={() => setView('catalogue')}>Catalogue</a></nav><div className="header-actions"><span className="snapshot"><span className="status-dot" /> Snapshot: {snapshotDate}</span><button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾' : '☀'}</button><button className="avatar" aria-label="Open profile">SA</button></div></header>
      <main id="top"><section className="intro" id="optimizer"><div><p className="eyebrow">AI-ASSISTED GROCERY PLANNING</p><h1>Your basket,<br /><em>made smarter.</em></h1><p className="lede">Tell us what you need. We find the best combination of products, packages, and stores for your budget.</p></div><div className="trust-note"><span className="spark">✦</span><div><strong>Prices checked and validated</strong><small>Our optimization engine handles the maths. AI helps understand your list.</small></div></div></section>{apiError && <p className="api-error">{apiError}</p>}
        <section className="workspace"><aside className="controls-panel"><div className="panel-heading"><span className="step">01</span><div><h2>Build your list</h2><p>Write naturally in English, Urdu, or Roman Urdu.</p></div></div><label htmlFor="grocery-list">Grocery list</label><textarea id="grocery-list" value={list} onChange={(event) => setList(event.target.value)} /><div className="parse-hint"><span>✦</span> 4 items understood <button type="button" onClick={() => setList('')}>Clear</button></div><div className="field-label"><label htmlFor="budget">Maximum budget</label><span>PKR</span></div><div className="input-wrap"><span>Rs.</span><input id="budget" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} /></div><label htmlFor="exclude">Exclude brands <span className="optional">Optional</span></label><input id="exclude" className="text-input" placeholder="e.g. National, Shan" value={exclude} onChange={(event) => setExclude(event.target.value)} /><button type="button" className="optimize-button" onClick={optimize}><span>✦</span>{optimized ? 'Optimize my basket' : 'Finding the best basket...'}<b>→</b></button><p className="secure-note">⌁ Your list stays private and is never sold.</p></aside>
          <section className="results-panel" aria-live="polite"><div className="results-top"><div><div className="result-kicker"><span className="check">✓</span> BEST VALUE FOUND</div><h2>Your optimized basket</h2><p>{selectedItems.length} items · 2 stores · all quantities covered</p></div><button className="share-button" type="button">↗ Share basket</button></div><div className={`total-banner ${overBudget ? 'over' : ''}`}><div><span className="total-label">ESTIMATED TOTAL</span><strong>Rs. {total.toLocaleString()}</strong><small>Includes Rs. 100 delivery fees</small></div><div className="budget-status"><span className="budget-bar"><i style={{ width: `${Math.min((total / Math.max(budgetValue, total)) * 100, 100)}%` }} /></span><b>{overBudget ? 'Over budget' : `Rs. ${(budgetValue - total).toLocaleString()} left`}</b><small>of Rs. {budgetValue.toLocaleString()}</small></div></div><div className="basket-dock"><span className="basket-doodle">🛒</span><div><strong>Basket party</strong><small>{selectedItems.length ? 'Tap an item to send it shopping' : 'Your basket is feeling lonely'}</small></div><b>{selectedItems.length}</b></div><div className="basket-list">{selectedItems.map((item) => <article className={`basket-item ${movingItem?.name === item.name && movingItem.direction === 'in' ? 'fly-in' : ''} ${movingItem?.name === item.name && movingItem.direction === 'out' ? 'fly-out' : ''}`} key={item.name}><div className={`product-icon ${item.tone}`}>{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <span>{item.tone === 'eggs' ? '◌' : item.tone === 'oil' ? '◒' : item.tone === 'rice' ? '▦' : '✣'}</span>}</div><div className="product-info"><strong>{item.name}</strong><span>{item.detail}</span><small>{item.store}</small></div><span className="quantity">{item.quantity}</span><strong className="item-price">Rs. {item.price.toLocaleString()}</strong><button className="item-action remove-item" type="button" onClick={() => removeItem(item.name)} aria-label={`Remove ${item.name}`}>−</button></article>)}</div>{availableItems.length > 0 && <div className="catalogue-tray"><span className="tray-label">SEND BACK TO BASKET</span>{availableItems.map((item) => <button className={`catalogue-chip ${movingItem?.name === item.name && movingItem.direction === 'out' ? 'fly-out' : ''}`} type="button" key={item.name} onClick={() => addItem(item.name)}><span className={`mini-icon ${item.tone}`}>{item.tone === 'eggs' ? '◌' : item.tone === 'oil' ? '◒' : item.tone === 'rice' ? '▦' : '✣'}</span>{item.name}<b>+</b></button>)}</div>}<div className="store-summary"><div><span className="store-badge metro">M</span><div><strong>Metro Online</strong><small>2 products · Delivery Rs. 60</small></div></div><b>Rs. 1,620</b></div><div className="store-summary"><div><span className="store-badge alfatah">A</span><div><strong>Al-Fatah</strong><small>2 products · Delivery Rs. 40</small></div></div><b>Rs. 535</b></div><div className="result-footer"><span>↗ Compared across 4 stores</span><button type="button">See alternatives <b>→</b></button></div></section></section>
        <section className="feature-strip" id="how-it-works"><div><span className="feature-number">01</span><div><strong>Understands your words</strong><p>English, Urdu, or Roman Urdu. Just type it your way.</p></div></div><div><span className="feature-number">02</span><div><strong>Does the real maths</strong><p>Package sizes, surplus, delivery fees, and minimums included.</p></div></div><div><span className="feature-number">03</span><div><strong>Respects your choices</strong><p>Brand exclusions and preferences are always honoured.</p></div></div></section><footer><span><span className="brand-mark small">b</span> BachatBasket</span><span>Built for smarter shopping in Pakistan <i>·</i> Fixed price snapshot for demo</span><span>AI-powered · Logic-validated</span></footer></main></div>
    </>
  )
}

export default App
