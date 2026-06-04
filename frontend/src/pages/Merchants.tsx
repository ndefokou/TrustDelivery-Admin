import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMerchants } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Search, Eye, Edit, Ban, Store, Package, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export default function Merchants() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ status: '', search: '' })

  const { data: merchants, isLoading } = useMerchants(filters)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Merchants</h1>
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
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Deliveries</Th>
                <Th>Revenue</Th>
                <Th>Active</Th>
                <Th>Joined</Th>
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
              ) : merchants?.merchants?.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8 text-gray-500">
                    No merchants found
                  </Td>
                </Tr>
              ) : (
                merchants?.merchants?.map((merchant: any) => (
                  <Tr key={merchant.id} className="cursor-pointer" onClick={() => navigate(`/merchants/${merchant.id}`)}>
                    <Td>
                      <div>
                        <p className="font-medium">{merchant.business_name}</p>
                        <p className="text-xs text-gray-500">{merchant.owner_name}</p>
                      </div>
                    </Td>
                    <Td>
                      <div>
                        <p className="text-sm">{merchant.email}</p>
                        <p className="text-xs text-gray-500">{merchant.phone_number}</p>
                      </div>
                    </Td>
                    <Td><StatusBadge status={merchant.status} /></Td>
                    <Td>{merchant.total_deliveries}</Td>
                    <Td className="font-medium">{merchant.total_revenue.toLocaleString()} FCFA</Td>
                    <Td>
                      <span className="text-secondary">{merchant.active_deliveries}</span>
                    </Td>
                    <Td>{format(new Date(merchant.created_at), 'MMM dd, yyyy')}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/merchants/${merchant.id}`) }}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                          <Edit size={14} />
                        </Button>
                        {merchant.status !== 'suspended' && (
                          <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => e.stopPropagation()}>
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
    </div>
  )
}