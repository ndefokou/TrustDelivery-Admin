import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useRiders, useCreateRider, useUpdateRider, useSuspendRider, useActivateRider, useRiderPerformance, useRiderExpenses, useReviewExpense } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { FloatingActionButton } from '../components/ui/FloatingActionButton'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Plus, Search, Eye, Edit, Ban, CheckCircle, ListChecks, TrendingUp, Receipt } from 'lucide-react'
import { AxiosError } from 'axios'
import { format } from 'date-fns'

const tabs = [
  { id: 'list', label: 'Rider List', icon: ListChecks },
  { id: 'performance', label: 'Rider Performance', icon: TrendingUp },
  { id: 'expenses', label: 'Rider Expenses', icon: Receipt },
]

export default function Riders() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'list'

  const [filters, setFilters] = useState({ status: '', search: '' })
  const [expenseFilters, setExpenseFilters] = useState({ category: '', status: '', search: '' })
  const [perfSearch, setPerfSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newRider, setNewRider] = useState({
    full_name: '',
    phone_number: '',
    national_id: '',
    address: '',
    motorbike_registration: '',
  })
  const [editingRider, setEditingRider] = useState<any>(null)
  const [reviewingExpense, setReviewingExpense] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', admin_notes: '' })

  const { data: ridersData, isLoading: ridersLoading } = useRiders(filters)
  const { data: performance, isLoading: perfLoading } = useRiderPerformance()
  const { data: expenses, isLoading: expensesLoading } = useRiderExpenses()

  const createRider = useCreateRider()
  const updateRider = useUpdateRider()
  const suspendRider = useSuspendRider()
  const activateRider = useActivateRider()
  const reviewExpense = useReviewExpense()

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createRider.mutateAsync(newRider)
      setShowAddModal(false)
      setNewRider({ full_name: '', phone_number: '', national_id: '', address: '', motorbike_registration: '' })
      setError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to create rider'
      setError(message)
    }
  }

  const handleUpdateRider = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingRider) return
    try {
      await updateRider.mutateAsync({
        id: editingRider.id,
        rider: {
          full_name: editingRider.full_name,
          phone_number: editingRider.phone_number,
          address: editingRider.address,
        },
      })
      setShowEditModal(false)
      setEditingRider(null)
      setError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to update rider'
      setError(message)
    }
  }

  const handleReviewExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingExpense) return
    try {
      await reviewExpense.mutateAsync({
        id: reviewingExpense.id,
        status: reviewForm.status,
        admin_notes: reviewForm.admin_notes,
      })
      setShowReviewModal(false)
      setReviewingExpense(null)
      setReviewForm({ status: 'approved', admin_notes: '' })
      setError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to review expense'
      setError(message)
    }
  }

  const riders = ridersData?.riders || []

  const filteredPerformance = (performance || []).filter((r: any) =>
    r.rider_name.toLowerCase().includes(perfSearch.toLowerCase())
  )

  const filteredExpenses = (expenses || []).filter((e: any) => {
    const matchesCategory = expenseFilters.category ? e.category === expenseFilters.category : true
    const matchesStatus = expenseFilters.status ? e.status === expenseFilters.status : true
    const matchesSearch = expenseFilters.search
      ? (e.rider_name?.toLowerCase().includes(expenseFilters.search.toLowerCase()) ||
          e.description.toLowerCase().includes(expenseFilters.search.toLowerCase()))
      : true
    return matchesCategory && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Riders</h1>
        {activeTab === 'list' && (
          <Button onClick={() => setShowAddModal(true)} className="hidden sm:inline-flex">
            <Plus size={16} />
            Add Rider
          </Button>
        )}
      </div>

      {activeTab === 'list' && (
        <FloatingActionButton variant="primary" size="lg" onClick={() => setShowAddModal(true)} className="sm:hidden">
          <Plus size={24} />
        </FloatingActionButton>
      )}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'primary' : 'secondary'}
            onClick={() => {
              if (tab.id === 'list') {
                navigate('/riders')
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

      {activeTab === 'list' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Rider List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full sm:w-40"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
                <option value="suspended">Suspended</option>
              </Select>
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search riders..."
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
                  <Th>Rider</Th>
                  <Th className="hidden sm:table-cell">Phone</Th>
                  <Th>Status</Th>
                  <Th className="hidden md:table-cell">Completed</Th>
                  <Th className="hidden md:table-cell">Failed</Th>
                  <Th className="hidden sm:table-cell">Score</Th>
                  <Th className="hidden md:table-cell">Revenue</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {ridersLoading ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : riders.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8 text-gray-500">
                      No riders found
                    </Td>
                  </Tr>
                ) : (
                  riders.map((rider: any) => (
                    <Tr key={rider.id} className="cursor-pointer" onClick={() => navigate(`/riders/${rider.id}`)}>
                      <Td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {rider.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{rider.full_name}</p>
                            <p className="text-xs text-gray-500 hidden sm:block">{rider.motorbike_registration}</p>
                            <p className="text-xs text-gray-500 sm:hidden">{rider.phone_number}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden sm:table-cell">{rider.phone_number}</Td>
                      <Td><StatusBadge status={rider.status} /></Td>
                      <Td className="hidden md:table-cell">{rider.completed_deliveries}</Td>
                      <Td className="hidden md:table-cell text-danger">{rider.failed_deliveries}</Td>
                      <Td className="hidden sm:table-cell">
                        <span className={`font-medium ${
                          rider.performance_score >= 90 ? 'text-success' :
                          rider.performance_score >= 70 ? 'text-warning' : 'text-danger'
                        }`}>
                          {rider.performance_score.toFixed(1)}%
                        </span>
                      </Td>
                      <Td className="hidden md:table-cell font-medium">{rider.total_revenue.toLocaleString()} FCFA</Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/riders/${rider.id}`) }}>
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingRider(rider); setShowEditModal(true) }} className="hidden sm:flex">
                            <Edit size={14} />
                          </Button>
                          {rider.status === 'suspended' ? (
                            <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); activateRider.mutate(rider.id) }} disabled={activateRider.isPending && activateRider.variables === rider.id}>
                              <CheckCircle size={14} />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => { e.stopPropagation(); suspendRider.mutate(rider.id) }} disabled={suspendRider.isPending && suspendRider.variables === rider.id}>
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

      {activeTab === 'performance' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Rider Performance</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search riders..."
                value={perfSearch}
                onChange={(e) => setPerfSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th className="w-16">Rank</Th>
                  <Th>Rider</Th>
                  <Th className="hidden md:table-cell">Completed</Th>
                  <Th>Success Rate</Th>
                  <Th className="hidden sm:table-cell">Revenue</Th>
                </Tr>
              </Thead>
              <Tbody>
                {perfLoading ? (
                  <Tr>
                    <Td colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : filteredPerformance.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} className="text-center py-8 text-gray-500">
                      No performance data found
                    </Td>
                  </Tr>
                ) : (
                  filteredPerformance.map((rider: any) => (
                    <Tr key={rider.rank}>
                      <Td>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          rider.rank === 1 ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300' :
                          rider.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          rider.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {rider.rank}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {rider.rider_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{rider.rider_name}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden md:table-cell">{rider.deliveries_completed}</Td>
                      <Td>
                        <span className={`font-medium ${
                          rider.success_rate >= 90 ? 'text-success' :
                          rider.success_rate >= 70 ? 'text-warning' : 'text-danger'
                        }`}>
                          {rider.success_rate.toFixed(1)}%
                        </span>
                      </Td>
                      <Td className="hidden sm:table-cell font-medium">{rider.revenue_generated.toLocaleString()} FCFA</Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'expenses' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle>Rider Expenses</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={expenseFilters.category}
                onChange={(e) => setExpenseFilters({ ...expenseFilters, category: e.target.value })}
                className="w-full sm:w-40"
              >
                <option value="">All Categories</option>
                <option value="fuel">Fuel</option>
                <option value="maintenance">Maintenance</option>
                <option value="parking">Parking</option>
                <option value="other">Other</option>
              </Select>
              <Select
                value={expenseFilters.status}
                onChange={(e) => setExpenseFilters({ ...expenseFilters, status: e.target.value })}
                className="w-full sm:w-40"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search expenses..."
                  value={expenseFilters.search}
                  onChange={(e) => setExpenseFilters({ ...expenseFilters, search: e.target.value })}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Rider</Th>
                  <Th>Category</Th>
                  <Th>Amount</Th>
                  <Th className="hidden md:table-cell">Description</Th>
                  <Th>Status</Th>
                  <Th className="hidden sm:table-cell">Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expensesLoading ? (
                  <Tr>
                    <Td colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : filteredExpenses.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} className="text-center py-8 text-gray-500">
                      No expenses found
                    </Td>
                  </Tr>
                ) : (
                  filteredExpenses.map((expense: any) => (
                    <Tr key={expense.id}>
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(expense.rider_name || '?').charAt(0)}
                          </div>
                          <span className="font-medium truncate">{expense.rider_name || 'Unknown'}</span>
                        </div>
                      </Td>
                      <Td className="capitalize">{expense.category}</Td>
                      <Td className="font-medium">{expense.amount.toLocaleString()} FCFA</Td>
                      <Td className="hidden md:table-cell truncate max-w-[200px]">{expense.description}</Td>
                      <Td><StatusBadge status={expense.status} /></Td>
                      <Td className="hidden sm:table-cell">{format(new Date(expense.created_at), 'MMM dd, yyyy')}</Td>
                      <Td>
                        {expense.status === 'pending' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => { setReviewingExpense(expense); setReviewForm({ status: 'approved', admin_notes: '' }); setError(null); setShowReviewModal(true) }}
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setReviewingExpense(null); setError(null) }} title="Review Expense" size="lg">
        {reviewingExpense && (
          <form onSubmit={handleReviewExpense} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Rider</p>
                <p className="font-medium">{reviewingExpense.rider_name || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount</p>
                <p className="font-medium">{reviewingExpense.amount.toLocaleString()} FCFA</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="font-medium">{reviewingExpense.description}</p>
            </div>
            <Select
              label="Decision"
              value={reviewForm.status}
              onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
            >
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
            </Select>
            <Input
              label="Admin Notes (optional)"
              value={reviewForm.admin_notes}
              onChange={(e) => setReviewForm({ ...reviewForm, admin_notes: e.target.value })}
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowReviewModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={reviewExpense.isPending} className="w-full sm:w-auto">
                {reviewExpense.isPending ? 'Saving...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setError(null) }} title="Add New Rider" size="lg">
        <form onSubmit={handleCreateRider} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={newRider.full_name}
              onChange={(e) => setNewRider({ ...newRider, full_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={newRider.phone_number}
              onChange={(e) => setNewRider({ ...newRider, phone_number: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="National ID"
              value={newRider.national_id}
              onChange={(e) => setNewRider({ ...newRider, national_id: e.target.value })}
              required
            />
            <Input
              label="Motorbike Registration"
              value={newRider.motorbike_registration}
              onChange={(e) => setNewRider({ ...newRider, motorbike_registration: e.target.value })}
              required
            />
          </div>
          <Input
            label="Address"
            value={newRider.address}
            onChange={(e) => setNewRider({ ...newRider, address: e.target.value })}
            required
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={createRider.isPending} className="w-full sm:w-auto">
              {createRider.isPending ? 'Creating...' : 'Create Rider'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingRider(null); setError(null) }} title="Edit Rider" size="lg">
        {editingRider && (
          <form onSubmit={handleUpdateRider} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={editingRider.full_name}
                onChange={(e) => setEditingRider({ ...editingRider, full_name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={editingRider.phone_number}
                onChange={(e) => setEditingRider({ ...editingRider, phone_number: e.target.value })}
                required
              />
            </div>
            <Input
              label="Address"
              value={editingRider.address}
              onChange={(e) => setEditingRider({ ...editingRider, address: e.target.value })}
              required
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={updateRider.isPending} className="w-full sm:w-auto">
                {updateRider.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
