import type {
  ApiBrand,
  ApiCategory,
  ApiDashboardData,
  ApiProduct,
  ApiPurchaseOrder,
  ApiStockMovement,
  ApiSupplier,
  ApiUser,
  ApiWarehouse,
  ApiWarehouseDetail,
} from '@/types/api'

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : null
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch('/sanctum/csrf-cookie', {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase()

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !getCookie('XSRF-TOKEN')) {
    await ensureCsrfCookie()
  }

  const xsrf = getCookie('XSRF-TOKEN')
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  const response = await fetch(path, {
    ...options,
    method,
    credentials: 'include',
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const firstFieldErrors = json?.errors ? (Object.values(json.errors)[0] as string[]) : undefined
    const message = firstFieldErrors?.[0] || json?.message || `Error HTTP ${response.status}`
    throw new ApiError(message, response.status, json?.errors)
  }

  return json as T
}

let meInFlight: Promise<ApiUser> | null = null

export const authApi = {
  async login(email: string, password: string, remember = false): Promise<ApiUser> {
    await ensureCsrfCookie()
    const res = await request<{ data: ApiUser }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, remember }),
    })
    return res.data
  },

  async me(): Promise<ApiUser> {
    if (!meInFlight) {
      meInFlight = request<{ data: ApiUser }>('/api/v1/auth/me')
        .then((res) => res.data)
        .finally(() => {
          meInFlight = null
        })
    }
    return meInFlight
  },

  async logout(): Promise<void> {
    await request<void>('/api/v1/auth/logout', { method: 'POST' })
  },
}

export const dashboardApi = {
  async get(): Promise<ApiDashboardData> {
    const res = await request<{ data: ApiDashboardData }>('/api/v1/dashboard')
    return res.data
  },
}

export const productsApi = {
  async list(params?: { q?: string; category_id?: string; brand_id?: string; status?: string }): Promise<ApiProduct[]> {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.category_id) search.set('category_id', params.category_id)
    if (params?.brand_id) search.set('brand_id', params.brand_id)
    if (params?.status) search.set('status', params.status)
    const qs = search.toString()
    const res = await request<{ data: ApiProduct[] }>(`/api/v1/products${qs ? `?${qs}` : ''}`)
    return res.data
  },

  async get(id: string): Promise<{ product: ApiProduct; movements: ApiStockMovement[] }> {
    const res = await request<{ data: { product: ApiProduct; movements: ApiStockMovement[] } }>(`/api/v1/products/${id}`)
    return res.data
  },

  async create(payload: {
    category_id: string
    brand_id: string
    name: string
    base_sku: string
    barcode?: string
    description?: string
    status?: 'draft' | 'active' | 'archived'
    image?: string
    initial_warehouse_id?: string
    variants: Array<{
      sku: string
      color?: string
      storage?: string
      price: number
      cost: number
      min_stock?: number
      initial_stock?: number
    }>
  }): Promise<ApiProduct> {
    const res = await request<{ data: ApiProduct }>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

export const stockMovementsApi = {
  async list(params?: { q?: string; type?: string; warehouse_id?: string }): Promise<ApiStockMovement[]> {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.type) search.set('type', params.type)
    if (params?.warehouse_id) search.set('warehouse_id', params.warehouse_id)
    const qs = search.toString()
    const res = await request<{ data: ApiStockMovement[] }>(`/api/v1/stock-movements${qs ? `?${qs}` : ''}`)
    return res.data
  },

  async create(payload: {
    type: 'in' | 'out' | 'adjustment' | 'return' | 'transfer'
    product_variant_id: string
    warehouse_id: string
    to_warehouse_id?: string
    quantity: number
    reference?: string
    reason?: string
    current_password?: string
  }): Promise<ApiStockMovement> {
    const res = await request<{ data: ApiStockMovement }>('/api/v1/stock-movements', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

export const warehousesApi = {
  async list(): Promise<ApiWarehouse[]> {
    const res = await request<{ data: ApiWarehouse[] }>('/api/v1/warehouses')
    return res.data
  },

  async get(id: string): Promise<ApiWarehouseDetail> {
    const res = await request<{ data: ApiWarehouseDetail }>(`/api/v1/warehouses/${id}`)
    return res.data
  },
}

export const categoriesApi = {
  async list(): Promise<ApiCategory[]> {
    const res = await request<{ data: ApiCategory[] }>('/api/v1/categories')
    return res.data
  },

  async create(payload: {
    parent_id?: string | null
    name: string
    description?: string
    is_active?: boolean
  }): Promise<ApiCategory> {
    const res = await request<{ data: ApiCategory }>('/api/v1/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

export const brandsApi = {
  async list(): Promise<ApiBrand[]> {
    const res = await request<{ data: ApiBrand[] }>('/api/v1/brands')
    return res.data
  },

  async create(payload: {
    name: string
    code: string
    website?: string
    is_active?: boolean
  }): Promise<ApiBrand> {
    const res = await request<{ data: ApiBrand }>('/api/v1/brands', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

export const suppliersApi = {
  async list(): Promise<ApiSupplier[]> {
    const res = await request<{ data: ApiSupplier[] }>('/api/v1/suppliers')
    return res.data
  },

  async get(id: string): Promise<ApiSupplier> {
    const res = await request<{ data: ApiSupplier }>(`/api/v1/suppliers/${id}`)
    return res.data
  },

  async create(payload: {
    code: string
    legal_name: string
    trade_name?: string
    tax_id?: string
    website?: string
    contact_name?: string
    contact_position?: string
    contact_email?: string
    contact_phone?: string
    city?: string
    state?: string
    payment_terms?: string
    lead_time?: string
  }): Promise<ApiSupplier> {
    const res = await request<{ data: ApiSupplier }>('/api/v1/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },
}

export const purchaseOrdersApi = {
  async list(): Promise<ApiPurchaseOrder[]> {
    const res = await request<{ data: ApiPurchaseOrder[] }>('/api/v1/purchase-orders')
    return res.data
  },

  async get(id: string): Promise<ApiPurchaseOrder> {
    const res = await request<{ data: ApiPurchaseOrder }>(`/api/v1/purchase-orders/${id}`)
    return res.data
  },

  async create(payload: {
    supplier_id: string
    warehouse_id: string
    expected_at?: string
    notes?: string
    send_now?: boolean
    items: Array<{
      product_variant_id: string
      quantity_ordered: number
      unit_cost: number
    }>
  }): Promise<ApiPurchaseOrder> {
    const res = await request<{ data: ApiPurchaseOrder }>('/api/v1/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return res.data
  },

  async receive(
    id: string,
    items: Array<{ item_id: string; quantity_received: number }>,
  ): Promise<ApiPurchaseOrder> {
    const res = await request<{ data: ApiPurchaseOrder }>(`/api/v1/purchase-orders/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    })
    return res.data
  },
}
