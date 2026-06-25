import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { DollarSign, Plus, Edit, Percent, Clock, Package } from 'lucide-react'

interface BasePrice {
  id: string
  zoneType: string
  price: number
  active: boolean
}

interface DynamicRule {
  id: string
  condition: string
  adjustment: string
  value: number
  active: boolean
}

interface CommissionTier {
  id: string
  minAmount: number
  maxAmount: number
  commission: number
}

const basePrices: BasePrice[] = [
  { id: '1', zoneType: 'Same Zone', price: 1500, active: true },
  { id: '2', zoneType: 'Cross Zone', price: 2500, active: true },
  { id: '3', zoneType: 'Long Distance (>10km)', price: 3500, active: true },
]

const dynamicRules: DynamicRule[] = [
  { id: '1', condition: 'Peak Hours (17:00-20:00)', adjustment: '+10%', value: 10, active: true },
  { id: '2', condition: 'Distance > 10km', adjustment: '+500 FCFA', value: 500, active: true },
  { id: '3', condition: 'COD Handling Fee', adjustment: '+200 FCFA', value: 200, active: true },
  { id: '4', condition: 'Fragile Package', adjustment: '+300 FCFA', value: 300, active: false },
]

const commissionTiers: CommissionTier[] = [
  { id: '1', minAmount: 0, maxAmount: 10000, commission: 15 },
  { id: '2', minAmount: 10001, maxAmount: 50000, commission: 12 },
  { id: '3', minAmount: 50001, maxAmount: 100000, commission: 10 },
  { id: '4', minAmount: 100001, maxAmount: Infinity, commission: 8 },
]

