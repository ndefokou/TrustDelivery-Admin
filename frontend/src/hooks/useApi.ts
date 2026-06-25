import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Delivery,
  Carrier,
  Merchant,
  Notification,
  DashboardData,
  Settings,
  TopCarrier,
  Expense,
  Payment,
} from '../types'

/* ───────────────────────── Dashboard ───────────────────────── */

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data
    },
  })
}

/* ───────────────────────── Deliveries ───────────────────────── */

export function useDeliveries(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: async () => {
      const { data } = await api.get('/deliveries', { params: filters })
      return data
    },
  })
}

export interface MerchantWithLocation {
  id: string
  business_name: string
  contact_phone: string
  email: string
  dispatch_latitude: number | null
  dispatch_longitude: number | null
  address: string
}

export interface DeliveryDetailsResponse {
  delivery: Delivery
  merchant: MerchantWithLocation
  carrier: {
    id: string
    company_name: string
    phone: string
  } | null
  timeline: Array<{
    status: string
    timestamp: string
    description: string
  }>
}

export function useDelivery(id: string) {
  return useQuery<DeliveryDetailsResponse>({
    queryKey: ['delivery', id],
    queryFn: async () => {
      const { data } = await api.get(`/deliveries/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useAwaitingDeliveries() {
  return useQuery<Delivery[]>({
    queryKey: ['deliveries', 'awaiting'],
    queryFn: async () => {
      const { data } = await api.get('/deliveries/awaiting')
      return data
    },
  })
}

export function useAssignCarrier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ deliveryId, carrierId }: { deliveryId: string; carrierId: string }) => {
      const { data } = await api.post(`/deliveries/${deliveryId}/assign`, { carrier_id: carrierId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['delivery'], exact: false })
    },
  })
}

export function useAutoAssign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (deliveryId: string) => {
      const { data } = await api.post(`/deliveries/${deliveryId}/auto-assign`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['delivery'], exact: false })
    },
  })
}

export function useAvailableCarriers() {
  return useQuery({
    queryKey: ['available-carriers'],
    queryFn: async () => {
      const { data } = await api.get('/deliveries/available-carriers')
      return data
    },
  })
}

export function useCreateDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      product_description: string
      product_value: number
      distance_km: number
      customer_name: string
      customer_phone: string
      delivery_address: string
      delivery_lat?: number
      delivery_lng?: number
      merchant_id: string
    }) => {
      const { data } = await api.post('/deliveries', payload)
      return data
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
      const { data } = await api.delete(`/deliveries/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['delivery'], exact: false })
    },
  })
}

/* ───────────────────────── Carriers ───────────────────────── */

export function useCarriers(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['carriers', filters],
    queryFn: async () => {
      const { data } = await api.get('/carriers', { params: filters })
      return data
    },
  })
}

export function useCarrier(id: string) {
  return useQuery<Carrier>({
    queryKey: ['carrier', id],
    queryFn: async () => {
      const { data } = await api.get(`/carriers/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateCarrier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (carrier: Partial<Carrier>) => {
      const { data } = await api.post('/carriers', carrier)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

export function useUpdateCarrier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, carrier }: { id: string; carrier: Partial<Carrier> }) => {
      const { data } = await api.put(`/carriers/${id}`, carrier)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
      queryClient.invalidateQueries({ queryKey: ['carrier', variables.id] })
    },
  })
}

export function useSuspendCarrier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/carriers/${id}/suspend`)
      return data
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['carrier', id] })
      await queryClient.cancelQueries({ queryKey: ['carriers'] })
      const previousCarrier = queryClient.getQueryData<Carrier>(['carrier', id])
      queryClient.setQueryData<Carrier>(['carrier', id], (old) => {
        if (!old) return old
        return { ...old, status: 'suspended' as const }
      })
      queryClient.setQueriesData<{ carriers: Carrier[] }>(
        { queryKey: ['carriers'] },
        (old) => {
          if (!old || !old.carriers) return old
          return {
            ...old,
            carriers: old.carriers.map((c) => (c.id === id ? { ...c, status: 'suspended' as const } : c)),
          }
        }
      )
      return { previousCarrier }
    },
    onError: (_err, id, context) => {
      if (context?.previousCarrier) {
        queryClient.setQueryData(['carrier', id], context.previousCarrier)
      }
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['carrier', id] })
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

