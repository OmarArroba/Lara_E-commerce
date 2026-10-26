export interface ApiUser {
  id: number
  name: string
  email: string
  is_active: boolean
  roles: string[]
  permissions: string[]
  last_login_at: string | null
}

export interface ApiStockByWarehouse {
  warehouse_id: string
  warehouse_name: string | null
  warehouse_code: string | null
  warehouse_city: string | null
  quantity: number
  reserved: number
  available: number
}

export interface ApiProductVariant {
  id: string
  sku: string
  color: string | null
  storage: string | null
  attributes: Record<string, unknown> | null
  price: number
  cost: number
  min_stock: number
  is_active: boolean
  stock: number
  reserved: number
  available: number
  stocks_by_warehouse?: ApiStockByWarehouse[]
}

export interface ApiProduct {
  id: string
  name: string
  slug: string
  base_sku: string
  primary_sku: string
  barcode: string | null
  description: string | null
  status: 'draft' | 'active' | 'archived'
  inventory_state: 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived'
  total_stock: number
  price: number
  image: string | null
  images?: string[]
  category: { id: string; name: string } | null
  brand: { id: string; name: string; code: string } | null
  supplier: { id: string; name: string; code: string } | null
  variants_count: number
  variants?: ApiProductVariant[]
  updated_at: string | null
}

export interface ApiStockMovement {
  id: string
  code: string
  type: 'in' | 'out' | 'adjustment' | 'return' | 'transfer_out' | 'transfer_in' | 'purchase_receipt'
  quantity: number
  balance_after: number
  reference: string | null
  reason: string | null
  variant: {
    id: string
    sku: string
    color: string | null
    storage: string | null
    product_id: string
    product_name: string | null
  } | null
  warehouse: {
    id: string
    code: string
    name: string
  } | null
  related_warehouse: {
    id: string
    code: string
    name: string
  } | null
  user: {
    id: number
    name: string
  } | null
  created_at: string | null
}

export interface ApiDashboardData {
  kpis: {
    inventory_value: number
    active_products: number
    low_stock_count: number
    movements_today: number
    entries_today: number
    exits_today: number
  }
  low_stock_alerts: ApiProduct[]
  recent_movements: ApiStockMovement[]
}

export interface ApiWarehouse {
  id: string
  code: string
  name: string
  address: string | null
  city: string | null
  capacity_units: number | null
  status: 'operational' | 'maintenance' | 'closed'
  manager: { id: number; name: string } | null
  total_units: number
  distinct_variants: number
}

export interface ApiWarehouseDetail {
  warehouse: ApiWarehouse
  stocks: Array<{
    id: string
    quantity: number
    reserved: number
    available: number
    variant: {
      id: string
      sku: string
      price: number
      cost: number
      min_stock: number
      product_id: string
      product_name: string
      category: string | null
      image: string | null
    }
  }>
}

export interface ApiCategory {
  id: string
  parent_id: string | null
  name: string
  slug: string
  description: string | null
  sort_order: number
  is_active: boolean
  products_count?: number
  children?: ApiCategory[]
}

export interface ApiBrand {
  id: string
  name: string
  slug: string
  code: string
  website: string | null
  is_active: boolean
  products_count?: number
  updated_at: string | null
}

export interface ApiSupplier {
  id: string
  code: string
  legal_name: string
  trade_name: string | null
  tax_id: string | null
  website: string | null
  contact_name: string | null
  contact_position: string | null
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  currency: string
  payment_terms: string | null
  lead_time: string | null
  is_active: boolean
  products_count: number
  purchase_orders_count: number
  total_purchased: number
}

export interface ApiPurchaseOrderItem {
  id: string
  product_variant_id: string
  sku: string | null
  color: string | null
  storage: string | null
  product_id: string | null
  product_name: string | null
  image: string | null
  quantity_ordered: number
  quantity_received: number
  pending: number
  unit_cost: number
  subtotal: number
}

export interface ApiPurchaseOrder {
  id: string
  number: string
  status: 'draft' | 'sent' | 'partially_received' | 'received' | 'cancelled'
  expected_at: string | null
  sent_at: string | null
  received_at: string | null
  total: number
  notes: string | null
  created_at: string | null
  supplier: {
    id: string
    code: string
    legal_name: string
    trade_name: string | null
    contact_name: string | null
    contact_email: string | null
    contact_phone: string | null
  } | null
  warehouse: {
    id: string
    code: string
    name: string
    city: string | null
  } | null
  creator: {
    id: number
    name: string
  } | null
  items_count: number
  total_quantity_ordered: number
  total_quantity_received: number
  items?: ApiPurchaseOrderItem[]
}
