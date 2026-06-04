import { useDashboard } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/Badge'
import { TrendingUp, TrendingDown, Package, Truck, CheckCircle, AlertCircle, DollarSign, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'

const iconMap: Record<string, React.ReactNode> = {
  package: <Package size={24} />,
  truck: <Truck size={24} />,
  'check-circle': <CheckCircle size={24} />,
  'alert-circle': <AlertCircle size={24} />,
  'dollar-sign': <DollarSign size={24} />,
  users: <Users size={24} />,
}

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6']

export default function Dashboard() {
  const { data: dashboard, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    )
  }

  const deliveriesData = dashboard?.deliveries_per_day?.map((d) => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
  })) || []

  const revenueData = dashboard?.revenue_per_day?.map((d) => ({
    ...d,
    date: format(new Date(d.date), 'MMM dd'),
    revenue: d.revenue / 1000,
  })) || []

  const statusData = dashboard?.status_distribution?.map((s) => ({
    name: s.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: s.count,
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(new Date(), 'EEEE, MMMM dd, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {dashboard?.kpi_cards?.map((card, index) => (
          <Card key={index} className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
                <div className="text-secondary">{iconMap[card.icon] || <Package size={24} />}</div>
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 text-sm ${
                  card.trend.direction === 'up' ? 'text-success' : 'text-danger'
                }`}>
                  {card.trend.direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{card.trend.percentage.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {card.title.includes('Revenue') || card.title.includes('FCFA')
                  ? `${card.value.toLocaleString()} FCFA`
                  : card.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.title}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Deliveries per Day</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deliveriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={{ fill: '#2563EB' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue per Day (thousands FCFA)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
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
            <CardTitle>Top Performing Riders</CardTitle>
          </CardHeader>
          <CardContent>
<div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[500px] px-4 sm:px-0">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rider</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Deliveries</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Success</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-primary-700">
                      {dashboard?.top_performing_riders?.map((rider) => (
                        <tr key={rider.rank} className="hover:bg-gray-50 dark:hover:bg-primary-700">
                          <td className="px-2 sm:px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              rider.rank === 1 ? 'bg-warning text-white' :
                              rider.rank === 2 ? 'bg-gray-300 text-gray-800' :
                              rider.rank === 3 ? 'bg-orange-400 text-white' :
                              'bg-gray-100 dark:bg-primary-600 text-gray-800 dark:text-white'
                            }`}>
                              {rider.rank}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-sm font-medium">{rider.rider_name}</td>
                          <td className="px-2 sm:px-4 py-3 text-sm">{rider.deliveries_completed}</td>
                          <td className="px-2 sm:px-4 py-3">
                            <StatusBadge status={rider.success_rate >= 90 ? 'delivered' : rider.success_rate >= 70 ? 'in_transit' : 'failed'} />
                            <span className="ml-2 text-sm">{rider.success_rate.toFixed(1)}%</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-sm font-medium">{rider.revenue_generated.toLocaleString()} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}