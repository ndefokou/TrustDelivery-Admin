import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDeliveries } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Eye, UserPlus, Search, Printer } from 'lucide-react'
import { format } from 'date-fns'

export default function Deliveries() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    date_from: '',
    date_to: '',
    merchant: '',
    rider: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)

  const { data: deliveries, isLoading } = useDeliveries(filters)

  const handleView = (id: string) => {
    navigate(`/deliveries/${id}`)
  }

  const handleAssign = () => {
    setShowAssignModal(true)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Deliveries</h1>
        <Button onClick={() => setShowFilters(!showFilters)}>
          Search
        </Button>
      </div>

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
                  <Td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </Td>
                </Tr>
              ) : deliveries?.deliveries?.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8 text-gray-500">
                    No deliveries found
                  </Td>
                </Tr>
              ) : (
                deliveries?.deliveries?.map((delivery: any) => (
                  <Tr key={delivery.id}>
                    <Td className="font-mono text-xs">{delivery.id.slice(0, 8)}</Td>
                    <Td className="hidden sm:table-cell">{delivery.product_description.slice(0, 30)}...</Td>
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
                        {delivery.status === 'awaiting_assignment' && (
                          <Button size="sm" variant="primary" onClick={handleAssign}>
                            <UserPlus size={14} />
                          </Button>
                        )}
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
                <Button variant="secondary" size="sm">Previous</Button>
                <Button variant="secondary" size="sm">Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Rider"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select a rider to assign to this delivery.
          </p>
          <Select label="Select Rider">
            <option value="">Choose a rider...</option>
            <option value="rider-1">Jean-Baptiste Mba</option>
            <option value="rider-2">Pierre Nkongo</option>
            <option value="rider-3">Marie Atangana</option>
          </Select>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button>Assign Rider</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}