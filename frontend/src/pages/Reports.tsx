import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp, Package, XCircle, DollarSign } from 'lucide-react'
const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6']

const dailyData = [
  { label: 'Jun 04', created: 12, completed: 10, failed: 1, revenue: 45000 },
  { label: 'Jun 05', created: 15, completed: 14, failed: 0, revenue: 52000 },
  { label: 'Jun 06', created: 11, completed: 9, failed: 2, revenue: 38000 },
  { label: 'Jun 07', created: 18, completed: 16, failed: 1, revenue: 65000 },
  { label: 'Jun 08', created: 14, completed: 13, failed: 0, revenue: 48000 },
  { label: 'Jun 09', created: 20, completed: 18, failed: 1, revenue: 71000 },
  { label: 'Jun 10', created: 16, completed: 14, failed: 1, revenue: 58000 },
]

const weeklyData = [
  { label: 'Week 1', created: 89, completed: 82, failed: 3, revenue: 320000 },
  { label: 'Week 2', created: 102, completed: 95, failed: 4, revenue: 410000 },
  { label: 'Week 3', created: 95, completed: 88, failed: 5, revenue: 380000 },
  { label: 'Week 4', created: 110, completed: 105, failed: 2, revenue: 450000 },
  { label: 'Week 5', created: 98, completed: 92, failed: 3, revenue: 395000 },
  { label: 'Week 6', created: 115, completed: 108, failed: 4, revenue: 460000 },
  { label: 'Week 7', created: 108, completed: 102, failed: 3, revenue: 430000 },
  { label: 'Week 8', created: 124, completed: 118, failed: 2, revenue: 487500 },
]

const monthlyData = [
  { label: 'Jan', created: 340, completed: 310, failed: 18, revenue: 1250000 },
  { label: 'Feb', created: 380, completed: 355, failed: 15, revenue: 1420000 },
  { label: 'Mar', created: 410, completed: 390, failed: 12, revenue: 1580000 },
  { label: 'Apr', created: 390, completed: 365, failed: 20, revenue: 1480000 },
  { label: 'May', created: 450, completed: 430, failed: 14, revenue: 1750000 },
  { label: 'Jun', created: 350, completed: 325, failed: 16, revenue: 1380000 },
]

const revenueBreakdown = [
  { label: 'Delivery Fees', value: 45 },
  { label: 'Surge Pricing', value: 20 },
  { label: 'Peak Hour Fees', value: 15 },
  { label: 'Fuel Surcharge', value: 12 },
  { label: 'Other', value: 8 },
]

const monthlyRevenue = [
  { label: 'Jan', delivery_fees: 560000, surge: 180000, peak: 120000, fuel: 90000, other: 60000 },
  { label: 'Feb', delivery_fees: 640000, surge: 210000, peak: 140000, fuel: 100000, other: 70000 },
  { label: 'Mar', delivery_fees: 720000, surge: 250000, peak: 160000, fuel: 110000, other: 80000 },
  { label: 'Apr', delivery_fees: 680000, surge: 220000, peak: 150000, fuel: 105000, other: 75000 },
  { label: 'May', delivery_fees: 800000, surge: 280000, peak: 190000, fuel: 130000, other: 90000 },
  { label: 'Jun', delivery_fees: 620000, surge: 210000, peak: 150000, fuel: 100000, other: 70000 },
]

const failedReasons = [
  { reason: 'Customer Unavailable', count: 45, percentage: 35 },
  { reason: 'Wrong Address', count: 32, percentage: 25 },
  { reason: 'Phone Unreachable', count: 28, percentage: 22 },
  { reason: 'Customer Refused', count: 15, percentage: 12 },
  { reason: 'Other', count: 8, percentage: 6 },
]

const tabDatasets: Record<string, { data: any[]; title: string; xAxis?: string }> = {
  daily: { data: dailyData, title: 'Daily', xAxis: 'date' },
  weekly: { data: weeklyData, title: 'Weekly', xAxis: 'week' },
  monthly: { data: monthlyData, title: 'Monthly', xAxis: 'month' },
  revenue: { data: monthlyRevenue, title: 'Revenue', xAxis: 'month' },
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'revenue'>('daily')

  const tabs = [
    { id: 'daily' as const, label: 'Daily', icon: Calendar },
    { id: 'weekly' as const, label: 'Weekly', icon: TrendingUp },
    { id: 'monthly' as const, label: 'Monthly', icon: TrendingUp },
    { id: 'revenue' as const, label: 'Revenue', icon: DollarSign },
  ]

  const current = tabDatasets[activeTab]
  const trendData = current.data

  const totalCreated = trendData.reduce((acc: number, d: any) => acc + (d.created || 0), 0)
  const totalCompleted = trendData.reduce((acc: number, d: any) => acc + (d.completed || 0), 0)
  const totalFailed = trendData.reduce((acc: number, d: any) => acc + (d.failed || 0), 0)
  const totalRevenue = trendData.reduce((acc: number, d: any) => acc + (d.revenue || 0), 0)

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
              <p className="text-lg sm:text-2xl font-bold">{totalCreated}</p>
              <p className="text-xs sm:text-sm text-gray-500">{current.title} Created</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-success-50 dark:bg-success-900 rounded-lg">
              <TrendingUp className="text-success" size={20} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold">{totalCompleted}</p>
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
              <p className="text-lg sm:text-2xl font-bold">{totalFailed}</p>
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
              <p className="text-lg sm:text-2xl font-bold">{(totalRevenue / 1000).toFixed(0)}K</p>
              <p className="text-xs sm:text-sm text-gray-500">Revenue (FCFA)</p>
            </div>
          </div>
        </Card>
      </div>

      {activeTab !== 'revenue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{current.title} Deliveries Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#9CA3AF" />
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
              <CardTitle>{current.title} Revenue Trend (FCFA)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#9CA3AF" />
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
                    data={failedReasons}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {failedReasons.map((_, index) => (
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
                  {failedReasons.map((item) => (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Stack (FCFA)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="delivery_fees" stackId="a" fill="#2563EB" name="Delivery Fees" />
                  <Bar dataKey="surge" stackId="a" fill="#F59E0B" name="Surge Pricing" />
                  <Bar dataKey="peak" stackId="a" fill="#8B5CF6" name="Peak Hour" />
                  <Bar dataKey="fuel" stackId="a" fill="#DC2626" name="Fuel Surcharge" />
                  <Bar dataKey="other" stackId="a" fill="#16A34A" name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend vs Failed Deliveries</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyRevenue.map((m, i) => ({
                  ...m,
                  total: m.delivery_fees + m.surge + m.peak + m.fuel + m.other,
                  failed: monthlyData[i]?.failed || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="label" stroke="#9CA3AF" />
                  <YAxis yAxisId="left" stroke="#9CA3AF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#DC2626" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total" fill="#16A34A" name="Total Revenue" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="failed" stroke="#DC2626" name="Failed" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Revenue Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Category</Th>
                    <Th className="text-right">Share</Th>
                    <Th className="text-right hidden sm:table-cell">Est. Monthly (FCFA)</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {revenueBreakdown.map((item) => (
                    <Tr key={item.label}>
                      <Td className="truncate max-w-[150px] sm:max-w-none">{item.label}</Td>
                      <Td className="text-right font-medium">{item.value}%</Td>
                      <Td className="text-right hidden sm:table-cell">
                        <span className="text-sm bg-gray-100 dark:bg-primary-700 px-2 py-1 rounded">
                          {((totalRevenue * (item.value / 100)) / 1000).toFixed(0)}K
                        </span>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
