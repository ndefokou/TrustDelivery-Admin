import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMerchants, useUpdateMerchant, useSuspendMerchant } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Search, Eye, Edit, Ban, Store, Package, DollarSign, TrendingUp, ListChecks } from 'lucide-react'
import { format } from 'date-fns'

const tabs = [
  { id: 'list', label: 'Merchant List', icon: ListChecks },
  { id: 'activity', label: 'Merchant Activity', icon: TrendingUp },
]

export default function Merchants() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'list'

  const [filters, setFilters] = useState({ status: '', search: '' })
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMerchant, setEditingMerchant] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: merchants, isLoading } = useMerchants(filters)
  const updateMerchant = useUpdateMerchant()
  const suspendMerchant = useSuspendMerchant()

  const handleUpdateMerchant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMerchant) return
    try {
      await updateMerchant.mutateAsync({
        id: editingMerchant.id,
        merchant: {
          business_name: editingMerchant.business_name,
          owner_name: editingMerchant.owner_name,
          email: editingMerchant.email,
          phone_number: editingMerchant.phone_number,
          address: editingMerchant.address,
        },
      })
      setShowEditModal(false)
      setEditingMerchant(null)
      setError(null)
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to update merchant'
      setError(message)
    }
  }

  const listData = merchants?.merchants || []
  const activityData = [...listData].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Merchants</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => {
              if (tab.id === 'list') {
                navigate('/merchants')
              } else {
                setSearchParams({ tab: tab.id })
              }
            }}
            size="sm"
          >
            <tab.icon size={16} />
            {tab.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <Store className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{merchants?.merchants?.filter((m: any) => m.status === 'active').length || 0}</p>
              <p className="text-sm text-gray-500">Active Merchants</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-50 dark:bg-success-900 rounded-lg">
              <Package className="text-success" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">
                {merchants?.merchants?.reduce((acc: number, m: any) => acc + m.total_deliveries, 0) || 0}
              </p>
              <p className="text-sm text-gray-500">Total Deliveries</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <DollarSign className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">
                {((merchants?.merchants?.reduce((acc: number, m: any) => acc + m.total_revenue, 0) || 0) / 1000000).toFixed(2)}M
              </p>
              <p className="text-sm text-gray-500">Total Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {activeTab === 'list' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Merchant List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full sm:w-40"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </Select>
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search merchants..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Business</Th>
                  <Th className="hidden sm:table-cell">Contact</Th>
                  <Th>Status</Th>
                  <Th className="hidden md:table-cell">Deliveries</Th>
                  <Th className="hidden md:table-cell">Revenue</Th>
                  <Th className="hidden sm:table-cell">Active</Th>
                  <Th className="hidden lg:table-cell">Joined</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : listData.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8 text-gray-500">
                      No merchants found
                    </Td>
                  </Tr>
                ) : (
                  listData.map((merchant: any) => (
                    <Tr key={merchant.id} className="cursor-pointer" onClick={() => navigate(`/merchants/${merchant.id}`)}>
                      <Td>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{merchant.business_name}</p>
                          <p className="text-xs text-gray-500 truncate">{merchant.owner_name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{merchant.email}</p>
                        </div>
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <div>
                          <p className="text-sm truncate max-w-[200px]">{merchant.email}</p>
                          <p className="text-xs text-gray-500">{merchant.phone_number}</p>
                        </div>
                      </Td>
                      <Td><StatusBadge status={merchant.status} /></Td>
                      <Td className="hidden md:table-cell">{merchant.total_deliveries}</Td>
                      <Td className="hidden md:table-cell font-medium">{merchant.total_revenue.toLocaleString()} FCFA</Td>
                      <Td className="hidden sm:table-cell">
                        <span className="text-secondary">{merchant.active_deliveries}</span>
                      </Td>
                      <Td className="hidden lg:table-cell">{format(new Date(merchant.created_at), 'MMM dd, yyyy')}</Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/merchants/${merchant.id}`) }}>
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingMerchant(merchant); setShowEditModal(true) }} className="hidden sm:flex">
                            <Edit size={14} />
                          </Button>
                          {merchant.status !== 'suspended' && (
                            <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => { e.stopPropagation(); suspendMerchant.mutate(merchant.id) }} disabled={suspendMerchant.isPending}>
                              <Ban size={14} />
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Merchant Activity</CardTitle>
            <div className="relative flex-1 sm:flex-initial">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search merchants..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Business</Th>
                  <Th className="hidden sm:table-cell">Owner</Th>
                  <Th className="text-right">Total Deliveries</Th>
                  <Th className="text-right hidden md:table-cell">Active</Th>
                  <Th className="text-right hidden md:table-cell">Revenue</Th>
                  <Th>Status</Th>
                  <Th className="hidden sm:table-cell">Joined</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr>
                    <Td colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : activityData.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} className="text-center py-8 text-gray-500">
                      No activity data found
                    </Td>
                  </Tr>
                ) : (
                  activityData.map((merchant: any) => (
                    <Tr key={merchant.id} className="cursor-pointer" onClick={() => navigate(`/merchants/${merchant.id}`)}>
                      <Td>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{merchant.business_name}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{merchant.total_deliveries} deliveries</p>
                        </div>
                      </Td>
                      <Td className="hidden sm:table-cell">
                        <p className="text-sm truncate max-w-[200px]">{merchant.owner_name}</p>
                      </Td>
                      <Td className="text-right font-medium">{merchant.total_deliveries}</Td>
                      <Td className="text-right hidden md:table-cell">
                        <span className="text-secondary">{merchant.active_deliveries}</span>
                      </Td>
                      <Td className="text-right hidden md:table-cell font-medium">{merchant.total_revenue.toLocaleString()} FCFA</Td>
                      <Td><StatusBadge status={merchant.status} /></Td>
                      <Td className="hidden sm:table-cell">{format(new Date(merchant.created_at), 'MMM dd, yyyy')}</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingMerchant(null); setError(null) }} title="Edit Merchant" size="lg">
        {editingMerchant && (
          <form onSubmit={handleUpdateMerchant} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Business Name"
                value={editingMerchant.business_name}
                onChange={(e) => setEditingMerchant({ ...editingMerchant, business_name: e.target.value })}
                required
              />
              <Input
                label="Owner Name"
                value={editingMerchant.owner_name}
                onChange={(e) => setEditingMerchant({ ...editingMerchant, owner_name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={editingMerchant.email}
                onChange={(e) => setEditingMerchant({ ...editingMerchant, email: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={editingMerchant.phone_number}
                onChange={(e) => setEditingMerchant({ ...editingMerchant, phone_number: e.target.value })}
                required
              />
            </div>
            <Input
              label="Address"
              value={editingMerchant.address}
              onChange={(e) => setEditingMerchant({ ...editingMerchant, address: e.target.value })}
              required
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={updateMerchant.isPending} className="w-full sm:w-auto">
                {updateMerchant.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