export default function Pricing() {
  const [basePriceList, setBasePriceList] = useState<BasePrice[]>(basePrices)
  const [rules, setRules] = useState<DynamicRule[]>(dynamicRules)
  const [tiers, setTiers] = useState<CommissionTier[]>(commissionTiers)
  const [showBasePriceModal, setShowBasePriceModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [showCommissionModal, setShowCommissionModal] = useState(false)
  const [editingBasePrice, setEditingBasePrice] = useState<BasePrice | null>(null)
  const [editingRule, setEditingRule] = useState<DynamicRule | null>(null)
  const [editingTier, setEditingTier] = useState<CommissionTier | null>(null)

  const handleToggleBasePrice = (id: string) => {
    setBasePriceList(basePriceList.map(p => p.id === id ? { ...p, active: !p.active } : p))
  }

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r))
  }

  const handleSaveBasePrice = () => {
    if (!editingBasePrice) return
    if (editingBasePrice.id) {
      setBasePriceList(basePriceList.map(p => p.id === editingBasePrice.id ? editingBasePrice : p))
    } else {
      setBasePriceList([...basePriceList, { ...editingBasePrice, id: Date.now().toString() }])
    }
    setShowBasePriceModal(false)
    setEditingBasePrice(null)
  }

  const handleSaveRule = () => {
    if (!editingRule) return
    if (editingRule.id) {
      setRules(rules.map(r => r.id === editingRule.id ? editingRule : r))
    } else {
      setRules([...rules, { ...editingRule, id: Date.now().toString() }])
    }
    setShowRuleModal(false)
    setEditingRule(null)
  }

  const handleSaveTier = () => {
    if (!editingTier) return
    if (editingTier.id) {
      setTiers(tiers.map(t => t.id === editingTier.id ? editingTier : t))
    } else {
      setTiers([...tiers, { ...editingTier, id: Date.now().toString() }])
    }
    setShowCommissionModal(false)
    setEditingTier(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pricing Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Configure delivery pricing and commission structure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={20} />
              Base Prices
            </CardTitle>
            <Button size="sm" onClick={() => { setEditingBasePrice({ id: '', zoneType: '', price: 0, active: true }); setShowBasePriceModal(true) }}>
              <Plus size={16} />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {basePriceList.map((price) => (
                <div key={price.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <Package size={20} className="text-gray-400" />
                    <div>
                      <p className="font-medium">{price.zoneType}</p>
                      <p className="text-sm text-gray-500">{price.price.toLocaleString()} FCFA</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={price.active ? 'success' : 'default'} size="sm">
                      {price.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingBasePrice(price); setShowBasePriceModal(true) }}>
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant={price.active ? 'secondary' : 'primary'}
                      onClick={() => handleToggleBasePrice(price.id)}
                    >
                      {price.active ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Dynamic Pricing Rules
            </CardTitle>
            <Button size="sm" onClick={() => { setEditingRule({ id: '', condition: '', adjustment: '', value: 0, active: true }); setShowRuleModal(true) }}>
              <Plus size={16} />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className={`p-4 rounded-lg border ${rule.active ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{rule.condition}</p>
                      <p className="text-sm text-secondary">{rule.adjustment}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={rule.active ? 'success' : 'default'} size="sm">
                        {rule.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingRule(rule); setShowRuleModal(true) }}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleToggleRule(rule.id)}>
                        {rule.active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Percent size={20} />
            Commission Structure
          </CardTitle>
          <Button size="sm" onClick={() => { setEditingTier({ id: '', minAmount: 0, maxAmount: 0, commission: 0 }); setShowCommissionModal(true) }}>
            <Plus size={16} />
            Add Tier
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order Value Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Commission Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Example</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">
                      {tier.minAmount.toLocaleString()} - {tier.maxAmount === Infinity ? '∞' : tier.maxAmount.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{tier.commission}%</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {tier.minAmount > 0 ? `${tier.minAmount.toLocaleString()} FCFA order →${((tier.minAmount * tier.commission) / 100).toLocaleString()} FCFA fee` : 'Base tier'}
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingTier(tier); setShowCommissionModal(true) }}>
                        <Edit size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Earnings Split</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Carrier Earnings</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">85%</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Example: 1,700 FCFA from 2,000 FCFA</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Platform Fee</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">15%</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Example: 300 FCFA from 2,000 FCFA</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Delivery Fee</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">2,000 FCFA</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Example delivery fee</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showBasePriceModal}
        onClose={() => { setShowBasePriceModal(false); setEditingBasePrice(null) }}
        title={editingBasePrice?.id ? 'Edit Base Price' : 'Add Base Price'}
      >
        {editingBasePrice && (
          <div className="space-y-4">
            <Input
              label="Zone Type"
              value={editingBasePrice.zoneType}
              onChange={(e) => setEditingBasePrice({ ...editingBasePrice, zoneType: e.target.value })}
              placeholder="e.g., Same Zone, Cross Zone"
              required
            />
            <Input
              label="Price (FCFA)"
              type="number"
              value={editingBasePrice.price}
              onChange={(e) => setEditingBasePrice({ ...editingBasePrice, price: Number(e.target.value) })}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setShowBasePriceModal(false); setEditingBasePrice(null) }}>
                Cancel
              </Button>
              <Button onClick={handleSaveBasePrice} disabled={!editingBasePrice.zoneType || editingBasePrice.price <= 0}>
                {editingBasePrice.id ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showRuleModal}
        onClose={() => { setShowRuleModal(false); setEditingRule(null) }}
        title={editingRule?.id ? 'Edit Dynamic Rule' : 'Add Dynamic Rule'}
      >
        {editingRule && (
          <div className="space-y-4">
            <Input
              label="Condition"
              value={editingRule.condition}
              onChange={(e) => setEditingRule({ ...editingRule, condition: e.target.value })}
              placeholder="e.g., Peak Hours (17:00-20:00)"
              required
            />
            <Input
              label="Adjustment"
              value={editingRule.adjustment}
              onChange={(e) => setEditingRule({ ...editingRule, adjustment: e.target.value })}
              placeholder="e.g., +10%, +500 FCFA"
              required
            />
            <Input
              label="Value"
              type="number"
              value={editingRule.value}
              onChange={(e) => setEditingRule({ ...editingRule, value: Number(e.target.value) })}
              placeholder="Adjustment value"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setShowRuleModal(false); setEditingRule(null) }}>
                Cancel
              </Button>
              <Button onClick={handleSaveRule} disabled={!editingRule.condition || !editingRule.adjustment}>
                {editingRule.id ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCommissionModal}
        onClose={() => { setShowCommissionModal(false); setEditingTier(null) }}
        title={editingTier?.id ? 'Edit Commission Tier' : 'Add Commission Tier'}
      >
        {editingTier && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Amount (FCFA)"
                type="number"
                value={editingTier.minAmount}
                onChange={(e) => setEditingTier({ ...editingTier, minAmount: Number(e.target.value) })}
                required
              />
              <Input
                label="Max Amount (FCFA)"
                type="number"
                value={editingTier.maxAmount === Infinity ? '' : editingTier.maxAmount}
                onChange={(e) => setEditingTier({ ...editingTier, maxAmount: Number(e.target.value) || Infinity })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <Input
              label="Commission Rate (%)"
              type="number"
              value={editingTier.commission}
              onChange={(e) => setEditingTier({ ...editingTier, commission: Number(e.target.value) })}
              required
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setShowCommissionModal(false); setEditingTier(null) }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTier} disabled={editingTier.commission <= 0}>
                {editingTier.id ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}