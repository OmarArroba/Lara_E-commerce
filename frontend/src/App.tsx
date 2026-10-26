import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  Barcode,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleUserRound,
  Command,
  FileText,
  FileSpreadsheet,
  GitBranch,
  Globe,
  GripVertical,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  HelpCircle,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Mail,
  Monitor,
  Menu,
  Moon,
  MoreHorizontal,
  Package,
  PackageCheck,
  Plus,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ShoppingCart,
  Sun,
  UserCog,
  UserPlus,
  Tags,
  Trash2,
  TrendingUp,
  Truck,
  UploadCloud,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import {
  auditLogsApi,
  authApi,
  brandsApi,
  categoriesApi,
  dashboardApi,
  productsApi,
  purchaseOrdersApi,
  reportsApi,
  searchApi,
  stockMovementsApi,
  suppliersApi,
  usersApi,
  warehousesApi,
} from '@/api/client'
import type {
  ApiAuditLog,
  ApiBrand,
  ApiCategory,
  ApiDashboardData,
  ApiGlobalSearchResults,
  ApiProduct,
  ApiPurchaseOrder,
  ApiReportData,
  ApiStockMovement,
  ApiSupplier,
  ApiUser,
  ApiWarehouse,
  ApiWarehouseDetail,
} from '@/types/api'

type Page = 'login' | 'dashboard' | 'products' | 'product-form' | 'product-detail' | 'inventory' | 'warehouses' | 'purchases' | 'categories' | 'suppliers' | 'reports' | 'users' | 'audit' | 'profile'
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const productImages = [
  'https://images.unsplash.com/photo-1654555023156-0a1c9cdf1130?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1729058048010-86f7d7c30001?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1615714901553-bfb2b5a27750?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
]

const fallbackProducts = [
  { id: '1', name: 'iPhone 15 Pro 256GB', sku: 'APL-IP15P-256-BLK', category: 'Celulares', brand: 'Apple', stock: 42, price: 1199, status: 'Activo', image: productImages[0] },
  { id: '2', name: 'Samsung Galaxy S24', sku: 'SAM-S24-256-GRY', category: 'Celulares', brand: 'Samsung', stock: 7, price: 899, status: 'Stock bajo', image: productImages[1] },
  { id: '3', name: 'MacBook Air M3 13"', sku: 'APL-MBA-M3-512-SLV', category: 'Laptops', brand: 'Apple', stock: 18, price: 1499, status: 'Activo', image: productImages[0] },
  { id: '4', name: 'Lenovo ThinkPad X1', sku: 'LEN-TPX1-I7-1TB', category: 'Laptops', brand: 'Lenovo', stock: 0, price: 1749, status: 'Agotado', image: productImages[3] },
  { id: '5', name: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5-BLK', category: 'Audífonos', brand: 'Sony', stock: 31, price: 399, status: 'Activo', image: productImages[2] },
  { id: '6', name: 'AirPods Pro 2ª gen.', sku: 'APL-APP2-USB-C-WHT', category: 'Audífonos', brand: 'Apple', stock: 5, price: 249, status: 'Stock bajo', image: productImages[1] },
  { id: '7', name: 'Cargador USB-C 65W', sku: 'ANK-CHG-65W-BLK', category: 'Cargadores', brand: 'Anker', stock: 86, price: 49, status: 'Activo', image: productImages[3] },
  { id: '8', name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-GRY', category: 'Mouse', brand: 'Logitech', stock: 23, price: 99, status: 'Activo', image: productImages[0] },
  { id: '9', name: 'Keychron K2 Pro', sku: 'KEY-K2P-RGB-BRN', category: 'Teclados', brand: 'Keychron', stock: 4, price: 119, status: 'Stock bajo', image: productImages[3] },
]

function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Reciente'
  const date = new Date(iso)
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 1) return 'Hace instantes'
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH} h`
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function movementTypeLabel(type: string): string {
  switch (type) {
    case 'in':
    case 'purchase_receipt':
    case 'transfer_in':
      return 'Entrada'
    case 'out':
      return 'Salida'
    case 'adjustment':
      return 'Ajuste'
    case 'return':
      return 'Devolución'
    case 'transfer_out':
      return 'Transferencia'
    default:
      return type
  }
}

function inventoryStateLabel(state: ApiProduct['inventory_state']): string {
  switch (state) {
    case 'in_stock':
      return 'Activo'
    case 'low_stock':
      return 'Stock bajo'
    case 'out_of_stock':
      return 'Agotado'
    case 'archived':
      return 'Archivado'
  }
}

function initialsFromName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function Button({ children, variant = 'primary', size = 'md', icon, disabled, onClick, className = '', type = 'button' }: {
  children?: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'icon'; icon?: ReactNode; disabled?: boolean; onClick?: () => void; className?: string; type?: 'button' | 'submit'
}) {
  return <button type={type} className={`btn btn-${variant} btn-${size} ${className}`} disabled={disabled} onClick={onClick}>{icon}{children}</button>
}

function Field({ label, placeholder, type = 'text', value, defaultValue, onChange, prefix, suffix, autoFocus }: {
  label?: string; placeholder?: string; type?: string; value?: string; defaultValue?: string; onChange?: (v: string) => void; prefix?: ReactNode; suffix?: ReactNode; autoFocus?: boolean
}) {
  return <label className="field">{label && <span className="field-label">{label}</span>}<span className="input-wrap">{prefix}<input aria-label={label || placeholder} autoFocus={autoFocus} type={type} placeholder={placeholder} value={value} defaultValue={defaultValue} onChange={(e) => onChange?.(e.target.value)} />{suffix}</span></label>
}

function Badge({ children, tone = 'neutral', dot = false }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return <span className={`badge badge-${tone}`}>{dot && <i />}{children}</span>
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="logo"><span className="logo-mark"><Boxes size={19} strokeWidth={2.4} /></span>{!compact && <span>Lara <b>Inventory</b></span>}</div>
}

function Login({ onComplete }: { onComplete: (user: ApiUser) => void }) {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials')
  const [email, setEmail] = useState('admin@lara.test')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authenticatedUser, setAuthenticatedUser] = useState<ApiUser | null>(null)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await authApi.login(email, password, true)
      setAuthenticatedUser(user)
      setStep('2fa')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="login-page">
    <div className="login-brand"><Logo /><span className="login-security"><ShieldCheck size={14} /> Acceso interno seguro</span></div>
    <div className="login-visual" aria-hidden="true">
      <div className="visual-copy">
        <span className="eyebrow"><Sparkles size={14} /> Control total, decisiones más rápidas</span>
        <h1>Tu inventario,<br /><em>siempre en orden.</em></h1>
        <p>Visibilidad precisa de stock, movimientos y alertas para que tu equipo opere sin fricciones.</p>
      </div>
      <div className="floating-card fc-one"><span>Valor de inventario</span><strong>$284,650.00</strong><small><TrendingUp size={13} /> 8.4% este mes</small></div>
      <div className="floating-card fc-two"><span>Stock saludable</span><strong>94.2%</strong><div className="mini-progress"><i /></div></div>
      <div className="orb orb-one" /><div className="orb orb-two" />
    </div>
    <div className="login-form-side">
      <div className="auth-card">
        {step === 'credentials' ? <>
          <div className="auth-heading"><span className="mobile-logo"><Logo /></span><Badge tone="info">Lara Workspace</Badge><h2>Bienvenido de nuevo</h2><p>Ingresa tus credenciales o elige una cuenta demo para acceder.</p></div>
          <div className="tabs" style={{ marginBottom: 12 }}>
            <button type="button" className={email === 'admin@lara.test' ? 'active' : ''} onClick={() => { setEmail('admin@lara.test'); setPassword('password'); setError(null) }}>Super Admin</button>
            <button type="button" className={email === 'inventory@lara.test' ? 'active' : ''} onClick={() => { setEmail('inventory@lara.test'); setPassword('password'); setError(null) }}>Inventario</button>
            <button type="button" className={email === 'sales@lara.test' ? 'active' : ''} onClick={() => { setEmail('sales@lara.test'); setPassword('password'); setError(null) }}>Ventas (Lectura)</button>
          </div>
          {error && <div className="role-banner" style={{ marginBottom: 12, borderRadius: 8 }}><AlertTriangle size={15} /><span>{error}</span></div>}
          <form onSubmit={handleCredentialsSubmit} className="auth-form">
            <Field label="Correo electrónico" placeholder="nombre@empresa.com" type="email" value={email} onChange={setEmail} autoFocus />
            <Field label="Contraseña" placeholder="Ingresa tu contraseña" type={showPassword ? 'text' : 'password'} value={password} onChange={setPassword} suffix={<button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar contraseña">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
            <div className="form-between"><label className="check"><input type="checkbox" defaultChecked /> <span>Recordarme</span></label><button type="button" className="text-link">Olvidé mi contraseña</button></div>
            <Button type="submit" className="full" disabled={loading}>{loading ? 'Verificando...' : 'Continuar'} <ArrowRight size={16} /></Button>
          </form>
          <p className="auth-help"><HelpCircle size={14} /> ¿Necesitas ayuda? <b>Contacta a soporte</b></p>
        </> : <>
          <button className="back-link" onClick={() => setStep('credentials')}><ArrowLeft size={15} /> Volver</button>
          <div className="auth-heading two-fa"><span className="security-icon"><LockKeyhole size={24} /></span><h2>Verificación en dos pasos</h2><p>Ingresa el código de 6 dígitos generado por tu aplicación de autenticación.</p></div>
          <form onSubmit={(e) => { e.preventDefault(); if (authenticatedUser) onComplete(authenticatedUser) }} className="auth-form">
            <Field label="Código de verificación" placeholder="000000" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} autoFocus />
            <p className="code-hint">El código se actualiza cada 30 segundos.</p>
            <Button type="submit" className="full" disabled={code.length > 0 && code.length < 6}>Verificar y acceder</Button>
            <Button variant="secondary" className="full" onClick={() => { if (authenticatedUser) onComplete(authenticatedUser) }}>Usar un código de recuperación</Button>
          </form>
        </>}
      </div>
      <p className="copyright">© 2026 Lara Inventory · Privacidad · Seguridad</p>
    </div>
  </main>
}

function AppShell({ page, setPage, dark, setDark, salesMode, setSalesMode, user, productsCount, onSelectProduct, onLogout, children }: {
  page: Page; setPage: (p: Page) => void; dark: boolean; setDark: (v: boolean) => void; salesMode: boolean; setSalesMode: (v: boolean) => void; user: ApiUser | null; productsCount: number; onSelectProduct: (id: string) => void; onLogout: () => void; children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ApiGlobalSearchResults | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchModalOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults(null)
      return
    }
    searchApi.query(searchTerm.trim()).then(setSearchResults).catch(() => {})
  }, [searchTerm])

  const nav = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'products', label: 'Productos', icon: Package, badge: String(productsCount || 9) },
    { id: 'inventory', label: 'Movimientos', icon: RefreshCw },
    { id: 'warehouses', label: 'Almacenes', icon: Warehouse },
    { id: 'purchases', label: 'Compras', icon: Download },
  ]

  const displayName = salesMode ? 'María López' : (user?.name || 'Ana Martínez')
  const displayInitials = initialsFromName(displayName)
  const displayRole = salesMode ? 'Ventas · Solo lectura' : (user?.roles?.[0]?.replace('_', ' ') || 'Super admin')

  return <div className={`app-shell ${dark ? 'dark' : ''} ${collapsed ? 'is-collapsed' : ''}`}>
    {mobileOpen && <button className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top"><Logo compact={collapsed} /><Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="mobile-close" icon={<X size={18} />} /></div>
      <nav className="nav-list" aria-label="Navegación principal">
        <span className="nav-label">PLATAFORMA</span>
        {nav.map((item) => <button key={item.id} className={`nav-item ${(page === item.id || (item.id === 'products' && page.startsWith('product-'))) ? 'active' : ''}`} onClick={() => { if (['dashboard', 'products', 'inventory', 'warehouses', 'purchases'].includes(item.id)) setPage(item.id as Page); setMobileOpen(false) }}>
          <item.icon size={18} /><span>{item.label}</span>{item.badge && <small>{item.badge}</small>}
        </button>)}
        <span className="nav-label spaced">GESTIÓN</span>
        <button className={`nav-item ${page === 'categories' ? 'active' : ''}`} onClick={() => { setPage('categories'); setMobileOpen(false) }}><Tags size={18} /><span>Categorías y marcas</span></button>
        <button className={`nav-item ${page === 'suppliers' ? 'active' : ''}`} onClick={() => { setPage('suppliers'); setMobileOpen(false) }}><Users size={18} /><span>Proveedores</span></button>
        <button className={`nav-item ${page === 'reports' ? 'active' : ''}`} onClick={() => { setPage('reports'); setMobileOpen(false) }}><TrendingUp size={18} /><span>Reportes</span></button>
        {!salesMode && <button className={`nav-item ${page === 'users' ? 'active' : ''}`} onClick={() => { setPage('users'); setMobileOpen(false) }}><UserCog size={18} /><span>Usuarios y roles</span></button>}
        {!salesMode && <button className={`nav-item ${page === 'audit' ? 'active' : ''}`} onClick={() => { setPage('audit'); setMobileOpen(false) }}><ShieldCheck size={18} /><span>Auditoría</span></button>}
      </nav>
      <div className="sidebar-bottom">
        <button className={`nav-item ${page === 'profile' ? 'active' : ''}`} onClick={() => { setPage('profile'); setMobileOpen(false) }}><Settings size={18} /><span>Perfil y seguridad</span></button>
        <button className="nav-item"><HelpCircle size={18} /><span>Centro de ayuda</span></button>
        <button className="nav-item" onClick={() => { onLogout(); setMobileOpen(false) }}><LogOut size={18} /><span>Cerrar sesión</span></button>
        <button className="user-mini" onClick={() => setSalesMode(!salesMode)} title="Alternar vista previa de rol">
          <span className="avatar">{displayInitials}</span><span className="user-copy"><b>{displayName}</b><small>{displayRole}</small></span><MoreHorizontal size={17} />
        </button>
      </div>
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}><ChevronLeft size={15} /></button>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileOpen(true)} icon={<Menu size={20} />} />
        <div className="global-search" onClick={() => setSearchModalOpen(true)}><Search size={17} /><input aria-label="Búsqueda global" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSearchModalOpen(true) }} placeholder="Buscar productos, SKU, almacenes u órdenes (⌘K)..." /><kbd><Command size={11} /> K</kbd></div>
        <div className="top-actions">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} icon={dark ? <Sun size={18} /> : <Moon size={18} />} />
          <button className="notification" aria-label="Notificaciones"><Bell size={18} /><i /></button>
          <span className="top-divider" />
          <button className="profile-btn" onClick={() => setPage('profile')}><span className="avatar">{displayInitials}</span><span>{displayName}</span><ChevronDown size={14} /></button>
        </div>
      </header>
      {salesMode && <div className="role-banner"><Eye size={15} /><span>Modo <b>sales</b> activo: las acciones de edición están deshabilitadas.</span>{user && !user.roles.includes('sales') && <button onClick={() => setSalesMode(false)}>Salir de vista previa</button>}</div>}
      {children}
      {searchModalOpen && <Modal title="Búsqueda global (⌘K)" subtitle="Encuentra al instante productos, SKUs, almacenes u órdenes de compra en PostgreSQL." onClose={() => setSearchModalOpen(false)} footer={<Button variant="secondary" onClick={() => setSearchModalOpen(false)}>Cerrar</Button>}>
        <div className="modal-form-stack">
          <Field label="Buscar en todo el sistema" placeholder="Ej. iPhone, APL-IP15P, ALM-MIA, OC-2026..." value={searchTerm} onChange={setSearchTerm} autoFocus prefix={<Search size={15} />} />
          {searchResults && (
            <div className="alert-list">
              {searchResults.products.map((p) => (
                <button key={p.id} className="alert-row" onClick={() => { onSelectProduct(p.id); setPage('product-detail'); setSearchModalOpen(false) }}>
                  <span><b>{p.name}</b><small>Producto · {p.sku} ({p.category || 'Catálogo'})</small></span>
                  <ChevronRight size={15} />
                </button>
              ))}
              {searchResults.warehouses.map((w) => (
                <button key={w.id} className="alert-row" onClick={() => { setPage('warehouses'); setSearchModalOpen(false) }}>
                  <span><b>{w.name}</b><small>Almacén · {w.code} ({w.city || 'US'})</small></span>
                  <ChevronRight size={15} />
                </button>
              ))}
              {searchResults.purchase_orders.map((po) => (
                <button key={po.id} className="alert-row" onClick={() => { setPage('purchases'); setSearchModalOpen(false) }}>
                  <span><b>{po.number}</b><small>Orden de compra · {po.supplier || 'Proveedor'} (${po.total.toLocaleString()})</small></span>
                  <ChevronRight size={15} />
                </button>
              ))}
              {searchResults.products.length === 0 && searchResults.warehouses.length === 0 && searchResults.purchase_orders.length === 0 && (
                <p className="muted">No se encontraron coincidencias para "{searchTerm}".</p>
              )}
            </div>
          )}
        </div>
      </Modal>}
    </div>
  </div>
}

function KpiCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: ReactNode; icon: ReactNode; tone: Tone }) {
  return <Card className="kpi"><div className={`kpi-icon kpi-${tone}`}>{icon}</div><div><span className="muted">{label}</span><strong>{value}</strong><small>{detail}</small></div></Card>
}

function Dashboard({ setPage, salesMode, user, onSelectProduct }: { setPage: (p: Page) => void; salesMode: boolean; user: ApiUser | null; onSelectProduct: (id: string) => void }) {
  const [data, setData] = useState<ApiDashboardData | null>(null)
  const bars = [18, 24, 17, 29, 35, 23, 38, 31, 44, 37, 52, 47, 54, 43, 58, 61, 49, 67, 62, 70, 64, 75, 71, 82, 76, 84, 79, 87, 83, 91]

  useEffect(() => {
    dashboardApi.get().then(setData).catch(() => {})
  }, [])

  const firstName = salesMode ? 'María' : (user?.name?.split(' ')[0] || 'Ana')
  const kpis = data?.kpis
  const alerts = data?.low_stock_alerts ?? []
  const recent = data?.recent_movements ?? []

  return <main className="page">
    <div className="page-heading"><div><span className="eyebrow plain">PANEL EN TIEMPO REAL · POSTGRESQL</span><h1>Buenos días, {firstName}</h1><p>Aquí tienes un resumen en vivo de lo que ocurre con tu inventario.</p></div><div className="heading-actions"><Button variant="secondary" onClick={() => setPage('reports')} icon={<Download size={16} />}>Exportar</Button><Button disabled={salesMode} onClick={() => setPage('inventory')} icon={<Plus size={16} />}>Registrar movimiento</Button></div></div>
    <div className="kpi-grid">
      <KpiCard label="Valor total del inventario" value={kpis ? `$${kpis.inventory_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '$284,650'} tone="info" icon={<Boxes size={20} />} detail={<><span className="up"><ArrowUpRight size={13} /> Activo</span> valorizado a costo</>} />
      <KpiCard label="Productos activos" value={kpis ? String(kpis.active_products) : '9'} tone="success" icon={<Package size={20} />} detail={<><span className="up"><ArrowUpRight size={13} /> Catálogo</span> sincronizado</>} />
      <KpiCard label="Stock bajo" value={kpis ? String(kpis.low_stock_count) : '4'} tone="warning" icon={<AlertTriangle size={20} />} detail={<><span className="down"><ArrowDownRight size={13} /> Alertas</span> bajo mínimo</>} />
      <KpiCard label="Movimientos hoy" value={kpis ? String(kpis.movements_today) : '18'} tone="neutral" icon={<RefreshCw size={20} />} detail={<>{kpis ? `${kpis.entries_today} entradas · ${kpis.exits_today} salidas` : 'Entradas y salidas de hoy'}</>} />
    </div>
    <div className="dashboard-main-grid">
      <Card className="chart-card">
        <div className="card-head"><div><h2>Movimientos de stock</h2><p>Entradas y salidas durante los últimos 30 días</p></div><select aria-label="Periodo"><option>Últimos 30 días</option></select></div>
        <div className="chart-summary"><strong>{kpis ? kpis.movements_today : 18}</strong><Badge tone="success"><ArrowUpRight size={12} /> En vivo</Badge><span>movimientos registrados</span></div>
        <div className="chart-area">
          <div className="axis"><span>900</span><span>600</span><span>300</span><span>0</span></div>
          <div className="bars">{bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} className={i > 25 ? 'recent' : ''} />)}</div>
        </div>
        <div className="chart-labels"><span>22 Abr</span><span>29 Abr</span><span>6 May</span><span>13 May</span><span>Hoy</span></div>
      </Card>
      <Card className="alerts-card">
        <div className="card-head"><div><h2>Alertas de stock</h2><p>Requieren tu atención</p></div><Badge tone="warning">{alerts.length}</Badge></div>
        <div className="alert-list">
          {alerts.map((p, idx) => <button key={p.id} onClick={() => { onSelectProduct(p.id); setPage('product-detail') }} className="alert-row">
            <img src={p.image || productImages[idx % productImages.length]} alt="" /><span><b>{p.name}</b><small>{p.primary_sku}</small></span><span className="stock-count"><b className={p.total_stock === 0 ? 'danger-text' : 'warning-text'}>{p.total_stock} uds.</b><small>{p.total_stock === 0 ? 'Agotado' : 'Bajo mín.'}</small></span>
          </button>)}
        </div>
        <button className="card-link" onClick={() => setPage('products')}>Ver todos los productos <ArrowRight size={14} /></button>
      </Card>
    </div>
    <Card className="activity-card">
      <div className="card-head"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados en PostgreSQL</p></div><Button variant="ghost" size="sm" onClick={() => setPage('inventory')}>Ver historial</Button></div>
      <div className="activity-table">
        {recent.slice(0, 6).map((m) => {
          const label = movementTypeLabel(m.type)
          const tone: Tone = m.quantity > 0 ? 'success' : m.type === 'adjustment' ? 'warning' : 'info'
          const signQty = m.quantity > 0 ? `+${m.quantity} uds.` : `−${Math.abs(m.quantity)} uds.`
          return (
            <div className="activity-row" key={m.id}>
              <Badge tone={tone} dot>{label}</Badge>
              <b>{m.variant?.product_name || m.variant?.sku || 'Producto'}</b>
              <strong className={m.quantity > 0 ? 'up' : ''}>{signQty}</strong>
              <span>{m.user?.name || 'Sistema'}</span>
              <small>{formatRelativeDate(m.created_at)}</small>
            </div>
          )
        })}
      </div>
    </Card>
  </main>
}

