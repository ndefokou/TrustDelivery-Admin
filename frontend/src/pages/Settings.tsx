import { useState } from 'react'
import { useSettings, useUpdateSettings } from '../hooks/useApi'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Save, Building, DollarSign, Users } from 'lucide-react'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  useSettings()
  const updateSettings = useUpdateSettings()

  const [companySettings, setCompanySettings] = useState({
    company_name: 'TrustDelivery',
    address: 'Yaoundé, Cameroon',
    phone: '+237 XXX XXX XXX',
    email: 'info@trustdelivery.cm',
  })

  const [pricingRules, setPricingRules] = useState<any[]>([
    { min_distance_km: 0, max_distance_km: 3, base_price: 1000, price_per_km: null },
    { min_distance_km: 3, max_distance_km: 5, base_price: 1500, price_per_km: null },
    { min_distance_km: 5, max_distance_km: 10, base_price: 2500, price_per_km: null },
    { min_distance_km: 10, max_distance_km: 999, base_price: 3000, price_per_km: 200 },
  ])

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

  const tabs = [
    { id: 'company', label: 'Company', icon: Building },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'users', label: 'User Management', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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

        <div className="flex-1">
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
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-primary-700 rounded-lg">
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-primary-700">
                    <thead className="bg-gray-50 dark:bg-primary-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-primary-800 divide-y divide-gray-200 dark:divide-primary-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Admin User</td>
                        <td className="px-6 py-4 whitespace-nowrap">admin@trustdelivery.cm</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300 rounded-full">
                            Super Admin
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Button size="sm" variant="secondary">Edit</Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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