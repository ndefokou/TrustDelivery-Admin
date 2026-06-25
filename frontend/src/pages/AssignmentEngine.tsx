import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Settings2, Plus, Edit, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

interface WeightConfig {
  id: string
  name: string
  weight: number
  description: string
}

interface RuleOverride {
  id: string
  condition: string
  conditionValue: string | number
  action: string
  description: string
  active: boolean
}

const defaultWeights: WeightConfig[] = [
  { id: '1', name: 'Performance', weight: 40, description: 'Carrier reliability and success rate' },
  { id: '2', name: 'Speed', weight: 30, description: 'Average delivery time' },
  { id: '3', name: 'Price', weight: 30, description: 'Cost competitiveness' },
]

const defaultRules: RuleOverride[] = [
  { id: '1', condition: 'cod_amount', conditionValue: 50000, action: 'high_trust_only', description: 'COD > 50,000 FCFA → Only high-trust carriers', active: true },
  { id: '2', condition: 'distance', conditionValue: 20, action: 'fast_carriers_only', description: 'Distance > 20km → Only fast carriers', active: true },
]

export default function AssignmentEngine() {
  const [weights, setWeights] = useState<WeightConfig[]>(defaultWeights)
  const [rules, setRules] = useState<RuleOverride[]>(defaultRules)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState<RuleOverride | null>(null)

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  const isWeightValid = totalWeight === 100

  const handleSaveWeights = () => {
    if (!isWeightValid) return
    console.log('Saving weights:', weights)
    setShowWeightModal(false)
  }

  const handleSaveRule = () => {
    if (!editingRule) return
    console.log('Saving rule:', editingRule)
    setShowRuleModal(false)
    setEditingRule(null)
  }

  const handleToggleRule = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, active: !r.active } : r))
  }

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(r => r.id !== ruleId))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Assignment Engine</h1>
          <p className="text-sm text-gray-500 mt-1">Configure how the system auto-selects carriers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings2 size={20} />
              Weight Configuration
            </CardTitle>
            <Button size="sm" onClick={() => { setShowWeightModal(true) }}>
              <Edit size={16} />
              Edit Weights
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {weights.map((weight) => (
              <div key={weight.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{weight.name}</span>
                  <span className={`text-lg font-bold ${weight.weight > 50 ? 'text-success' : weight.weight > 20 ? 'text-secondary' : 'text-gray-500'}`}>
                    {weight.weight}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full transition-all"
                    style={{ width: `${weight.weight}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{weight.description}</p>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className={`text-lg font-bold ${isWeightValid ? 'text-success' : 'text-danger'}`}>
                  {totalWeight}%
                </span>
              </div>
              {!isWeightValid && (
                <p className="text-xs text-danger mt-1">Weights must sum to 100%</p>
              )}
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Scoring Formula</h4>
              <code className="text-sm text-blue-700 dark:text-blue-300 block">
                Score = (Performance × 0.{weights.find(w => w.name === 'Performance')?.weight || 40})<br />
                      + (Speed × 0.{weights.find(w => w.name === 'Speed')?.weight || 30})<br />
                      + (Price × 0.{weights.find(w => w.name === 'Price')?.weight || 30})
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rule Overrides</CardTitle>
            <Button size="sm" onClick={() => { setEditingRule({ id: '', condition: '', conditionValue: '', action: '', description: '', active: true }); setShowRuleModal(true) }}>
              <Plus size={16} />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No override rules configured</p>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border ${
                      rule.active
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{rule.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Condition: {rule.condition} {rule.conditionValue} → Action: {rule.action}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={rule.active ? 'primary' : 'secondary'}
                          onClick={() => handleToggleRule(rule.id)}
                        >
                          {rule.active ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setEditingRule(rule); setShowRuleModal(true) }}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger"
                          onClick={() => handleDeleteRule(rule.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fallback System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium mb-2">Auto-Assignment Flow</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>System calculates scores for all eligible carriers</li>
                <li>Highest scoring carrier receives assignment request</li>
                <li>If rejected, next highest scoring carrier is selected</li>
                <li>After 3 rejections, fallback rules apply</li>
              </ol>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Fallback Options</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                <li>Increase delivery price by configured percentage</li>
                <li>Notify Super Admin for manual intervention</li>
                <li>Broadcast to all carriers in zone</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Edit Weight Configuration"
        size="md"
      >
        <div className="space-y-4">
          {weights.map((weight, index) => (
            <div key={weight.id} className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">{weight.name}</label>
                <span className="font-bold">{weight.weight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weight.weight}
                onChange={(e) => {
                  const newWeights = [...weights]
                  newWeights[index].weight = Number(e.target.value)
                  setWeights(newWeights)
                }}
                className="w-full"
              />
            </div>
          ))}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-success' : 'text-danger'}`}>
                {totalWeight}%
              </span>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowWeightModal(false)}>Cancel</Button>
            <Button onClick={handleSaveWeights} disabled={!isWeightValid}>Save Weights</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRuleModal}
        onClose={() => { setShowRuleModal(false); setEditingRule(null) }}
        title={editingRule?.id ? 'Edit Rule' : 'Add New Rule'}
        size="lg"
      >
        {editingRule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select
                  value={editingRule.condition}
                  onChange={(e) => setEditingRule({ ...editingRule, condition: e.target.value })}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
                >
                  <option value="">Select condition...</option>
                  <option value="cod_amount">COD Amount</option>
                  <option value="distance">Distance</option>
                  <option value="fragile">Fragile Package</option>
                  <option value="priority">Priority Delivery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Condition Value</label>
                <Input
                  type="number"
                  value={editingRule.conditionValue}
                  onChange={(e) => setEditingRule({ ...editingRule, conditionValue: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <select
                value={editingRule.action}
                onChange={(e) => setEditingRule({ ...editingRule, action: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
              >
                <option value="">Select action...</option>
                <option value="high_trust_only">Only high-trust carriers</option>
                <option value="fast_carriers_only">Only fast carriers</option>
                <option value="premium_only">Only premium carriers</option>
                <option value="increase_price">Increase price by10%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={editingRule.description}
                onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                placeholder="e.g., COD > 50,000 FCFA → Only high-trust carriers"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setShowRuleModal(false); setEditingRule(null) }}>Cancel</Button>
              <Button onClick={handleSaveRule} disabled={!editingRule.condition || !editingRule.action}>
                {editingRule.id ? 'Update Rule' : 'Add Rule'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}