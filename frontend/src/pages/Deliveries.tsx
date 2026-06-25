import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDeliveries, useMerchants } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Eye, Search, Printer } from 'lucide-react'
import { format } from 'date-fns'

export default function Deliveries() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: '',
    date_from: '',
    date_to: '',
    merchant: '',
    page: 1,
    per_page: 20,
  })

  useEffect(() => {
    const status = searchParams.get('status') || ''
    setFilters((prev) => (prev.status === status ? prev : { ...prev, status, page: 1 }))
  }, [searchParams])
  const [showFilters, setShowFilters] = useState(false)

  const { data: deliveries, isLoading, error: deliveriesError } = useDeliveries(filters)
  const { data: merchantsData } = useMerchants()

  const getMerchantName = (merchantId: string) => {
    const merchant = merchantsData?.merchants?.find((m: any) => m.id === merchantId)
    return merchant?.business_name || '—'
  }

  const handleView = (id: string) => {
    navigate(`/deliveries/${id}`)
  }

  const handlePrevPage = () => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
  const handleNextPage = () => {
    if (deliveries && deliveries.total > filters.page * filters.per_page) {
      setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
          <p className="text-sm text-gray-500 mt-1">Read-only monitoring view</p>
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <Search size={16} />
          Search
        </Button>
      </div>

      {deliveriesError && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
          {(deliveriesError as any)?.response?.data?.error || 'Failed to load deliveries. Check backend logs.'}
        </div>
      )}

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">All Status</option>
                <option value="awaiting_assignment">Awaiting Assignment</option>
                <option value="assigned">Assigned</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </Select>

              <Input
                type="date"
                label="From Date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />

              <Input
                type="date"
                label="To Date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />

              <Input
                type="text"
                label="Merchant"
                placeholder="Merchant name"
                value={filters.merchant}
                onChange={(e) => setFilters({ ...filters, merchant: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>All Deliveries</CardTitle>
          <form className="flex gap-2 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search by ID, phone, customer..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 sm:w-64"
            />
            <Button type="submit" variant="secondary">
              <Search size={16} />
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th className="hidden sm:table-cell">Product</Th>
                <Th className="hidden sm:table-cell">Merchant</Th>
                <Th>Customer</Th>
                <Th className="hidden md:table-cell">Address</Th>
                <Th>Cost</Th>
                <Th>Status</Th>
                <Th className="hidden sm:table-cell">Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </Td>
                </Tr>
              ) : deliveries?.deliveries?.length === 0 ? (
                <Tr>
                  <Td colSpan={9} className="text-center py-8 text-gray-500">
                    No deliveries found
                  </Td>
                </Tr>
              ) : (
                deliveries?.deliveries?.map((delivery: any) => (
                  <Tr key={delivery.id}>
                    <Td className="font-mono text-xs">{delivery.id.slice(0, 8)}</Td>
                    <Td className="hidden sm:table-cell">{delivery.product_description.slice(0, 30)}...</Td>
                    <Td className="hidden sm:table-cell">
                      <p className="font-medium truncate max-w-[150px]">{getMerchantName(delivery.merchant_id)}</p>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-medium">{delivery.customer_name}</p>
                        <p className="text-xs text-gray-500">{delivery.customer_phone}</p>
                      </div>
                    </Td>
                    <Td className="hidden md:table-cell">{delivery.delivery_address}</Td>
                    <Td className="font-medium">{delivery.delivery_cost.toLocaleString()} FCFA</Td>
                    <Td><StatusBadge status={delivery.status} /></Td>
                    <Td className="hidden sm:table-cell">{format(new Date(delivery.created_at), 'MMM dd, yyyy HH:mm')}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleView(delivery.id)}>
                          <Eye size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handlePrint} className="hidden sm:flex">
                          <Printer size={14} />
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          {deliveries && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-primary-700">
              <p className="text-sm text-gray-500">
                Showing {deliveries.deliveries?.length || 0} of {deliveries.total || 0} deliveries
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handlePrevPage} disabled={filters.page <= 1}>Previous</Button>
                <Button variant="secondary" size="sm" onClick={handleNextPage} disabled={!deliveries || deliveries.total <= filters.page * filters.per_page}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}