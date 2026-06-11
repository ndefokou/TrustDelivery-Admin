import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  mockDeliveries,
  mockRiders,
  mockMerchants,
  mockPerformance,
  mockExpenses,
  mockNotifications,
  mockDashboard,
  mockPayments,
  mockSettings,
} from '../mocks/deliveryData'
import { Delivery, Rider, Merchant, Notification, DashboardData, Settings, TopRider, Expense } from '../types'

const delay = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/* ───────────────────────── Dashboard ───────────────────────── */

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      await delay()
      return { ...mockDashboard }
    },
  })
}

/* ───────────────────────── Deliveries ───────────────────────── */

export function useDeliveries(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: async () => {
      await delay()
      let data = [...mockDeliveries]

      if (filters?.status) {
        const s = String(filters.status)
        data = data.filter((d) => d.status === s)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        data = data.filter(
          (d) =>
            d.id.toLowerCase().includes(q) ||
            d.customer_name.toLowerCase().includes(q) ||
            d.customer_phone.toLowerCase().includes(q) ||
            d.product_description.toLowerCase().includes(q)
        )
      }
      if (filters?.date_from) {
        const from = new Date(String(filters.date_from)).getTime()
        data = data.filter((d) => new Date(d.created_at).getTime() >= from)
      }
      if (filters?.date_to) {
        const to = new Date(String(filters.date_to)).getTime()
        data = data.filter((d) => new Date(d.created_at).getTime() <= to)
      }
      if (filters?.merchant) {
        const m = String(filters.merchant).toLowerCase()
        data = data.filter((d) => {
          const merchant = mockMerchants.find((mer) => mer.id === d.merchant_id)
          return merchant?.business_name.toLowerCase().includes(m)
        })
      }
      if (filters?.rider) {
        const r = String(filters.rider).toLowerCase()
        data = data.filter((d) => {
          const rider = mockRiders.find((rid) => rid.id === d.assigned_rider_id)
          return rider?.full_name.toLowerCase().includes(r)
        })
      }

      return { deliveries: data, total: data.length }
    },
  })
}

export function useDelivery(id: string) {
  return useQuery<Delivery>({
    queryKey: ['delivery', id],
    queryFn: async () => {
      await delay()
      return mockDeliveries.find((d) => d.id === id) as Delivery
    },
    enabled: !!id,
  })
}

export function useAwaitingDeliveries() {
  return useQuery<Delivery[]>({
    queryKey: ['deliveries', 'awaiting'],
    queryFn: async () => {
      await delay()
      return mockDeliveries.filter((d) => d.status === 'awaiting_assignment')
    },
  })
}

export function useAssignRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ deliveryId, riderId }: { deliveryId: string; riderId: string }) => {
      await delay()
      const delivery = mockDeliveries.find((d) => d.id === deliveryId)
      if (delivery) {
        delivery.assigned_rider_id = riderId
        delivery.status = 'assigned'
        delivery.assigned_at = new Date().toISOString()
      }
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['delivery'], exact: false })
    },
  })
}

export function useCancelDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const idx = mockDeliveries.findIndex((d) => d.id === id)
      if (idx !== -1) mockDeliveries.splice(idx, 1)
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['delivery'], exact: false })
    },
  })
}

/* ───────────────────────── Riders ───────────────────────── */

export function useRiders(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['riders', filters],
    queryFn: async () => {
      await delay()
      let data = [...mockRiders]
      if (filters?.status) {
        data = data.filter((r) => r.status === filters.status)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        data = data.filter((r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.phone_number.toLowerCase().includes(q) ||
          r.motorbike_registration.toLowerCase().includes(q)
        )
      }
      return { riders: data }
    },
  })
}

export function useRider(id: string) {
  return useQuery<Rider>({
    queryKey: ['rider', id],
    queryFn: async () => {
      await delay()
      return mockRiders.find((r) => r.id === id) as Rider
    },
    enabled: !!id,
  })
}

export function useCreateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rider: Partial<Rider>) => {
      await delay()
      const newRider: Rider = {
        id: `rider-${Date.now()}`,
        full_name: rider.full_name || 'New Rider',
        phone_number: rider.phone_number || '',
        national_id: rider.national_id || '',
        address: rider.address || '',
        motorbike_registration: rider.motorbike_registration || '',
        status: 'active',
        total_deliveries: 0,
        completed_deliveries: 0,
        failed_deliveries: 0,
        performance_score: 0,
        total_revenue: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...rider,
      }
      mockRiders.push(newRider)
      return newRider
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
  })
}

export function useUpdateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, rider }: { id: string; rider: Partial<Rider> }) => {
      await delay()
      const existing = mockRiders.find((r) => r.id === id)
      if (existing) {
        Object.assign(existing, rider, { updated_at: new Date().toISOString() })
      }
      return existing
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
      queryClient.invalidateQueries({ queryKey: ['rider', variables.id] })
    },
  })
}

export function useSuspendRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const rider = mockRiders.find((r) => r.id === id)
      if (rider) {
        rider.status = 'suspended'
        rider.updated_at = new Date().toISOString()
      }
      return rider
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['rider', id] })
      await queryClient.cancelQueries({ queryKey: ['riders'] })
      const previousRider = queryClient.getQueryData<Rider>(['rider', id])
      queryClient.setQueryData<Rider>(['rider', id], (old) => {
        if (!old) return old
        return { ...old, status: 'suspended' }
      })
      queryClient.setQueriesData<{ riders: Rider[] }>(
        { queryKey: ['riders'] },
        (old) => {
          if (!old || !old.riders) return old
          return {
            ...old,
            riders: old.riders.map((r) => (r.id === id ? { ...r, status: 'suspended' } : r)),
          }
        }
      )
      return { previousRider }
    },
    onError: (_err, id, context) => {
      if (context?.previousRider) {
        queryClient.setQueryData(['rider', id], context.previousRider)
      }
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['rider', id] })
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
  })
}

