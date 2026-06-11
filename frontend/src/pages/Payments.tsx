import { useState, useMemo } from 'react'
import { usePayments } from '../hooks/useApi'
import { useMerchants } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { StatusBadge } from '../components/ui/Badge'
import { Search, Download, CreditCard, Smartphone, Building } from 'lucide-react'
import { format } from 'date-fns'

const paymentMethodIcons: Record<string, React.ReactNode> = {
  orange_money: <Smartphone size={16} className="text-warning" />,
  mtn_mobile_money: <Smartphone size={16} className="text-danger" />,
  bank_transfer: <Building size={16} className="text-secondary" />,
}

const paymentMethodLabels: Record<string, string> = {
  orange_money: 'Orange Money',
  mtn_mobile_money: 'MTN Mobile Money',
  bank_transfer: 'Bank Transfer',
}

export default function Payments() {
  const [filters, setFilters] = useState({
    status: '',
    merchant: '',
    date_from: '',
    date_to: '',
    search: '',
  })

  const { data, isLoading } = usePayments(filters)
  const { data: merchantsData } = useMerchants()

  const merchants = merchantsData?.merchants || []
  const payments = data?.payments || []

  const filteredPayments = useMemo(() => {
    let list = [...payments]

    if (filters.status) {
      list = list.filter((p) => p.status === filters.status)
    }
    if (filters.date_from) {
      const from = new Date(filters.date_from).getTime()
      list = list.filter((p) => new Date(p.created_at).getTime() >= from)
    }
    if (filters.date_to) {
      const to = new Date(filters.date_to).getTime()
      list = list.filter((p) => new Date(p.created_at).getTime() <= to)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      list = list.filter(
        (p) =>
          p.transaction_id.toLowerCase().includes(q) ||
          String(p.amount).includes(q)
      )
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [payments, filters])

  const totalPayments = filteredPayments.length
  const totalAmount = filteredPayments.reduce((acc, p) => acc + p.amount, 0)
  const pendingCount = filteredPayments.filter((p) => p.status === 'pending').length
  const failedCount = filteredPayments.filter((p) => p.status === 'failed').length

  const getMerchantName = (merchantId: string) => {
    const merchant = merchants.find((m: any) => m.id === merchantId)
    return merchant?.business_name || '—'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <Button variant="secondary">
          <Download size={16} />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success-50 dark:bg-success-900 rounded-lg">
              <CreditCard className="text-success" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{totalPayments}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Payments</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <Smartphone className="text-secondary" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{(totalAmount / 1000000).toFixed(2)}M</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Amount</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <CreditCard className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-danger-50 dark:bg-danger-900 rounded-lg">
              <CreditCard className="text-danger" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{failedCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full sm:w-40"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Select>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              className="w-full sm:w-40"
            />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              className="w-full sm:w-40"
            />
            <div className="relative flex-1 min-w-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by transaction ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Transaction ID</Th>
                <Th className="hidden sm:table-cell">Merchant</Th>
                <Th>Amount</Th>
                <Th className="hidden md:table-cell">Method</Th>
                <Th className="hidden sm:table-cell">Date</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {isLoading ? (
                <Tr>
                  <Td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                    </div>
                  </Td>
                </Tr>
              ) : filteredPayments.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center py-8 text-gray-500">
                    No payments found
                  </Td>
                </Tr>
              ) : (
                filteredPayments.map((payment) => (
                  <Tr key={payment.id}>
                    <Td className="font-mono text-xs sm:text-sm">{payment.transaction_id}</Td>
                    <Td className="hidden sm:table-cell">{getMerchantName(payment.merchant_id)}</Td>
                    <Td className="font-medium">{payment.amount.toLocaleString()} FCFA</Td>
                    <Td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {paymentMethodIcons[payment.payment_method] || <Smartphone size={16} />}
                        <span>{paymentMethodLabels[payment.payment_method] || payment.payment_method}</span>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">{format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}</Td>
                    <Td><StatusBadge status={payment.status} /></Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-primary-700">
            <p className="text-sm text-gray-500">
              Showing {filteredPayments.length} payments
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">Previous</Button>
              <Button variant="secondary" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
