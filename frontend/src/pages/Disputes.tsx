import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { AlertTriangle, Eye, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface Dispute {
  id: string
  deliveryId: string
  merchantName: string
  carrierName: string
  issue: string
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  merchantComplaint: string
  carrierResponse?: string
  resolution?: string
}

const mockDisputes: Dispute[] = [
  {
    id: '1',
    deliveryId: 'TD-123',
    merchantName: 'QuickShop Yaoundé',
    carrierName: 'FastExpress',
    issue: 'Late delivery',
    status: 'pending',
    priority: 'high',
    createdAt: new Date('2024-01-15'),
    merchantComplaint: 'Package was delivered 3 hours late, customer was very upset and demanded refund.',
    carrierResponse: 'Traffic jam on the route, not my fault.',
  },
  {
    id: '2',
    deliveryId: 'TD-456',
    merchantName: 'Fashion Plus',
    carrierName: 'CityRunner',
    issue: 'Lost package',
    status: 'investigating',
    priority: 'high',
    createdAt: new Date('2024-01-14'),
    merchantComplaint: 'Customer never received the package. Tracking shows delivered but customer denies.',
    carrierResponse: 'Package was delivered to the address provided. Have delivery photo as proof.',
  },
  {
    id: '3',
    deliveryId: 'TD-789',
    merchantName: 'TechStore',
    carrierName: 'QuickDel',
    issue: 'Damaged goods',
    status: 'resolved',
    priority: 'medium',
    createdAt: new Date('2024-01-13'),
    merchantComplaint: 'Electronics arrived damaged, screen cracked.',
    carrierResponse: 'I drove carefully, the package was not properly protected.',
    resolution: 'Carrier partially at fault. Merchant to share repair costs. Carrier score adjusted.',
  },
  {
    id: '4',
    deliveryId: 'TD-101',
    merchantName: 'FoodMart',
    carrierName: 'RapidTrans',
    issue: 'Wrong address',
    status: 'dismissed',
    priority: 'low',
    createdAt: new Date('2024-01-12'),
    merchantComplaint: 'Package delivered to wrong house.',
    carrierResponse: 'I delivered to the exact address provided by merchant.',
    resolution: 'Merchant provided incorrect address. Dismissed.',
  },
]

export default function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolution, setResolution] = useState('')

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter && d.status !== statusFilter) return false
    if (priorityFilter && d.priority !== priorityFilter) return false
    return true
  })

  const handleResolve = () => {
    if (!selectedDispute) return
    setDisputes(disputes.map(d => d.id === selectedDispute.id ? { ...d, status: 'resolved', resolution } : d))
    setShowResolveModal(false)
    setSelectedDispute(null)
    setResolution('')
  }

  const handleDismiss = () => {
    if (!selectedDispute) return
    setDisputes(disputes.map(d => d.id === selectedDispute.id ? { ...d, status: 'dismissed', resolution } : d))
    setShowResolveModal(false)
    setSelectedDispute(null)
    setResolution('')
  }

  const getStatusBadge = (status: Dispute['status']) => {
    const variants: Record<Dispute['status'], 'danger' | 'warning' | 'success' | 'default'> = {
      pending: 'danger',
      investigating: 'warning',
      resolved: 'success',
      dismissed: 'default',
    }
    const labels: Record<Dispute['status'], string> = {
      pending: 'Pending',
      investigating: 'Investigating',
      resolved: 'Resolved',
      dismissed: 'Dismissed',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getPriorityBadge = (priority: Dispute['priority']) => {
    const colors: Record<Dispute['priority'], string> = {
      low: 'text-gray-600 dark:text-gray-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-red-600 dark:text-red-400',
    }
    return <span className={`font-medium ${colors[priority]}`}>{priority.toUpperCase()}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">Handle delivery disputes and exceptions</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 dark:bg-red-900 rounded-lg">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'pending').length}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
              <Eye className="text-yellow-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'investigating').length}</p>
              <p className="text-sm text-gray-500">Investigating</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'resolved').length}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <XCircle className="text-gray-500" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'dismissed').length}</p>
              <p className="text-sm text-gray-500">Dismissed</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle>All Disputes</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-40"
            >
              <option value="">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Issue</Th>
                <Th className="hidden sm:table-cell">Merchant</Th>
                <Th className="hidden sm:table-cell">Carrier</Th>
                <Th>Priority</Th>
                <Th>Status</Th>
                <Th className="hidden md:table-cell">Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDisputes.map((dispute) => (
                <Tr key={dispute.id}>
                  <Td className="font-mono text-xs">{dispute.deliveryId}</Td>
                  <Td className="font-medium">{dispute.issue}</Td>
                  <Td className="hidden sm:table-cell">{dispute.merchantName}</Td>
                  <Td className="hidden sm:table-cell">{dispute.carrierName}</Td>
                  <Td>{getPriorityBadge(dispute.priority)}</Td>
                  <Td>{getStatusBadge(dispute.status)}</Td>
                  <Td className="hidden md:table-cell">{format(dispute.createdAt, 'MMM dd, yyyy')}</Td>
                  <Td>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setSelectedDispute(dispute); setShowDetailModal(true) }}
                    >
                      <Eye size={14} />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedDispute(null) }}
        title={`Dispute ${selectedDispute?.deliveryId || ''}`}
        size="lg"
      >
        {selectedDispute && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPriorityBadge(selectedDispute.priority)}
                {getStatusBadge(selectedDispute.status)}
              </div>
              <span className="text-sm text-gray-500">{format(selectedDispute.createdAt, 'MMM dd, yyyy')}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Merchant</p>
                <p className="font-medium">{selectedDispute.merchantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carrier</p>
                <p className="font-medium">{selectedDispute.carrierName}</p>
              </div>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="text-red-500" />
                <h4 className="font-medium text-red-800 dark:text-red-200">Merchant Complaint</h4>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{selectedDispute.merchantComplaint}</p>
            </div>

            {selectedDispute.carrierResponse && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={18} className="text-blue-500" />
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">Carrier Response</h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">{selectedDispute.carrierResponse}</p>
              </div>
            )}

            {selectedDispute.resolution && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={18} className="text-green-500" />
                  <h4 className="font-medium text-green-800 dark:text-green-200">Resolution</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">{selectedDispute.resolution}</p>
              </div>
            )}

            {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'dismissed' && (
              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="primary"
                  onClick={() => {
                    setDisputes(disputes.map(d => d.id === selectedDispute.id ? { ...d, status: 'investigating' } : d))
                    setSelectedDispute({ ...selectedDispute, status: 'investigating' })
                  }}
                >
                  <Eye size={16} className="mr-1" />
                  Investigate
                </Button>
                <Button
                  variant="success"
                  onClick={() => { setShowDetailModal(false); setShowResolveModal(true) }}
                >
                  <CheckCircle size={16} className="mr-1" />
                  Resolve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { setShowDetailModal(false); setShowResolveModal(true) }}
                >
                  <XCircle size={16} className="mr-1" />
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showResolveModal}
        onClose={() => { setShowResolveModal(false); setSelectedDispute(null); setResolution('') }}
        title="Resolve Dispute"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Resolution Notes</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 min-h-[100px]"
              placeholder="Describe the resolution or reason for dismissal..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => { setShowResolveModal(false); setResolution('') }}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleResolve}>
              Mark Resolved
            </Button>
            <Button className="bg-gray-500 hover:bg-gray-600" onClick={handleDismiss}>
              Dismiss Dispute
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}