export function useActivateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const rider = mockRiders.find((r) => r.id === id)
      if (rider) {
        rider.status = 'active'
        rider.updated_at = new Date().toISOString()
      }
      return rider
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['rider', id] })
      await queryClient.cancelQueries({ queryKey: ['riders'] })
      const previousRider = queryClient.getQueryData<Rider>(['rider', id])
      queryClient.setQueryData<Rider>(['rider', id], (old) => {
        if (!old) return old
        return { ...old, status: 'active' }
      })
      queryClient.setQueriesData<{ riders: Rider[] }>(
        { queryKey: ['riders'] },
        (old) => {
          if (!old || !old.riders) return old
          return {
            ...old,
            riders: old.riders.map((r) => (r.id === id ? { ...r, status: 'active' } : r)),
          }
        }
      )
      return { previousRider }
    },
    onError: (_err, id, context) => {
      if (context?.previousRider) {
        queryClient.setQueryData(['rider', id], context.previousRider)
      }
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['rider', id] })
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
  })
}

export function useReviewExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      await delay()
      const expense = mockExpenses.find((e) => e.id === id)
      if (expense) {
        expense.status = status as Expense['status']
        expense.admin_notes = admin_notes || expense.admin_notes
        expense.reviewed_at = new Date().toISOString()
        expense.reviewed_by = 'Admin'
      }
      return expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-expenses'] })
    },
  })
}

export function useRiderPerformance() {
  return useQuery<TopRider[]>({
    queryKey: ['rider-performance'],
    queryFn: async () => {
      await delay()
      return [...mockPerformance]
    },
  })
}

export function useRiderExpenses() {
  return useQuery<Expense[]>({
    queryKey: ['rider-expenses'],
    queryFn: async () => {
      await delay()
      return [...mockExpenses]
    },
  })
}

/* ───────────────────────── Merchants ───────────────────────── */

export function useMerchants(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['merchants', filters],
    queryFn: async () => {
      await delay()
      let data = [...mockMerchants]
      if (filters?.status) {
        data = data.filter((m) => m.status === filters.status)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        data = data.filter(
          (m) =>
            m.business_name.toLowerCase().includes(q) ||
            m.owner_name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q)
        )
      }
      return { merchants: data }
    },
  })
}

export function useMerchant(id: string) {
  return useQuery<Merchant>({
    queryKey: ['merchant', id],
    queryFn: async () => {
      await delay()
      return mockMerchants.find((m) => m.id === id) as Merchant
    },
    enabled: !!id,
  })
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, merchant }: { id: string; merchant: Partial<Merchant> }) => {
      await delay()
      const existing = mockMerchants.find((m) => m.id === id)
      if (existing) {
        Object.assign(existing, merchant, { updated_at: new Date().toISOString() })
      }
      return existing
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
      queryClient.invalidateQueries({ queryKey: ['merchant', variables.id] })
    },
  })
}

export function useSuspendMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const merchant = mockMerchants.find((m) => m.id === id)
      if (merchant) {
        merchant.status = 'suspended'
        merchant.updated_at = new Date().toISOString()
      }
      return merchant
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}

export function useActivateMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const merchant = mockMerchants.find((m) => m.id === id)
      if (merchant) {
        merchant.status = 'active'
        merchant.updated_at = new Date().toISOString()
      }
      return merchant
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchants'] })
    },
  })
}

/* ───────────────────────── Payments ───────────────────────── */

export function usePayments(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      await delay()
      let data = [...mockPayments]
      if (filters?.status) {
        data = data.filter((p) => p.status === filters.status)
      }
      if (filters?.search) {
        const q = String(filters.search).toLowerCase()
        data = data.filter((p) =>
          p.transaction_id.toLowerCase().includes(q) ||
          String(p.amount).includes(q)
        )
      }
      return { payments: data, total: data.length }
    },
  })
}

/* ───────────────────────── Notifications ───────────────────────── */

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay()
      const notifications = [...mockNotifications].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const unread_count = notifications.filter((n) => !n.is_read).length
      return { notifications, unread_count }
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await delay()
      const notif = mockNotifications.find((n) => n.id === id)
      if (notif) {
        notif.is_read = true
        notif.read_at = new Date().toISOString()
      }
      return notif
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await delay()
      mockNotifications.forEach((n) => {
        if (!n.is_read) {
          n.is_read = true
          n.read_at = new Date().toISOString()
        }
      })
      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

/* ───────────────────────── Settings ───────────────────────── */

export function useSettings() {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      await delay()
      return { ...mockSettings }
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      await delay()
      if (settings.company) {
        Object.assign(mockSettings.company, settings.company)
      }
      if (settings.pricing_rules) {
        mockSettings.pricing_rules = settings.pricing_rules
      }
      return { ...mockSettings }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/* ───────────────────────── Reports ───────────────────────── */

export function useReports(type: 'daily' | 'weekly' | 'monthly' | 'revenue') {
  return useQuery({
    queryKey: ['reports', type],
    queryFn: async () => {
      await delay()
      return {
        type,
        data: [
          { label: 'Period 1', value: 120 },
          { label: 'Period 2', value: 150 },
          { label: 'Period 3', value: 180 },
        ],
      }
    },
  })
}
