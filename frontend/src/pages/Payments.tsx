import { useState } from 'react'
import { usePayments } from '../hooks/useApi'
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

export default function Payments() {
  const [filters, setFilters] = useState({
    status: '',
    merchant: '',
    date_from: '',
    date_to: '',
    search: '',
  })

  const { isLoading } = usePayments(filters)

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
              <p className="text-lg sm:text-2xl font-bold">156</p>
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
              <p className="text-lg sm:text-2xl font-bold">2.4M</p>
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
              <p className="text-lg sm:text-2xl font-bold">8</p>
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
              <p className="text-lg sm:text-2xl font-bold">3</p>
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
              ) : (
                <>
                  <Tr>
                    <Td className="font-mono text-xs sm:text-sm">TXN-2024-001</Td>
                    <Td className="hidden sm:table-cell">Arthur Electronics</Td>
                    <Td className="font-medium">2,500 FCFA</Td>
                    <Td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {paymentMethodIcons.orange_money}
                        <span>Orange Money</span>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">{format(new Date(), 'MMM dd, yyyy HH:mm')}</Td>
                    <Td><StatusBadge status="completed" /></Td>
                  </Tr>
                  <Tr>
                    <Td className="font-mono text-xs sm:text-sm">TXN-2024-002</Td>
                    <Td className="hidden sm:table-cell">Bastos Fashion</Td>
                    <Td className="font-medium">1,500 FCFA</Td>
                    <Td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {paymentMethodIcons.mtn_mobile_money}
                        <span>MTN Mobile Money</span>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">{format(new Date(), 'MMM dd, yyyy HH:mm')}</Td>
                    <Td><StatusBadge status="pending" /></Td>
                  </Tr>
                  <Tr>
                    <Td className="font-mono text-xs sm:text-sm">TXN-2024-003</Td>
                    <Td className="hidden sm:table-cell">Mvog-Mbi Market</Td>
                    <Td className="font-medium">3,000 FCFA</Td>
                    <Td className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {paymentMethodIcons.bank_transfer}
                        <span>Bank Transfer</span>
                      </div>
                    </Td>
                    <Td className="hidden sm:table-cell">{format(new Date(), 'MMM dd, yyyy HH:mm')}</Td>
                    <Td><StatusBadge status="completed" /></Td>
                  </Tr>
                </>
              )}
            </Tbody>
          </Table>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-primary-700">
            <p className="text-sm text-gray-500">
              Showing 1-10 of 156 payments
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