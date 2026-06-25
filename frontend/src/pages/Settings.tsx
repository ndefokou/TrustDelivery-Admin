import { useState, useEffect } from 'react'
import { useSettings, useUpdateSettings } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Save, Building, DollarSign, Users, Settings2, ToggleLeft, ToggleRight } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  const { data: settingsData, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const [companySettings, setCompanySettings] = useState({
    company_name: 'TrustDelivery',
    address: 'Yaoundé, Cameroon',
    phone: '+237 XXX XXX XXX',
    email: 'info@trustdelivery.cm',
  })

  const [systemSettings, setSystemSettings] = useState({
    auto_assignment: true,
    commission_rate: 15,
    fallback_enabled: true,
    max_retry_assignments: 3,
    increase_price_on_retry: true,
    price_increase_percentage: 10,
    notify_admin_on_failure: true,
  })

  const [pricingRules, setPricingRules] = useState<any[]>([
    { min_distance_km: 0, max_distance_km: 1, base_price: 1000, price_per_km: null },
    { min_distance_km: 1, max_distance_km: 3, base_price: 1500, price_per_km: null },
    { min_distance_km: 3, max_distance_km: 5, base_price: 2000, price_per_km: null },
    { min_distance_km: 5, max_distance_km: 10, base_price: 2500, price_per_km: null },
    { min_distance_km: 10, max_distance_km: 999, base_price: 3000, price_per_km: 200 },
  ])

  useEffect(() => {
    if (settingsData?.company) {
      setCompanySettings({
        company_name: settingsData.company.company_name || 'TrustDelivery',
        address: settingsData.company.address || '',
        phone: settingsData.company.phone || '',
        email: settingsData.company.email || '',
      })
    }
    if (settingsData?.pricing_rules) {
      setPricingRules(
        settingsData.pricing_rules.map((r) => ({
          ...r,
          price_per_km: r.price_per_km ?? null,
        }))
      )
    }
    if ((settingsData as any)?.system) {
      setSystemSettings({
        auto_assignment: (settingsData as any).system.auto_assignment ?? true,
        commission_rate: (settingsData as any).system.commission_rate ?? 15,
        fallback_enabled: (settingsData as any).system.fallback_enabled ?? true,
        max_retry_assignments: (settingsData as any).system.max_retry_assignments ?? 3,
        increase_price_on_retry: (settingsData as any).system.increase_price_on_retry ?? true,
        price_increase_percentage: (settingsData as any).system.price_increase_percentage ?? 10,
        notify_admin_on_failure: (settingsData as any).system.notify_admin_on_failure ?? true,
      })
    }
  }, [settingsData])

  const handleSaveCompany = () => {
    updateSettings.mutate({
      company: companySettings,
    })
  }

  const handleSavePricing = () => {
    updateSettings.mutate({
      pricing_rules: pricingRules.map((r) => ({
        min_distance_km: r.min_distance_km,
        max_distance_km: r.max_distance_km,
        base_price: r.base_price,
        price_per_km: r.price_per_km || null,
      })),
    })
  }

  const handleSaveSystem = () => {
    updateSettings.mutate({
      system: systemSettings,
    } as any)
  }

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'system', label: 'System', icon: Settings2 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'users', label: 'User Management', icon: Users },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap lg:w-48 ${
                activeTab === tab.id
                  ? 'bg-secondary text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-primary-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name"
                  value={companySettings.company_name}
                  onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                />
                <Input
                  label="Address"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                />
                <div className="pt-4">
                  <Button onClick={handleSaveCompany} disabled={updateSettings.isPending}>
                    <Save size={16} />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Auto-Assignment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Auto Assignment</p>
                      <p className="text-sm text-gray-500">Automatically assign deliveries to best carrier</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, auto_assignment: !systemSettings.auto_assignment })}
                      className={`p-2 rounded-lg transition-colors ${systemSettings.auto_assignment ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {systemSettings.auto_assignment ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Fallback Enabled</p>
                      <p className="text-sm text-gray-500">Retry with next best carrier if rejected</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, fallback_enabled: !systemSettings.fallback_enabled })}
                      className={`p-2 rounded-lg transition-colors ${systemSettings.fallback_enabled ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {systemSettings.fallback_enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>

                  <Input
                    label="Max Retry Assignments"
                    type="number"
                    value={systemSettings.max_retry_assignments}
                    onChange={(e) => setSystemSettings({ ...systemSettings, max_retry_assignments: parseInt(e.target.value) || 3 })}
                  />
                  <p className="text-sm text-gray-500 -mt-2">Number of carriers to try before declaring failure</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fallback Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Increase Price on Retry</p>
                      <p className="text-sm text-gray-500">Increase delivery price if carriers reject</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, increase_price_on_retry: !systemSettings.increase_price_on_retry })}
                      className={`p-2 rounded-lg transition-colors ${systemSettings.increase_price_on_retry ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {systemSettings.increase_price_on_retry ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>

                  {systemSettings.increase_price_on_retry && (
                    <>
                      <Input
                        label="Price Increase Percentage"
                        type="number"
                        value={systemSettings.price_increase_percentage}
                        onChange={(e) => setSystemSettings({ ...systemSettings, price_increase_percentage: parseInt(e.target.value) || 10 })}
                      />
                      <p className="text-sm text-gray-500 -mt-2">Percentage to increase price when retrying</p>
                    </>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Notify Admin on Failure</p>
                      <p className="text-sm text-gray-500">Send notification when carrier assignment fails</p>
                    </div>
                    <button
                      onClick={() => setSystemSettings({ ...systemSettings, notify_admin_on_failure: !systemSettings.notify_admin_on_failure })}
                      className={`p-2 rounded-lg transition-colors ${systemSettings.notify_admin_on_failure ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-500'}`}
                    >
                      {systemSettings.notify_admin_on_failure ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Commission Rate (%)"
                    type="number"
                    value={systemSettings.commission_rate}
                    onChange={(e) => setSystemSettings({ ...systemSettings, commission_rate: parseInt(e.target.value) || 15 })}
                  />
                  <p className="text-sm text-gray-500 -mt-2">Percentage of delivery fee keptby platform</p>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">How Commission Works</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      The platform takes {systemSettings.commission_rate}% of each delivery fee. Carriers receive {100 - systemSettings.commission_rate}%.
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      Example: On a 2,000 FCFA delivery, platform keeps {(2000 * systemSettings.commission_rate / 100).toFixed(0)} FCFA, carrier gets {(2000 * (100 - systemSettings.commission_rate) / 100).toFixed(0)} FCFA.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="pt-4">
                <Button onClick={handleSaveSystem} disabled={updateSettings.isPending}>
                  <Save size={16} />
                  {updateSettings.isPending ? 'Saving...' : 'Save System Settings'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <Card>
              <CardHeader>
                <CardTitle>Distance-Based Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Configure delivery pricing based on distance traveled.
                </p>
                <div className="space-y-4">
                  {pricingRules.map((rule, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-primary-700 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Min Distance (km)
                        </label>
                        <Input
                          type="number"
                          value={rule.min_distance_km}
                          onChange={(e) => {
                            const newRules = [...pricingRules]
                            newRules[index].min_distance_km = parseFloat(e.target.value)
                            setPricingRules(newRules)
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Distance (km)
                        </label>
                        <Input
                          type="number"
                          value={rule.max_distance_km}
                          onChange={(e) => {
                            const newRules = [...pricingRules]
                            newRules[index].max_distance_km = parseFloat(e.target.value)
                            setPricingRules(newRules)
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Base Price (FCFA)
                        </label>
                        <Input
                          type="number"
                          value={rule.base_price}
                          onChange={(e) => {
                            const newRules = [...pricingRules]
                            newRules[index].base_price = parseFloat(e.target.value)
                            setPricingRules(newRules)
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price per km (FCFA)
                        </label>
                        <Input
                          type="number"
                          value={rule.price_per_km || ''}
                          placeholder="Optional"
                          onChange={(e) => {
                            const newRules = [...pricingRules]
                            newRules[index].price_per_km = parseFloat(e.target.value) || undefined
                            setPricingRules(newRules)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button onClick={handleSavePricing} disabled={updateSettings.isPending}>
                    <Save size={16} />
                    {updateSettings.isPending ? 'Saving...' : 'Save Pricing Rules'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[600px] px-4 sm:px-0">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
                      <thead className="bg-gray-50 dark:bg-primary-700">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
                        <tr>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">Admin User</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">admin@trustdelivery.cm</td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300 rounded-full">
                              Super Admin
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 rounded-full">
                              Active
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <Button size="sm" variant="secondary">Edit</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="pt-4">
                  <Button>Add New User</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
