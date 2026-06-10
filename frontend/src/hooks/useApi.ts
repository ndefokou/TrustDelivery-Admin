import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Delivery, Rider, Merchant, Notification, DashboardData, Settings } from '../types'

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard')
      return data
    },
  })
}

export function useDeliveries(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['deliveries', filters],
    queryFn: async () => {
      const { data } = await api.get('/deliveries', { params: filters })
      return data
    },
  })
}

export function useDelivery(id: string) {
  return useQuery<Delivery>({
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

export function useAssignRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ deliveryId, riderId }: { deliveryId: string; riderId: string }) => {
      const { data } = await api.post(`/deliveries/${deliveryId}/assign`, { rider_id: riderId })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
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
      queryClient.invalidateQueries({ queryKey: ['deliveries'] })
    },
  })
}

export function useRiders(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['riders', filters],
    queryFn: async () => {
      const { data } = await api.get('/riders', { params: filters })
      return data
    },
  })
}

export function useRider(id: string) {
  return useQuery<Rider>({
    queryKey: ['rider', id],
    queryFn: async () => {
      const { data } = await api.get(`/riders/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rider: Partial<Rider>) => {
      const { data } = await api.post('/riders', rider)
      return data
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
      const { data } = await api.put(`/riders/${id}`, rider)
      return data
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
      const { data } = await api.post(`/riders/${id}/suspend`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
  })
}

export function useActivateRider() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/riders/${id}/activate`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['riders'] })
    },
  })
}

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

export function usePayments(filters?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/payments', { params: filters })
      return data
    },
  })
}

export function useNotifications() {
  return useQuery<{ notifications: Notification[]; unread_count: number }>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data
    },
  })
}

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

export function useReports(type: 'daily' | 'weekly' | 'monthly' | 'revenue') {
  return useQuery({
    queryKey: ['reports', type],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${type}`)
      return data
    },
  })
}