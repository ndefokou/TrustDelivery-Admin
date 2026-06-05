import { useState } from 'react'
import { useReports } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp, Package, XCircle, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6']

export default function Reports() {
  const [activeTab, setActiveTab] = useState('daily')
  useReports(activeTab as any)

  const tabs = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
  ]

  const mockDailyData = [
    { date: '2024-01-01', created: 45, completed: 38, failed: 2, revenue: 45000 },
    { date: '2024-01-02', created: 52, completed: 48, failed: 1, revenue: 52000 },
    { date: '2024-01-03', created: 38, completed: 35, failed: 3, revenue: 38000 },
    { date: '2024-01-04', created: 65, completed: 60, failed: 2, revenue: 65000 },
    { date: '2024-01-05', created: 71, completed: 68, failed: 1, revenue: 71000 },
    { date: '2024-01-06', created: 58, completed: 52, failed: 4, revenue: 58000 },
    { date: '2024-01-07', created: 42, completed: 40, failed: 1, revenue: 42000 },
  ]

  const mockFailedReasons = [
    { reason: 'Customer Unavailable', count: 45, percentage: 35 },
    { reason: 'Wrong Address', count: 32, percentage: 25 },
    { reason: 'Phone Unreachable', count: 28, percentage: 22 },
    { reason: 'Customer Refused', count: 15, percentage: 12 },
    { reason: 'Other', count: 8, percentage: 6 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.id)}
              size="sm"
            >
              <tab.icon size={16} />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <Package className="text-secondary" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{mockDailyData.reduce((acc, d) => acc + d.created, 0)}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Created</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success-50 dark:bg-success-900 rounded-lg">
              <TrendingUp className="text-success" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{mockDailyData.reduce((acc, d) => acc + d.completed, 0)}</p>
              <p className="text-xs sm:text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-danger-50 dark:bg-danger-900 rounded-lg">
              <XCircle className="text-danger" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{mockDailyData.reduce((acc, d) => acc + d.failed, 0)}</p>
              <p className="text-xs sm:text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <DollarSign className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{(mockDailyData.reduce((acc, d) => acc + d.revenue, 0) / 1000).toFixed(0)}K</p>
              <p className="text-xs sm:text-sm text-gray-500">Revenue (FCFA)</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#2563EB" name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#16A34A" name="Completed" />
                <Line type="monotone" dataKey="failed" stroke="#DC2626" name="Failed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (FCFA)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" tickFormatter={(v) => format(new Date(v), 'MMM dd')} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Deliveries by Reason</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockFailedReasons}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {mockFailedReasons.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failed Deliveries Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <Thead>
                <Tr>
                  <Th>Reason</Th>
                  <Th className="text-right">Count</Th>
                  <Th className="text-right hidden sm:table-cell">Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {mockFailedReasons.map((item) => (
                  <Tr key={item.reason}>
                    <Td className="truncate max-w-[150px] sm:max-w-none">{item.reason}</Td>
                    <Td className="text-right font-medium">{item.count}</Td>
                    <Td className="text-right hidden sm:table-cell">
                      <span className="text-sm bg-gray-100 dark:bg-primary-700 px-2 py-1 rounded">
                        {item.percentage}%
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}