export function useActivateCarrier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/carriers/${id}/activate`)
      return data
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['carrier', id] })
      await queryClient.cancelQueries({ queryKey: ['carriers'] })
      const previousCarrier = queryClient.getQueryData<Carrier>(['carrier', id])
      queryClient.setQueryData<Carrier>(['carrier', id], (old) => {
        if (!old) return old
        return { ...old, status: 'active' as const }
      })
      queryClient.setQueriesData<{ carriers: Carrier[] }>(
        { queryKey: ['carriers'] },
        (old) => {
          if (!old || !old.carriers) return old
          return {
            ...old,
            carriers: old.carriers.map((c) => (c.id === id ? { ...c, status: 'active' as const } : c)),
          }
        }
      )
      return { previousCarrier }
    },
    onError: (_err, id, context) => {
      if (context?.previousCarrier) {
        queryClient.setQueryData(['carrier', id], context.previousCarrier)
      }
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ['carrier', id] })
      queryClient.invalidateQueries({ queryKey: ['carriers'] })
    },
  })
}

export function useReviewExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status: string; admin_notes?: string }) => {
      const { data } = await api.post(`/carriers/expenses/${id}/review`, { status, admin_notes })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier-expenses'] })
    },
  })
}

export function useCarrierPerformance() {
  return useQuery<TopCarrier[]>({
    queryKey: ['carrier-performance'],
    queryFn: async () => {
      const { data } = await api.get('/carriers/performance')
      return data
    },
  })
}

export function useCarrierExpenses() {
  return useQuery<Expense[]>({
    queryKey: ['carrier-expenses'],
    queryFn: async () => {
      const { data } = await api.get('/carriers/expenses')
      return data
    },
  })
}

/* ───────────────────────── Merchants ───────────────────────── */

export function useMerchants(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['merchants', filters],
    queryFn: async () => {
      const { data } = await api.get('/merchants', { params: filters })
      return data
    },
  })
}

export function useMerchant(id: string) {
  return useQuery<Merchant>({
    queryKey: ['merchant', id],
    queryFn: async () => {
      const { data } = await api.get(`/merchants/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useUpdateMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, merchant }: { id: string; merchant: Partial<Merchant> }) => {
      const { data } = await api.put(`/merchants/${id}`, merchant)
      return data
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
      const { data } = await api.post(`/merchants/${id}/suspend`)
      return data
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
      const { data } = await api.post(`/merchants/${id}/activate`)
      return data
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
      const { data } = await api.get('/payments', { params: filters })
      return data
    },
  })
}

export function usePayment(id: string) {
  return useQuery<Payment>({
    queryKey: ['payment', id],
    queryFn: async () => {
      const { data } = await api.get(`/payments/${id}`)
      return data
    },
    enabled: !!id,
  })
}

/* ───────────────────────── Notifications ───────────────────────── */

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/notifications/${id}/read`)
      return data
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
      const { data } = await api.post('/notifications/read-all')
      return data
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
      const { data } = await api.get('/settings')
      return data
    },
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const { data } = await api.put('/settings', settings)
      return data
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
      const { data } = await api.get(`/reports/${type}`)
      return { type, data }
    },
  })
}

export function useFailedDeliveriesReport() {
  return useQuery({
    queryKey: ['reports', 'failed-deliveries'],
    queryFn: async () => {
      const { data } = await api.get('/reports/failed-deliveries')
      return data
    },
  })
}