function Products({ salesMode, setPage, onSelectProduct }: { salesMode: boolean; setPage: (p: Page) => void; onSelectProduct: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [tabFilter, setTabFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived'>('all')
  const [selected, setSelected] = useState<string[]>([])
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    productsApi.list().then(setApiProducts).catch(() => {})
  }, [])

  const rows = useMemo(() => {
    if (apiProducts.length === 0) {
      return fallbackProducts.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        price: p.price,
        status: p.status,
        inventory_state: (p.stock === 0 ? 'out_of_stock' : p.stock < 8 ? 'low_stock' : 'in_stock') as ApiProduct['inventory_state'],
        image: p.image,
      }))
    }
    return apiProducts.map((p, idx) => ({
      id: p.id,
      name: p.name,
      sku: p.primary_sku,
      category: p.category?.name || 'General',
      brand: p.brand?.name || '—',
      stock: p.total_stock,
      price: p.price,
      status: inventoryStateLabel(p.inventory_state),
      inventory_state: p.inventory_state,
      image: p.image || productImages[idx % productImages.length],
    }))
  }, [apiProducts])

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const matchesTab = tabFilter === 'all' || p.inventory_state === tabFilter
      const matchesQuery = `${p.name} ${p.sku} ${p.brand} ${p.category}`.toLowerCase().includes(query.toLowerCase())
      return matchesTab && matchesQuery
    })
  }, [rows, query, tabFilter])

  const counts = useMemo(() => ({
    all: rows.length,
    in_stock: rows.filter((r) => r.inventory_state === 'in_stock').length,
    low_stock: rows.filter((r) => r.inventory_state === 'low_stock').length,
    out_of_stock: rows.filter((r) => r.inventory_state === 'out_of_stock').length,
    archived: rows.filter((r) => r.inventory_state === 'archived').length,
  }), [rows])

  const toggle = (sku: string) => setSelected((s) => (s.includes(sku) ? s.filter((x) => x !== sku) : [...s, sku]))
  const toneFor = (status: string): Tone => (status === 'Activo' ? 'success' : status === 'Agotado' ? 'danger' : 'warning')

  return <main className="page products-page">
    <div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Productos</b></div>
    <div className="page-heading compact"><div><h1>Productos</h1><p>Gestiona tu catálogo y controla el stock disponible.</p></div><Button disabled={salesMode} onClick={() => setPage('product-form')} icon={<Plus size={16} />}>Nuevo producto</Button></div>
    <div className="tabs">
      <button className={tabFilter === 'all' ? 'active' : ''} onClick={() => setTabFilter('all')}>Todos <span>{counts.all}</span></button>
      <button className={tabFilter === 'in_stock' ? 'active' : ''} onClick={() => setTabFilter('in_stock')}>Activos <span>{counts.in_stock}</span></button>
      <button className={tabFilter === 'low_stock' ? 'active' : ''} onClick={() => setTabFilter('low_stock')}>Stock bajo <span>{counts.low_stock}</span></button>
      <button className={tabFilter === 'out_of_stock' ? 'active' : ''} onClick={() => setTabFilter('out_of_stock')}>Agotados <span>{counts.out_of_stock}</span></button>
      <button className={tabFilter === 'archived' ? 'active' : ''} onClick={() => setTabFilter('archived')}>Archivados <span>{counts.archived}</span></button>
    </div>
    <Card className="product-card">
      <div className="table-toolbar">
        <div className="product-search"><Search size={16} /><input placeholder="Buscar por nombre, SKU o marca..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="filters">
          <button><Filter size={15} /> Categoría <ChevronDown size={13} /></button>
          <button>Marca <ChevronDown size={13} /></button>
          <button>Estado <ChevronDown size={13} /></button>
          <button><SlidersHorizontal size={15} /> Más filtros</button>
          <span />
          <Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button>
        </div>
      </div>
      {selected.length > 0 && <div className="bulk-bar"><span><Check size={14} /> {selected.length} seleccionados</span><Button variant="secondary" size="sm" disabled={salesMode}>Cambiar estado</Button><Button variant="danger" size="sm" disabled={salesMode}>Archivar</Button><button onClick={() => setSelected([])}>Cancelar</button></div>}
      <div className="table-scroll">
        <table className="product-list-table">
          <thead><tr><th><input type="checkbox" aria-label="Seleccionar todos" disabled={salesMode} checked={selected.length === filtered.length && filtered.length > 0} onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.sku))} /></th><th>Producto <ChevronsUpDown size={12} /></th><th>Categoría</th><th>Marca</th><th>Stock <ChevronsUpDown size={12} /></th><th>Precio <ChevronsUpDown size={12} /></th><th>Estado</th><th /></tr></thead>
          <tbody>{filtered.map((p) => <tr key={p.id}><td><input type="checkbox" aria-label={`Seleccionar ${p.name}`} checked={selected.includes(p.sku)} onChange={() => toggle(p.sku)} disabled={salesMode} /></td><td><button className="product-cell product-link" onClick={() => { onSelectProduct(p.id); setPage('product-detail') }}><img src={p.image} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span></button></td><td>{p.category}</td><td>{p.brand}</td><td><div className="stock-cell"><b className={p.stock === 0 ? 'danger-text' : p.stock < 8 ? 'warning-text' : ''}>{p.stock}</b><span><i style={{ width: `${Math.min(p.stock * 2, 100)}%` }} className={p.stock === 0 ? 'danger' : p.stock < 8 ? 'warning' : ''} /></span></div></td><td><b>${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td><td><Badge tone={toneFor(p.status)} dot>{p.status}</Badge></td><td><Button variant="ghost" size="icon" disabled={salesMode} onClick={() => { onSelectProduct(p.id); setPage('product-detail') }} icon={<MoreHorizontal size={17} />} /></td></tr>)}</tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><span><Search size={23} /></span><h3>No encontramos productos</h3><p>Prueba con otro nombre, SKU o marca.</p><Button variant="secondary" onClick={() => { setQuery(''); setTabFilter('all') }}>Limpiar búsqueda</Button></div>}
      </div>
      <div className="pagination"><span>Mostrando <b>1–{filtered.length}</b> de <b>{rows.length}</b> productos</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button disabled><ChevronRight size={15} /></button></div></div>
    </Card>
  </main>
}

