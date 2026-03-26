import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package,
  DollarSign,
  Truck,
  CheckCircle,
  LogOut,
  RefreshCw,
  ChevronDown,
  ExternalLink,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types/order'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order'

interface Metrics {
  total: number
  revenue: number
  shipped: number
  delivered: number
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [metrics, setMetrics] = useState<Metrics>({ total: 0, revenue: 0, shipped: 0, delivered: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

  const fetchOrders = useCallback(async () => {
    setLoading(true)

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/admin/login')
      return
    }

    // Check admin
    const { data: admin } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!admin) {
      navigate('/admin/login')
      return
    }

    // Fetch orders with customer data
    let query = supabase
      .from('orders')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    const orderData = (data ?? []) as Order[]
    setOrders(orderData)

    // Compute metrics from all orders (unfiltered)
    const { data: allOrders } = await supabase
      .from('orders')
      .select('status, amount_cents')

    if (allOrders) {
      setMetrics({
        total: allOrders.length,
        revenue: allOrders
          .filter((o) => o.status !== 'cancelled' && o.status !== 'refunded')
          .reduce((sum, o) => sum + o.amount_cents, 0),
        shipped: allOrders.filter((o) => o.status === 'shipped').length,
        delivered: allOrders.filter((o) => o.status === 'delivered').length,
      })
    }

    setLoading(false)
  }, [navigate, statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    await fetchOrders()
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null))
    }
  }

  async function updateTrackingNumber(orderId: string, tracking: string) {
    await supabase.from('orders').update({ tracking_number: tracking }).eq('id', orderId)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const METRIC_CARDS = [
    { label: 'Total Orders', value: metrics.total, icon: Package, color: 'text-blue-400' },
    {
      label: 'Revenue',
      value: `$${(metrics.revenue / 100).toFixed(2)}`,
      icon: DollarSign,
      color: 'text-gold',
    },
    { label: 'Shipped', value: metrics.shipped, icon: Truck, color: 'text-purple-400' },
    { label: 'Delivered', value: metrics.delivered, icon: CheckCircle, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-stone">
      {/* Top bar */}
      <header className="bg-stone-warm border-b border-gold/10 px-6 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-gold/40 rounded-full flex items-center justify-center">
            <span className="font-[Cinzel] text-gold text-xs font-bold">D</span>
          </div>
          <span className="font-[Cinzel] text-cream text-sm tracking-[0.15em] uppercase">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-stone-light text-xs hover:text-cream transition-colors flex items-center gap-1"
          >
            View Store <ExternalLink size={10} />
          </a>
          <button
            onClick={handleLogout}
            className="text-stone-light text-xs hover:text-cream transition-colors flex items-center gap-1"
          >
            <LogOut size={12} /> Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-stone-warm border border-gold/5 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-stone-light text-xs tracking-wider uppercase">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <p className="font-[Cinzel] text-cream text-2xl font-bold">{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Orders section */}
        <div className="bg-stone-warm border border-gold/5">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gold/5">
            <h2 className="text-cream text-sm font-semibold tracking-wide">Orders</h2>
            <div className="flex items-center gap-3">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  className="appearance-none bg-stone border border-stone-mid text-stone-light text-xs px-3 py-1.5 pr-7 focus:outline-none focus:border-gold/30 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-light pointer-events-none" />
              </div>

              <button
                onClick={fetchOrders}
                className="text-stone-light hover:text-cream p-1 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <Package size={28} className="text-stone-mid mx-auto mb-3" />
              <p className="text-stone-light text-sm">No orders yet</p>
              <p className="text-stone-light/50 text-xs mt-1">Orders will appear here once customers purchase</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/5 text-stone-light text-xs tracking-wider uppercase">
                    <th className="text-left px-5 py-3 font-medium">Date</th>
                    <th className="text-left px-5 py-3 font-medium">Customer</th>
                    <th className="text-left px-5 py-3 font-medium">Amount</th>
                    <th className="text-left px-5 py-3 font-medium">Status</th>
                    <th className="text-left px-5 py-3 font-medium">Tracking</th>
                    <th className="text-left px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gold/[0.03] hover:bg-stone/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3.5 text-cream text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-cream text-xs">
                          {order.shipping_name ?? order.customer?.name ?? '—'}
                        </p>
                        <p className="text-stone-light text-[11px]">
                          {order.customer?.email ?? '—'}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-cream text-xs font-medium">
                        ${(order.amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-light text-xs font-mono">
                        {order.tracking_number ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={order.status}
                          onChange={(e) => {
                            e.stopPropagation()
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="appearance-none bg-stone border border-stone-mid text-stone-light text-[11px] px-2 py-1 focus:outline-none focus:border-gold/30 cursor-pointer"
                        >
                          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order detail slide-over */}
      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={updateOrderStatus}
          onTrackingChange={updateTrackingNumber}
        />
      )}
    </div>
  )
}

function OrderDetailPanel({
  order,
  onClose,
  onStatusChange,
  onTrackingChange,
}: {
  order: Order
  onClose: () => void
  onStatusChange: (id: string, status: OrderStatus) => void
  onTrackingChange: (id: string, tracking: string) => void
}) {
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const addr = order.shipping_address

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-md bg-stone-warm border-l border-gold/10 overflow-y-auto"
      >
        <div className="px-6 py-5 border-b border-gold/10 flex items-center justify-between">
          <h3 className="font-[Cinzel] text-cream text-base">Order Details</h3>
          <button onClick={onClose} className="text-stone-light hover:text-cream">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Status */}
          <div>
            <label className="text-stone-light text-xs tracking-wider uppercase block mb-2">Status</label>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className="w-full bg-stone border border-stone-mid text-cream text-sm px-3 py-2 focus:outline-none focus:border-gold/30"
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Tracking */}
          <div>
            <label className="text-stone-light text-xs tracking-wider uppercase block mb-2">Tracking Number</label>
            <div className="flex gap-2">
              <input
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="Enter tracking number"
                className="flex-1 bg-stone border border-stone-mid text-cream text-sm px-3 py-2 focus:outline-none focus:border-gold/30"
              />
              <button
                onClick={() => onTrackingChange(order.id, tracking)}
                className="px-4 py-2 bg-gold text-stone text-xs font-semibold tracking-wider uppercase hover:bg-gold-light transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-stone-light text-xs tracking-wider uppercase mb-2">Customer</h4>
            <div className="bg-stone p-4 border border-gold/5 space-y-1 text-sm">
              <p className="text-cream">{order.shipping_name ?? order.customer?.name ?? '—'}</p>
              <p className="text-stone-light">{order.customer?.email ?? '—'}</p>
            </div>
          </div>

          {/* Shipping address */}
          {addr && (
            <div>
              <h4 className="text-stone-light text-xs tracking-wider uppercase mb-2">Shipping Address</h4>
              <div className="bg-stone p-4 border border-gold/5 text-sm text-cream space-y-0.5">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          )}

          {/* Order info */}
          <div>
            <h4 className="text-stone-light text-xs tracking-wider uppercase mb-2">Order Info</h4>
            <div className="bg-stone p-4 border border-gold/5 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-light">Amount</span>
                <span className="text-cream font-medium">${(order.amount_cents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-light">Quantity</span>
                <span className="text-cream">{order.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-light">Date</span>
                <span className="text-cream">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-light">Payment</span>
                <span className="text-cream font-mono text-xs">{order.stripe_payment_intent_id ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
