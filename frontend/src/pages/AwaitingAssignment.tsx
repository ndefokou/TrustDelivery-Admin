import { useState } from 'react'
import { useAwaitingDeliveries, useRiders, useAssignRider, useMerchants } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FloatingActionButton } from '../components/ui/FloatingActionButton'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { UserPlus, Clock, AlertTriangle } from 'lucide-react'

export default function AwaitingAssignment() {
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null)
  const [selectedRider, setSelectedRider] = useState('')

  const { data: deliveries, isLoading, error: deliveriesError } = useAwaitingDeliveries()
  const { data: riders } = useRiders()
  const { data: merchantsData } = useMerchants()
  const assignRider = useAssignRider()

  const getMerchantName = (merchantId: string) => {
    const merchant = merchantsData?.merchants?.find((m: any) => m.id === merchantId)
    return merchant?.business_name || 'Merchant Name'
  }

  const handleSelectDelivery = (id: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (deliveries && deliveries.length === selectedDeliveries.length) {
      setSelectedDeliveries([])
    } else if (deliveries) {
      setSelectedDeliveries(deliveries.map((d: any) => d.id))
    }
  }

  const handleOpenAssign = (deliveryId: string) => {
    setSelectedDelivery(deliveryId)
    setShowAssignModal(true)
  }

  const handleAssign = async () => {
    if (!selectedRider || (!selectedDelivery && selectedDeliveries.length === 0)) return

    try {
      if (selectedDelivery) {
        await assignRider.mutateAsync({ deliveryId: selectedDelivery, riderId: selectedRider })
      } else {
        for (const deliveryId of selectedDeliveries) {
          await assignRider.mutateAsync({ deliveryId, riderId: selectedRider })
        }
      }
      setShowAssignModal(false)
      setSelectedDelivery(null)
      setSelectedDeliveries([])
      setSelectedRider('')
    } catch (error) {
      console.error('Failed to assign rider:', error)
    }
  }

  const handleBulkAssign = () => {
    if (selectedDeliveries.length === 0) return
    setShowAssignModal(true)
  }

  const avgWaitingTime = (deliveries?.reduce((acc: number, d: any) => {
    const waitTime = (new Date().getTime() - new Date(d.created_at).getTime()) / (1000 * 60)
    return acc + waitTime
  }, 0) || 0) / (deliveries?.length || 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Awaiting Assignment</h1>
          <p className="text-sm text-gray-500 mt-1">
            {deliveries?.length || 0} deliveries waiting for rider assignment
          </p>
        </div>
        <div className="hidden sm:block">
          {selectedDeliveries.length > 0 && (
            <Button onClick={handleBulkAssign}>
              <UserPlus size={16} />
              Assign {selectedDeliveries.length} Deliveries
            </Button>
          )}
        </div>
      </div>

      {deliveriesError && (
        <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
          {(deliveriesError as any)?.response?.data?.error || 'Failed to load deliveries. Check backend logs.'}
        </div>
      )}

      <FloatingActionButton
        variant="primary"
        size="lg"
        onClick={handleBulkAssign}
        className={`sm:hidden ${selectedDeliveries.length === 0 ? 'hidden' : ''}`}
      >
        <UserPlus size={24} />
      </FloatingActionButton>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{deliveries?.length || 0}</p>
              <p className="text-sm text-gray-500">Pending Assignments</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-danger-50 dark:bg-danger-900 rounded-lg">
              <AlertTriangle className="text-danger" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">
                {deliveries?.filter((d: any) => 
                  (new Date().getTime() - new Date(d.created_at).getTime()) > 30 * 60 * 1000
                ).length || 0}
              </p>
              <p className="text-sm text-gray-500">Over 30 mins</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <Clock className="text-secondary" size={24} />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{avgWaitingTime?.toFixed(0) || 0} min</p>
              <p className="text-sm text-gray-500">Avg Wait Time</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    checked={deliveries?.length === selectedDeliveries.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </Th>
                <Th>ID</Th>
                <Th className="hidden sm:table-cell">Merchant</Th>
                <Th>Customer</Th>
                <Th className="hidden md:table-cell">Address</Th>
                <Th>Price</Th>
                <Th>Waiting</Th>
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
              ) : deliveries?.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8 text-gray-500">
                    No deliveries awaiting assignment
                  </Td>
                </Tr>
              ) : (
                deliveries?.map((delivery: any) => {
                  const waitingMinutes = Math.floor(
                    (new Date().getTime() - new Date(delivery.created_at).getTime()) / (1000 * 60)
                  )
                  const isUrgent = waitingMinutes > 30

                  return (
                    <Tr key={delivery.id} className={isUrgent ? 'bg-danger-50 dark:bg-danger-900/20' : ''}>
                      <Td>
                        <input
                          type="checkbox"
                          checked={selectedDeliveries.includes(delivery.id)}
                          onChange={() => handleSelectDelivery(delivery.id)}
                          className="rounded"
                        />
                      </Td>
                      <Td className="font-mono text-xs">{delivery.id.slice(0, 8)}</Td>
                      <Td className="hidden sm:table-cell">
                        <p className="font-medium truncate max-w-[150px]">{getMerchantName(delivery.merchant_id)}</p>
                      </Td>
                      <Td>
                        <p className="font-medium truncate max-w-[150px]">{delivery.customer_name}</p>
                        <p className="text-xs text-gray-500">{delivery.customer_phone}</p>
                      </Td>
                      <Td className="hidden md:table-cell max-w-[200px] truncate">{delivery.delivery_address}</Td>
                      <Td>
                        <Badge variant={isUrgent ? 'danger' : 'primary'} size="sm">{delivery.delivery_cost.toLocaleString()} FCFA</Badge>
                      </Td>
                      <Td>
                        <Badge variant={isUrgent ? 'danger' : 'default'} size="sm">{waitingMinutes} min</Badge>
                      </Td>
                      <Td>
                        <Button size="sm" onClick={() => handleOpenAssign(delivery.id)}>
                          <UserPlus size={14} className="hidden sm:block" />
                          <span className="sm:hidden">Assign</span>
                          <span className="hidden sm:inline">Assign</span>
                        </Button>
                      </Td>
                    </Tr>
                  )
                })
              )}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedDelivery(null)
          setSelectedRider('')
        }}
        title="Assign Rider"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select a rider to assign to {selectedDeliveries.length > 0 ? `${selectedDeliveries.length} deliveries` : 'this delivery'}.
          </p>
          <Select
            label="Select Rider"
            value={selectedRider}
            onChange={(e) => setSelectedRider(e.target.value)}
          >
            <option value="">Choose a rider...</option>
            {riders?.riders?.filter((r: any) => r.status === 'active').map((rider: any) => (
              <option key={rider.id} value={rider.id}>
                {rider.full_name} - {rider.completed_deliveries} completed
              </option>
            ))}
          </Select>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!selectedRider || assignRider.isPending}>
              {assignRider.isPending ? 'Assigning...' : 'Assign Rider'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}