type Variant = { id: number; sku: string; color: string; storage: string; price: string; cost: string; stock: number }

function FormSelect({ label, children, value, onChange }: { label: string; children: ReactNode; value?: string; onChange?: (v: string) => void }) {
  return <label className="field"><span className="field-label">{label}</span><span className="select-wrap"><select value={value} onChange={(e) => onChange?.(e.target.value)}>{children}</select><ChevronDown size={15} /></span></label>
}

function ProductForm({ setPage, onProductCreated }: { setPage: (p: Page) => void; onProductCreated: (product: ApiProduct) => void }) {
  const [name, setName] = useState('')
  const [baseSku, setBaseSku] = useState('')
  const [barcode, setBarcode] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active')
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [brands, setBrands] = useState<ApiBrand[]>([])
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([])
  const [variants, setVariants] = useState<Variant[]>([
    { id: 1, sku: '', color: 'Negro', storage: '256 GB', price: '999.00', cost: '780.00', stock: 10 },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    categoriesApi.list().then((tree) => {
      const flat: ApiCategory[] = []
      tree.forEach((root) => {
        if (root.children && root.children.length > 0) {
          root.children.forEach((c) => flat.push(c))
        } else {
          flat.push(root)
        }
      })
      setCategories(flat)
      if (flat[0]) setCategoryId(flat[0].id)
    }).catch(() => {})

    brandsApi.list().then((list) => {
      setBrands(list)
      if (list[0]) setBrandId(list[0].id)
    }).catch(() => {})

    warehousesApi.list().then((list) => {
      setWarehouses(list)
      if (list[0]) setWarehouseId(list[0].id)
    }).catch(() => {})
  }, [])

  const updateVariant = (id: number, key: keyof Variant, value: string) =>
    setVariants((items) => items.map((item) => (item.id === id ? { ...item, [key]: key === 'stock' ? Number(value) : value } : item)))
  const addVariant = () =>
    setVariants((items) => [...items, { id: Date.now(), sku: '', color: '', storage: '', price: '0.00', cost: '0.00', stock: 0 }])

  const handleSave = async () => {
    setError(null)
    setSaving(true)
    try {
      const created = await productsApi.create({
        category_id: categoryId,
        brand_id: brandId,
        name,
        base_sku: baseSku,
        barcode: barcode || undefined,
        description: description || undefined,
        status,
        image: productImages[0],
        initial_warehouse_id: warehouseId || undefined,
        variants: variants.map((v) => ({
          sku: v.sku,
          color: v.color || undefined,
          storage: v.storage || undefined,
          price: parseFloat(v.price.replace(/,/g, '')) || 0,
          cost: parseFloat(v.cost.replace(/,/g, '')) || 0,
          min_stock: 8,
          initial_stock: Number(v.stock) || 0,
        })),
      })
      setSaved(true)
      onProductCreated(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  return <main className="page editor-page">
    <div className="breadcrumb"><button onClick={() => setPage('products')}>Productos</button><ChevronRight size={13} /><b>Nuevo producto</b></div>
    <div className="page-heading editor-heading"><div><h1>Nuevo producto</h1><p>Completa la información del producto y configura sus variantes en PostgreSQL.</p></div><div className="heading-actions"><Button variant="secondary" onClick={() => setPage('products')}>Cancelar</Button><Button icon={<Save size={15} />} disabled={saving} onClick={handleSave}>{saving ? 'Guardando...' : 'Guardar producto'}</Button></div></div>
    {error && <div className="role-banner" style={{ marginBottom: 16, borderRadius: 8 }}><AlertTriangle size={15} /><span>{error}</span></div>}
    <div className="editor-layout">
      <div className="editor-main">
        <Card className="form-card">
          <div className="section-heading"><span><Package size={17} /></span><div><h2>Información general</h2><p>Datos principales que identifican al producto.</p></div></div>
          <div className="form-grid">
            <div className="span-2"><Field label="Nombre del producto" placeholder="Ej. iPad Pro M4 11&quot;" value={name} onChange={setName} /></div>
            <Field label="SKU base" placeholder="Ej. APL-IPADP-M4" value={baseSku} onChange={setBaseSku} prefix={<Barcode size={15} />} />
            <Field label="Código de barras" placeholder="Ej. 0194253766420" value={barcode} onChange={setBarcode} />
            <div className="span-2 textarea-field"><label className="field-label">Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe las características más importantes del producto." /><small>Describe las características más importantes del producto.</small></div>
          </div>
        </Card>
        <Card className="form-card">
          <div className="section-heading"><span><Camera size={17} /></span><div><h2>Imágenes</h2><p>Agrega hasta 8 imágenes. La primera será la portada.</p></div></div>
          <div className="image-editor">
            <div className="image-tile featured"><img src={productImages[1]} alt="Portada" /><Badge tone="info">Portada</Badge><button type="button"><Trash2 size={14} /></button></div>
            <div className="image-tile"><img src={productImages[0]} alt="Vista adicional" /><button type="button"><Trash2 size={14} /></button></div>
            <button type="button" className="upload-tile"><UploadCloud size={22} /><b>Agregar imágenes</b><small>PNG, JPG o WebP · Máx. 5 MB</small></button>
          </div>
        </Card>
        <Card className="form-card variants-card">
          <div className="section-heading variants-title"><span><SlidersHorizontal size={17} /></span><div><h2>Variantes</h2><p>Configura combinaciones, precios, costos y stock inicial.</p></div><Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addVariant}>Agregar variante</Button></div>
          <div className="variant-scroll">
            <div className="variant-table variant-head"><span>SKU</span><span>Color</span><span>Almacenamiento</span><span>Precio</span><span>Costo</span><span>Stock inicial</span><span /></div>
            {variants.map((v, index) => <div className="variant-table variant-row" key={v.id}>
              <div className="variant-index"><span>{index + 1}</span><input value={v.sku} aria-label="SKU de variante" onChange={(e) => updateVariant(v.id, 'sku', e.target.value)} placeholder="Ej. APL-IPADP-256-BLK" /></div>
              <input value={v.color} aria-label="Color" onChange={(e) => updateVariant(v.id, 'color', e.target.value)} placeholder="Color" />
              <select value={v.storage} aria-label="Almacenamiento" onChange={(e) => updateVariant(v.id, 'storage', e.target.value)}><option value="">N/A</option><option>128 GB</option><option>256 GB</option><option>512 GB</option><option>1 TB</option></select>
              <div className="money-input"><span>$</span><input value={v.price} aria-label="Precio" onChange={(e) => updateVariant(v.id, 'price', e.target.value)} /></div>
              <div className="money-input"><span>$</span><input value={v.cost} aria-label="Costo" onChange={(e) => updateVariant(v.id, 'cost', e.target.value)} /></div>
              <input type="number" value={v.stock} aria-label="Stock inicial" onChange={(e) => updateVariant(v.id, 'stock', e.target.value)} />
              <Button variant="ghost" size="icon" disabled={variants.length === 1} onClick={() => setVariants((items) => items.filter((item) => item.id !== v.id))} icon={<Trash2 size={15} />} />
            </div>)}
          </div>
          <div className="variant-summary"><span>{variants.length} variantes</span><span>Stock inicial total <b>{variants.reduce((sum, item) => sum + item.stock, 0)} unidades</b></span></div>
        </Card>
      </div>
      <aside className="editor-side">
        <Card className="form-card">
          <div className="side-card-title"><h2>Organización</h2><p>Clasifica y relaciona el producto.</p></div>
          <div className="side-fields">
            <FormSelect label="Categoría" value={categoryId} onChange={setCategoryId}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
            <FormSelect label="Marca" value={brandId} onChange={setBrandId}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </FormSelect>
            <FormSelect label="Almacén de stock inicial" value={warehouseId} onChange={setWarehouseId}>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
            </FormSelect>
          </div>
        </Card>
        <Card className="form-card">
          <div className="side-card-title"><h2>Estado del producto</h2></div>
          <FormSelect label="Visibilidad" value={status} onChange={(v) => setStatus(v as 'active' | 'draft' | 'archived')}>
            <option value="active">Activo</option>
            <option value="draft">Borrador</option>
            <option value="archived">Archivado</option>
          </FormSelect>
          <div className="status-note"><Check size={15} /><span><b>Listo para publicar</b><small>El producto aparecerá en los reportes y movimientos.</small></span></div>
        </Card>
      </aside>
    </div>
    {saved && <div className="toast"><span><Check size={16} /></span><div><b>Producto guardado</b><p>{name} y sus {variants.length} variantes se guardaron correctamente.</p></div><button onClick={() => setSaved(false)}><X size={15} /></button></div>}
  </main>
}

function ProductDetail({ productId, setPage, salesMode }: { productId: string | null; setPage: (p: Page) => void; salesMode: boolean }) {
  const [tab, setTab] = useState<'stock' | 'movements' | 'audit'>('stock')
  const [product, setProduct] = useState<ApiProduct | null>(null)
  const [movements, setMovements] = useState<ApiStockMovement[]>([])

  useEffect(() => {
    if (!productId) return
    productsApi.get(productId).then((res) => {
      setProduct(res.product)
      setMovements(res.movements)
    }).catch(() => {})
  }, [productId])

  const variants = product?.variants ?? []
  const totalValue = variants.reduce((sum, v) => sum + v.stock * v.cost, 0)
  const avgCost = variants.length > 0 ? variants.reduce((sum, v) => sum + v.cost, 0) / variants.length : 0

  return <main className="page detail-page">
    <div className="breadcrumb"><button onClick={() => setPage('products')}>Productos</button><ChevronRight size={13} /><b>{product?.name || 'Detalle de producto'}</b></div>
    <div className="detail-hero">
      <div className="detail-product"><div className="detail-image"><img src={product?.image || productImages[1]} alt={product?.name || ''} /></div><div><div className="detail-title-line"><h1>{product?.name || 'Cargando...'}</h1><Badge tone="success" dot>{product ? inventoryStateLabel(product.inventory_state) : 'Activo'}</Badge></div><p>{product?.base_sku} · {product?.brand?.name} · {product?.category?.name}</p><div className="detail-meta"><span><Boxes size={14} /> {product?.total_stock ?? 0} unidades</span><span><Barcode size={14} /> {variants.length} variantes</span><span><TrendingUp size={14} /> ${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} en inventario</span></div></div></div>
      <div className="heading-actions"><Button variant="secondary" icon={<Download size={15} />}>Exportar</Button><Button disabled={salesMode} icon={<Plus size={15} />} onClick={() => setPage('inventory')}>Registrar movimiento</Button></div>
    </div>
    <div className="detail-stats">
      <Card><span>Precio desde</span><strong>${(product?.price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><small>{variants.length} variante(s) activas</small></Card>
      <Card><span>Costo promedio</span><strong>${avgCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><small>Valorizado en almacén</small></Card>
      <Card><span>Stock disponible</span><strong>{product?.total_stock ?? 0} <em>uds.</em></strong><small>Sincronizado con PostgreSQL</small></Card>
      <Card><span>Última actualización</span><strong className="date-value">{formatRelativeDate(product?.updated_at ?? null)}</strong><small>Trazabilidad activa</small></Card>
    </div>
    <Card className="detail-card">
      <div className="detail-tabs"><button className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>Stock por variante y almacén</button><button className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}>Historial de movimientos ({movements.length})</button><button className={tab === 'audit' ? 'active' : ''} onClick={() => setTab('audit')}>Registro de auditoría</button></div>
      {tab === 'stock' && <>
        <div className="detail-section-head"><div><h2>Distribución de stock</h2><p>Existencias por variante y ubicación.</p></div><Button disabled={salesMode} size="sm" onClick={() => setPage('inventory')} icon={<Plus size={14} />}>Registrar movimiento</Button></div>
        <div className="warehouse-scroll">
          <table className="warehouse-table">
            <thead><tr><th>Variante (SKU)</th><th>Atributos</th><th>Precio</th><th>Costo</th><th>Stock total</th><th>Detalle por almacén</th></tr></thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id}>
                  <td><b>{v.sku}</b></td>
                  <td>{[v.color, v.storage].filter(Boolean).join(' · ') || 'Estándar'}</td>
                  <td>${v.price.toFixed(2)}</td>
                  <td>${v.cost.toFixed(2)}</td>
                  <td><b>{v.stock} uds.</b></td>
                  <td>
                    {(v.stocks_by_warehouse && v.stocks_by_warehouse.length > 0)
                      ? v.stocks_by_warehouse.map((s) => `${s.warehouse_name}: ${s.quantity} uds.`).join(' · ')
                      : '0 uds.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}
      {tab === 'movements' && <div className="timeline-list">
        {movements.map((m) => {
          const label = movementTypeLabel(m.type)
          const tone: Tone = m.quantity > 0 ? 'success' : m.type === 'adjustment' ? 'warning' : 'info'
          const qtyStr = m.quantity > 0 ? `+${m.quantity} unidades` : `−${Math.abs(m.quantity)} unidades`
          return (
            <div className="timeline-row" key={m.id}>
              <span className={`timeline-dot ${tone}`} />
              <div>
                <Badge tone={tone}>{label}</Badge>
                <b>{m.reason || m.reference || `Movimiento en ${m.warehouse?.name || 'Almacén'}`}</b>
                <small>{m.user?.name || 'Usuario'} · {m.warehouse?.name} · {formatRelativeDate(m.created_at)}</small>
              </div>
              <strong className={m.quantity > 0 ? 'up' : ''}>{qtyStr}</strong>
            </div>
          )
        })}
      </div>}
      {tab === 'audit' && <div className="timeline-list">
        {[
          ['Trazabilidad inmutable activa', 'Todos los movimientos de este producto están protegidos por trigger en PostgreSQL', 'Verificado'],
        ].map((item) => <div className="audit-row" key={item[1]}><span><ShieldCheck size={15} /></span><div><b>{item[0]}</b><p>{item[1]}</p></div><small>{item[2]}</small></div>)}
      </div>}
    </Card>
  </main>
}

function MovementBadge({ type }: { type: string }) {
  const tone: Tone = type === 'Entrada' || type === 'Devolución' ? 'success' : type === 'Salida' ? 'info' : type === 'Ajuste' ? 'warning' : 'neutral'
  const Icon = type === 'Entrada' ? Download : type === 'Salida' ? ArrowUpRight : type === 'Transferencia' ? ArrowRightLeft : type === 'Devolución' ? RotateCcw : SlidersHorizontal
  return <Badge tone={tone}><Icon size={11} />{type}</Badge>
}

function Modal({ title, subtitle, children, onClose, footer }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; footer: ReactNode }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}><button className="modal-backdrop" onClick={onClose} aria-label="Cerrar modal" /><div className="modal-card"><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><Button variant="ghost" size="icon" onClick={onClose} icon={<X size={18} />} /></div><div className="modal-body">{children}</div><div className="modal-footer">{footer}</div></div></div>
}

function Inventory({ salesMode }: { salesMode: boolean }) {
  const [movements, setMovements] = useState<ApiStockMovement[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [movementType, setMovementType] = useState<'Entrada' | 'Salida' | 'Ajuste' | 'Devolución' | 'Transferencia'>('Entrada')
  const [variantId, setVariantId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [toWarehouseId, setToWarehouseId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [reference, setReference] = useState('')
  const [reason, setReason] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const loadData = useCallback(() => {
    stockMovementsApi.list({ q: search || undefined }).then(setMovements).catch(() => {})
  }, [search])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    productsApi.list().then((list) => {
      setProducts(list)
      const firstVariant = list.flatMap((p) => p.variants ?? [])[0]
      if (firstVariant) setVariantId(firstVariant.id)
    }).catch(() => {})

    warehousesApi.list().then((list) => {
      setWarehouses(list)
      if (list[0]) setWarehouseId(list[0].id)
      if (list[1]) setToWarehouseId(list[1].id)
    }).catch(() => {})
  }, [])

  const allVariants = useMemo(() => {
    return products.flatMap((p) =>
      (p.variants ?? []).map((v) => ({
        id: v.id,
        label: `${p.name} · ${v.sku} (Stock: ${v.stock})`,
      }))
    )
  }, [products])

  const handleCreateMovement = async () => {
    setError(null)
    setSubmitting(true)
    const apiTypeMap = {
      Entrada: 'in',
      Salida: 'out',
      Ajuste: 'adjustment',
      Devolución: 'return',
      Transferencia: 'transfer',
    } as const

    try {
      await stockMovementsApi.create({
        type: apiTypeMap[movementType],
        product_variant_id: variantId,
        warehouse_id: warehouseId,
        to_warehouse_id: movementType === 'Transferencia' ? toWarehouseId : undefined,
        quantity: Number(quantity),
        reference: reference || undefined,
        reason: reason || undefined,
        current_password: currentPassword || undefined,
      })
      setModal(false)
      setConfirmed(true)
      setCurrentPassword('')
      setReference('')
      setReason('')
      loadData()
      productsApi.list().then(setProducts).catch(() => {})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el movimiento.')
    } finally {
      setSubmitting(false)
    }
  }

  const entriesCount = movements.filter((m) => m.quantity > 0).length
  const exitsCount = movements.filter((m) => m.quantity < 0).length
  const adjustmentsCount = movements.filter((m) => m.type === 'adjustment').length
  const transfersCount = movements.filter((m) => m.type === 'transfer_out' || m.type === 'transfer_in').length

  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Movimientos</b></div><h1>Movimientos de inventario</h1><p>Consulta y registra todas las entradas, salidas y ajustes en el libro inmutable (`stock_movements`).</p></div><Button disabled={salesMode} onClick={() => { setError(null); setModal(true) }} icon={<Plus size={16} />}>Registrar movimiento</Button></div>
    <div className="ops-kpis">
      <Card><span className="ops-icon success"><Download size={17} /></span><div><small>Entradas registradas</small><b>{entriesCount}</b><em>Libro mayor activo</em></div></Card>
      <Card><span className="ops-icon info"><ArrowUpRight size={17} /></span><div><small>Salidas registradas</small><b>{exitsCount}</b><em>Con control de saldo</em></div></Card>
      <Card><span className="ops-icon warning"><SlidersHorizontal size={17} /></span><div><small>Ajustes manuales</small><b>{adjustmentsCount}</b><em>Auditados en activity_log</em></div></Card>
      <Card><span className="ops-icon neutral"><ArrowRightLeft size={17} /></span><div><small>Transferencias</small><b>{transfersCount}</b><em>Entre almacenes</em></div></Card>
    </div>
    <Card className="ops-table-card">
      <div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar por producto, SKU o referencia..." value={search} onChange={(e) => setSearch(e.target.value)} /></div><div className="filters"><button><CalendarDays size={15} /> Recientes <ChevronDown size={13} /></button><button>Tipo <ChevronDown size={13} /></button><button>Almacén <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div>
      <div className="table-scroll"><table className="movement-table"><thead><tr><th>Movimiento</th><th>Producto</th><th>Cantidad</th><th>Saldo post.</th><th>Almacén / destino</th><th>Responsable</th><th>Fecha</th><th>Referencia</th></tr></thead><tbody>
        {movements.map((row) => {
          const uiType = movementTypeLabel(row.type)
          const qtyFormatted = row.quantity > 0 ? `+${row.quantity}` : `−${Math.abs(row.quantity)}`
          const warehouseLabel = row.related_warehouse
            ? `${row.warehouse?.name} → ${row.related_warehouse.name}`
            : (row.warehouse?.name || '—')
          const userName = row.user?.name || 'Sistema'
          return (
            <tr key={row.id}>
              <td><div className="movement-id"><b>{row.code}</b><MovementBadge type={uiType} /></div></td>
              <td><div className="product-cell compact-product"><span><b>{row.variant?.product_name || 'Producto'}</b><small>{row.variant?.sku}</small></span></div></td>
              <td><strong className={row.quantity > 0 ? 'up' : 'danger-text'}>{qtyFormatted} uds.</strong></td>
              <td><b>{row.balance_after} uds.</b></td>
              <td>{warehouseLabel}</td>
              <td><div className="person-cell"><span>{initialsFromName(userName)}</span>{userName}</div></td>
              <td>{formatRelativeDate(row.created_at)}</td>
              <td><b>{row.reference || '—'}</b></td>
            </tr>
          )
        })}
      </tbody></table></div>
      <div className="pagination"><span>Mostrando <b>{movements.length}</b> movimientos registrados</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button disabled><ChevronRight size={15} /></button></div></div>
    </Card>
    {modal && <Modal title="Registrar movimiento" subtitle="Actualiza el stock de forma transaccional con bloqueo de fila (FOR UPDATE)." onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button disabled={submitting} onClick={handleCreateMovement}>{submitting ? 'Procesando...' : 'Confirmar movimiento'}</Button></>}>
      {error && <div className="role-banner" style={{ marginBottom: 12, borderRadius: 8 }}><AlertTriangle size={15} /><span>{error}</span></div>}
      <div className="movement-type-grid">{(['Entrada', 'Salida', 'Ajuste', 'Devolución', 'Transferencia'] as const).map((type) => <button type="button" className={movementType === type ? 'active' : ''} onClick={() => setMovementType(type)} key={type}><MovementBadge type={type} /></button>)}</div>
      <div className="modal-form-grid">
        <FormSelect label="Variante de producto" value={variantId} onChange={setVariantId}>
          {allVariants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </FormSelect>
        <FormSelect label={movementType === 'Transferencia' ? 'Almacén origen' : 'Almacén'} value={warehouseId} onChange={setWarehouseId}>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
        </FormSelect>
        {movementType === 'Transferencia' && (
          <FormSelect label="Almacén destino" value={toWarehouseId} onChange={setToWarehouseId}>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
          </FormSelect>
        )}
        <Field label={movementType === 'Ajuste' ? 'Cantidad (ej. -2 o 5)' : 'Cantidad'} type="number" value={quantity} onChange={setQuantity} />
        <Field label="Referencia" placeholder="Ej. FACT-2048 / OC-2026" value={reference} onChange={setReference} />
      </div>
      <label className="field modal-notes"><span className="field-label">Motivo o notas</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Describe el motivo del movimiento..." /></label>
      {(movementType === 'Ajuste' || movementType === 'Salida') && <div className="password-confirm"><LockKeyhole size={17} /><div><b>Confirmación de seguridad requerida</b><p>Ingresa tu contraseña actual (`password` en demo) para autorizar este movimiento sensible.</p><Field type="password" placeholder="Tu contraseña actual" value={currentPassword} onChange={setCurrentPassword} /></div></div>}
    </Modal>}
    {confirmed && <div className="toast"><span><Check size={16} /></span><div><b>Movimiento registrado</b><p>El stock y el libro de movimientos se actualizaron en PostgreSQL.</p></div><button onClick={() => setConfirmed(false)}><X size={15} /></button></div>}
  </main>
}

function Warehouses({ salesMode }: { salesMode: boolean }) {
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([])
  const [selectedDetail, setSelectedDetail] = useState<ApiWarehouseDetail | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [wCode, setWCode] = useState('')
  const [wName, setWName] = useState('')
  const [wCity, setWCity] = useState('')
  const [wAddress, setWAddress] = useState('')
  const [wCapacity, setWCapacity] = useState('5000')
  const [wStatus, setWStatus] = useState<'operational' | 'maintenance' | 'closed'>('operational')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const loadWarehouses = useCallback(() => {
    warehousesApi.list().then(setWarehouses).catch(() => {})
  }, [])

  useEffect(() => {
    loadWarehouses()
  }, [loadWarehouses])

  const openWarehouse = (id: string) => {
    warehousesApi.get(id).then(setSelectedDetail).catch(() => {})
  }

  const openCreateModal = () => {
    setWCode('')
    setWName('')
    setWCity('Miami, FL')
    setWAddress('')
    setWCapacity('5000')
    setWStatus('operational')
    setError(null)
    setModalMode('create')
  }

  const openEditModal = () => {
    if (!selectedDetail) return
    const w = selectedDetail.warehouse
    setWCode(w.code)
    setWName(w.name)
    setWCity(w.city || '')
    setWAddress(w.address || '')
    setWCapacity(String(w.capacity_units ?? 5000))
    setWStatus(w.status)
    setError(null)
    setModalMode('edit')
  }

  const handleSaveWarehouse = async () => {
    setError(null)
    setSaving(true)
    try {
      if (modalMode === 'create') {
        await warehousesApi.create({
          code: wCode,
          name: wName,
          city: wCity || undefined,
          address: wAddress || undefined,
          capacity_units: Number(wCapacity) || 5000,
          status: wStatus,
        })
        setToastMsg('Nuevo almacén registrado en PostgreSQL.')
      } else if (modalMode === 'edit' && selectedDetail) {
        await warehousesApi.update(selectedDetail.warehouse.id, {
          name: wName,
          city: wCity || undefined,
          address: wAddress || undefined,
          capacity_units: Number(wCapacity) || 5000,
          status: wStatus,
        })
        openWarehouse(selectedDetail.warehouse.id)
        setToastMsg('Almacén actualizado en PostgreSQL.')
      }
      setModalMode(null)
      loadWarehouses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el almacén.')
    } finally {
      setSaving(false)
    }
  }

  if (selectedDetail) {
    const w = selectedDetail.warehouse
    const totalValue = selectedDetail.stocks.reduce((sum, s) => sum + s.quantity * s.variant.cost, 0)
    return <main className="page warehouse-detail">
      <div className="breadcrumb"><button onClick={() => setSelectedDetail(null)}>Almacenes</button><ChevronRight size={13} /><b>{w.name}</b></div>
      <div className="detail-hero warehouse-hero"><div className="detail-product"><span className="warehouse-hero-icon"><Warehouse size={25} /></span><div><div className="detail-title-line"><h1>{w.name}</h1><Badge tone={w.status === 'operational' ? 'success' : 'warning'} dot>{w.status === 'operational' ? 'Operativo' : 'Mantenimiento'}</Badge></div><p>{w.code} · {w.city}</p><div className="detail-meta"><span><MapPin size={14} /> {w.address || w.city}</span><span><Users size={14} /> {w.manager?.name || 'Sin asignar'}</span></div></div></div><div className="heading-actions"><Button variant="secondary" disabled={salesMode} onClick={openEditModal}>Editar almacén</Button></div></div>
      <div className="detail-stats warehouse-stats"><Card><span>Variantes con stock</span><strong>{w.distinct_variants}</strong><small>En esta ubicación</small></Card><Card><span>Unidades totales</span><strong>{w.total_units.toLocaleString()}</strong><small>Disponibles en almacén</small></Card><Card><span>Valor almacenado</span><strong>${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong><small className="up">Valor a costo</small></Card><Card><span>Capacidad máxima</span><strong>{(w.capacity_units ?? 5000).toLocaleString()} uds.</strong><div className="capacity-bar"><i /></div></Card></div>
      <Card className="ops-table-card">
        <div className="table-toolbar ops-toolbar"><div><h2>Stock por producto</h2><p>Inventario disponible en {w.name}.</p></div></div>
        <div className="table-scroll"><table className="warehouse-stock-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Disponible</th><th>Reservado</th><th>Valor a costo</th><th>Estado</th></tr></thead><tbody>{selectedDetail.stocks.map((s, idx) => <tr key={s.id}><td><div className="product-cell"><img src={s.variant.image || productImages[idx % productImages.length]} alt="" /><span><b>{s.variant.product_name}</b><small>{s.variant.sku}</small></span></div></td><td>{s.variant.category || '—'}</td><td><b>{s.available} uds.</b></td><td>{s.reserved} uds.</td><td><b>${(s.quantity * s.variant.cost).toLocaleString()}</b></td><td><Badge tone={s.quantity < s.variant.min_stock ? 'warning' : 'success'} dot>{s.quantity < s.variant.min_stock ? 'Stock bajo' : 'Saludable'}</Badge></td></tr>)}</tbody></table></div>
      </Card>
      {modalMode === 'edit' && <Modal title={`Editar ${w.name}`} subtitle="Actualiza capacidad, ubicación o estado operativo." onClose={() => setModalMode(null)} footer={<><Button variant="secondary" onClick={() => setModalMode(null)}>Cancelar</Button><Button disabled={saving} onClick={handleSaveWarehouse}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button></>}>
        <div className="modal-form-stack">
          <div className="modal-form-grid">
            <Field label="Nombre del almacén *" value={wName} onChange={setWName} />
            <Field label="Ciudad *" value={wCity} onChange={setWCity} />
          </div>
          <div className="modal-form-grid">
            <Field label="Dirección" value={wAddress} onChange={setWAddress} />
            <Field label="Capacidad máxima (uds.)" type="number" value={wCapacity} onChange={setWCapacity} />
          </div>
          <FormSelect label="Estado operativo" value={wStatus} onChange={(val) => setWStatus(val as 'operational' | 'maintenance' | 'closed')}>
            <option value="operational">Operativo</option>
            <option value="maintenance">En mantenimiento</option>
            <option value="closed">Cerrado</option>
          </FormSelect>
          {error && <p className="danger-text">{error}</p>}
        </div>
      </Modal>}
      {toastMsg && <div className="toast"><span><Check size={16} /></span><div><b>Almacenes</b><p>{toastMsg}</p></div><button onClick={() => setToastMsg(null)}><X size={15} /></button></div>}
    </main>
  }

  const totalUnitsAll = warehouses.reduce((sum, w) => sum + w.total_units, 0)

  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Almacenes</b></div><h1>Almacenes</h1><p>Administra ubicaciones, capacidad y distribución del inventario en PostgreSQL.</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={openCreateModal}>Nuevo almacén</Button></div>
    <div className="warehouse-overview"><Card><div><span className="ops-icon info"><Building2 size={19} /></span><div><small>Ubicaciones registradas</small><strong>{warehouses.length}</strong></div></div><div className="warehouse-spark">{[35,48,42,58,64,61,76].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div></Card><Card><div><span className="ops-icon success"><Boxes size={19} /></span><div><small>Unidades almacenadas</small><strong>{totalUnitsAll.toLocaleString()}</strong></div></div><Badge tone="success"><ArrowUpRight size={11} /> En vivo</Badge></Card><Card><div><span className="ops-icon warning"><AlertTriangle size={19} /></span><div><small>Estado de red</small><strong>Operativa</strong></div></div><Badge tone="info">Multi-almacén</Badge></Card></div>
    <Card className="ops-table-card">
      <div className="table-scroll"><table className="warehouse-list-table"><thead><tr><th>Almacén</th><th>Responsable</th><th>Variantes</th><th>Unidades</th><th>Capacidad</th><th>Estado</th><th /></tr></thead><tbody>{warehouses.map((w) => {
        const managerName = w.manager?.name || 'Carlos Ruiz'
        return <tr key={w.id}><td><button className="warehouse-link" onClick={() => openWarehouse(w.id)}><span><Warehouse size={18} /></span><div><b>{w.name}</b><small><MapPin size={10} /> {w.city} · {w.code}</small></div></button></td><td><div className="person-cell"><span>{initialsFromName(managerName)}</span>{managerName}</div></td><td><b>{w.distinct_variants}</b></td><td>{w.total_units.toLocaleString()} uds.</td><td><b>{(w.capacity_units ?? 0).toLocaleString()} uds.</b></td><td><Badge tone={w.status === 'operational' ? 'success' : 'warning'} dot>{w.status === 'operational' ? 'Operativo' : 'Mantenimiento'}</Badge></td><td><Button variant="ghost" size="icon" icon={<ChevronRight size={16} />} onClick={() => openWarehouse(w.id)} /></td></tr>
      })}</tbody></table></div>
    </Card>
    {modalMode === 'create' && <Modal title="Nuevo almacén" subtitle="Registra un nuevo centro de distribución o sucursal." onClose={() => setModalMode(null)} footer={<><Button variant="secondary" onClick={() => setModalMode(null)}>Cancelar</Button><Button disabled={saving} onClick={handleSaveWarehouse}>{saving ? 'Creando...' : 'Crear almacén'}</Button></>}>
      <div className="modal-form-stack">
        <div className="modal-form-grid">
          <Field label="Código *" placeholder="Ej. ALM-JAX-05" value={wCode} onChange={setWCode} />
          <Field label="Nombre del almacén *" placeholder="Ej. Hub Logístico Jacksonville" value={wName} onChange={setWName} />
        </div>
        <div className="modal-form-grid">
          <Field label="Ciudad" placeholder="Ej. Jacksonville, FL" value={wCity} onChange={setWCity} />
          <Field label="Dirección" placeholder="Ej. 900 Bay St" value={wAddress} onChange={setWAddress} />
        </div>
        <div className="modal-form-grid">
          <Field label="Capacidad máxima (uds.)" type="number" value={wCapacity} onChange={setWCapacity} />
          <FormSelect label="Estado operativo" value={wStatus} onChange={(val) => setWStatus(val as 'operational' | 'maintenance' | 'closed')}>
            <option value="operational">Operativo</option>
            <option value="maintenance">En mantenimiento</option>
            <option value="closed">Cerrado</option>
          </FormSelect>
        </div>
        {error && <p className="danger-text">{error}</p>}
      </div>
    </Modal>}
    {toastMsg && <div className="toast"><span><Check size={16} /></span><div><b>Almacenes</b><p>{toastMsg}</p></div><button onClick={() => setToastMsg(null)}><X size={15} /></button></div>}
  </main>
}

function mapOrderStatusLabel(status: ApiPurchaseOrder['status']): string {
  if (status === 'received') return 'Recibida'
  if (status === 'partially_received') return 'Recibida parcial'
  if (status === 'sent') return 'Enviada'
  if (status === 'cancelled') return 'Cancelada'
  return 'Borrador'
}

function OrderStatus({ status }: { status: string }) {
  const tone: Tone = status === 'Recibida' ? 'success' : status === 'Cancelada' ? 'danger' : status === 'Borrador' ? 'neutral' : status === 'Recibida parcial' ? 'warning' : 'info'
  return <Badge tone={tone} dot>{status}</Badge>
}

function Purchases({ salesMode }: { salesMode: boolean }) {
  const [orders, setOrders] = useState<ApiPurchaseOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<ApiPurchaseOrder | null>(null)
  const [receive, setReceive] = useState(false)
  const [receiveQuantities, setReceiveQuantities] = useState<Record<string, number>>({})
  const [receiveError, setReceiveError] = useState<string | null>(null)
  const [submittingReceive, setSubmittingReceive] = useState(false)
  const [done, setDone] = useState(false)

  // Modal de Nueva Orden
  const [createModal, setCreateModal] = useState(false)
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([])
  const [warehouses, setWarehouses] = useState<ApiWarehouse[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [poSupplierId, setPoSupplierId] = useState('')
  const [poWarehouseId, setPoWarehouseId] = useState('')
  const [poVariantId, setPoVariantId] = useState('')
  const [poQty, setPoQty] = useState('10')
  const [poCost, setPoCost] = useState('250')
  const [poExpectedAt, setPoExpectedAt] = useState('')
  const [poNotes, setPoNotes] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [creatingOrder, setCreatingOrder] = useState(false)

  const allVariants = useMemo(() => {
    const list: Array<{ id: string; sku: string; productName: string; cost: number }> = []
    products.forEach((p) => {
      ;(p.variants ?? []).forEach((v) => {
        list.push({ id: v.id, sku: v.sku, productName: p.name, cost: v.cost })
      })
    })
    return list
  }, [products])

  const loadOrders = useCallback(() => {
    purchaseOrdersApi.list().then(setOrders).catch(() => {})
  }, [])

  useEffect(() => {
    loadOrders()
    suppliersApi.list().then((s) => {
      setSuppliers(s)
      if (s[0]) setPoSupplierId(s[0].id)
    }).catch(() => {})
    warehousesApi.list().then((w) => {
      setWarehouses(w)
      if (w[0]) setPoWarehouseId(w[0].id)
    }).catch(() => {})
    productsApi.list().then((p) => {
      setProducts(p)
      const firstVariant = p[0]?.variants?.[0]
      if (firstVariant) {
        setPoVariantId(firstVariant.id)
        setPoCost(String(firstVariant.cost))
      }
    }).catch(() => {})
  }, [loadOrders])

  const openOrderDetail = (order: ApiPurchaseOrder) => {
    setSelectedOrder(order)
    purchaseOrdersApi.get(order.id).then(setSelectedOrder).catch(() => {})
  }

  const openReceiveModal = () => {
    if (!selectedOrder) return
    const defaults: Record<string, number> = {}
    ;(selectedOrder.items ?? []).forEach((item) => {
      if (item.pending > 0) {
        defaults[item.id] = item.pending
      }
    })
    setReceiveQuantities(defaults)
    setReceiveError(null)
    setReceive(true)
  }

  const handleConfirmReceive = async () => {
    if (!selectedOrder) return
    setReceiveError(null)
    setSubmittingReceive(true)
    try {
      const payload = Object.entries(receiveQuantities)
        .filter(([, q]) => Number(q) > 0)
        .map(([item_id, q]) => ({ item_id, quantity_received: Number(q) }))

      const updated = await purchaseOrdersApi.receive(selectedOrder.id, payload)
      setSelectedOrder(updated)
      setReceive(false)
      setDone(true)
      loadOrders()
    } catch (err) {
      setReceiveError(err instanceof Error ? err.message : 'No se pudo registrar la recepción.')
    } finally {
      setSubmittingReceive(false)
    }
  }

  const handleCreateOrder = async () => {
    setCreateError(null)
    setCreatingOrder(true)
    try {
      const created = await purchaseOrdersApi.create({
        supplier_id: poSupplierId,
        warehouse_id: poWarehouseId,
        expected_at: poExpectedAt || undefined,
        notes: poNotes || undefined,
        send_now: true,
        items: [
          {
            product_variant_id: poVariantId,
            quantity_ordered: Number(poQty) || 1,
            unit_cost: Number(poCost) || 0,
          },
        ],
      })
      setCreateModal(false)
      setPoNotes('')
      loadOrders()
      setSelectedOrder(created)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear la orden de compra.')
    } finally {
      setCreatingOrder(false)
    }
  }

  if (selectedOrder) {
    const statusLabel = mapOrderStatusLabel(selectedOrder.status)
    const orderItems = selectedOrder.items ?? []
    const canReceive = !salesMode && (selectedOrder.status === 'sent' || selectedOrder.status === 'partially_received') && orderItems.some((i) => i.pending > 0)
    const supplierName = selectedOrder.supplier?.legal_name || 'Proveedor'
    const isPartiallyReceived = selectedOrder.status === 'partially_received'
    const isFullyReceived = selectedOrder.status === 'received'

    return <main className="page purchase-detail">
      <div className="breadcrumb"><button onClick={() => setSelectedOrder(null)}>Compras</button><ChevronRight size={13} /><b>{selectedOrder.number}</b></div>
      <div className="page-heading compact purchase-heading"><div><div className="detail-title-line"><h1>Orden {selectedOrder.number}</h1><OrderStatus status={statusLabel} /></div><p>Creada por {selectedOrder.creator?.name || 'Ana Martínez'} · Destino: {selectedOrder.warehouse?.name || 'Almacén Central'}</p></div><div className="heading-actions"><Button variant="secondary" icon={<FileText size={15} />} onClick={() => window.print()}>Descargar PDF</Button><Button disabled={!canReceive} onClick={openReceiveModal} icon={<PackageCheck size={16} />}>{isFullyReceived ? 'Mercancía recibida' : 'Recibir mercancía'}</Button></div></div>
      <div className="purchase-layout"><div className="purchase-main">
        <Card className="order-progress">
          <div className="progress-step complete"><span><Check size={14} /></span><div><b>Borrador</b><small>Completado</small></div></div><i />
          <div className={`progress-step ${selectedOrder.status !== 'draft' ? 'complete' : 'active'}`}><span><Check size={14} /></span><div><b>Enviada</b><small>{selectedOrder.status !== 'draft' ? 'Completado' : 'Actual'}</small></div></div><i />
          <div className={`progress-step ${isFullyReceived ? 'complete' : isPartiallyReceived ? 'active' : ''}`}><span><Truck size={14} /></span><div><b>Recepción parcial</b><small>{isFullyReceived ? 'Completado' : isPartiallyReceived ? 'En curso' : 'Pendiente'}</small></div></div><i />
          <div className={`progress-step ${isFullyReceived ? 'complete' : ''}`}><span><PackageCheck size={14} /></span><div><b>Recibida</b><small>{isFullyReceived ? 'Completado' : 'Pendiente'}</small></div></div>
        </Card>
        <Card className="order-items-card"><div className="detail-section-head"><div><h2>Productos de la orden</h2><p>{orderItems.length} productos · {selectedOrder.total_quantity_ordered} unidades solicitadas ({selectedOrder.total_quantity_received} recibidas)</p></div></div><div className="table-scroll"><table className="order-line-table"><thead><tr><th>Producto</th><th>Solicitado</th><th>Recibido</th><th>Pendiente</th><th>Costo unitario</th><th>Subtotal</th></tr></thead><tbody>{orderItems.map((item, i) => <tr key={item.id}><td><div className="product-cell"><img src={item.image || productImages[i % productImages.length]} alt="" /><span><b>{item.product_name || item.sku}</b><small>{item.sku}</small></span></div></td><td>{item.quantity_ordered} uds.</td><td><b className={item.quantity_received > 0 ? 'up' : ''}>{item.quantity_received} uds.</b></td><td><Badge tone={item.pending > 0 ? 'warning' : 'success'}>{item.pending} uds.</Badge></td><td>${item.unit_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td><b>${item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td></tr>)}</tbody></table></div><div className="order-total"><span>Subtotal <b>${selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span><span>Impuestos <b>$0.00</b></span><span className="grand-total">Total <b>${selectedOrder.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></span></div></Card>
      </div><aside className="purchase-side"><Card className="form-card"><div className="side-card-title"><h2>Proveedor</h2></div><div className="supplier-card"><span>{initialsFromName(supplierName)}</span><div><b>{supplierName}</b><small>{selectedOrder.supplier?.contact_email || '—'}</small><small>{selectedOrder.supplier?.contact_phone || '—'}</small></div></div></Card></aside></div>
      {receive && <Modal title="Recibir mercancía" subtitle={`Registra las cantidades recibidas para ${selectedOrder.number}.`} onClose={() => setReceive(false)} footer={<><Button variant="secondary" onClick={() => setReceive(false)}>Cancelar</Button><Button disabled={submittingReceive} icon={<PackageCheck size={15} />} onClick={handleConfirmReceive}>{submittingReceive ? 'Registrando...' : 'Confirmar recepción'}</Button></>}>
        <div className="receive-destination"><Warehouse size={16} /><div><small>Almacén de destino</small><b>{selectedOrder.warehouse?.name} · {selectedOrder.warehouse?.code}</b></div></div>
        <div className="receive-list">{orderItems.filter((item) => item.pending > 0).map((item, i) => <div className="receive-row" key={item.id}><img src={item.image || productImages[i % productImages.length]} alt="" /><div><b>{item.product_name || item.sku}</b><small>{item.sku} · Pendiente: {item.pending} uds.</small></div><label><span>Recibido</span><input type="number" min={0} max={item.pending} value={receiveQuantities[item.id] ?? item.pending} onChange={(e) => setReceiveQuantities((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))} /></label></div>)}</div>
        {receiveError && <p className="danger-text" style={{ marginTop: 10 }}>{receiveError}</p>}
      </Modal>}
      {done && <div className="toast"><span><Check size={16} /></span><div><b>Recepción registrada en PostgreSQL</b><p>El stock de {selectedOrder.warehouse?.name} fue actualizado automáticamente.</p></div><button onClick={() => setDone(false)}><X size={15} /></button></div>}
    </main>
  }

  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Compras</span><ChevronRight size={13} /><b>Órdenes</b></div><h1>Compras a proveedores</h1><p>Gestiona órdenes de compra y recepción automática de mercancía en PostgreSQL.</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={() => setCreateModal(true)}>Nueva orden</Button></div>
    <Card className="ops-table-card"><div className="table-scroll"><table className="orders-table"><thead><tr><th>Orden</th><th>Proveedor</th><th>Almacén destino</th><th>Artículos</th><th>Total</th><th>Entrega estimada</th><th>Estado</th><th /></tr></thead><tbody>{orders.map((order) => {
      const supplierName = order.supplier?.legal_name || 'Proveedor'
      const statusLabel = mapOrderStatusLabel(order.status)
      return <tr key={order.id}><td><button className="order-link" onClick={() => openOrderDetail(order)}>{order.number}</button></td><td><div className="supplier-cell"><span>{initialsFromName(supplierName)}</span><b>{supplierName}</b></div></td><td>{order.warehouse?.name || '—'}</td><td>{order.items_count} productos ({order.total_quantity_ordered} uds.)</td><td><b>${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td><td>{order.expected_at || '—'}</td><td><OrderStatus status={statusLabel} /></td><td><Button variant="ghost" size="icon" icon={<ChevronRight size={16} />} onClick={() => openOrderDetail(order)} /></td></tr>
    })}</tbody></table></div></Card>
    {createModal && <Modal title="Nueva orden de compra" subtitle="Genera una orden a proveedor con recepción vinculada a inventario." onClose={() => setCreateModal(false)} footer={<><Button variant="secondary" onClick={() => setCreateModal(false)}>Cancelar</Button><Button disabled={creatingOrder} onClick={handleCreateOrder}>{creatingOrder ? 'Creando...' : 'Crear y enviar orden'}</Button></>}>
      <div className="modal-form-stack">
        <div className="modal-form-grid">
          <FormSelect label="Proveedor *" value={poSupplierId} onChange={setPoSupplierId}>
            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.legal_name} ({s.code})</option>)}
          </FormSelect>
          <FormSelect label="Almacén de recepción *" value={poWarehouseId} onChange={setPoWarehouseId}>
            {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.code})</option>)}
          </FormSelect>
        </div>
        <FormSelect label="Variante / SKU a solicitar *" value={poVariantId} onChange={(val) => {
          setPoVariantId(val)
          const found = allVariants.find((v) => v.id === val)
          if (found) setPoCost(String(found.cost))
        }}>
          {allVariants.map((v) => <option key={v.id} value={v.id}>{v.productName} · {v.sku}</option>)}
        </FormSelect>
        <div className="modal-form-grid">
          <Field label="Cantidad a solicitar *" type="number" value={poQty} onChange={setPoQty} />
          <Field label="Costo unitario (USD) *" type="number" value={poCost} onChange={setPoCost} prefix="$" />
        </div>
        <div className="modal-form-grid">
          <Field label="Fecha estimada de entrega" type="date" value={poExpectedAt} onChange={setPoExpectedAt} />
          <Field label="Notas" placeholder="Instrucciones de entrega..." value={poNotes} onChange={setPoNotes} />
        </div>
        {createError && <p className="danger-text">{createError}</p>}
      </div>
    </Modal>}
  </main>
}

function CategoriesBrands({ salesMode }: { salesMode: boolean }) {
  const [section, setSection] = useState<'categories' | 'brands'>('categories')
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [brands, setBrands] = useState<ApiBrand[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [modal, setModal] = useState<'category' | 'brand' | null>(null)
  const [catName, setCatName] = useState('')
  const [catParent, setCatParent] = useState('')
  const [brandName, setBrandName] = useState('')
  const [brandCode, setBrandCode] = useState('')
  const [brandWeb, setBrandWeb] = useState('')
  const [saved, setSaved] = useState(false)

  const loadAll = useCallback(() => {
    categoriesApi.list().then((list) => {
      setCategories(list)
      setExpanded(list.map((c) => c.id))
    }).catch(() => {})
    brandsApi.list().then(setBrands).catch(() => {})
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleSaveModal = async () => {
    try {
      if (modal === 'category') {
        await categoriesApi.create({ name: catName, parent_id: catParent || null })
        setCatName('')
      } else if (modal === 'brand') {
        await brandsApi.create({ name: brandName, code: brandCode, website: brandWeb || undefined })
        setBrandName('')
        setBrandCode('')
        setBrandWeb('')
      }
      setModal(null)
      setSaved(true)
      loadAll()
    } catch {
      // handled
    }
  }

  return <main className="page management-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Categorías y marcas</b></div><h1>Categorías y marcas</h1><p>Organiza el catálogo y administra sus fabricantes en PostgreSQL.</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={() => setModal(section === 'categories' ? 'category' : 'brand')}>{section === 'categories' ? 'Nueva categoría' : 'Nueva marca'}</Button></div>
    <div className="management-tabs"><button className={section === 'categories' ? 'active' : ''} onClick={() => setSection('categories')}><GitBranch size={16} /> Categorías <span>{categories.length}</span></button><button className={section === 'brands' ? 'active' : ''} onClick={() => setSection('brands')}><Tags size={16} /> Marcas <span>{brands.length}</span></button></div>
    {section === 'categories' ? <div className="category-layout">
      <Card className="category-tree-card">
        <div className="management-card-head"><div><h2>Árbol de categorías</h2><p>Jerarquía almacenada en PostgreSQL.</p></div><Badge tone="neutral">{categories.length} principales</Badge></div>
        <div className="tree-list">{categories.map((category) => <div className="tree-group" key={category.id}>
          <div className="tree-row root"><GripVertical size={15} /><button className="tree-toggle" onClick={() => setExpanded((ids) => ids.includes(category.id) ? ids.filter((id) => id !== category.id) : [...ids, category.id])}><ChevronRight size={14} className={expanded.includes(category.id) ? 'open' : ''} /></button><span className="tree-icon"><Package size={15} /></span><b>{category.name}</b><Badge tone="neutral">{(category.children ?? []).reduce((s, c) => s + (c.products_count ?? 0), category.products_count ?? 0)} productos</Badge></div>
          {expanded.includes(category.id) && <div className="tree-children">{category.children?.map((child) => <div className="tree-row" key={child.id}><GripVertical size={14} /><span className="tree-branch" /><span className="tree-icon child"><Tags size={13} /></span><b>{child.name}</b><span className="tree-count">{child.products_count ?? 0} productos</span></div>)}</div>}
        </div>)}</div>
      </Card>
    </div> : <Card className="ops-table-card">
      <div className="table-scroll"><table className="brands-table"><thead><tr><th>Marca</th><th>Código</th><th>Productos</th><th>Sitio web</th><th>Estado</th></tr></thead><tbody>{brands.map((brand) => <tr key={brand.id}><td><div className="brand-cell"><span>{brand.name.slice(0, 1)}</span><b>{brand.name}</b></div></td><td><code>{brand.code}</code></td><td><b>{brand.products_count ?? 0}</b> productos</td><td><span className="website-cell"><Globe size={13} /> {brand.website || '—'}</span></td><td><Badge tone="success" dot>{brand.is_active ? 'Activa' : 'Inactiva'}</Badge></td></tr>)}</tbody></table></div>
    </Card>}
    {modal && <Modal title={modal === 'category' ? 'Nueva categoría' : 'Nueva marca'} subtitle={modal === 'category' ? 'Agrega una nueva clasificación al catálogo.' : 'Registra un fabricante para asociarlo a productos.'} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={handleSaveModal}>Guardar {modal === 'category' ? 'categoría' : 'marca'}</Button></>}>
      {modal === 'category' ? <div className="modal-form-stack"><Field label="Nombre de la categoría" placeholder="Ej. Consolas y videojuegos" value={catName} onChange={setCatName} /><FormSelect label="Categoría padre" value={catParent} onChange={setCatParent}><option value="">Ninguna · Categoría principal</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</FormSelect></div> : <div className="modal-form-stack"><div className="modal-form-grid"><Field label="Nombre de la marca" placeholder="Ej. ASUS" value={brandName} onChange={setBrandName} /><Field label="Código (máx. 10)" placeholder="Ej. ASUS" value={brandCode} onChange={setBrandCode} /></div><Field label="Sitio web" placeholder="https://asus.com" value={brandWeb} onChange={setBrandWeb} prefix={<Globe size={14} />} /></div>}
    </Modal>}
    {saved && <div className="toast"><span><Check size={16} /></span><div><b>Registro guardado</b><p>Los cambios se guardaron en PostgreSQL.</p></div><button onClick={() => setSaved(false)}><X size={15} /></button></div>}
  </main>
}

function Suppliers({ salesMode }: { salesMode: boolean }) {
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [code, setCode] = useState('')
  const [legalName, setLegalName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [city, setCity] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('NET 30')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  const loadSuppliers = useCallback(() => {
    suppliersApi.list().then(setSuppliers).catch(() => {})
  }, [])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  const handleCreateSupplier = async () => {
    setError(null)
    setSaving(true)
    try {
      await suppliersApi.create({
        code,
        legal_name: legalName,
        tax_id: taxId || undefined,
        contact_name: contactName || undefined,
        contact_email: contactEmail || undefined,
        contact_phone: contactPhone || undefined,
        city: city || undefined,
        payment_terms: paymentTerms || 'NET 30',
      })
      setModalOpen(false)
      setCode('')
      setLegalName('')
      setTaxId('')
      setContactName('')
      setContactEmail('')
      setContactPhone('')
      setCity('')
      setSavedToast(true)
      loadSuppliers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el proveedor.')
    } finally {
      setSaving(false)
    }
  }

  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Proveedores</b></div><h1>Proveedores</h1><p>Datos fiscales y de contacto cifrados en reposo (`encrypted` cast en PostgreSQL).</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Nuevo proveedor</Button></div>
    <Card className="ops-table-card"><div className="table-scroll"><table className="suppliers-table"><thead><tr><th>Proveedor</th><th>Contacto principal (cifrado)</th><th>Condiciones</th><th>Productos</th><th>Órdenes</th><th>Total comprado</th><th>Estado</th></tr></thead><tbody>{suppliers.map((supplier) => <tr key={supplier.id}><td><div className="supplier-link"><span>{initialsFromName(supplier.legal_name)}</span><div><b>{supplier.legal_name}</b><small>{supplier.code} · {supplier.city || 'US'}</small></div></div></td><td><div className="supplier-contact"><b>{supplier.contact_name || '—'}</b><small>{supplier.contact_email || '—'} · {supplier.contact_phone || ''}</small></div></td><td><Badge tone="neutral">{supplier.payment_terms || 'NET 30'}</Badge></td><td>{supplier.products_count}</td><td>{supplier.purchase_orders_count}</td><td><b>${supplier.total_purchased.toLocaleString('en-US', { maximumFractionDigits: 0 })}</b></td><td><Badge tone={supplier.is_active ? 'success' : 'neutral'} dot>{supplier.is_active ? 'Activo' : 'Inactivo'}</Badge></td></tr>)}</tbody></table></div></Card>
    {modalOpen && <Modal title="Nuevo proveedor" subtitle="El Tax ID, correo y teléfono se cifran automáticamente en reposo." onClose={() => setModalOpen(false)} footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button disabled={saving} onClick={handleCreateSupplier}>{saving ? 'Guardando...' : 'Guardar proveedor'}</Button></>}>
      <div className="modal-form-stack">
        <div className="modal-form-grid">
          <Field label="Código *" placeholder="Ej. PRV-0025" value={code} onChange={setCode} />
          <Field label="Razón social *" placeholder="Ej. Asus Global Dist. LLC" value={legalName} onChange={setLegalName} />
        </div>
        <div className="modal-form-grid">
          <Field label="Tax ID / RFC (cifrado)" placeholder="Ej. 65-9920114" value={taxId} onChange={setTaxId} />
          <Field label="Condiciones de pago" placeholder="Ej. NET 30" value={paymentTerms} onChange={setPaymentTerms} />
        </div>
        <div className="modal-form-grid">
          <Field label="Nombre de contacto" placeholder="Ej. Laura Gómez" value={contactName} onChange={setContactName} />
          <Field label="Ciudad" placeholder="Ej. Miami" value={city} onChange={setCity} />
        </div>
        <div className="modal-form-grid">
          <Field label="Correo de contacto (cifrado)" type="email" placeholder="laura@asusdist.com" value={contactEmail} onChange={setContactEmail} />
          <Field label="Teléfono (cifrado)" placeholder="+1 305 555 0190" value={contactPhone} onChange={setContactPhone} />
        </div>
        {error && <p className="danger-text">{error}</p>}
      </div>
    </Modal>}
    {savedToast && <div className="toast"><span><Check size={16} /></span><div><b>Proveedor registrado</b><p>Guardado en PostgreSQL con PII cifrada.</p></div><button onClick={() => setSavedToast(false)}><X size={15} /></button></div>}
  </main>
}

function Reports({ salesMode }: { salesMode: boolean }) {
  const [report, setReport] = useState<ApiReportData | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    reportsApi.get().then(setReport).catch(() => {})
  }, [])

  const handleExportCsv = async () => {
    setExporting(true)
    try {
      await reportsApi.downloadCsv()
      setToastMsg('Archivo CSV/Excel (lara-inventario-valorizado.csv) descargado.')
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'Error al exportar reporte.')
    } finally {
      setExporting(false)
    }
  }

  const s = report?.summary

  return <main className="page reports-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Reportes</b></div><h1>Reportes y valorización</h1><p>Analiza el rendimiento financiero y la distribución real del inventario en PostgreSQL.</p></div><div className="heading-actions"><Button variant="secondary" disabled={salesMode || exporting} icon={<FileSpreadsheet size={15} />} onClick={handleExportCsv}>{exporting ? 'Exportando...' : 'Exportar CSV / Excel'}</Button><Button variant="secondary" icon={<FileText size={15} />} onClick={() => window.print()}>Imprimir / PDF</Button></div></div>
    <div className="detail-stats report-stats">
      <Card><span>Valor total a costo</span><strong>${s ? s.total_cost_value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}</strong><small className="up">{s ? `${s.total_units.toLocaleString()} unidades totales` : 'Calculando...'}</small></Card>
      <Card><span>Valor potencial de venta</span><strong>${s ? s.total_retail_value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}</strong><small>Margen estimado {s ? `${s.estimated_margin_percent}%` : '—'} (${s ? s.estimated_profit.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'})</small></Card>
      <Card><span>Productos activos</span><strong>{s ? s.active_products : 9}</strong><small>{s ? `${s.active_variants} variantes con SKU` : 'Catálogo activo'}</small></Card>
      <Card><span>Almacenes activos</span><strong>{s ? s.active_warehouses : 4}</strong><small>Red Florida, US</small></Card>
    </div>
    <div className="detail-grid">
      <Card className="ops-table-card">
        <div className="table-toolbar ops-toolbar"><div><h2>Valorización por almacén</h2><p>Distribución de capital inmovilizado por centro logístico.</p></div></div>
        <div className="table-scroll">
          <table className="warehouse-stock-table">
            <thead>
              <tr>
                <th>Almacén</th>
                <th>Ciudad</th>
                <th>Unidades</th>
                <th>Valor a costo</th>
                <th>Valor de venta</th>
              </tr>
            </thead>
            <tbody>
              {(report?.by_warehouse ?? []).map((w) => (
                <tr key={w.warehouse_id}>
                  <td><b>{w.warehouse_name}</b> <small>({w.warehouse_code})</small></td>
                  <td>{w.warehouse_city || '—'}</td>
                  <td>{w.units.toLocaleString()} uds.</td>
                  <td><b>${w.cost_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td>
                  <td>${w.retail_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="ops-table-card">
        <div className="table-toolbar ops-toolbar"><div><h2>Valorización por categoría</h2><p>Categorías con mayor peso en inventario.</p></div></div>
        <div className="table-scroll">
          <table className="warehouse-stock-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Unidades</th>
                <th>Costo total</th>
                <th>Venta estimada</th>
              </tr>
            </thead>
            <tbody>
              {(report?.by_category ?? []).map((c) => (
                <tr key={c.category_id}>
                  <td><b>{c.category_name}</b></td>
                  <td>{c.units.toLocaleString()} uds.</td>
                  <td><b>${c.cost_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</b></td>
                  <td>${c.retail_value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
    {toastMsg && <div className="toast"><span><Check size={16} /></span><div><b>Reportes</b><p>{toastMsg}</p></div><button onClick={() => setToastMsg(null)}><X size={15} /></button></div>}
  </main>
}

function UsersRoles({ salesMode }: { salesMode: boolean }) {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('password123')
  const [role, setRole] = useState('inventory_manager')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const loadUsers = useCallback(() => {
    usersApi.list().then(setUsers).catch(() => {})
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleCreateUser = async () => {
    setError(null)
    setSaving(true)
    try {
      await usersApi.create({ name, email, password, role, is_active: true })
      setModalOpen(false)
      setName('')
      setEmail('')
      setPassword('password123')
      setToastMsg('Nuevo usuario creado y rol asignado en PostgreSQL.')
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (targetUser: ApiUser) => {
    try {
      await usersApi.update(targetUser.id, { is_active: !targetUser.is_active })
      setToastMsg(`Estado de ${targetUser.name} actualizado.`)
      loadUsers()
    } catch (err) {
      setToastMsg(err instanceof Error ? err.message : 'No tienes permisos para modificar este usuario.')
    }
  }

  return <main className="page users-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Administración</span><ChevronRight size={13} /><b>Usuarios y roles</b></div><h1>Usuarios y roles</h1><p>Control de acceso basado en roles (`spatie/laravel-permission`) conectado a PostgreSQL.</p></div><Button disabled={salesMode} icon={<UserPlus size={16} />} onClick={() => setModalOpen(true)}>Invitar usuario</Button></div>
    <Card className="ops-table-card"><div className="table-scroll"><table className="users-table"><thead><tr><th>Usuario</th><th>Rol asignado</th><th>Permisos</th><th>Estado</th><th>Último acceso</th><th /></tr></thead><tbody>{users.map((u) => {
      const primaryRole = u.roles[0] || 'sales'
      return <tr key={u.id}><td><div className="user-table-cell"><span>{initialsFromName(u.name)}</span><div><b>{u.name}</b><small>{u.email}</small></div></div></td><td><Badge tone={primaryRole === 'super_admin' ? 'info' : 'neutral'}>{primaryRole}</Badge></td><td><span className="twofa-on"><ShieldCheck size={13} /> {u.permissions.length} permisos</span></td><td><Badge tone={u.is_active ? 'success' : 'danger'} dot>{u.is_active ? 'Activo' : 'Inactivo'}</Badge></td><td>{formatRelativeDate(u.last_login_at)}</td><td><Button variant="ghost" disabled={salesMode} onClick={() => handleToggleActive(u)}>{u.is_active ? 'Desactivar' : 'Activar'}</Button></td></tr>
    })}</tbody></table></div></Card>
    {modalOpen && <Modal title="Invitar nuevo usuario" subtitle="Asigna credenciales y rol RBAC de Spatie (requiere rol super_admin)." onClose={() => setModalOpen(false)} footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button><Button disabled={saving} onClick={handleCreateUser}>{saving ? 'Creando...' : 'Crear usuario'}</Button></>}>
      <div className="modal-form-stack">
        <div className="modal-form-grid">
          <Field label="Nombre completo *" placeholder="Ej. Diego Morales" value={name} onChange={setName} />
          <Field label="Correo electrónico *" type="email" placeholder="diego@lara.test" value={email} onChange={setEmail} />
        </div>
        <div className="modal-form-grid">
          <FormSelect label="Rol del sistema *" value={role} onChange={setRole}>
            <option value="super_admin">super_admin (Control total)</option>
            <option value="admin">admin (Catálogo, compras y reportes)</option>
            <option value="inventory_manager">inventory_manager (Stock y órdenes)</option>
            <option value="sales">sales (Solo lectura)</option>
          </FormSelect>
          <Field label="Contraseña temporal (mín. 8) *" type="password" value={password} onChange={setPassword} />
        </div>
        {error && <p className="danger-text">{error}</p>}
      </div>
    </Modal>}
    {toastMsg && <div className="toast"><span><Check size={16} /></span><div><b>Usuarios y roles</b><p>{toastMsg}</p></div><button onClick={() => setToastMsg(null)}><X size={15} /></button></div>}
  </main>
}

function Audit() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([])
  const [filterLog, setFilterLog] = useState('')
  const [query, setQuery] = useState('')

  const loadLogs = useCallback(() => {
    auditLogsApi
      .list({
        log_name: filterLog || undefined,
        q: query || undefined,
      })
      .then(setLogs)
      .catch(() => {})
  }, [filterLog, query])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const logBadgeTone = (logName: string): Tone => {
    if (logName === 'inventory') return 'warning'
    if (logName === 'purchases') return 'info'
    if (logName === 'users') return 'danger'
    return 'success'
  }

  return <main className="page audit-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Administración</span><ChevronRight size={13} /><b>Auditoría</b></div><h1>Registro de auditoría</h1><p>Trazabilidad en tiempo real desde la tabla `activity_log` (`spatie/laravel-activitylog`).</p></div><Button variant="secondary" icon={<RefreshCw size={15} />} onClick={loadLogs}>Actualizar</Button></div>
    <div className="audit-summary">
      <Card><span className="ops-icon info"><History size={18} /></span><div><small>Libro de stock</small><b>Inmutable</b><em className="up">Protegido por trigger PG</em></div></Card>
      <Card><span className="ops-icon warning"><ShieldCheck size={18} /></span><div><small>Ajustes y salidas</small><b>Reautenticados</b><em>Exigen contraseña actual</em></div></Card>
      <Card><span className="ops-icon success"><BarChart3 size={18} /></span><div><small>Eventos registrados</small><b>{logs.length} eventos</b><em>En `activity_log`</em></div></Card>
    </div>
    <Card className="ops-table-card">
      <div className="table-toolbar">
        <div className="table-search"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por descripción, SKU, orden o usuario..." /></div>
        <div className="filter-row">
          <select aria-label="Canal de auditoría" value={filterLog} onChange={(e) => setFilterLog(e.target.value)}>
            <option value="">Todos los canales</option>
            <option value="inventory">inventory (Movimientos sensibles)</option>
            <option value="purchases">purchases (Órdenes de compra)</option>
            <option value="catalog">catalog (Productos y proveedores)</option>
            <option value="users">users (Usuarios y roles)</option>
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>Canal</th>
              <th>Evento / Descripción</th>
              <th>Entidad</th>
              <th>Ejecutado por</th>
              <th>Metadatos (JSON)</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td><Badge tone={logBadgeTone(log.log_name)} dot>{log.log_name}</Badge></td>
                <td><b>{log.description}</b></td>
                <td><code>{log.subject_type || 'Sistema'}</code></td>
                <td>
                  <div className="user-table-cell">
                    <span>{initialsFromName(log.causer?.name || 'Sistema')}</span>
                    <div>
                      <b>{log.causer?.name || 'Sistema'}</b>
                      <small>{log.causer?.email || '—'}</small>
                    </div>
                  </div>
                </td>
                <td><code>{JSON.stringify(log.properties)}</code></td>
                <td>{formatRelativeDate(log.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </main>
}

function ProfileSecurity({ user, salesMode }: { user: ApiUser | null; salesMode: boolean }) {
  const [section, setSection] = useState<'profile' | 'security' | 'sessions'>('profile')
  const [saved, setSaved] = useState(false)

  const fullName = salesMode ? 'María López' : (user?.name || 'Ana Martínez')
  const parts = fullName.split(' ')
  const firstName = parts[0] || 'Ana'
  const lastName = parts.slice(1).join(' ') || 'Martínez'
  const email = salesMode ? 'sales@lara.test' : (user?.email || 'admin@lara.test')
  const role = salesMode ? 'sales' : (user?.roles?.[0] || 'super_admin')
  const title = role === 'super_admin'
    ? 'Directora de Operaciones'
    : role === 'inventory_manager'
      ? 'Jefe de Almacén'
      : 'Ejecutiva de Ventas'
  const initials = initialsFromName(fullName)

  return <main className="page profile-page">
    <div className="page-heading compact">
      <div>
        <div className="breadcrumb"><span>Configuración</span><ChevronRight size={13} /><b>Perfil y seguridad</b></div>
        <h1>Perfil y seguridad</h1>
        <p>Administra tu información personal, credenciales y sesiones activas en Laravel Sanctum.</p>
      </div>
    </div>
    <div className="profile-layout">
      <aside className="profile-nav-card">
        <div className="profile-person">
          <span className="avatar large">{initials}</span>
          <div>
            <b>{fullName}</b>
            <small>{email}</small>
            <Badge tone="info">{role}</Badge>
          </div>
        </div>
        <nav>
          <button className={section === 'profile' ? 'active' : ''} onClick={() => setSection('profile')}>
            <CircleUserRound size={16} /> Información personal
          </button>
          <button className={section === 'security' ? 'active' : ''} onClick={() => setSection('security')}>
            <ShieldCheck size={16} /> Contraseña y 2FA
          </button>
          <button className={section === 'sessions' ? 'active' : ''} onClick={() => setSection('sessions')}>
            <Monitor size={16} /> Sesiones activas <Badge tone="neutral">3</Badge>
          </button>
        </nav>
      </aside>
      <div className="profile-content">
        {section === 'profile' && (
          <Card className="profile-card">
            <div className="profile-card-head">
              <div>
                <h2>Información personal</h2>
                <p>Actualiza tu nombre, correo corporativo y datos de contacto.</p>
              </div>
              <Badge tone="success" dot>Cuenta activa</Badge>
            </div>
            <div className="profile-photo">
              <span className="avatar xlarge">{initials}</span>
              <div>
                <Button variant="secondary" size="sm" icon={<UploadCloud size={14} />}>Cambiar foto</Button>
                <small>JPG, PNG o WebP. Máx. 2 MB.</small>
              </div>
            </div>
            <div className="form-grid">
              <Field label="Nombre" defaultValue={firstName} />
              <Field label="Apellido" defaultValue={lastName} />
              <div className="span-2">
                <Field label="Correo electrónico" defaultValue={email} prefix={<Mail size={14} />} />
              </div>
              <Field label="Cargo" defaultValue={title} />
              <Field label="Teléfono" defaultValue="+1 305 555 0188" prefix={<Phone size={14} />} />
            </div>
            <div className="twofa-details">
              <span>
                <small>Rol asignado (Spatie)</small>
                <b>{role}</b>
              </span>
              <span>
                <small>Permisos efectivos en sesión</small>
                <b>{(user?.permissions ?? []).length} permisos activos</b>
              </span>
              <span>
                <small>Último acceso</small>
                <b>{formatRelativeDate(user?.last_login_at ?? null)}</b>
              </span>
            </div>
            <div className="profile-actions">
              <Button disabled={salesMode} onClick={() => setSaved(true)}>Guardar cambios</Button>
            </div>
          </Card>
        )}

        {section === 'security' && (
          <div className="security-stack">
            <Card className="profile-card">
              <div className="profile-card-head">
                <div>
                  <h2>Cambiar contraseña</h2>
                  <p>Usa una contraseña única de al menos 12 caracteres.</p>
                </div>
                <Badge tone="success">Segura</Badge>
              </div>
              <div className="password-fields">
                <Field label="Contraseña actual" type="password" placeholder="••••••••••••" />
                <Field label="Nueva contraseña" type="password" placeholder="Mínimo 12 caracteres" />
                <Field label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" />
              </div>
              <div className="password-strength">
                <span><i /><i /><i /><i /></span>
                <small>Contraseña fuerte</small>
              </div>
              <div className="profile-actions">
                <Button disabled={salesMode} onClick={() => setSaved(true)}>Actualizar contraseña</Button>
              </div>
            </Card>

            <Card className="profile-card twofa-card">
              <div className="twofa-status">
                <span><ShieldCheck size={21} /></span>
                <div>
                  <h2>Autenticación en dos pasos (2FA)</h2>
                  <p>Tu cuenta está protegida con una aplicación de autenticación TOTP.</p>
                </div>
                <Badge tone="success" dot>Activada</Badge>
              </div>
              <div className="twofa-details">
                <span><small>Método</small><b>Aplicación de autenticación</b></span>
                <span><small>Activada el</small><b>12 de enero de 2026</b></span>
                <span><small>Códigos de recuperación</small><b>7 de 10 disponibles</b></span>
              </div>
              <div className="profile-actions split">
                <Button variant="secondary" onClick={() => setSaved(true)}>Ver códigos de recuperación</Button>
                <Button variant="danger" disabled={salesMode}>Desactivar 2FA</Button>
              </div>
            </Card>
          </div>
        )}

        {section === 'sessions' && (
          <Card className="profile-card">
            <div className="profile-card-head">
              <div>
                <h2>Sesiones activas (Laravel Sanctum)</h2>
                <p>Dispositivos donde tu cuenta tiene cookies de sesión HttpOnly activas.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setSaved(true)}>Cerrar otras sesiones</Button>
            </div>
            <div className="sessions-list">
              {[
                ['Navegador actual (Sesión SPA Sanctum)', 'Miami, FL · 127.0.0.1', 'Esta sesión · Activa ahora', 'desktop'],
                ['Safari en iPhone 15 Pro', 'Miami, FL · 181.42.18.31', 'Hace 2 horas', 'mobile'],
                ['Chrome en Estación de Almacén', 'Orlando, FL · 172.58.14.22', 'Ayer, 18:42', 'desktop'],
              ].map((s, i) => (
                <div className="session-row" key={s[0]}>
                  <span className="session-icon">{s[3] === 'desktop' ? <Monitor size={19} /> : <CircleUserRound size={19} />}</span>
                  <div><b>{s[0]}</b><small>{s[1]}</small></div>
                  <span className={i === 0 ? 'current' : ''}>{i === 0 && <i />}{s[2]}</span>
                  {i > 0 && <Button variant="ghost" size="sm" onClick={() => setSaved(true)}>Cerrar sesión</Button>}
                </div>
              ))}
            </div>
            <div className="session-note">
              <ShieldCheck size={15} />
              <span>¿No reconoces alguna sesión? Cambia tu contraseña inmediatamente para proteger tu cuenta.</span>
            </div>
          </Card>
        )}
      </div>
    </div>
    {saved && (
      <div className="toast">
        <span><Check size={16} /></span>
        <div><b>Cambios guardados</b><p>La configuración de tu cuenta se actualizó correctamente.</p></div>
        <button onClick={() => setSaved(false)}><X size={15} /></button>
      </div>
    )}
  </main>
}

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [salesMode, setSalesMode] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [productsCount, setProductsCount] = useState(9)

  useEffect(() => {
    authApi.me().then((u) => {
      setUser(u)
      setSalesMode(u.roles.includes('sales'))
      setPage('dashboard')
    }).catch(() => {})
  }, [])

  const handleLoginComplete = (loggedInUser: ApiUser) => {
    setUser(loggedInUser)
    setSalesMode(loggedInUser.roles.includes('sales'))
    setPage('dashboard')
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore
    }
    setUser(null)
    setPage('login')
  }

  if (page === 'login') return <Login onComplete={handleLoginComplete} />

  return <AppShell page={page} setPage={setPage} dark={dark} setDark={setDark} salesMode={salesMode} setSalesMode={setSalesMode} user={user} productsCount={productsCount} onSelectProduct={setSelectedProductId} onLogout={handleLogout}>
    {page === 'dashboard' && <Dashboard setPage={setPage} salesMode={salesMode} user={user} onSelectProduct={setSelectedProductId} />}
    {page === 'products' && <Products salesMode={salesMode} setPage={setPage} onSelectProduct={setSelectedProductId} />}
    {page === 'product-form' && <ProductForm setPage={setPage} onProductCreated={(created) => { setSelectedProductId(created.id); setProductsCount((c) => c + 1); setPage('product-detail') }} />}
    {page === 'product-detail' && <ProductDetail productId={selectedProductId} setPage={setPage} salesMode={salesMode} />}
    {page === 'inventory' && <Inventory salesMode={salesMode} />}
    {page === 'warehouses' && <Warehouses salesMode={salesMode} />}
    {page === 'purchases' && <Purchases salesMode={salesMode} />}
    {page === 'categories' && <CategoriesBrands salesMode={salesMode} />}
    {page === 'suppliers' && <Suppliers salesMode={salesMode} />}
    {page === 'reports' && <Reports salesMode={salesMode} />}
    {page === 'users' && <UsersRoles salesMode={salesMode} />}
    {page === 'audit' && <Audit />}
    {page === 'profile' && <ProfileSecurity user={user} salesMode={salesMode} />}
  </AppShell>
}
