import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Modal } from '../components/ui/Modal'
import { Banknote, Search, User, Wallet, CheckCircle, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

interface RiderCollectionSummary {
  rider_id: string
  rider_name: string
  total_collected: number
  total_returned: number
  outstanding_balance: number
  collections_count: number
}

interface CollectionRecord {
  id: string
  rider_id: string
  rider_name: string
  delivery_id: string
  customer_name: string
  amount_collected: number
  amount_returned: number
  collection_status: 'pending' | 'collected' | 'not_collected'
  collected_at: string | null
  returned_at: string | null
  created_at: string
}

const mockRiderSummaries: RiderCollectionSummary[] = [
  { rider_id: '1', rider_name: 'Jean-Pierre Mbarga', total_collected: 125000, total_returned: 50000, outstanding_balance: 75000, collections_count: 5 },
  { rider_id: '2', rider_name: 'Marie Ngono', total_collected: 89500, total_returned: 89500, outstanding_balance: 0, collections_count: 3 },
  { rider_id: '3', rider_name: 'Paul Fotso', total_collected: 250000, total_returned: 120000, outstanding_balance: 130000, collections_count: 8 },
  { rider_id: '4', rider_name: 'Aminata Bello', total_collected: 45000, total_returned: 0, outstanding_balance: 45000, collections_count: 2 },
]

const mockCollectionRecords: CollectionRecord[] = [
  { id: '1', rider_id: '1', rider_name: 'Jean-Pierre Mbarga', delivery_id: 'TRD-1001', customer_name: 'John Doe', amount_collected: 25000, amount_returned: 0, collection_status: 'collected', collected_at: '2024-01-15T14:30:00Z', returned_at: null, created_at: '2024-01-15T14:30:00Z' },
  { id: '2', rider_id: '1', rider_name: 'Jean-Pierre Mbarga', delivery_id: 'TRD-1005', customer_name: 'Jane Smith', amount_collected: 35000, amount_returned: 0, collection_status: 'collected', collected_at: '2024-01-15T16:45:00Z', returned_at: null, created_at: '2024-01-15T16:45:00Z' },
  { id: '3', rider_id: '2', rider_name: 'Marie Ngono', delivery_id: 'TRD-1002', customer_name: 'Paul Kamga', amount_collected: 45000, amount_returned: 45000, collection_status: 'collected', collected_at: '2024-01-15T10:00:00Z', returned_at: '2024-01-15T17:00:00Z', created_at: '2024-01-15T10:00:00Z' },
  { id: '4', rider_id: '3', rider_name: 'Paul Fotso', delivery_id: 'TRD-1003', customer_name: 'Aminata Ngo', amount_collected: 85000, amount_returned: 50000, collection_status: 'collected', collected_at: '2024-01-14T11:30:00Z', returned_at: '2024-01-15T09:00:00Z', created_at: '2024-01-14T11:30:00Z' },
  { id: '5', rider_id: '4', rider_name: 'Aminata Bello', delivery_id: 'TRD-1004', customer_name: 'Robert Mballa', amount_collected: 0, amount_returned: 0, collection_status: 'not_collected', collected_at: null, returned_at: null, created_at: '2024-01-15T13:00:00Z' },
]

export default function RiderCollections() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'summary'
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedRider, setSelectedRider] = useState<RiderCollectionSummary | null>(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnAmount, setReturnAmount] = useState('')
  const [returnNotes, setReturnNotes] = useState('')

  const tabs = [
    { id: 'summary', label: 'Collection Summary', icon: Wallet },
    { id: 'history', label: 'Collection History', icon: Banknote },
  ]

  const filteredSummaries = mockRiderSummaries.filter(rider =>
    rider.rider_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredRecords = mockCollectionRecords.filter(record => {
    const matchesSearch = record.rider_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.delivery_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || record.collection_status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fr-CM') + ' FCFA'
  }

  const handleValidateReturn = () => {
    console.log('Validating return:', { rider: selectedRider?.rider_id, amount: returnAmount, notes: returnNotes })
    setShowReturnModal(false)
    setReturnAmount('')
    setReturnNotes('')
    setSelectedRider(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rider Collections</h1>
          <p className="text-gray-600 mt-1">Track cash-on-delivery collections and rider balances</p>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setSearchParams({ tab: tab.id })}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'summary' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Collected</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(mockRiderSummaries.reduce((sum, r) => sum + r.total_collected, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Returned</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(mockRiderSummaries.reduce((sum, r) => sum + r.total_returned, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Wallet className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Outstanding Balance</p>
                    <p className="text-xl font-bold text-amber-600">
                      {formatCurrency(mockRiderSummaries.reduce((sum, r) => sum + r.outstanding_balance, 0))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Rider Balances</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search riders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Rider</Th>
                    <Th>Total Collected</Th>
                    <Th>Total Returned</Th>
                    <Th>Outstanding</Th>
                    <Th>Collections</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredSummaries.map((rider) => (
                    <Tr key={rider.rider_id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{rider.rider_name}</span>
                        </div>
                      </Td>
                      <Td>
                        <span className="font-medium text-green-600">{formatCurrency(rider.total_collected)}</span>
                      </Td>
                      <Td>
                        <span className="font-medium text-blue-600">{formatCurrency(rider.total_returned)}</span>
                      </Td>
                      <Td>
                        <span className={`font-medium ${rider.outstanding_balance > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                          {formatCurrency(rider.outstanding_balance)}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-gray-600">{rider.collections_count} delivery(ies)</span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => {
                            setSelectedRider(rider)
                            setSearchParams({ tab: 'history', rider: rider.rider_id })
                          }}>
                            View Details
                          </Button>
                          {rider.outstanding_balance > 0 && (
                            <Button 
                              size="sm" 
                              onClick={() => {
                                setSelectedRider(rider)
                                setReturnAmount(rider.outstanding_balance.toString())
                                setShowReturnModal(true)
                              }}
                            >
                              Record Return
                            </Button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Collection Records</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-full"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="collected">Collected</option>
                  <option value="not_collected">Not Collected</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Delivery ID</Th>
                  <Th>Rider</Th>
                  <Th>Customer</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Returned</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredRecords.map((record) => (
                  <Tr key={record.id}>
                    <Td>
                      <span className="font-mono text-sm text-primary-600">{record.delivery_id}</span>
                    </Td>
                    <Td>
                      <span className="font-medium text-gray-900">{record.rider_name}</span>
                    </Td>
                    <Td>
                      <span className="text-gray-600">{record.customer_name}</span>
                    </Td>
                    <Td>
                      <span className="font-medium text-gray-900">{formatCurrency(record.amount_collected)}</span>
                    </Td>
                    <Td>
                      {record.collection_status === 'collected' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Collected</span>
                      )}
                      {record.collection_status === 'not_collected' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Not Collected</span>
                      )}
                      {record.collection_status === 'pending' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                      )}
                    </Td>
                    <Td>
                      {record.amount_returned > 0 ? (
                        <span className="text-blue-600 font-medium">{formatCurrency(record.amount_returned)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </Td>
                    <Td>
                      <span className="text-gray-500 text-sm">
                        {format(new Date(record.created_at), 'dd MMM yyyy HH:mm')}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showReturnModal}
        onClose={() => {
          setShowReturnModal(false)
          setSelectedRider(null)
          setReturnAmount('')
          setReturnNotes('')
        }}
        title="Record Money Return"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Rider</p>
            <p className="font-medium text-gray-900">{selectedRider?.rider_name}</p>
            <p className="text-sm text-gray-600 mt-2">Outstanding Balance</p>
            <p className="font-bold text-amber-600 text-lg">{formatCurrency(selectedRider?.outstanding_balance || 0)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Received (FCFA)
            </label>
            <Input
              type="number"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
              placeholder="Enter amount"
              max={selectedRider?.outstanding_balance}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowReturnModal(false)
                setSelectedRider(null)
                setReturnAmount('')
                setReturnNotes('')
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleValidateReturn}
              disabled={!returnAmount || parseInt(returnAmount) <= 0}
            >
              Validate Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}