import { useMemo, useState, type ReactNode } from 'react'
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
  KeyRound,
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

type Page = 'login' | 'dashboard' | 'products' | 'product-form' | 'product-detail' | 'inventory' | 'warehouses' | 'purchases' | 'categories' | 'suppliers' | 'reports' | 'users' | 'audit' | 'profile'
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const productImages = [
  'https://images.unsplash.com/photo-1654555023156-0a1c9cdf1130?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1729058048010-86f7d7c30001?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1615714901553-bfb2b5a27750?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1749545849681-37e7b302fdb6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=160&h=160',
]

const products = [
  { name: 'iPhone 15 Pro 256GB', sku: 'APL-IP15P-256-BLK', category: 'Celulares', brand: 'Apple', stock: 42, price: 1199, status: 'Activo', image: 0 },
  { name: 'Samsung Galaxy S24', sku: 'SAM-S24-256-GRY', category: 'Celulares', brand: 'Samsung', stock: 7, price: 899, status: 'Stock bajo', image: 1 },
  { name: 'MacBook Air M3 13"', sku: 'APL-MBA-M3-512-SLV', category: 'Laptops', brand: 'Apple', stock: 18, price: 1499, status: 'Activo', image: 0 },
  { name: 'Lenovo ThinkPad X1', sku: 'LEN-TPX1-I7-1TB', category: 'Laptops', brand: 'Lenovo', stock: 0, price: 1749, status: 'Agotado', image: 3 },
  { name: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5-BLK', category: 'Audífonos', brand: 'Sony', stock: 31, price: 399, status: 'Activo', image: 2 },
  { name: 'AirPods Pro 2ª gen.', sku: 'APL-APP2-USB-C-WHT', category: 'Audífonos', brand: 'Apple', stock: 5, price: 249, status: 'Stock bajo', image: 1 },
  { name: 'Cargador USB-C 65W', sku: 'ANK-CHG-65W-BLK', category: 'Cargadores', brand: 'Anker', stock: 86, price: 49, status: 'Activo', image: 3 },
  { name: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-GRY', category: 'Mouse', brand: 'Logitech', stock: 23, price: 99, status: 'Activo', image: 0 },
  { name: 'Keychron K2 Pro', sku: 'KEY-K2P-RGB-BRN', category: 'Teclados', brand: 'Keychron', stock: 4, price: 119, status: 'Stock bajo', image: 3 },
]

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

function Login({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')

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
          <div className="auth-heading"><span className="mobile-logo"><Logo /></span><Badge tone="info">Lara Workspace</Badge><h2>Bienvenido de nuevo</h2><p>Ingresa tus credenciales para acceder al panel.</p></div>
          <form onSubmit={(e) => { e.preventDefault(); setStep('2fa') }} className="auth-form">
            <Field label="Correo electrónico" placeholder="nombre@empresa.com" type="email" autoFocus />
            <Field label="Contraseña" placeholder="Ingresa tu contraseña" type={showPassword ? 'text' : 'password'} suffix={<button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar contraseña">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>} />
            <div className="form-between"><label className="check"><input type="checkbox" /> <span>Recordarme</span></label><button type="button" className="text-link">Olvidé mi contraseña</button></div>
            <Button type="submit" className="full">Continuar <ArrowRight size={16} /></Button>
          </form>
          <p className="auth-help"><HelpCircle size={14} /> ¿Necesitas ayuda? <b>Contacta a soporte</b></p>
        </> : <>
          <button className="back-link" onClick={() => setStep('credentials')}><ArrowLeft size={15} /> Volver</button>
          <div className="auth-heading two-fa"><span className="security-icon"><LockKeyhole size={24} /></span><h2>Verificación en dos pasos</h2><p>Ingresa el código de 6 dígitos generado por tu aplicación de autenticación.</p></div>
          <form onSubmit={(e) => { e.preventDefault(); onComplete() }} className="auth-form">
            <Field label="Código de verificación" placeholder="000000" value={code} onChange={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} autoFocus />
            <p className="code-hint">El código se actualiza cada 30 segundos.</p>
            <Button type="submit" className="full" disabled={code.length > 0 && code.length < 6}>Verificar y acceder</Button>
            <Button variant="secondary" className="full">Usar un código de recuperación</Button>
          </form>
        </>}
      </div>
      <p className="copyright">© 2025 Lara Inventory · Privacidad · Seguridad</p>
    </div>
  </main>
}

const nav = [
  { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
  { id: 'products', label: 'Productos', icon: Package, badge: '1,248' },
  { id: 'inventory', label: 'Movimientos', icon: RefreshCw },
  { id: 'warehouses', label: 'Almacenes', icon: Warehouse },
  { id: 'purchases', label: 'Compras', icon: Download },
]

function AppShell({ page, setPage, dark, setDark, salesMode, setSalesMode, children }: {
  page: Page; setPage: (p: Page) => void; dark: boolean; setDark: (v: boolean) => void; salesMode: boolean; setSalesMode: (v: boolean) => void; children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
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
        <button className="user-mini" onClick={() => setSalesMode(!salesMode)}>
          <span className="avatar">{salesMode ? 'ML' : 'AM'}</span><span className="user-copy"><b>{salesMode ? 'María López' : 'Ana Martínez'}</b><small>{salesMode ? 'Ventas · Solo lectura' : 'Super admin'}</small></span><MoreHorizontal size={17} />
        </button>
      </div>
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}><ChevronLeft size={15} /></button>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <Button variant="ghost" size="icon" className="mobile-menu" onClick={() => setMobileOpen(true)} icon={<Menu size={20} />} />
        <div className="global-search"><Search size={17} /><input aria-label="Búsqueda global" placeholder="Buscar productos, SKU, órdenes..." /><kbd><Command size={11} /> K</kbd></div>
        <div className="top-actions">
          <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} icon={dark ? <Sun size={18} /> : <Moon size={18} />} />
          <button className="notification" aria-label="Notificaciones"><Bell size={18} /><i /></button>
          <span className="top-divider" />
          <button className="profile-btn"><span className="avatar">{salesMode ? 'ML' : 'AM'}</span><span>{salesMode ? 'María López' : 'Ana Martínez'}</span><ChevronDown size={14} /></button>
        </div>
      </header>
      {salesMode && <div className="role-banner"><Eye size={15} /><span>Vista previa del rol <b>sales</b>: las acciones de edición están deshabilitadas.</span><button onClick={() => setSalesMode(false)}>Salir de vista previa</button></div>}
      {children}
    </div>
  </div>
}

function KpiCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: ReactNode; icon: ReactNode; tone: Tone }) {
  return <Card className="kpi"><div className={`kpi-icon kpi-${tone}`}>{icon}</div><div><span className="muted">{label}</span><strong>{value}</strong><small>{detail}</small></div></Card>
}

function Dashboard({ setPage, salesMode }: { setPage: (p: Page) => void; salesMode: boolean }) {
  const bars = [18, 24, 17, 29, 35, 23, 38, 31, 44, 37, 52, 47, 54, 43, 58, 61, 49, 67, 62, 70, 64, 75, 71, 82, 76, 84, 79, 87, 83, 91]
  return <main className="page">
    <div className="page-heading"><div><span className="eyebrow plain">MIÉRCOLES, 21 DE MAYO</span><h1>Buenos días, {salesMode ? 'María' : 'Ana'}</h1><p>Aquí tienes un resumen de lo que ocurre con tu inventario.</p></div><div className="heading-actions"><Button variant="secondary" icon={<Download size={16} />}>Exportar</Button><Button disabled={salesMode} icon={<Plus size={16} />}>Registrar movimiento</Button></div></div>
    <div className="kpi-grid">
      <KpiCard label="Valor total del inventario" value="$284,650" tone="info" icon={<Boxes size={20} />} detail={<><span className="up"><ArrowUpRight size={13} /> 8.4%</span> vs. mes anterior</>} />
      <KpiCard label="Productos activos" value="1,248" tone="success" icon={<Package size={20} />} detail={<><span className="up"><ArrowUpRight size={13} /> 24</span> nuevos este mes</>} />
      <KpiCard label="Stock bajo" value="18" tone="warning" icon={<AlertTriangle size={20} />} detail={<><span className="down"><ArrowDownRight size={13} /> 3</span> desde ayer</>} />
      <KpiCard label="Movimientos hoy" value="126" tone="neutral" icon={<RefreshCw size={20} />} detail={<>84 entradas · 42 salidas</>} />
    </div>
    <div className="dashboard-main-grid">
      <Card className="chart-card">
        <div className="card-head"><div><h2>Movimientos de stock</h2><p>Entradas y salidas durante los últimos 30 días</p></div><select aria-label="Periodo"><option>Últimos 30 días</option></select></div>
        <div className="chart-summary"><strong>3,842</strong><Badge tone="success"><ArrowUpRight size={12} /> 12.5%</Badge><span>movimientos totales</span></div>
        <div className="chart-area">
          <div className="axis"><span>900</span><span>600</span><span>300</span><span>0</span></div>
          <div className="bars">{bars.map((h, i) => <span key={i} style={{ height: `${h}%` }} className={i > 25 ? 'recent' : ''} />)}</div>
        </div>
        <div className="chart-labels"><span>22 Abr</span><span>29 Abr</span><span>6 May</span><span>13 May</span><span>21 May</span></div>
      </Card>
      <Card className="alerts-card">
        <div className="card-head"><div><h2>Alertas de stock</h2><p>Requieren tu atención</p></div><Badge tone="warning">18</Badge></div>
        <div className="alert-list">
          {products.filter(p => p.stock < 8).slice(0, 4).map((p) => <button key={p.sku} onClick={() => setPage('products')} className="alert-row">
            <img src={productImages[p.image]} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span><span className="stock-count"><b className={p.stock === 0 ? 'danger-text' : 'warning-text'}>{p.stock} uds.</b><small>Mín. {p.stock === 0 ? 8 : 10}</small></span>
          </button>)}
        </div>
        <button className="card-link" onClick={() => setPage('products')}>Ver todos los productos <ArrowRight size={14} /></button>
      </Card>
    </div>
    <Card className="activity-card">
      <div className="card-head"><div><h2>Actividad reciente</h2><p>Últimos movimientos registrados por el equipo</p></div><Button variant="ghost" size="sm">Ver historial</Button></div>
      <div className="activity-table">
        {[
          ['Entrada de stock', 'iPhone 15 Pro 256GB', '+24 uds.', 'Carlos Ruiz', 'Hace 12 min', 'success'],
          ['Salida por venta', 'Sony WH-1000XM5', '−3 uds.', 'María López', 'Hace 28 min', 'info'],
          ['Ajuste manual', 'Samsung Galaxy S24', '−2 uds.', 'Ana Martínez', 'Hace 1 h', 'warning'],
          ['Transferencia', 'MacBook Air M3 13"', '12 uds.', 'Diego Torres', 'Hace 2 h', 'neutral'],
        ].map((a) => <div className="activity-row" key={a[0] + a[1]}><Badge tone={a[5] as Tone} dot>{a[0]}</Badge><b>{a[1]}</b><strong className={a[2].startsWith('+') ? 'up' : ''}>{a[2]}</strong><span>{a[3]}</span><small>{a[4]}</small></div>)}
      </div>
    </Card>
  </main>
}

function Products({ salesMode, setPage }: { salesMode: boolean; setPage: (p: Page) => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [toast, setToast] = useState(false)
  const filtered = useMemo(() => products.filter(p => `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(query.toLowerCase())), [query])
  const toggle = (sku: string) => setSelected(s => s.includes(sku) ? s.filter(x => x !== sku) : [...s, sku])
  const toneFor = (status: string): Tone => status === 'Activo' ? 'success' : status === 'Agotado' ? 'danger' : 'warning'

  return <main className="page products-page">
    <div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Productos</b></div>
    <div className="page-heading compact"><div><h1>Productos</h1><p>Gestiona tu catálogo y controla el stock disponible.</p></div><Button disabled={salesMode} onClick={() => setPage('product-form')} icon={<Plus size={16} />}>Nuevo producto</Button></div>
    <div className="tabs"><button className="active">Todos <span>1,248</span></button><button>Activos <span>1,194</span></button><button>Stock bajo <span>18</span></button><button>Agotados <span>9</span></button><button>Archivados <span>27</span></button></div>
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
          <thead><tr><th><input type="checkbox" aria-label="Seleccionar todos" disabled={salesMode} checked={selected.length === filtered.length && filtered.length > 0} onChange={() => setSelected(selected.length === filtered.length ? [] : filtered.map(p => p.sku))} /></th><th>Producto <ChevronsUpDown size={12} /></th><th>Categoría</th><th>Marca</th><th>Stock <ChevronsUpDown size={12} /></th><th>Precio <ChevronsUpDown size={12} /></th><th>Estado</th><th /></tr></thead>
          <tbody>{filtered.map((p) => <tr key={p.sku}><td><input type="checkbox" aria-label={`Seleccionar ${p.name}`} checked={selected.includes(p.sku)} onChange={() => toggle(p.sku)} disabled={salesMode} /></td><td><button className="product-cell product-link" onClick={() => setPage('product-detail')}><img src={productImages[p.image]} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span></button></td><td>{p.category}</td><td>{p.brand}</td><td><div className="stock-cell"><b className={p.stock === 0 ? 'danger-text' : p.stock < 8 ? 'warning-text' : ''}>{p.stock}</b><span><i style={{ width: `${Math.min(p.stock * 2, 100)}%` }} className={p.stock === 0 ? 'danger' : p.stock < 8 ? 'warning' : ''} /></span></div></td><td><b>${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td><td><Badge tone={toneFor(p.status)} dot>{p.status}</Badge></td><td><Button variant="ghost" size="icon" disabled={salesMode} icon={<MoreHorizontal size={17} />} /></td></tr>)}</tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><span><Search size={23} /></span><h3>No encontramos productos</h3><p>Prueba con otro nombre, SKU o marca.</p><Button variant="secondary" onClick={() => setQuery('')}>Limpiar búsqueda</Button></div>}
      </div>
      <div className="pagination"><span>Mostrando <b>1–{filtered.length}</b> de <b>1,248</b> productos</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>125</button><button><ChevronRight size={15} /></button></div></div>
    </Card>
    {toast && <div className="toast"><span><Check size={16} /></span><div><b>Acción preparada</b><p>El formulario de producto estará disponible en la siguiente fase.</p></div><button onClick={() => setToast(false)}><X size={15} /></button></div>}
  </main>
}

type Variant = { id: number; sku: string; color: string; storage: string; price: string; cost: string; stock: number }

function FormSelect({ label, children, value }: { label: string; children: ReactNode; value?: string }) {
  return <label className="field"><span className="field-label">{label}</span><span className="select-wrap"><select defaultValue={value}>{children}</select><ChevronDown size={15} /></span></label>
}

function ProductForm({ setPage }: { setPage: (p: Page) => void }) {
  const [variants, setVariants] = useState<Variant[]>([
    { id: 1, sku: 'APL-IP15P-128-NT', color: 'Titanio natural', storage: '128 GB', price: '999.00', cost: '812.00', stock: 14 },
    { id: 2, sku: 'APL-IP15P-256-BLK', color: 'Titanio negro', storage: '256 GB', price: '1,199.00', cost: '965.00', stock: 18 },
    { id: 3, sku: 'APL-IP15P-512-BLU', color: 'Titanio azul', storage: '512 GB', price: '1,399.00', cost: '1,120.00', stock: 10 },
  ])
  const [saved, setSaved] = useState(false)
  const updateVariant = (id: number, key: keyof Variant, value: string) => setVariants(items => items.map(item => item.id === id ? { ...item, [key]: key === 'stock' ? Number(value) : value } : item))
  const addVariant = () => setVariants(items => [...items, { id: Date.now(), sku: '', color: '', storage: '', price: '', cost: '', stock: 0 }])

  return <main className="page editor-page">
    <div className="breadcrumb"><button onClick={() => setPage('products')}>Productos</button><ChevronRight size={13} /><b>Nuevo producto</b></div>
    <div className="page-heading editor-heading"><div><h1>Nuevo producto</h1><p>Completa la información del producto y configura sus variantes.</p></div><div className="heading-actions"><Button variant="secondary" onClick={() => setPage('products')}>Cancelar</Button><Button icon={<Save size={15} />} onClick={() => setSaved(true)}>Guardar producto</Button></div></div>
    <div className="editor-layout">
      <div className="editor-main">
        <Card className="form-card">
          <div className="section-heading"><span><Package size={17} /></span><div><h2>Información general</h2><p>Datos principales que identifican al producto.</p></div></div>
          <div className="form-grid">
            <div className="span-2"><Field label="Nombre del producto" defaultValue="iPhone 15 Pro" /></div>
            <Field label="SKU base" defaultValue="APL-IP15P" prefix={<Barcode size={15} />} />
            <Field label="Código de barras" placeholder="Ej. 0194253766420" />
            <div className="span-2 textarea-field"><label className="field-label">Descripción</label><textarea defaultValue="iPhone 15 Pro con diseño de titanio aeroespacial, chip A17 Pro y sistema de cámaras profesional." /><small>Describe las características más importantes del producto.</small></div>
          </div>
        </Card>
        <Card className="form-card">
          <div className="section-heading"><span><Camera size={17} /></span><div><h2>Imágenes</h2><p>Agrega hasta 8 imágenes. La primera será la portada.</p></div></div>
          <div className="image-editor">
            <div className="image-tile featured"><img src={productImages[1]} alt="iPhone 15 Pro" /><Badge tone="info">Portada</Badge><button><Trash2 size={14} /></button></div>
            <div className="image-tile"><img src={productImages[0]} alt="Vista adicional" /><button><Trash2 size={14} /></button></div>
            <button className="upload-tile"><UploadCloud size={22} /><b>Agregar imágenes</b><small>PNG, JPG o WebP · Máx. 5 MB</small></button>
          </div>
        </Card>
        <Card className="form-card variants-card">
          <div className="section-heading variants-title"><span><SlidersHorizontal size={17} /></span><div><h2>Variantes</h2><p>Configura combinaciones, precios, costos y stock inicial.</p></div><Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addVariant}>Agregar variante</Button></div>
          <div className="variant-scroll">
            <div className="variant-table variant-head"><span>SKU</span><span>Color</span><span>Almacenamiento</span><span>Precio</span><span>Costo</span><span>Stock inicial</span><span /></div>
            {variants.map((v, index) => <div className="variant-table variant-row" key={v.id}>
              <div className="variant-index"><span>{index + 1}</span><input value={v.sku} aria-label="SKU de variante" onChange={e => updateVariant(v.id, 'sku', e.target.value)} placeholder="SKU único" /></div>
              <input value={v.color} aria-label="Color" onChange={e => updateVariant(v.id, 'color', e.target.value)} placeholder="Color" />
              <select value={v.storage} aria-label="Almacenamiento" onChange={e => updateVariant(v.id, 'storage', e.target.value)}><option value="">Seleccionar</option><option>128 GB</option><option>256 GB</option><option>512 GB</option><option>1 TB</option></select>
              <div className="money-input"><span>$</span><input value={v.price} aria-label="Precio" onChange={e => updateVariant(v.id, 'price', e.target.value)} /></div>
              <div className="money-input"><span>$</span><input value={v.cost} aria-label="Costo" onChange={e => updateVariant(v.id, 'cost', e.target.value)} /></div>
              <input type="number" value={v.stock} aria-label="Stock inicial" onChange={e => updateVariant(v.id, 'stock', e.target.value)} />
              <Button variant="ghost" size="icon" disabled={variants.length === 1} onClick={() => setVariants(items => items.filter(item => item.id !== v.id))} icon={<Trash2 size={15} />} />
            </div>)}
          </div>
          <div className="variant-summary"><span>{variants.length} variantes</span><span>Stock inicial total <b>{variants.reduce((sum, item) => sum + item.stock, 0)} unidades</b></span><span>Margen promedio <b className="up">19.2%</b></span></div>
        </Card>
      </div>
      <aside className="editor-side">
        <Card className="form-card">
          <div className="side-card-title"><h2>Organización</h2><p>Clasifica y relaciona el producto.</p></div>
          <div className="side-fields">
            <FormSelect label="Categoría" value="Celulares"><option>Celulares</option><option>Laptops</option><option>Audífonos</option></FormSelect>
            <FormSelect label="Marca" value="Apple"><option>Apple</option><option>Samsung</option><option>Sony</option></FormSelect>
            <FormSelect label="Proveedor" value="TechDistribution LLC"><option>TechDistribution LLC</option><option>Global Devices Inc.</option></FormSelect>
          </div>
        </Card>
        <Card className="form-card">
          <div className="side-card-title"><h2>Estado del producto</h2></div>
          <FormSelect label="Visibilidad" value="Activo"><option>Activo</option><option>Borrador</option><option>Archivado</option></FormSelect>
          <div className="status-note"><Check size={15} /><span><b>Listo para publicar</b><small>El producto aparecerá en los reportes y movimientos.</small></span></div>
        </Card>
      </aside>
    </div>
    {saved && <div className="toast"><span><Check size={16} /></span><div><b>Producto guardado</b><p>iPhone 15 Pro y sus {variants.length} variantes se guardaron correctamente.</p></div><button onClick={() => setSaved(false)}><X size={15} /></button></div>}
  </main>
}

function ProductDetail({ setPage, salesMode }: { setPage: (p: Page) => void; salesMode: boolean }) {
  const [tab, setTab] = useState<'stock' | 'movements' | 'audit'>('stock')
  const warehouseStock = [
    ['Almacén Central', 'Miami, FL', 22, 6, 8, 8],
    ['Sucursal Norte', 'Orlando, FL', 12, 4, 5, 3],
    ['Fulfillment Center', 'Tampa, FL', 8, 4, 2, 2],
  ]
  return <main className="page detail-page">
    <div className="breadcrumb"><button onClick={() => setPage('products')}>Productos</button><ChevronRight size={13} /><b>iPhone 15 Pro</b></div>
    <div className="detail-hero">
      <div className="detail-product"><div className="detail-image"><img src={productImages[1]} alt="iPhone 15 Pro" /></div><div><div className="detail-title-line"><h1>iPhone 15 Pro</h1><Badge tone="success" dot>Activo</Badge></div><p>APL-IP15P · Apple · Celulares</p><div className="detail-meta"><span><Boxes size={14} /> 42 unidades</span><span><Barcode size={14} /> 3 variantes</span><span><TrendingUp size={14} /> $49,158 en inventario</span></div></div></div>
      <div className="heading-actions"><Button variant="secondary" icon={<Download size={15} />}>Exportar</Button><Button disabled={salesMode} icon={<Edit3 size={15} />} onClick={() => setPage('product-form')}>Editar producto</Button></div>
    </div>
    <div className="detail-stats">
      <Card><span>Precio desde</span><strong>$999.00</strong><small>Precio promedio $1,199.00</small></Card>
      <Card><span>Costo promedio</span><strong>$965.67</strong><small>Margen promedio <b className="up">19.2%</b></small></Card>
      <Card><span>Stock disponible</span><strong>42 <em>uds.</em></strong><small>8 reservadas · 34 disponibles</small></Card>
      <Card><span>Última actualización</span><strong className="date-value">Hoy, 10:42</strong><small>por Ana Martínez</small></Card>
    </div>
    <Card className="detail-card">
      <div className="detail-tabs"><button className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>Stock por almacén</button><button className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}>Historial de movimientos</button><button className={tab === 'audit' ? 'active' : ''} onClick={() => setTab('audit')}>Registro de auditoría</button></div>
      {tab === 'stock' && <>
        <div className="detail-section-head"><div><h2>Distribución de stock</h2><p>Existencias por ubicación y variante.</p></div><Button disabled={salesMode} size="sm" icon={<Plus size={14} />}>Registrar movimiento</Button></div>
        <div className="warehouse-scroll"><table className="warehouse-table"><thead><tr><th>Almacén</th><th>Stock total</th><th>Titanio natural · 128 GB</th><th>Titanio negro · 256 GB</th><th>Titanio azul · 512 GB</th></tr></thead><tbody>{warehouseStock.map(w => <tr key={w[0]}><td><div className="warehouse-cell"><span><Warehouse size={16} /></span><div><b>{w[0]}</b><small><MapPin size={10} /> {w[1]}</small></div></div></td><td><b>{w[2]} uds.</b></td><td>{w[3]} uds.</td><td>{w[4]} uds.</td><td>{w[5]} uds.</td></tr>)}</tbody><tfoot><tr><td>Total</td><td>42 uds.</td><td>14 uds.</td><td>15 uds.</td><td>13 uds.</td></tr></tfoot></table></div>
      </>}
      {tab === 'movements' && <div className="timeline-list">
        {[
          ['Entrada de stock', '+24 unidades', 'Recepción de orden de compra OC-2025-0184', 'Carlos Ruiz', 'Hoy, 09:48', 'success'],
          ['Salida por venta', '−3 unidades', 'Pedido mayorista #10482', 'María López', 'Ayer, 16:22', 'info'],
          ['Transferencia', '12 unidades', 'Central → Sucursal Norte', 'Diego Torres', '19 May, 11:06', 'neutral'],
        ].map(item => <div className="timeline-row" key={item[2]}><span className={`timeline-dot ${item[5]}`} /><div><Badge tone={item[5] as Tone}>{item[0]}</Badge><b>{item[2]}</b><small>{item[3]} · {item[4]}</small></div><strong className={item[1].startsWith('+') ? 'up' : ''}>{item[1]}</strong></div>)}
      </div>}
      {tab === 'audit' && <div className="timeline-list">
        {[
          ['Producto actualizado', 'Ana Martínez actualizó el precio de la variante APL-IP15P-256-BLK', 'Hoy, 10:42'],
          ['Variante creada', 'Carlos Ruiz agregó la variante Titanio azul · 512 GB', '18 May, 14:10'],
          ['Producto publicado', 'Ana Martínez cambió el estado de Borrador a Activo', '15 May, 09:02'],
        ].map(item => <div className="audit-row" key={item[1]}><span><ShieldCheck size={15} /></span><div><b>{item[0]}</b><p>{item[1]}</p></div><small>{item[2]}</small></div>)}
      </div>}
    </Card>
  </main>
}

const movementRows = [
  { id: 'MOV-4821', type: 'Entrada', product: 'iPhone 15 Pro 256GB', sku: 'APL-IP15P-256-BLK', qty: '+24', warehouse: 'Almacén Central', user: 'Carlos Ruiz', date: '21 May, 09:48', ref: 'OC-2025-0184' },
  { id: 'MOV-4820', type: 'Salida', product: 'Sony WH-1000XM5', sku: 'SNY-WH1000XM5-BLK', qty: '−3', warehouse: 'Sucursal Norte', user: 'María López', date: '21 May, 09:31', ref: 'PED-10482' },
  { id: 'MOV-4819', type: 'Ajuste', product: 'Samsung Galaxy S24', sku: 'SAM-S24-256-GRY', qty: '−2', warehouse: 'Almacén Central', user: 'Ana Martínez', date: '21 May, 08:55', ref: 'AJ-2025-091' },
  { id: 'MOV-4818', type: 'Transferencia', product: 'MacBook Air M3 13"', sku: 'APL-MBA-M3-512-SLV', qty: '12', warehouse: 'Central → Norte', user: 'Diego Torres', date: '20 May, 17:42', ref: 'TR-2025-044' },
  { id: 'MOV-4817', type: 'Devolución', product: 'AirPods Pro 2ª gen.', sku: 'APL-APP2-USB-C-WHT', qty: '+1', warehouse: 'Fulfillment Center', user: 'María López', date: '20 May, 16:18', ref: 'DEV-2038' },
  { id: 'MOV-4816', type: 'Entrada', product: 'Logitech MX Master 3S', sku: 'LOG-MXM3S-GRY', qty: '+36', warehouse: 'Almacén Central', user: 'Carlos Ruiz', date: '20 May, 14:03', ref: 'OC-2025-0181' },
]

function MovementBadge({ type }: { type: string }) {
  const tone: Tone = type === 'Entrada' || type === 'Devolución' ? 'success' : type === 'Salida' ? 'info' : type === 'Ajuste' ? 'warning' : 'neutral'
  const Icon = type === 'Entrada' ? Download : type === 'Salida' ? ArrowUpRight : type === 'Transferencia' ? ArrowRightLeft : type === 'Devolución' ? RotateCcw : SlidersHorizontal
  return <Badge tone={tone}><Icon size={11} />{type}</Badge>
}

function Modal({ title, subtitle, children, onClose, footer }: { title: string; subtitle: string; children: ReactNode; onClose: () => void; footer: ReactNode }) {
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}><button className="modal-backdrop" onClick={onClose} aria-label="Cerrar modal" /><div className="modal-card"><div className="modal-head"><div><h2>{title}</h2><p>{subtitle}</p></div><Button variant="ghost" size="icon" onClick={onClose} icon={<X size={18} />} /></div><div className="modal-body">{children}</div><div className="modal-footer">{footer}</div></div></div>
}

function Inventory({ salesMode }: { salesMode: boolean }) {
  const [modal, setModal] = useState(false)
  const [movementType, setMovementType] = useState('Entrada')
  const [confirmed, setConfirmed] = useState(false)
  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Movimientos</b></div><h1>Movimientos de inventario</h1><p>Consulta y registra todas las entradas, salidas y ajustes de stock.</p></div><Button disabled={salesMode} onClick={() => setModal(true)} icon={<Plus size={16} />}>Registrar movimiento</Button></div>
    <div className="ops-kpis">
      <Card><span className="ops-icon success"><Download size={17} /></span><div><small>Entradas hoy</small><b>84</b><em>+1,248 unidades</em></div></Card>
      <Card><span className="ops-icon info"><ArrowUpRight size={17} /></span><div><small>Salidas hoy</small><b>42</b><em>−386 unidades</em></div></Card>
      <Card><span className="ops-icon warning"><SlidersHorizontal size={17} /></span><div><small>Ajustes este mes</small><b>18</b><em>Requieren auditoría</em></div></Card>
      <Card><span className="ops-icon neutral"><ArrowRightLeft size={17} /></span><div><small>Transferencias</small><b>12</b><em>3 en tránsito</em></div></Card>
    </div>
    <Card className="ops-table-card">
      <div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar por producto, SKU o referencia..." /></div><div className="filters"><button><CalendarDays size={15} /> 15 May – 21 May <ChevronDown size={13} /></button><button>Tipo <ChevronDown size={13} /></button><button>Almacén <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div>
      <div className="table-scroll"><table className="movement-table"><thead><tr><th>Movimiento</th><th>Producto</th><th>Cantidad</th><th>Almacén / destino</th><th>Responsable</th><th>Fecha</th><th>Referencia</th><th /></tr></thead><tbody>
        {movementRows.map(row => <tr key={row.id}><td><div className="movement-id"><b>{row.id}</b><MovementBadge type={row.type} /></div></td><td><div className="product-cell compact-product"><span><b>{row.product}</b><small>{row.sku}</small></span></div></td><td><strong className={row.qty.startsWith('+') ? 'up' : row.qty.startsWith('−') ? 'danger-text' : ''}>{row.qty} uds.</strong></td><td>{row.warehouse}</td><td><div className="person-cell"><span>{row.user.split(' ').map(n => n[0]).join('')}</span>{row.user}</div></td><td>{row.date}</td><td><b>{row.ref}</b></td><td><Button variant="ghost" size="icon" icon={<MoreHorizontal size={16} />} /></td></tr>)}
      </tbody></table></div>
      <div className="pagination"><span>Mostrando <b>1–6</b> de <b>482</b> movimientos</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>81</button><button><ChevronRight size={15} /></button></div></div>
    </Card>
    {modal && <Modal title="Registrar movimiento" subtitle="Actualiza el stock de un producto de forma manual." onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button onClick={() => { setModal(false); setConfirmed(true) }}>Confirmar movimiento</Button></>}>
      <div className="movement-type-grid">{['Entrada', 'Salida', 'Ajuste', 'Devolución', 'Transferencia'].map(type => <button className={movementType === type ? 'active' : ''} onClick={() => setMovementType(type)} key={type}><MovementBadge type={type} /></button>)}</div>
      <div className="modal-form-grid"><FormSelect label="Producto"><option>iPhone 15 Pro 256GB · APL-IP15P-256-BLK</option><option>Samsung Galaxy S24</option></FormSelect><FormSelect label="Almacén"><option>Almacén Central</option><option>Sucursal Norte</option></FormSelect><Field label="Cantidad" type="number" defaultValue="1" /><Field label="Referencia" placeholder="Ej. FACT-2048" /></div>
      <label className="field modal-notes"><span className="field-label">Motivo o notas</span><textarea placeholder="Describe el motivo del movimiento..." /></label>
      {(movementType === 'Ajuste' || movementType === 'Salida') && <div className="password-confirm"><LockKeyhole size={17} /><div><b>Confirmación de seguridad</b><p>Ingresa tu contraseña para autorizar este movimiento.</p><Field type="password" placeholder="Tu contraseña" /></div></div>}
    </Modal>}
    {confirmed && <div className="toast"><span><Check size={16} /></span><div><b>Movimiento registrado</b><p>El stock se actualizó correctamente en Almacén Central.</p></div><button onClick={() => setConfirmed(false)}><X size={15} /></button></div>}
  </main>
}

const warehouseRows = [
  { name: 'Almacén Central', code: 'ALM-MIA-01', city: 'Miami, FL', products: 824, units: 6842, value: '$184,320', status: 'Operativo', manager: 'Carlos Ruiz' },
  { name: 'Sucursal Norte', code: 'ALM-ORL-02', city: 'Orlando, FL', products: 516, units: 2954, value: '$72,480', status: 'Operativo', manager: 'Diego Torres' },
  { name: 'Fulfillment Center', code: 'ALM-TPA-03', city: 'Tampa, FL', products: 438, units: 1860, value: '$27,850', status: 'Operativo', manager: 'Laura Méndez' },
  { name: 'Depósito secundario', code: 'ALM-MIA-04', city: 'Miami, FL', products: 112, units: 384, value: '$9,640', status: 'Mantenimiento', manager: 'Carlos Ruiz' },
]

function Warehouses({ salesMode }: { salesMode: boolean }) {
  const [detail, setDetail] = useState(false)
  if (detail) return <main className="page warehouse-detail">
    <div className="breadcrumb"><button onClick={() => setDetail(false)}>Almacenes</button><ChevronRight size={13} /><b>Almacén Central</b></div>
    <div className="detail-hero warehouse-hero"><div className="detail-product"><span className="warehouse-hero-icon"><Warehouse size={25} /></span><div><div className="detail-title-line"><h1>Almacén Central</h1><Badge tone="success" dot>Operativo</Badge></div><p>ALM-MIA-01 · Centro principal de distribución</p><div className="detail-meta"><span><MapPin size={14} /> 1840 NW 72nd Ave, Miami, FL</span><span><Users size={14} /> Carlos Ruiz</span></div></div></div><div className="heading-actions"><Button variant="secondary" disabled={salesMode}>Editar almacén</Button><Button disabled={salesMode} icon={<ArrowRightLeft size={15} />}>Nueva transferencia</Button></div></div>
    <div className="detail-stats warehouse-stats"><Card><span>Productos distintos</span><strong>824</strong><small>66% del catálogo</small></Card><Card><span>Unidades totales</span><strong>6,842</strong><small>128 reservadas</small></Card><Card><span>Valor almacenado</span><strong>$184,320</strong><small className="up">+4.8% este mes</small></Card><Card><span>Capacidad utilizada</span><strong>78%</strong><div className="capacity-bar"><i /></div></Card></div>
    <Card className="ops-table-card">
      <div className="table-toolbar ops-toolbar"><div><h2>Stock por producto</h2><p>Inventario disponible en esta ubicación.</p></div><div className="product-search"><Search size={16} /><input placeholder="Buscar producto o SKU..." /></div><div className="filters"><button>Categoría <ChevronDown size={13} /></button><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div>
      <div className="table-scroll"><table className="warehouse-stock-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Disponible</th><th>Reservado</th><th>En tránsito</th><th>Valor</th><th>Estado</th></tr></thead><tbody>{products.slice(0, 6).map(p => <tr key={p.sku}><td><div className="product-cell"><img src={productImages[p.image]} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span></div></td><td>{p.category}</td><td><b>{Math.max(p.stock - 3, 0)} uds.</b></td><td>{p.stock ? 3 : 0} uds.</td><td>{p.stock < 8 ? 12 : 0} uds.</td><td><b>${(p.price * p.stock).toLocaleString()}</b></td><td><Badge tone={p.stock < 8 ? 'warning' : 'success'} dot>{p.stock < 8 ? 'Stock bajo' : 'Saludable'}</Badge></td></tr>)}</tbody></table></div>
    </Card>
  </main>
  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Inventario</span><ChevronRight size={13} /><b>Almacenes</b></div><h1>Almacenes</h1><p>Administra ubicaciones, capacidad y distribución del inventario.</p></div><Button disabled={salesMode} icon={<Plus size={16} />}>Nuevo almacén</Button></div>
    <div className="warehouse-overview"><Card><div><span className="ops-icon info"><Building2 size={19} /></span><div><small>Ubicaciones activas</small><strong>4</strong></div></div><div className="warehouse-spark">{[35,48,42,58,64,61,76].map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div></Card><Card><div><span className="ops-icon success"><Boxes size={19} /></span><div><small>Unidades almacenadas</small><strong>12,040</strong></div></div><Badge tone="success"><ArrowUpRight size={11} /> 6.2%</Badge></Card><Card><div><span className="ops-icon warning"><AlertTriangle size={19} /></span><div><small>Capacidad promedio</small><strong>72%</strong></div></div><Badge tone="warning">1 almacén &gt; 85%</Badge></Card></div>
    <Card className="ops-table-card">
      <div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar almacén o ciudad..." /></div><div className="filters"><button>Estado <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div>
      <div className="table-scroll"><table className="warehouse-list-table"><thead><tr><th>Almacén</th><th>Responsable</th><th>Productos</th><th>Unidades</th><th>Valor inventario</th><th>Estado</th><th /></tr></thead><tbody>{warehouseRows.map((w, i) => <tr key={w.code}><td><button className="warehouse-link" onClick={() => setDetail(true)}><span><Warehouse size={18} /></span><div><b>{w.name}</b><small><MapPin size={10} /> {w.city} · {w.code}</small></div></button></td><td><div className="person-cell"><span>{w.manager.split(' ').map(n=>n[0]).join('')}</span>{w.manager}</div></td><td><b>{w.products}</b></td><td>{w.units.toLocaleString()}</td><td><b>{w.value}</b></td><td><Badge tone={i === 3 ? 'warning' : 'success'} dot>{w.status}</Badge></td><td><Button variant="ghost" size="icon" icon={<ChevronRight size={16} />} onClick={() => setDetail(true)} /></td></tr>)}</tbody></table></div>
    </Card>
  </main>
}

const orders = [
  { id: 'OC-2025-0184', supplier: 'TechDistribution LLC', items: 5, total: '$28,460.00', created: '18 May 2025', delivery: '24 May 2025', status: 'Enviada' },
  { id: 'OC-2025-0183', supplier: 'Apple Authorized Dist.', items: 3, total: '$42,180.00', created: '16 May 2025', delivery: '22 May 2025', status: 'Recibida parcial' },
  { id: 'OC-2025-0182', supplier: 'Global Devices Inc.', items: 8, total: '$16,840.00', created: '14 May 2025', delivery: '20 May 2025', status: 'Recibida' },
  { id: 'OC-2025-0181', supplier: 'Logi Supply Co.', items: 2, total: '$8,720.00', created: '12 May 2025', delivery: '19 May 2025', status: 'Recibida' },
  { id: 'OC-2025-0180', supplier: 'Samsung Business', items: 4, total: '$31,240.00', created: '10 May 2025', delivery: '26 May 2025', status: 'Borrador' },
  { id: 'OC-2025-0179', supplier: 'Audio Wholesale Corp.', items: 6, total: '$12,950.00', created: '8 May 2025', delivery: '18 May 2025', status: 'Cancelada' },
]

function OrderStatus({ status }: { status: string }) {
  const tone: Tone = status === 'Recibida' ? 'success' : status === 'Cancelada' ? 'danger' : status === 'Borrador' ? 'neutral' : status === 'Recibida parcial' ? 'warning' : 'info'
  return <Badge tone={tone} dot>{status}</Badge>
}

function Purchases({ salesMode }: { salesMode: boolean }) {
  const [detail, setDetail] = useState(false)
  const [receive, setReceive] = useState(false)
  const [done, setDone] = useState(false)
  const items = [
    ['iPhone 15 Pro 256GB', 'APL-IP15P-256-BLK', 24, 18, '$965.00', '$23,160.00'],
    ['AirPods Pro 2ª gen.', 'APL-APP2-USB-C-WHT', 20, 20, '$182.00', '$3,640.00'],
    ['Cargador USB-C 65W', 'ANK-CHG-65W-BLK', 40, 0, '$41.50', '$1,660.00'],
  ]
  if (detail) return <main className="page purchase-detail">
    <div className="breadcrumb"><button onClick={() => setDetail(false)}>Compras</button><ChevronRight size={13} /><b>OC-2025-0184</b></div>
    <div className="page-heading compact purchase-heading"><div><div className="detail-title-line"><h1>Orden OC-2025-0184</h1><OrderStatus status="Recibida parcial" /></div><p>Creada el 18 de mayo de 2025 por Ana Martínez</p></div><div className="heading-actions"><Button variant="secondary" icon={<FileText size={15} />}>Descargar PDF</Button><Button disabled={salesMode} onClick={() => setReceive(true)} icon={<PackageCheck size={16} />}>Recibir mercancía</Button></div></div>
    <div className="purchase-layout"><div className="purchase-main">
      <Card className="order-progress"><div className="progress-step complete"><span><Check size={14} /></span><div><b>Borrador</b><small>18 May · 09:10</small></div></div><i /><div className="progress-step complete"><span><Check size={14} /></span><div><b>Enviada</b><small>18 May · 11:24</small></div></div><i /><div className="progress-step active"><span><Truck size={14} /></span><div><b>Recepción parcial</b><small>21 May · 09:48</small></div></div><i /><div className="progress-step"><span><PackageCheck size={14} /></span><div><b>Recibida</b><small>Pendiente</small></div></div></Card>
      <Card className="order-items-card"><div className="detail-section-head"><div><h2>Productos de la orden</h2><p>3 productos · 84 unidades solicitadas</p></div></div><div className="table-scroll"><table className="order-line-table"><thead><tr><th>Producto</th><th>Solicitado</th><th>Recibido</th><th>Pendiente</th><th>Costo unitario</th><th>Subtotal</th></tr></thead><tbody>{items.map((item, i) => <tr key={item[1] as string}><td><div className="product-cell"><img src={productImages[i]} alt="" /><span><b>{item[0]}</b><small>{item[1]}</small></span></div></td><td>{item[2]} uds.</td><td><b className={item[3] ? 'up' : ''}>{item[3]} uds.</b></td><td><Badge tone={Number(item[2])-Number(item[3]) > 0 ? 'warning' : 'success'}>{Number(item[2])-Number(item[3])} uds.</Badge></td><td>{item[4]}</td><td><b>{item[5]}</b></td></tr>)}</tbody></table></div><div className="order-total"><span>Subtotal <b>$28,460.00</b></span><span>Impuestos <b>$0.00</b></span><span className="grand-total">Total <b>$28,460.00</b></span></div></Card>
      <Card className="order-notes"><h2>Notas de la orden</h2><p>Entrega prioritaria. Verificar números de serie y condición del empaque al recibir.</p></Card>
    </div><aside className="purchase-side"><Card className="form-card"><div className="side-card-title"><h2>Proveedor</h2></div><div className="supplier-card"><span>TD</span><div><b>TechDistribution LLC</b><small>ventas@techdistribution.com</small><small>+1 (305) 555-0184</small></div></div><button className="card-link">Ver proveedor <ArrowRight size={14} /></button></Card><Card className="form-card"><div className="side-card-title"><h2>Información de entrega</h2></div><div className="order-info-list"><span><small>Almacén de destino</small><b>Almacén Central</b></span><span><small>Entrega estimada</small><b>24 May 2025</b></span><span><small>Condición de pago</small><b>NET 30</b></span></div></Card></aside></div>
    {receive && <Modal title="Recibir mercancía" subtitle="Registra las cantidades recibidas para OC-2025-0184." onClose={() => setReceive(false)} footer={<><Button variant="secondary" onClick={() => setReceive(false)}>Cancelar</Button><Button icon={<PackageCheck size={15} />} onClick={() => { setReceive(false); setDone(true) }}>Confirmar recepción</Button></>}>
      <div className="receive-destination"><Warehouse size={16} /><div><small>Almacén de destino</small><b>Almacén Central · ALM-MIA-01</b></div></div>
      <div className="receive-list">{items.filter(item => Number(item[2])-Number(item[3]) > 0).map((item, i) => <div className="receive-row" key={item[1] as string}><img src={productImages[i]} alt="" /><div><b>{item[0]}</b><small>{item[1]} · Pendiente: {Number(item[2])-Number(item[3])}</small></div><label><span>Recibido</span><input type="number" defaultValue={Number(item[2])-Number(item[3])} /></label></div>)}</div>
      <label className="field modal-notes"><span className="field-label">Notas de recepción</span><textarea placeholder="Condición, incidencias o números de lote..." /></label>
    </Modal>}
    {done && <div className="toast"><span><Check size={16} /></span><div><b>Recepción registrada</b><p>El stock del Almacén Central fue actualizado.</p></div><button onClick={() => setDone(false)}><X size={15} /></button></div>}
  </main>
  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Compras</span><ChevronRight size={13} /><b>Órdenes</b></div><h1>Compras a proveedores</h1><p>Gestiona órdenes de compra y recepción de mercancía.</p></div><Button disabled={salesMode} icon={<Plus size={16} />}>Nueva orden</Button></div>
    <div className="ops-kpis purchase-kpis"><Card><span className="ops-icon neutral"><FileText size={17} /></span><div><small>Borradores</small><b>4</b><em>$18,420 pendientes</em></div></Card><Card><span className="ops-icon info"><Truck size={17} /></span><div><small>En tránsito</small><b>7</b><em>$84,360 en órdenes</em></div></Card><Card><span className="ops-icon warning"><PackageCheck size={17} /></span><div><small>Recepción parcial</small><b>3</b><em>42 unidades pendientes</em></div></Card><Card><span className="ops-icon success"><ShoppingCart size={17} /></span><div><small>Compras este mes</small><b>$146,820</b><em className="up">+12.4% vs. abril</em></div></Card></div>
    <div className="tabs"><button className="active">Todas <span>184</span></button><button>Borradores <span>4</span></button><button>Enviadas <span>7</span></button><button>Recibidas parciales <span>3</span></button><button>Recibidas <span>164</span></button><button>Canceladas <span>6</span></button></div>
    <Card className="ops-table-card"><div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar orden o proveedor..." /></div><div className="filters"><button><CalendarDays size={15} /> Fecha <ChevronDown size={13} /></button><button>Proveedor <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div><div className="table-scroll"><table className="orders-table"><thead><tr><th>Orden</th><th>Proveedor</th><th>Artículos</th><th>Total</th><th>Creada</th><th>Entrega estimada</th><th>Estado</th><th /></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><button className="order-link" onClick={() => setDetail(true)}>{order.id}</button></td><td><div className="supplier-cell"><span>{order.supplier.split(' ').map(n=>n[0]).join('').slice(0,2)}</span><b>{order.supplier}</b></div></td><td>{order.items} productos</td><td><b>{order.total}</b></td><td>{order.created}</td><td>{order.delivery}</td><td><OrderStatus status={order.status} /></td><td><Button variant="ghost" size="icon" icon={<ChevronRight size={16} />} onClick={() => setDetail(true)} /></td></tr>)}</tbody></table></div><div className="pagination"><span>Mostrando <b>1–6</b> de <b>184</b> órdenes</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>31</button><button><ChevronRight size={15} /></button></div></div></Card>
  </main>
}

type CategoryNode = { id: number; name: string; count: number; children?: CategoryNode[] }

const initialCategories: CategoryNode[] = [
  { id: 1, name: 'Celulares y tablets', count: 286, children: [{ id: 11, name: 'Smartphones', count: 214 }, { id: 12, name: 'Tablets', count: 48 }, { id: 13, name: 'Accesorios móviles', count: 24 }] },
  { id: 2, name: 'Computación', count: 342, children: [{ id: 21, name: 'Laptops', count: 126 }, { id: 22, name: 'Monitores', count: 84 }, { id: 23, name: 'Componentes', count: 132 }] },
  { id: 3, name: 'Audio', count: 198, children: [{ id: 31, name: 'Audífonos', count: 119 }, { id: 32, name: 'Bocinas', count: 52 }, { id: 33, name: 'Micrófonos', count: 27 }] },
  { id: 4, name: 'Periféricos', count: 246, children: [{ id: 41, name: 'Mouse', count: 88 }, { id: 42, name: 'Teclados', count: 92 }, { id: 43, name: 'Webcams', count: 66 }] },
  { id: 5, name: 'Cables y energía', count: 176, children: [{ id: 51, name: 'Cargadores', count: 96 }, { id: 52, name: 'Cables', count: 80 }] },
]

const brandRows = [
  ['Apple', 'APL', 248, 'apple.com', 'Activa'],
  ['Samsung', 'SAM', 186, 'samsung.com', 'Activa'],
  ['Sony', 'SNY', 112, 'sony.com', 'Activa'],
  ['Logitech', 'LOG', 94, 'logitech.com', 'Activa'],
  ['Lenovo', 'LEN', 82, 'lenovo.com', 'Activa'],
  ['Anker', 'ANK', 76, 'anker.com', 'Activa'],
  ['Keychron', 'KEY', 42, 'keychron.com', 'Activa'],
]

function CategoriesBrands({ salesMode }: { salesMode: boolean }) {
  const [section, setSection] = useState<'categories' | 'brands'>('categories')
  const [categories, setCategories] = useState(initialCategories)
  const [expanded, setExpanded] = useState<number[]>([1, 2, 3, 4, 5])
  const [modal, setModal] = useState<'category' | 'brand' | null>(null)
  const [saved, setSaved] = useState(false)
  const [dragged, setDragged] = useState<number | null>(null)
  const dropCategory = (targetId: number) => {
    if (!dragged || dragged === targetId) return
    setCategories(items => {
      const from = items.findIndex(item => item.id === dragged)
      const to = items.findIndex(item => item.id === targetId)
      const next = [...items]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
    setDragged(null)
  }
  return <main className="page management-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Categorías y marcas</b></div><h1>Categorías y marcas</h1><p>Organiza el catálogo y administra sus fabricantes.</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={() => setModal(section === 'categories' ? 'category' : 'brand')}>{section === 'categories' ? 'Nueva categoría' : 'Nueva marca'}</Button></div>
    <div className="management-tabs"><button className={section === 'categories' ? 'active' : ''} onClick={() => setSection('categories')}><GitBranch size={16} /> Categorías <span>18</span></button><button className={section === 'brands' ? 'active' : ''} onClick={() => setSection('brands')}><Tags size={16} /> Marcas <span>42</span></button></div>
    {section === 'categories' ? <div className="category-layout">
      <Card className="category-tree-card">
        <div className="management-card-head"><div><h2>Árbol de categorías</h2><p>Arrastra las categorías para reordenarlas.</p></div><Badge tone="neutral">18 categorías</Badge></div>
        <div className="tree-list">{categories.map(category => <div className={`tree-group ${dragged === category.id ? 'dragging' : ''}`} key={category.id} draggable={!salesMode} onDragStart={() => setDragged(category.id)} onDragOver={e => e.preventDefault()} onDrop={() => dropCategory(category.id)}>
          <div className="tree-row root"><GripVertical size={15} /><button className="tree-toggle" onClick={() => setExpanded(ids => ids.includes(category.id) ? ids.filter(id => id !== category.id) : [...ids, category.id])}><ChevronRight size={14} className={expanded.includes(category.id) ? 'open' : ''} /></button><span className="tree-icon"><Package size={15} /></span><b>{category.name}</b><Badge tone="neutral">{category.count} productos</Badge><div className="tree-actions"><Button variant="ghost" size="icon" disabled={salesMode} icon={<Plus size={14} />} /><Button variant="ghost" size="icon" disabled={salesMode} icon={<Edit3 size={14} />} /><Button variant="ghost" size="icon" icon={<MoreHorizontal size={15} />} /></div>
          </div>
          {expanded.includes(category.id) && <div className="tree-children">{category.children?.map(child => <div className="tree-row" key={child.id}><GripVertical size={14} /><span className="tree-branch" /><span className="tree-icon child"><Tags size={13} /></span><b>{child.name}</b><span className="tree-count">{child.count} productos</span><div className="tree-actions"><Button variant="ghost" size="icon" disabled={salesMode} icon={<Edit3 size={14} />} /><Button variant="ghost" size="icon" icon={<MoreHorizontal size={15} />} /></div></div>)}</div>}
        </div>)}</div>
      </Card>
      <aside className="category-side">
        <Card className="form-card category-summary"><div className="side-card-title"><h2>Resumen del catálogo</h2></div><div className="summary-list"><span><i className="summary-dot primary" /><small>Categorías principales</small><b>5</b></span><span><i className="summary-dot success" /><small>Subcategorías</small><b>13</b></span><span><i className="summary-dot warning" /><small>Sin productos</small><b>2</b></span><span><i className="summary-dot danger" /><small>Sin categoría</small><b>7</b></span></div></Card>
        <Card className="category-tip"><span><GripVertical size={16} /></span><div><b>Organización por arrastre</b><p>Mueve categorías principales para cambiar su orden de aparición. En modo sales esta acción está bloqueada.</p></div></Card>
      </aside>
    </div> : <Card className="ops-table-card">
      <div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar marca..." /></div><div className="filters"><button>Estado <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div>
      <div className="table-scroll"><table className="brands-table"><thead><tr><th>Marca</th><th>Código</th><th>Productos</th><th>Sitio web</th><th>Estado</th><th>Última actualización</th><th /></tr></thead><tbody>{brandRows.map((brand, i) => <tr key={brand[0] as string}><td><div className="brand-cell"><span>{String(brand[0]).slice(0,1)}</span><b>{brand[0]}</b></div></td><td><code>{brand[1]}</code></td><td><b>{brand[2]}</b> productos</td><td><span className="website-cell"><Globe size={13} /> {brand[3]}</span></td><td><Badge tone="success" dot>{brand[4]}</Badge></td><td>{i < 2 ? 'Hoy' : `${i + 1} May 2025`}</td><td><Button variant="ghost" size="icon" icon={<MoreHorizontal size={16} />} /></td></tr>)}</tbody></table></div>
      <div className="pagination"><span>Mostrando <b>1–7</b> de <b>42</b> marcas</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button>2</button><button>3</button><button><ChevronRight size={15} /></button></div></div>
    </Card>}
    {modal && <Modal title={modal === 'category' ? 'Nueva categoría' : 'Nueva marca'} subtitle={modal === 'category' ? 'Agrega una nueva clasificación al catálogo.' : 'Registra un fabricante para asociarlo a productos.'} onClose={() => setModal(null)} footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={() => { setModal(null); setSaved(true) }}>Guardar {modal === 'category' ? 'categoría' : 'marca'}</Button></>}>
      {modal === 'category' ? <div className="modal-form-stack"><Field label="Nombre de la categoría" placeholder="Ej. Consolas y videojuegos" /><FormSelect label="Categoría padre"><option>Ninguna · Categoría principal</option><option>Computación</option><option>Accesorios</option></FormSelect><label className="field modal-notes"><span className="field-label">Descripción</span><textarea placeholder="Descripción interna opcional..." /></label><label className="switch-row"><span><b>Categoría activa</b><small>Disponible para asignar a productos.</small></span><input type="checkbox" defaultChecked /></label></div> : <div className="modal-form-stack"><div className="brand-upload"><span>A</span><button><UploadCloud size={14} /> Subir logotipo</button><small>PNG o SVG, fondo transparente</small></div><div className="modal-form-grid"><Field label="Nombre de la marca" placeholder="Ej. ASUS" /><Field label="Código" placeholder="Ej. ASUS" /></div><Field label="Sitio web" placeholder="https://..." prefix={<Globe size={14} />} /><label className="switch-row"><span><b>Marca activa</b><small>Visible para asignar a productos.</small></span><input type="checkbox" defaultChecked /></label></div>}
    </Modal>}
    {saved && <div className="toast"><span><Check size={16} /></span><div><b>Registro guardado</b><p>Los cambios se aplicaron correctamente al catálogo.</p></div><button onClick={() => setSaved(false)}><X size={15} /></button></div>}
  </main>
}

const supplierRows = [
  { name: 'TechDistribution LLC', code: 'PRV-0018', contact: 'Robert Chen', email: 'robert@techdistribution.com', phone: '+1 305 555 0184', products: 184, orders: 12, total: '$86,420', status: 'Activo', initials: 'TD' },
  { name: 'Apple Authorized Dist.', code: 'PRV-0004', contact: 'Sofia Williams', email: 'sofia@appledist.com', phone: '+1 407 555 0122', products: 96, orders: 8, total: '$124,800', status: 'Activo', initials: 'AA' },
  { name: 'Global Devices Inc.', code: 'PRV-0011', contact: 'Marco Bellini', email: 'marco@globaldevices.com', phone: '+1 813 555 0169', products: 142, orders: 6, total: '$48,760', status: 'Activo', initials: 'GD' },
  { name: 'Logi Supply Co.', code: 'PRV-0022', contact: 'Emma Novak', email: 'emma@logisupply.com', phone: '+1 305 555 0143', products: 68, orders: 5, total: '$24,380', status: 'Activo', initials: 'LS' },
  { name: 'Samsung Business', code: 'PRV-0008', contact: 'Daniel Kim', email: 'daniel@samsungbusiness.com', phone: '+1 786 555 0191', products: 112, orders: 9, total: '$72,190', status: 'Activo', initials: 'SB' },
  { name: 'Audio Wholesale Corp.', code: 'PRV-0026', contact: 'Laura Stein', email: 'laura@audiowholesale.com', phone: '+1 954 555 0118', products: 54, orders: 3, total: '$12,950', status: 'Inactivo', initials: 'AW' },
]

function Suppliers({ salesMode }: { salesMode: boolean }) {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list')
  const [saved, setSaved] = useState(false)
  if (view === 'form') return <main className="page supplier-form-page">
    <div className="breadcrumb"><button onClick={() => setView('list')}>Proveedores</button><ChevronRight size={13} /><b>Nuevo proveedor</b></div>
    <div className="page-heading editor-heading"><div><h1>Nuevo proveedor</h1><p>Registra información comercial, fiscal y condiciones de compra.</p></div><div className="heading-actions"><Button variant="secondary" onClick={() => setView('list')}>Cancelar</Button><Button icon={<Save size={15} />} onClick={() => setSaved(true)}>Guardar proveedor</Button></div></div>
    <div className="supplier-form-layout"><div className="supplier-form-main">
      <Card className="form-card"><div className="section-heading"><span><Building2 size={17} /></span><div><h2>Información de la empresa</h2><p>Datos de identificación del proveedor.</p></div></div><div className="form-grid"><div className="span-2"><Field label="Razón social" placeholder="Ej. TechDistribution LLC" /></div><Field label="Nombre comercial" placeholder="TechDistribution" /><Field label="Código interno" defaultValue="PRV-0027" prefix={<Barcode size={14} />} /><Field label="Identificación fiscal / EIN" placeholder="XX-XXXXXXX" /><Field label="Sitio web" placeholder="https://..." prefix={<Globe size={14} />} /></div></Card>
      <Card className="form-card"><div className="section-heading"><span><CircleUserRound size={17} /></span><div><h2>Contacto principal</h2><p>Persona responsable de ventas o cuentas.</p></div></div><div className="form-grid"><Field label="Nombre" placeholder="Nombre completo" /><Field label="Cargo" placeholder="Ej. Ejecutivo de cuenta" /><Field label="Correo electrónico" placeholder="nombre@empresa.com" prefix={<Mail size={14} />} /><Field label="Teléfono" placeholder="+1 000 000 0000" prefix={<Phone size={14} />} /></div></Card>
      <Card className="form-card"><div className="section-heading"><span><MapPin size={17} /></span><div><h2>Dirección</h2><p>Dirección fiscal y de correspondencia.</p></div></div><div className="form-grid"><div className="span-2"><Field label="Dirección" placeholder="Calle, número y unidad" /></div><Field label="Ciudad" placeholder="Miami" /><Field label="Estado / Provincia" placeholder="Florida" /><Field label="Código postal" placeholder="33126" /><FormSelect label="País"><option>Estados Unidos</option><option>México</option><option>Canadá</option></FormSelect></div></Card>
    </div><aside className="supplier-form-side"><Card className="form-card"><div className="side-card-title"><h2>Condiciones comerciales</h2></div><div className="side-fields"><FormSelect label="Moneda"><option>USD — Dólar estadounidense</option><option>EUR — Euro</option></FormSelect><FormSelect label="Condición de pago"><option>NET 30</option><option>NET 15</option><option>Pago anticipado</option></FormSelect><Field label="Tiempo de entrega" placeholder="Ej. 5–7 días" /></div></Card><Card className="form-card"><div className="side-card-title"><h2>Estado</h2></div><label className="switch-row"><span><b>Proveedor activo</b><small>Disponible para nuevas órdenes.</small></span><input type="checkbox" defaultChecked /></label></Card></aside></div>
    {saved && <div className="toast"><span><Check size={16} /></span><div><b>Proveedor guardado</b><p>El nuevo proveedor ya está disponible para órdenes de compra.</p></div><button onClick={() => { setSaved(false); setView('list') }}><X size={15} /></button></div>}
  </main>
  if (view === 'detail') {
    const supplier = supplierRows[0]
    return <main className="page supplier-detail-page"><div className="breadcrumb"><button onClick={() => setView('list')}>Proveedores</button><ChevronRight size={13} /><b>{supplier.name}</b></div><div className="detail-hero"><div className="detail-product"><span className="supplier-hero-logo">{supplier.initials}</span><div><div className="detail-title-line"><h1>{supplier.name}</h1><Badge tone="success" dot>Activo</Badge></div><p>{supplier.code} · Distribuidor mayorista de electrónicos</p><div className="detail-meta"><span><Mail size={14} /> {supplier.email}</span><span><Phone size={14} /> {supplier.phone}</span></div></div></div><Button disabled={salesMode} icon={<Edit3 size={15} />} onClick={() => setView('form')}>Editar proveedor</Button></div>
      <div className="detail-stats"><Card><span>Productos asociados</span><strong>184</strong><small>14 categorías</small></Card><Card><span>Órdenes este año</span><strong>12</strong><small>9 recibidas · 3 abiertas</small></Card><Card><span>Total comprado</span><strong>$86,420</strong><small className="up">+18.2% vs. año anterior</small></Card><Card><span>Entrega promedio</span><strong>5.8 días</strong><small>Dentro del plazo acordado</small></Card></div>
      <div className="supplier-detail-grid"><Card className="supplier-orders"><div className="detail-section-head"><div><h2>Órdenes recientes</h2><p>Últimas compras realizadas al proveedor.</p></div><Button variant="ghost" size="sm">Ver todas</Button></div><div className="table-scroll"><table className="supplier-orders-table"><thead><tr><th>Orden</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th></tr></thead><tbody>{orders.slice(0,4).map(order => <tr key={order.id}><td><b className="info-text">{order.id}</b></td><td>{order.created}</td><td>{order.items}</td><td><b>{order.total}</b></td><td><OrderStatus status={order.status} /></td></tr>)}</tbody></table></div></Card><Card className="form-card supplier-contact-card"><div className="side-card-title"><h2>Información de contacto</h2></div><div className="contact-list"><span><CircleUserRound size={15} /><div><small>Contacto principal</small><b>{supplier.contact}</b></div></span><span><Mail size={15} /><div><small>Correo</small><b>{supplier.email}</b></div></span><span><Phone size={15} /><div><small>Teléfono</small><b>{supplier.phone}</b></div></span><span><MapPin size={15} /><div><small>Dirección</small><b>1840 NW 72nd Ave, Miami, FL</b></div></span></div></Card></div>
    </main>
  }
  return <main className="page operations-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Proveedores</b></div><h1>Proveedores</h1><p>Administra contactos, condiciones y relaciones comerciales.</p></div><Button disabled={salesMode} icon={<Plus size={16} />} onClick={() => setView('form')}>Nuevo proveedor</Button></div>
    <div className="supplier-overview"><Card><span className="ops-icon info"><Users size={18} /></span><div><small>Proveedores activos</small><b>38</b><em>4 agregados este año</em></div></Card><Card><span className="ops-icon success"><ShoppingCart size={18} /></span><div><small>Compras este mes</small><b>$146,820</b><em className="up">+12.4% vs. abril</em></div></Card><Card><span className="ops-icon warning"><Truck size={18} /></span><div><small>Órdenes abiertas</small><b>14</b><em>3 con retraso</em></div></Card></div>
    <Card className="ops-table-card"><div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16} /><input placeholder="Buscar proveedor, contacto o código..." /></div><div className="filters"><button>Estado <ChevronDown size={13} /></button><span /><Button variant="secondary" size="sm" icon={<Download size={15} />}>Exportar</Button></div></div><div className="table-scroll"><table className="suppliers-table"><thead><tr><th>Proveedor</th><th>Contacto principal</th><th>Productos</th><th>Órdenes</th><th>Total comprado</th><th>Estado</th><th /></tr></thead><tbody>{supplierRows.map(supplier => <tr key={supplier.code}><td><button className="supplier-link" onClick={() => setView('detail')}><span>{supplier.initials}</span><div><b>{supplier.name}</b><small>{supplier.code}</small></div></button></td><td><div className="supplier-contact"><b>{supplier.contact}</b><small>{supplier.email}</small></div></td><td>{supplier.products}</td><td>{supplier.orders}</td><td><b>{supplier.total}</b></td><td><Badge tone={supplier.status === 'Activo' ? 'success' : 'neutral'} dot>{supplier.status}</Badge></td><td><Button variant="ghost" size="icon" icon={<ChevronRight size={16} />} onClick={() => setView('detail')} /></td></tr>)}</tbody></table></div><div className="pagination"><span>Mostrando <b>1–6</b> de <b>42</b> proveedores</span><div><button disabled><ChevronLeft size={15} /></button><button className="active">1</button><button>2</button><button>3</button><button><ChevronRight size={15} /></button></div></div></Card>
  </main>
}

function Reports() {
  const [report, setReport] = useState<'valuation' | 'rotation' | 'low-stock'>('valuation')
  const [exported, setExported] = useState(false)
  const reportTitle = report === 'valuation' ? 'Valorización del inventario' : report === 'rotation' ? 'Rotación de productos' : 'Productos con stock bajo'
  return <main className="page reports-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Gestión</span><ChevronRight size={13} /><b>Reportes</b></div><h1>Reportes</h1><p>Analiza el rendimiento y la salud de tu inventario.</p></div><div className="heading-actions"><Button variant="secondary" icon={<FileSpreadsheet size={15} />} onClick={() => setExported(true)}>Excel</Button><Button variant="secondary" icon={<FileText size={15} />} onClick={() => setExported(true)}>PDF</Button></div></div>
    <div className="report-picker">
      <button className={report === 'valuation' ? 'active' : ''} onClick={() => setReport('valuation')}><span className="report-icon info"><BarChart3 size={19} /></span><div><b>Valorización</b><small>Valor por categoría y almacén</small></div><ChevronRight size={15} /></button>
      <button className={report === 'rotation' ? 'active' : ''} onClick={() => setReport('rotation')}><span className="report-icon success"><RefreshCw size={19} /></span><div><b>Rotación</b><small>Velocidad de salida y cobertura</small></div><ChevronRight size={15} /></button>
      <button className={report === 'low-stock' ? 'active' : ''} onClick={() => setReport('low-stock')}><span className="report-icon warning"><AlertTriangle size={19} /></span><div><b>Stock bajo</b><small>Productos que requieren reposición</small></div><ChevronRight size={15} /></button>
    </div>
    <div className="report-toolbar"><div><h2>{reportTitle}</h2><p>Datos actualizados hoy a las 10:42</p></div><div className="filters"><button><CalendarDays size={14} /> Últimos 30 días <ChevronDown size={13} /></button><button>Todos los almacenes <ChevronDown size={13} /></button></div></div>
    {report === 'valuation' && <>
      <div className="detail-stats report-stats"><Card><span>Valor total a costo</span><strong>$284,650</strong><small className="up">+8.4% vs. mes anterior</small></Card><Card><span>Valor potencial de venta</span><strong>$356,420</strong><small>Margen estimado 20.1%</small></Card><Card><span>Unidades en inventario</span><strong>12,040</strong><small>1,248 productos activos</small></Card><Card><span>Costo promedio</span><strong>$23.64</strong><small>Por unidad almacenada</small></Card></div>
      <div className="report-grid"><Card className="valuation-chart"><div className="card-head"><div><h2>Valor por categoría</h2><p>Distribución del costo de inventario</p></div></div><div className="donut-wrap"><div className="donut"><span><b>$284k</b><small>Total</small></span></div><div className="chart-legend">{[['Computación','36%','$102,474','primary'],['Celulares','29%','$82,549','success'],['Audio','17%','$48,390','warning'],['Periféricos','11%','$31,312','danger'],['Otros','7%','$19,925','neutral']].map(l => <span key={l[0]}><i className={l[3]} /><b>{l[0]}</b><small>{l[1]}</small><strong>{l[2]}</strong></span>)}</div></div></Card><Card className="warehouse-value"><div className="card-head"><div><h2>Valor por almacén</h2><p>Participación por ubicación</p></div></div>{warehouseRows.slice(0,3).map((w,i) => <div className="value-row" key={w.code}><span className="rank">{i+1}</span><div><b>{w.name}</b><small>{w.units.toLocaleString()} unidades</small><i><em style={{width:`${[68,26,10][i]}%`}} /></i></div><strong>{w.value}</strong></div>)}</Card></div>
    </>}
    {report === 'rotation' && <Card className="report-table-card"><div className="rotation-summary"><span><small>Rotación promedio</small><b>4.8x</b><Badge tone="success">Saludable</Badge></span><span><small>Días de inventario</small><b>76 días</b><em>Objetivo: 60–90</em></span><span><small>Sin movimiento +90 días</small><b>34 productos</b><em className="warning-text">$18,420 inmovilizados</em></span></div><div className="table-scroll"><table className="rotation-table"><thead><tr><th>Producto</th><th>Unidades vendidas</th><th>Stock actual</th><th>Rotación</th><th>Cobertura</th><th>Clasificación</th></tr></thead><tbody>{products.slice(0,6).map((p,i)=><tr key={p.sku}><td><div className="product-cell"><img src={productImages[p.image]} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span></div></td><td>{[186,142,98,64,154,201][i]}</td><td>{p.stock}</td><td><b>{[8.2,7.4,5.8,2.1,6.9,9.4][i]}x</b></td><td>{[32,18,67,142,45,12][i]} días</td><td><Badge tone={i===3?'warning':i===5?'success':'info'}>{i===3?'Lenta':i===5?'Alta':'Media'}</Badge></td></tr>)}</tbody></table></div></Card>}
    {report === 'low-stock' && <Card className="report-table-card"><div className="low-stock-head"><div><span className="ops-icon warning"><AlertTriangle size={18}/></span><div><small>Productos bajo mínimo</small><b>18</b></div></div><div><span className="ops-icon danger"><X size={18}/></span><div><small>Productos agotados</small><b>9</b></div></div><div><span className="ops-icon info"><ShoppingCart size={18}/></span><div><small>Costo de reposición</small><b>$24,860</b></div></div></div><div className="table-scroll"><table className="low-stock-table"><thead><tr><th>Producto</th><th>Stock actual</th><th>Stock mínimo</th><th>Déficit</th><th>Consumo diario</th><th>Proveedor</th><th>Prioridad</th></tr></thead><tbody>{products.filter(p=>p.stock<20).map((p,i)=><tr key={p.sku}><td><div className="product-cell"><img src={productImages[p.image]} alt="" /><span><b>{p.name}</b><small>{p.sku}</small></span></div></td><td><b className={p.stock===0?'danger-text':'warning-text'}>{p.stock}</b></td><td>{[12,8,10,15,14][i] || 10}</td><td>−{Math.max(10-p.stock,2)}</td><td>{(1.2+i*.7).toFixed(1)} uds.</td><td>{['Samsung Business','Apple Authorized Dist.','Global Devices Inc.','TechDistribution LLC'][i%4]}</td><td><Badge tone={p.stock===0?'danger':'warning'}>{p.stock===0?'Crítica':'Alta'}</Badge></td></tr>)}</tbody></table></div></Card>}
    {exported && <div className="toast"><span><Check size={16} /></span><div><b>Reporte exportado</b><p>El archivo se preparó correctamente y está listo para descargar.</p></div><button onClick={() => setExported(false)}><X size={15} /></button></div>}
  </main>
}

const userRows = [
  ['Ana Martínez','ana@larainventory.com','AM','super_admin','Activo','Hoy, 10:42',true],
  ['Carlos Ruiz','carlos@larainventory.com','CR','inventory_manager','Activo','Hoy, 09:48',true],
  ['María López','maria@larainventory.com','ML','sales','Activo','Hoy, 09:31',false],
  ['Diego Torres','diego@larainventory.com','DT','inventory_manager','Activo','Ayer, 17:42',true],
  ['Laura Méndez','laura@larainventory.com','LM','admin','Activo','20 May, 14:12',true],
  ['Jorge Silva','jorge@larainventory.com','JS','sales','Invitado','Nunca',false],
]

function UsersRoles({ salesMode }: { salesMode: boolean }) {
  const [tab, setTab] = useState<'users'|'roles'>('users')
  const [modal, setModal] = useState(false)
  const [saved, setSaved] = useState(false)
  const roles = ['super_admin','admin','inventory_manager','sales']
  const permissions = ['Ver dashboard','Gestionar productos','Registrar movimientos','Gestionar compras','Administrar usuarios','Ver auditoría','Exportar reportes']
  return <main className="page users-page">
    <div className="page-heading compact"><div><div className="breadcrumb"><span>Administración</span><ChevronRight size={13}/><b>Usuarios y roles</b></div><h1>Usuarios y roles</h1><p>Controla el acceso del equipo y sus permisos.</p></div><Button disabled={salesMode} icon={<UserPlus size={16}/>} onClick={()=>setModal(true)}>Invitar usuario</Button></div>
    <div className="management-tabs"><button className={tab==='users'?'active':''} onClick={()=>setTab('users')}><Users size={16}/> Usuarios <span>24</span></button><button className={tab==='roles'?'active':''} onClick={()=>setTab('roles')}><Shield size={16}/> Roles y permisos <span>4</span></button></div>
    {tab==='users'?<><div className="user-summary"><Card><span className="ops-icon info"><Users size={18}/></span><div><small>Usuarios activos</small><b>21</b></div></Card><Card><span className="ops-icon success"><ShieldCheck size={18}/></span><div><small>Con 2FA activo</small><b>17 <em>81%</em></b></div></Card><Card><span className="ops-icon warning"><Mail size={18}/></span><div><small>Invitaciones pendientes</small><b>3</b></div></Card></div><Card className="ops-table-card"><div className="table-toolbar ops-toolbar"><div className="product-search"><Search size={16}/><input placeholder="Buscar usuario o correo..."/></div><div className="filters"><button>Rol <ChevronDown size={13}/></button><button>Estado <ChevronDown size={13}/></button><span/></div></div><div className="table-scroll"><table className="users-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>2FA</th><th>Último acceso</th><th/></tr></thead><tbody>{userRows.map(user=><tr key={user[1] as string}><td><div className="user-table-cell"><span>{user[2]}</span><div><b>{user[0]}</b><small>{user[1]}</small></div></div></td><td><Badge tone={user[3]==='super_admin'?'info':'neutral'}>{String(user[3]).replace('_',' ')}</Badge></td><td><Badge tone={user[4]==='Activo'?'success':'warning'} dot>{user[4]}</Badge></td><td>{user[6]?<span className="twofa-on"><ShieldCheck size={13}/> Activado</span>:<span className="twofa-off">No activado</span>}</td><td>{user[5]}</td><td><Button variant="ghost" size="icon" icon={<MoreHorizontal size={16}/>} /></td></tr>)}</tbody></table></div></Card></>:<div className="roles-layout"><div className="role-cards">{roles.map((role,i)=><Card className={`role-card ${i===0?'selected':''}`} key={role}><div className="role-card-top"><span className={`role-symbol r${i}`}><Shield size={16}/></span><Badge tone={i===0?'info':'neutral'}>{[1,3,8,12][i]} usuarios</Badge></div><b>{role}</b><p>{['Acceso completo a todas las funciones y configuración.','Gestión operativa con acceso administrativo limitado.','Productos, inventario, almacenes y compras.','Consulta de catálogo, stock y reportes.'][i]}</p></Card>)}</div><Card className="permissions-card"><div className="management-card-head"><div><h2>Matriz de permisos</h2><p>Permisos efectivos para cada rol del sistema.</p></div><Button variant="secondary" size="sm" disabled={salesMode}>Editar permisos</Button></div><div className="permission-scroll"><table><thead><tr><th>Permiso</th>{roles.map(r=><th key={r}>{r.replace('_',' ')}</th>)}</tr></thead><tbody>{permissions.map((permission,row)=><tr key={permission}><td><b>{permission}</b></td>{roles.map((role,col)=><td key={role}>{col===0 || (col===1&&row!==4) || (col===2&&row<4) || (col===3&&(row===0||row===6))?<span className="permission-yes"><Check size={13}/></span>:<span className="permission-no">—</span>}</td>)}</tr>)}</tbody></table></div></Card></div>}
    {modal&&<Modal title="Invitar usuario" subtitle="Envía una invitación para unirse a Lara Inventory." onClose={()=>setModal(false)} footer={<><Button variant="secondary" onClick={()=>setModal(false)}>Cancelar</Button><Button onClick={()=>{setModal(false);setSaved(true)}}>Enviar invitación</Button></>}><div className="modal-form-stack"><Field label="Correo electrónico" placeholder="nombre@empresa.com" prefix={<Mail size={14}/>} /><FormSelect label="Rol"><option>sales</option><option>inventory_manager</option><option>admin</option></FormSelect><label className="switch-row"><span><b>Requerir 2FA</b><small>El usuario deberá configurar 2FA en su primer acceso.</small></span><input type="checkbox" defaultChecked/></label></div></Modal>}
    {saved&&<div className="toast"><span><Check size={16}/></span><div><b>Invitación enviada</b><p>El usuario recibirá instrucciones para crear su cuenta.</p></div><button onClick={()=>setSaved(false)}><X size={15}/></button></div>}
  </main>
}

const auditRows = [
  ['Ana Martínez','AM','Producto actualizado','iPhone 15 Pro 256GB','Cambió precio de $1,149.00 a $1,199.00','Hoy, 10:42','181.42.18.24'],
  ['Carlos Ruiz','CR','Movimiento registrado','MOV-4821','Entrada de 24 unidades en Almacén Central','Hoy, 09:48','181.42.22.91'],
  ['María López','ML','Inicio de sesión','Cuenta de usuario','Acceso exitoso con verificación 2FA','Hoy, 09:31','172.58.14.72'],
  ['Ana Martínez','AM','Permisos actualizados','Rol inventory_manager','Habilitó exportación de reportes','Hoy, 08:55','181.42.18.24'],
  ['Diego Torres','DT','Transferencia creada','TR-2025-044','12 unidades de Central a Sucursal Norte','Ayer, 17:42','192.168.1.48'],
  ['Laura Méndez','LM','Orden recibida','OC-2025-0183','Recepción parcial de 38 unidades','Ayer, 16:20','172.61.30.15'],
]

function Audit() {
  return <main className="page audit-page"><div className="page-heading compact"><div><div className="breadcrumb"><span>Administración</span><ChevronRight size={13}/><b>Auditoría</b></div><h1>Registro de auditoría</h1><p>Trazabilidad completa de acciones realizadas en el sistema.</p></div><Button variant="secondary" icon={<Download size={15}/>}>Exportar registro</Button></div>
    <div className="audit-summary"><Card><span className="ops-icon info"><History size={18}/></span><div><small>Eventos hoy</small><b>284</b><em className="up">+8.2% vs. ayer</em></div></Card><Card><span className="ops-icon warning"><ShieldCheck size={18}/></span><div><small>Eventos de seguridad</small><b>18</b><em>2 requieren revisión</em></div></Card><Card><span className="ops-icon success"><CircleUserRound size={18}/></span><div><small>Usuarios activos hoy</small><b>17</b><em>de 21 usuarios activos</em></div></Card></div>
    <Card className="ops-table-card"><div className="audit-filter-bar"><div className="product-search"><Search size={16}/><input placeholder="Buscar usuario, acción o recurso..."/></div><div className="filters"><button><CalendarDays size={14}/> Hoy <ChevronDown size={13}/></button><button>Usuario <ChevronDown size={13}/></button><button>Tipo de evento <ChevronDown size={13}/></button><button><Filter size={14}/> Más filtros</button></div></div><div className="active-filters"><span>Filtros activos:</span><Badge tone="info">Todos los eventos <X size={10}/></Badge><button>Limpiar filtros</button></div><div className="table-scroll"><table className="audit-table"><thead><tr><th>Usuario</th><th>Acción</th><th>Recurso</th><th>Detalle</th><th>Fecha y hora</th><th>Dirección IP</th><th/></tr></thead><tbody>{auditRows.map((row,i)=><tr key={row[2]+row[5]}><td><div className="user-table-cell small"><span>{row[1]}</span><b>{row[0]}</b></div></td><td><Badge tone={i===2?'success':i===3?'warning':'info'}>{row[2]}</Badge></td><td><b>{row[3]}</b></td><td className="audit-detail">{row[4]}</td><td>{row[5]}</td><td><code>{row[6]}</code></td><td><Button variant="ghost" size="icon" icon={<Eye size={15}/>} /></td></tr>)}</tbody></table></div><div className="pagination"><span>Mostrando <b>1–6</b> de <b>2,842</b> eventos</span><div><button disabled><ChevronLeft size={15}/></button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>474</button><button><ChevronRight size={15}/></button></div></div></Card>
  </main>
}

function ProfileSecurity({ salesMode }: { salesMode: boolean }) {
  const [section,setSection]=useState<'profile'|'security'|'sessions'>('profile')
  const [saved,setSaved]=useState(false)
  const person = salesMode ? { initials: 'ML', name: 'María López', email: 'maria@larainventory.com', role: 'sales', first: 'María', last: 'López', title: 'Ejecutiva de ventas' } : { initials: 'AM', name: 'Ana Martínez', email: 'ana@larainventory.com', role: 'super_admin', first: 'Ana', last: 'Martínez', title: 'Directora de operaciones' }
  return <main className="page profile-page"><div className="page-heading compact"><div><div className="breadcrumb"><span>Configuración</span><ChevronRight size={13}/><b>Perfil y seguridad</b></div><h1>Perfil y seguridad</h1><p>Administra tu información personal y protege tu cuenta.</p></div></div>
    <div className="profile-layout"><aside className="profile-nav-card"><div className="profile-person"><span className="avatar large">{person.initials}</span><div><b>{person.name}</b><small>{person.email}</small><Badge tone="info">{person.role}</Badge></div></div><nav><button className={section==='profile'?'active':''} onClick={()=>setSection('profile')}><CircleUserRound size={16}/> Información personal</button><button className={section==='security'?'active':''} onClick={()=>setSection('security')}><ShieldCheck size={16}/> Contraseña y 2FA</button><button className={section==='sessions'?'active':''} onClick={()=>setSection('sessions')}><Monitor size={16}/> Sesiones activas <Badge tone="neutral">3</Badge></button></nav></aside>
      <div className="profile-content">{section==='profile'&&<Card className="profile-card"><div className="profile-card-head"><div><h2>Información personal</h2><p>Actualiza tu nombre, correo y foto de perfil.</p></div></div><div className="profile-photo"><span className="avatar xlarge">{person.initials}</span><div><Button variant="secondary" size="sm" icon={<UploadCloud size={14}/>}>Cambiar foto</Button><small>JPG, PNG o WebP. Máx. 2 MB.</small></div></div><div className="form-grid"><Field label="Nombre" defaultValue={person.first}/><Field label="Apellido" defaultValue={person.last}/><div className="span-2"><Field label="Correo electrónico" defaultValue={person.email} prefix={<Mail size={14}/>} /></div><Field label="Cargo" defaultValue={person.title}/><Field label="Teléfono" defaultValue="+1 305 555 0188" prefix={<Phone size={14}/>} /></div><div className="profile-actions"><Button onClick={()=>setSaved(true)}>Guardar cambios</Button></div></Card>}
      {section==='security'&&<div className="security-stack"><Card className="profile-card"><div className="profile-card-head"><div><h2>Cambiar contraseña</h2><p>Usa una contraseña única de al menos 12 caracteres.</p></div><Badge tone="success">Segura</Badge></div><div className="password-fields"><Field label="Contraseña actual" type="password" placeholder="••••••••••••"/><Field label="Nueva contraseña" type="password" placeholder="Mínimo 12 caracteres"/><Field label="Confirmar contraseña" type="password" placeholder="Repite la contraseña"/></div><div className="password-strength"><span><i/><i/><i/><i/></span><small>Contraseña fuerte</small></div><div className="profile-actions"><Button onClick={()=>setSaved(true)}>Actualizar contraseña</Button></div></Card><Card className="profile-card twofa-card"><div className="twofa-status"><span><ShieldCheck size={21}/></span><div><h2>Autenticación en dos pasos</h2><p>Tu cuenta está protegida con una aplicación de autenticación.</p></div><Badge tone="success" dot>Activada</Badge></div><div className="twofa-details"><span><small>Método</small><b>Aplicación de autenticación</b></span><span><small>Activada el</small><b>12 de enero de 2025</b></span><span><small>Códigos de recuperación</small><b>7 de 10 disponibles</b></span></div><div className="profile-actions split"><Button variant="secondary">Ver códigos de recuperación</Button><Button variant="danger">Desactivar 2FA</Button></div></Card></div>}
      {section==='sessions'&&<Card className="profile-card"><div className="profile-card-head"><div><h2>Sesiones activas</h2><p>Dispositivos donde tu cuenta está actualmente abierta.</p></div><Button variant="danger" size="sm">Cerrar otras sesiones</Button></div><div className="sessions-list">{[['Chrome en macOS','Miami, FL · 181.42.18.24','Esta sesión · Activa ahora','desktop'],['Safari en iPhone','Miami, FL · 181.42.18.31','Hace 2 horas','mobile'],['Chrome en Windows','Orlando, FL · 172.58.14.22','Ayer, 18:42','desktop']].map((s,i)=><div className="session-row" key={s[0]}><span className="session-icon">{s[3]==='desktop'?<Monitor size={19}/>:<CircleUserRound size={19}/>}</span><div><b>{s[0]}</b><small>{s[1]}</small></div><span className={i===0?'current':''}>{i===0&&<i/>}{s[2]}</span>{i>0&&<Button variant="ghost" size="sm">Cerrar sesión</Button>}</div>)}</div><div className="session-note"><ShieldCheck size={15}/><span>¿No reconoces alguna sesión? Cambia tu contraseña inmediatamente para proteger tu cuenta.</span></div></Card>}</div>
    </div>{saved&&<div className="toast"><span><Check size={16}/></span><div><b>Cambios guardados</b><p>La configuración de tu cuenta se actualizó correctamente.</p></div><button onClick={()=>setSaved(false)}><X size={15}/></button></div>}</main>
}

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [dark, setDark] = useState(false)
  const [salesMode, setSalesMode] = useState(true)
  if (page === 'login') return <Login onComplete={() => setPage('dashboard')} />
  return <AppShell page={page} setPage={setPage} dark={dark} setDark={setDark} salesMode={salesMode} setSalesMode={setSalesMode}>
    {page === 'dashboard' && <Dashboard setPage={setPage} salesMode={salesMode} />}
    {page === 'products' && <Products salesMode={salesMode} setPage={setPage} />}
    {page === 'product-form' && <ProductForm setPage={setPage} />}
    {page === 'product-detail' && <ProductDetail setPage={setPage} salesMode={salesMode} />}
    {page === 'inventory' && <Inventory salesMode={salesMode} />}
    {page === 'warehouses' && <Warehouses salesMode={salesMode} />}
    {page === 'purchases' && <Purchases salesMode={salesMode} />}
    {page === 'categories' && <CategoriesBrands salesMode={salesMode} />}
    {page === 'suppliers' && <Suppliers salesMode={salesMode} />}
    {page === 'reports' && <Reports />}
    {page === 'users' && <UsersRoles salesMode={salesMode} />}
    {page === 'audit' && <Audit />}
    {page === 'profile' && <ProfileSecurity salesMode={salesMode} />}
    <button className="demo-logout" onClick={() => setPage('login')} title="Ver pantalla de acceso"><LogOut size={16} /><span>Ver login</span></button>
  </AppShell>
}
