import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useCarriers, useCreateCarrier, useUpdateCarrier, useSuspendCarrier, useActivateCarrier, useCarrierPerformance, useCarrierExpenses, useReviewExpense } from '../hooks/useApi'
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

interface CreateCarrierFormData {
  company_name: string
  phone: string
  email: string
  password: string
  address: string
}

const tabs = [
  { id: 'list', label: 'Carrier List', icon: ListChecks },
  { id: 'performance', label: 'Carrier Performance', icon: TrendingUp },
  { id: 'expenses', label: 'Carrier Expenses', icon: Receipt },
]

export default function Carriers() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'list'

  const [filters, setFilters] = useState({ status: '', search: '' })
  const [expenseFilters, setExpenseFilters] = useState({ category: '', status: '', search: '' })
  const [perfSearch, setPerfSearch] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
  const [createdCarrierEmail, setCreatedCarrierEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [newCarrier, setNewCarrier] = useState<CreateCarrierFormData>({
    company_name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  })
  const [editingCarrier, setEditingCarrier] = useState<any>(null)
  const [reviewingExpense, setReviewingExpense] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ status: 'approved', admin_notes: '' })

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZabcdefghjkmnprstuvwxyz23456789'
    let password = ''
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const { data: carriersData, isLoading: carriersLoading } = useCarriers(filters)
  const { data: performance, isLoading: perfLoading } = useCarrierPerformance()
  const { data: expenses, isLoading: expensesLoading } = useCarrierExpenses()

  const createCarrier = useCreateCarrier()
  const updateCarrier = useUpdateCarrier()
  const suspendCarrier = useSuspendCarrier()
  const activateCarrier = useActivateCarrier()
  const reviewExpense = useReviewExpense()

  const handleCreateCarrier = async (e: React.FormEvent) => {
    e.preventDefault()
    const password = newCarrier.password || generatePassword()
    try {
      await createCarrier.mutateAsync({
        company_name: newCarrier.company_name,
        phone: newCarrier.phone,
        email: newCarrier.email,
        password: password,
        address: newCarrier.address || undefined,
      } as any)
      setCreatedCarrierEmail(newCarrier.email)
      setGeneratedPassword(password)
      setShowAddModal(false)
      setShowPasswordModal(true)
      setNewCarrier({ company_name: '', phone: '', email: '', password: '', address: '' })
      setError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to create carrier'
      setError(message)
    }
  }

  const handleUpdateCarrier = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCarrier) return
    try {
      await updateCarrier.mutateAsync({
        id: editingCarrier.id,
        carrier: {
          company_name: editingCarrier.company_name,
          phone: editingCarrier.phone,
          address: editingCarrier.address,
        },
      })
      setShowEditModal(false)
      setEditingCarrier(null)
      setError(null)
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>
      const message = axiosError.response?.data?.error || 'Failed to update carrier'
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

  const carriers = carriersData?.carriers || []

  const filteredPerformance = (performance || []).filter((r: any) =>
    r.carrier_name.toLowerCase().includes(perfSearch.toLowerCase())
  )

  const filteredExpenses = (expenses || []).filter((e: any) => {
    const matchesCategory = expenseFilters.category ? e.category === expenseFilters.category : true
    const matchesStatus = expenseFilters.status ? e.status === expenseFilters.status : true
    const matchesSearch = expenseFilters.search
      ? (e.carrier_name?.toLowerCase().includes(expenseFilters.search.toLowerCase()) ||
          e.description.toLowerCase().includes(expenseFilters.search.toLowerCase()))
      : true
    return matchesCategory && matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Carriers</h1>
        {activeTab === 'list' && (
          <Button onClick={() => setShowAddModal(true)} className="hidden sm:inline-flex">
            <Plus size={16} />
            Add Carrier
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
                navigate('/carriers')
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
            <CardTitle>Carrier List</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full sm:w-40"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
              <div className="relative flex-1 sm:flex-initial">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search carriers..."
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
                  <Th>Carrier</Th>
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
                {carriersLoading ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                      </div>
                    </Td>
                  </Tr>
                ) : carriers.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} className="text-center py-8 text-gray-500">
                      No carriers found
                    </Td>
                  </Tr>
                ) : (
                  carriers.map((carrier: any) => (
                    <Tr key={carrier.id} className="cursor-pointer" onClick={() => navigate(`/carriers/${carrier.id}`)}>
                      <Td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {carrier.company_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{carrier.company_name}</p>
                            <p className="text-xs text-gray-500 hidden sm:block">{carrier.email || ''}</p>
                            <p className="text-xs text-gray-500 sm:hidden">{carrier.phone}</p>
                          </div>
                        </div>
                      </Td>
<Td className="hidden sm:table-cell">{carrier.phone}</Td>
                       <Td><StatusBadge status={carrier.is_active ? 'active' : 'suspended'} /></Td>
                      <Td className="hidden md:table-cell">{carrier.completed_deliveries}</Td>
                      <Td className="hidden md:table-cell text-danger">{carrier.failed_deliveries}</Td>
                      <Td className="hidden sm:table-cell">
                        <span className={`font-medium ${
                          carrier.performance_score >= 90 ? 'text-success' :
                          carrier.performance_score >= 70 ? 'text-warning' : 'text-danger'
                        }`}>
                          {(carrier.performance_score || 0).toFixed(1)}%
                        </span>
                      </Td>
                      <Td className="hidden md:table-cell font-medium">{(carrier.total_revenue || 0).toLocaleString()} FCFA</Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/carriers/${carrier.id}`) }}>
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingCarrier(carrier); setShowEditModal(true) }} className="hidden sm:flex">
                            <Edit size={14} />
                          </Button>
                          {!carrier.is_active ? (
                            <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); activateCarrier.mutate(carrier.id) }} disabled={activateCarrier.isPending && activateCarrier.variables === carrier.id}>
                              <CheckCircle size={14} />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => { e.stopPropagation(); suspendCarrier.mutate(carrier.id) }} disabled={suspendCarrier.isPending && suspendCarrier.variables === carrier.id}>
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
            <CardTitle>Carrier Performance</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search carriers..."
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
                  <Th>Carrier</Th>
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
                  filteredPerformance.map((carrier: any) => (
                    <Tr key={carrier.rank}>
                      <Td>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          carrier.rank === 1 ? 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300' :
                          carrier.rank === 2 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                          carrier.rank === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {carrier.rank}
                        </span>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {carrier.carrier_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{carrier.carrier_name}</p>
                          </div>
                        </div>
                      </Td>
                      <Td className="hidden md:table-cell">{carrier.deliveries_completed}</Td>
                      <Td>
                        <span className={`font-medium ${
                          carrier.success_rate >= 90 ? 'text-success' :
                          carrier.success_rate >= 70 ? 'text-warning' : 'text-danger'
                        }`}>
                          {carrier.success_rate.toFixed(1)}%
                        </span>
                      </Td>
                      <Td className="hidden sm:table-cell font-medium">{carrier.revenue_generated.toLocaleString()} FCFA</Td>
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
            <CardTitle>Carrier Expenses</CardTitle>
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
                  <Th>Carrier</Th>
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
                            {(expense.carrier_name || '?').charAt(0)}
                          </div>
                          <span className="font-medium truncate">{expense.carrier_name || 'Unknown'}</span>
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
                <p className="text-sm text-gray-500 mb-1">Carrier</p>
                <p className="font-medium">{reviewingExpense.carrier_name || 'Unknown'}</p>
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

      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setError(null) }} title="Add New Carrier" size="lg">
        <form onSubmit={handleCreateCarrier} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              value={newCarrier.company_name}
              onChange={(e) => setNewCarrier({ ...newCarrier, company_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              value={newCarrier.phone}
              onChange={(e) => setNewCarrier({ ...newCarrier, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={newCarrier.email}
              onChange={(e) => setNewCarrier({ ...newCarrier, email: e.target.value })}
              placeholder="carrier@example.com"
              required
            />
            <div className="relative">
              <Input
                label="Password (leave empty to auto-generate)"
                type="text"
                value={newCarrier.password}
                onChange={(e) => setNewCarrier({ ...newCarrier, password: e.target.value })}
                placeholder="Auto-generated if empty"
              />
              <button
                type="button"
                onClick={() => setNewCarrier({ ...newCarrier, password: generatePassword() })}
                className="absolute right-2 top-7 text-xs text-secondary hover:text-primary"
              >
                Generate
              </button>
            </div>
          </div>
          <Input
            label="Address"
            value={newCarrier.address}
            onChange={(e) => setNewCarrier({ ...newCarrier, address: e.target.value })}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={createCarrier.isPending} className="w-full sm:w-auto">
              {createCarrier.isPending ? 'Creating...' : 'Create Carrier'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showPasswordModal} onClose={() => { setShowPasswordModal(false); setGeneratedPassword(null); setCreatedCarrierEmail(null) }} title="Carrier Created Successfully" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              Carrier has been created successfully. Share these credentials with the carrier:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</span>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{createdCarrierEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password:</span>
                <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{generatedPassword}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Please save these credentials securely. The carrier will need them to log into the Carrier App.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => { setShowPasswordModal(false); setGeneratedPassword(null); setCreatedCarrierEmail(null) }}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingCarrier(null); setError(null) }} title="Edit Carrier" size="lg">
        {editingCarrier && (
          <form onSubmit={handleUpdateCarrier} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={editingCarrier.company_name}
                onChange={(e) => setEditingCarrier({ ...editingCarrier, company_name: e.target.value })}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={editingCarrier.phone}
                onChange={(e) => setEditingCarrier({ ...editingCarrier, phone: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={editingCarrier.email}
              onChange={(e) => setEditingCarrier({ ...editingCarrier, email: e.target.value })}
            />
            <Input
              label="Address"
              value={editingCarrier.address || ''}
              onChange={(e) => setEditingCarrier({ ...editingCarrier, address: e.target.value })}
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button type="submit" disabled={updateCarrier.isPending} className="w-full sm:w-auto">
                {updateCarrier.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
