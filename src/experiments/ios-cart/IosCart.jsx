import { useEffect, useState } from 'react'
import PasswordGate from '../../components/PasswordGate'
import './IosCart.css'

const PW_HASH = 'd2760672c3010d591b868dfcc99e8690a6448c6ee992ae07df0325eb20b9d685'

/* ── tiny inline SVG icons ── */
const IconMinus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconPlus = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="10.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 7v8M7 11h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3.5 5.5h13M7.5 5.5V4a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 12.5 4v1.5M5.5 5.5l.5 11a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5l.5-11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L1 14h14L8 1.5z" stroke="#c0392b" strokeWidth="1.2" fill="none" />
    <path d="M8 6v4" stroke="#c0392b" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="12" r=".7" fill="#c0392b" />
  </svg>
)
const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5L12 3l9 7.5" />
    <path d="M5 9.5V19a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V9.5" />
  </svg>
)
const IconCart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)
const IconProfile = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21v-1a6 6 0 0112 0v1" />
  </svg>
)

/* ── status-bar icons ── */
const SignalIcon = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
    <rect x="0" y="9" width="3" height="3" rx="0.5" />
    <rect x="4.5" y="6" width="3" height="6" rx="0.5" />
    <rect x="9" y="3" width="3" height="9" rx="0.5" />
    <rect x="13.5" y="0" width="3" height="12" rx="0.5" />
  </svg>
)
const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
    <path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM4.5 8.5a5 5 0 017 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1.5 5.5a9 9 0 0113 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)
const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" fill="currentColor">
    <rect x="0.5" y="0.5" width="23" height="12" rx="2.5" stroke="currentColor" fill="none" strokeWidth="1" opacity="0.4" />
    <rect x="2" y="2" width="20" height="9" rx="1.5" />
    <path d="M25 4.5v4a1.5 1.5 0 000-4z" opacity="0.4" />
  </svg>
)

/* ── product data ── */
const PRODUCTS = [
  {
    id: 1,
    name: 'Potted Plant',
    variant: 'Cream',
    size: '10″',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=240&h=240&fit=crop',
    outOfStock: true,
  },
  {
    id: 2,
    name: 'Decorative Mug',
    variant: 'Floral',
    price: 20.99,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=240&h=240&fit=crop',
    outOfStock: false,
  },
]

export default function IosCart() {
  const [quantities, setQuantities] = useState({ 1: 1, 2: 1 })

  useEffect(() => {
    document.title = 'iOS Cart — Matthew Vernon'
    const prev = document.body.style.backgroundColor
    document.body.style.backgroundColor = '#000'
    return () => { document.body.style.backgroundColor = prev }
  }, [])

  const updateQty = (id, delta) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(0, q[id] + delta) }))
  }

  /* only in-stock items count toward totals */
  const inStock = PRODUCTS.filter((p) => !p.outOfStock)
  const subtotal = inStock.reduce((s, p) => s + p.price * (quantities[p.id] || 0), 0)
  const tax = +(subtotal * 0.1297).toFixed(2) /* ~13% to get $2.72 on $20.99 */
  const total = +(subtotal + tax).toFixed(2)

  return (
    <PasswordGate hash={PW_HASH} slug="ioscart">
    <div className="ios-page">
      <div className="ios-device">
        {/* ── status bar ── */}
        <div className="ios-status-bar">
          <span className="ios-status-time">9:41</span>
          <div className="ios-status-right">
            <SignalIcon />
            <WifiIcon />
            <BatteryIcon />
          </div>
        </div>

        {/* ── screen content ── */}
        <div className="ios-screen">
          {/* nav bar */}
          <div className="cart-nav">
            <span className="cart-nav-title">Cart</span>
          </div>

          {/* scrollable product list */}
          <div className="cart-scroll">
            {PRODUCTS.map((product) => (
              <div key={product.id}>
                <div className={`cart-item${product.outOfStock ? ' cart-item--oos' : ''}`}>
                  <img className="cart-item-img" src={product.image} alt={product.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-row">
                      <div>
                        <div className="cart-item-name">{product.name}</div>
                        <div className="cart-item-variant">
                          {product.variant}
                          {product.outOfStock && <IconWarning />}
                        </div>
                        {product.size && <div className="cart-item-size">{product.size}</div>}
                      </div>
                      <div className="cart-item-price">${product.price.toFixed(2)}</div>
                    </div>
                    <div className="cart-item-actions">
                      <div className="cart-qty">
                        <button className="cart-qty-btn" onClick={() => updateQty(product.id, -1)} aria-label="Decrease">
                          <IconMinus />
                        </button>
                        <span className="cart-qty-val">{quantities[product.id]}</span>
                        <button className="cart-qty-btn" onClick={() => updateQty(product.id, 1)} aria-label="Increase">
                          <IconPlus />
                        </button>
                      </div>
                      <button className="cart-delete-btn" aria-label="Remove item">
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                </div>

                {product.outOfStock && (
                  <div className="cart-oos-banner">
                    <IconWarning />
                    <span>Variant out of stock, item removed from cart</span>
                  </div>
                )}
              </div>
            ))}

            {/* ── order summary ── */}
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Taxes</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* ── checkout button ── */}
            <button className="cart-checkout-btn">Checkout</button>
          </div>
        </div>

        {/* ── tab bar ── */}
        <div className="ios-tab-bar">
          <button className="ios-tab">
            <IconHome />
            <span>Home</span>
          </button>
          <button className="ios-tab ios-tab--active">
            <IconCart />
            <span>Cart</span>
          </button>
          <button className="ios-tab">
            <IconProfile />
            <span>Profile</span>
          </button>
        </div>

        {/* ── home indicator ── */}
        <div className="ios-home-indicator">
          <div className="ios-home-indicator-bar" />
        </div>
      </div>
    </div>
    </PasswordGate>
  )
}
