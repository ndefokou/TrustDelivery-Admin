import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMapEvents, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/Table'
import { Plus, Edit, Trash2, Layers, Hexagon, Check, X, MapPin, Search, Building2 } from 'lucide-react'

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Zone {
  id: string
  name: string
  type: 'city' | 'custom'
  cityName?: string
  carriers: string[]
  active: boolean
  deliveryCount: number
  polygon: [number, number][]
}

const CAMEROON_CITIES = [
  { name: 'Yaoundé', center: [3.8480, 11.5020] as [number, number], bounds: [[3.75, 11.40], [3.95, 11.60]] as [[number, number], [number, number]] },
  { name: 'Douala', center: [4.0485, 9.7023] as [number, number], bounds: [[3.95, 9.60], [4.15, 9.85]] as [[number, number], [number, number]] },
  { name: 'Bamenda', center: [5.9631, 10.2464] as [number, number], bounds: [[5.90, 10.20], [6.05, 10.30]] as [[number, number], [number, number]] },
  { name: 'Bafoussam', center: [5.4833, 10.4167] as [number, number], bounds: [[5.43, 10.36], [5.55, 10.48]] as [[number, number], [number, number]] },
  { name: 'Garoua', center: [9.3009, 13.3974] as [number, number], bounds: [[9.20, 13.30], [9.40, 13.50]] as [[number, number], [number, number]] },
  { name: 'Maroua', center: [10.6105, 14.3246] as [number, number], bounds: [[10.55, 14.25], [10.65, 14.40]] as [[number, number], [number, number]] },
  { name: 'Nkongsamba', center: [4.9500, 9.7000] as [number, number], bounds: [[4.90, 9.65], [5.00, 9.75]] as [[number, number], [number, number]] },
  { name: 'Buea', center: [4.1518, 9.2352] as [number, number], bounds: [[4.10, 9.20], [4.20, 9.30]] as [[number, number], [number, number]] },
  { name: 'Limbe', center: [4.0217, 9.2058] as [number, number], bounds: [[3.98, 9.18], [4.06, 9.23]] as [[number, number], [number, number]] },
  { name: 'Kribi', center: [2.9371, 9.9069] as [number, number], bounds: [[2.88, 9.85], [3.00, 9.95]] as [[number, number], [number, number]] },
]

const mockZones: Zone[] = [
  { id: '1', name: 'Bastos', type: 'custom', carriers: ['FastExpress', 'CityRunner'], active: true, deliveryCount: 145, polygon: [[3.88, 11.50], [3.89, 11.52], [3.87, 11.53], [3.86, 11.51]] },
  { id: '2', name: 'Melen', type: 'custom', carriers: ['FastExpress', 'QuickDel'], active: true, deliveryCount: 89, polygon: [[3.85, 11.51], [3.86, 11.53], [3.84, 11.54], [3.83, 11.52]] },
  { id: '3', name: 'Yaoundé City', type: 'city', cityName: 'Yaoundé', carriers: ['FastExpress', 'CityRunner', 'QuickDel'], active: true, deliveryCount: 542, polygon: [] },
  { id: '4', name: 'Douala City', type: 'city', cityName: 'Douala', carriers: ['RapidTrans', 'ExpressLog'], active: false, deliveryCount: 0, polygon: [] },
]

const mockCarriers = ['FastExpress', 'CityRunner', 'QuickDel', 'RapidTrans', 'ExpressLog']

const YAOUNDE_CENTER: [number, number] = [3.8480, 11.5020]

function boundsToPolygon(bounds: [[number, number], [number, number]]): [number, number][] {
  const [[south, west], [north, east]] = bounds
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
  ]
}

function ZonePolygon({ zone, isSelected, onClick }: { zone: Zone; isSelected: boolean; onClick: () => void }) {
  const polygon = zone.type === 'city' 
    ? boundsToPolygon(CAMEROON_CITIES.find(c => c.name === zone.cityName)?.bounds || [[0, 0], [0, 0]])
    : zone.polygon

  if (!polygon || polygon.length < 3) return null

  return (
    <Polygon
      positions={polygon}
      pathOptions={{
        color: isSelected ? '#2563EB' : zone.active ? '#16A34A' : '#9CA3AF',
        fillColor: isSelected ? '#2563EB' : zone.active ? '#16A34A' : '#9CA3AF',
        fillOpacity: isSelected ? 0.4 : 0.2,
        weight: isSelected ? 3 : 2,
      }}
      eventHandlers={{
        click: onClick,
      }}
    />
  )
}

function CityMarker({ city, onClick }: { city: typeof CAMEROON_CITIES[0]; onClick: () => void }) {
  return (
    <Marker position={city.center} eventHandlers={{ click: onClick }}>
      <Popup>
        <div className="font-medium">{city.name}</div>
        <div className="text-sm text-gray-500">Click to create zone</div>
      </Popup>
    </Marker>
  )
}

function DrawControls({ 
  isDrawing, 
  onDrawComplete, 
  onCancel 
}: { 
  isDrawing: boolean
  onDrawComplete: (points: [number, number][]) => void
  onCancel: () => void
}) {
  const [points, setPoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (!isDrawing) {
      setPoints([])
    }
  }, [isDrawing])

  useMapEvents({
    click: (e) => {
      if (!isDrawing) return
      const newPoints: [number, number][] = [...points, [e.latlng.lat, e.latlng.lng]]
      setPoints(newPoints)
    },
  })

  const handleComplete = () => {
    if (points.length >= 3) {
      onDrawComplete(points)
      setPoints([])
    }
  }

  if (!isDrawing) return null

  return (
    <>
      {points.length > 0 && (
        <Polygon
          positions={points}
          pathOptions={{
            color: '#2563EB',
            fillColor: '#2563EB',
            fillOpacity: 0.3,
            weight: 2,
            dashArray: '5, 5',
          }}
        />
      )}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Points: {points.length} (min 3)
        </span>
        {points.length >= 3 && (
          <Button size="sm" onClick={handleComplete}>
            <Check size={14} className="mr-1" />
            Complete
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onCancel}>
          <X size={14} className="mr-1" />
          Cancel
        </Button>
      </div>
    </>
  )
}

function MapControls({ 
  onDrawStart, 
  isDrawing,
}: { 
  onDrawStart: () => void
  isDrawing: boolean
}) {
  return (
    <div className="absolute top-2 right-2 z-[1000]">
      <Button
        size="sm"
        variant={isDrawing ? 'primary' : 'secondary'}
        onClick={onDrawStart}
        disabled={isDrawing}
      >
        <Hexagon size={14} className="mr-1" />
        {isDrawing ? 'Drawing...' : 'Draw Zone'}
      </Button>
    </div>
  )
}

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>(mockZones)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'cities' | 'custom'>('all')
  const [zoneForm, setZoneForm] = useState<{ 
    name: string
    type: 'city' | 'custom'
    cityName: string
    carriers: string[]
    polygon: [number, number][] 
  }>({
    name: '',
    type: 'custom',
    cityName: '',
    carriers: [],
    polygon: [],
  })

  const filteredZones = zones.filter((zone) => {
    const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = activeTab === 'all' || zone.type === activeTab
    return matchesSearch && matchesType
  })

  const handleZoneClick = (zone: Zone) => {
    if (!isDrawing) {
      setSelectedZone(zone)
    }
  }

  const handleCityClick = (city: typeof CAMEROON_CITIES[0]) => {
    setZoneForm({
      name: `${city.name} City`,
      type: 'city',
      cityName: city.name,
      carriers: [],
      polygon: boundsToPolygon(city.bounds),
    })
    setShowModal(true)
  }

  const handleDrawStart = () => {
    setIsDrawing(true)
    setSelectedZone(null)
  }

  const handleDrawComplete = (points: [number, number][]) => {
    setZoneForm(prev => ({ ...prev, name: '', type: 'custom', cityName: '', polygon: points }))
    setIsDrawing(false)
    setShowModal(true)
  }

  const handleDrawCancel = () => {
    setIsDrawing(false)
    setSelectedZone(null)
  }

  const handleCreateZone = () => {
    setEditingZone(null)
    setZoneForm({ name: '', type: 'custom', cityName: '', carriers: [], polygon: [] })
    setShowModal(true)
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone)
    setZoneForm({
      name: zone.name,
      type: zone.type,
      cityName: zone.cityName || '',
      carriers: zone.carriers,
      polygon: zone.polygon,
    })
    setShowModal(true)
  }

  const handleDeleteZone = (zoneId: string) => {
    setZones(zones.filter(z => z.id !== zoneId))
    if (selectedZone?.id === zoneId) {
      setSelectedZone(null)
    }
  }

  const handleToggleZone = (zoneId: string) => {
    setZones(zones.map(z => z.id === zoneId ? { ...z, active: !z.active } : z))
  }

  const handleSaveZone = () => {
    if (editingZone) {
      setZones(zones.map(z => z.id === editingZone.id ? { 
        ...z, 
        name: zoneForm.name, 
        type: zoneForm.type,
        cityName: zoneForm.cityName,
        carriers: zoneForm.carriers, 
        polygon: zoneForm.polygon 
      } : z))
    } else {
      const newZone: Zone = {
        id: Date.now().toString(),
        name: zoneForm.name || (zoneForm.type === 'city' ? `${zoneForm.cityName} City` : 'New Zone'),
        type: zoneForm.type,
        cityName: zoneForm.cityName || undefined,
        carriers: zoneForm.carriers,
        active: true,
        deliveryCount: 0,
        polygon: zoneForm.polygon,
      }
      setZones([...zones, newZone])
    }
    setShowModal(false)
    setZoneForm({ name: '', type: 'custom', cityName: '', carriers: [], polygon: [] })
    setSelectedZone(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Zone Management</h1>
          <p className="text-sm text-gray-500 mt-1">Define delivery zones and assign carriers</p>
        </div>
        <Button onClick={handleCreateZone}>
          <Plus size={16} />
          Add Zone
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-50 dark:bg-secondary-900 rounded-lg">
              <Layers className="text-secondary" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Zones</p>
              <p className="text-xl font-bold">{zones.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-50 dark:bg-success-900 rounded-lg">
              <Check className="text-success" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Zones</p>
              <p className="text-xl font-bold">{zones.filter(z => z.active).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-lg">
              <Building2 className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">City Zones</p>
              <p className="text-xl font-bold">{zones.filter(z => z.type === 'city').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-50 dark:bg-warning-900 rounded-lg">
              <Hexagon className="text-warning" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Custom Zones</p>
              <p className="text-xl font-bold">{zones.filter(z => z.type === 'custom').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers size={20} />
              Zone Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ zIndex: 1 }}>
              <MapContainer
                center={YAOUNDE_CENTER}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="rounded-lg"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {zones.map((zone) => (
                  <ZonePolygon
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZone?.id === zone.id}
                    onClick={() => handleZoneClick(zone)}
                  />
                ))}
                {!isDrawing && CAMEROON_CITIES.map((city) => (
                  <CityMarker key={city.name} city={city} onClick={() => handleCityClick(city)} />
                ))}
                {!isDrawing && (
                  <MapControls onDrawStart={handleDrawStart} isDrawing={isDrawing} />
                )}
                {isDrawing && (
                  <DrawControls
                    isDrawing={isDrawing}
                    onDrawComplete={handleDrawComplete}
                    onCancel={handleDrawCancel}
                  />
                )}
              </MapContainer>
            </div>
            {selectedZone && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">{selectedZone.name}</h4>
                      <Badge variant={selectedZone.type === 'city' ? 'primary' : 'default'} size="sm">
                        {selectedZone.type === 'city' ? 'City' : 'Custom'}
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {selectedZone.carriers.length} carrier{selectedZone.carriers.length !== 1 ? 's' : ''} • {selectedZone.deliveryCount} deliveries
                    </p>
                    {selectedZone.type === 'city' && selectedZone.cityName && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Covers entire {selectedZone.cityName} area
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedZone.active ? 'success' : 'default'}>
                      {selectedZone.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => handleEditZone(selectedZone)}>
                      <Edit size={14} />
                    </Button>
                  </div>
                </div>
                {selectedZone.carriers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedZone.carriers.map((carrier) => (
                      <Badge key={carrier} variant="primary" size="sm">{carrier}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zone List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search zones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="flex gap-1">
                {(['all', 'cities', 'custom'] as const).map((tab) => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={activeTab === tab ? 'primary' : 'secondary'}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1"
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredZones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedZone?.id === zone.id
                        ? 'border-secondary bg-secondary-50 dark:bg-secondary-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
                    } ${!zone.active ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{zone.name}</span>
                        <Badge variant={zone.type === 'city' ? 'primary' : 'default'} size="sm">
                          {zone.type === 'city' ? 'City' : 'Custom'}
                        </Badge>
                      </div>
                      <Badge variant={zone.active ? 'success' : 'default'} size="sm">
                        {zone.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {zone.carriers.slice(0, 2).map((carrier) => (
                        <Badge key={carrier} variant="default" size="sm">
                          {carrier}
                        </Badge>
                      ))}
                      {zone.carriers.length > 2 && (
                        <Badge variant="default" size="sm">
                          +{zone.carriers.length - 2}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{zone.deliveryCount} deliveries</span>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEditZone(zone) }}>
                          <Edit size={12} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-danger" onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id) }}>
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredZones.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No zones found
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Cities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">Click on a city name to create a zone for the entire city</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {CAMEROON_CITIES.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city)}
                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-secondary hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-secondary" />
                  <span className="font-medium">{city.name}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Zones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <Tr>
                <Th>Zone</Th>
                <Th>Type</Th>
                <Th>Carriers</Th>
                <Th>Deliveries</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {zones.map((zone) => (
                <Tr key={zone.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{zone.name}</span>
                      {zone.type === 'city' && zone.cityName && (
                        <Badge variant="primary" size="sm">{zone.cityName}</Badge>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <Badge variant={zone.type === 'city' ? 'primary' : 'default'}>
                      {zone.type === 'city' ? 'City' : 'Custom'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {zone.carriers.slice(0, 2).map((carrier) => (
                        <Badge key={carrier} variant="default" size="sm">{carrier}</Badge>
                      ))}
                      {zone.carriers.length > 2 && (
                        <Badge variant="default" size="sm">+{zone.carriers.length - 2}</Badge>
                      )}
                    </div>
                  </Td>
                  <Td>{zone.deliveryCount}</Td>
                  <Td>
                    <Badge variant={zone.active ? 'success' : 'default'}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEditZone(zone)}>
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-danger" onClick={() => handleDeleteZone(zone.id)}>
                        <Trash2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant={zone.active ? 'secondary' : 'primary'}
                        onClick={() => handleToggleZone(zone.id)}
                      >
                        {zone.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingZone(null) }}
        title={editingZone ? 'Edit Zone' : 'Add New Zone'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Zone Type</label>
              <Select
                value={zoneForm.type}
                onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value as 'city' | 'custom' })}
              >
                <option value="custom">Custom Zone (Draw on Map)</option>
                <option value="city">Entire City</option>
              </Select>
            </div>
            {zoneForm.type === 'city' && (
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Select
                  value={zoneForm.cityName}
                  onChange={(e) => {
                    const city = CAMEROON_CITIES.find(c => c.name === e.target.value)
                    if (city) {
                      setZoneForm({
                        ...zoneForm,
                        cityName: city.name,
                        name: `${city.name} City`,
                        polygon: boundsToPolygon(city.bounds),
                      })
                    }
                  }}
                >
                  <option value="">Select a city...</option>
                  {CAMEROON_CITIES.map((city) => (
                    <option key={city.name} value={city.name}>{city.name}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          <Input
            label="Zone Name"
            value={zoneForm.name}
            onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
            placeholder={zoneForm.type === 'city' ? 'e.g., Yaoundé Delivery Zone' : 'e.g., Bastos, Melen'}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Assigned Carriers</label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
              {mockCarriers.map((carrier) => (
                <label key={carrier} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={zoneForm.carriers.includes(carrier)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setZoneForm({ ...zoneForm, carriers: [...zoneForm.carriers, carrier] })
                      } else {
                        setZoneForm({ ...zoneForm, carriers: zoneForm.carriers.filter(c => c !== carrier) })
                      }
                    }}
                    className="rounded"
                  />
                  <span>{carrier}</span>
                </label>
              ))}
            </div>
          </div>

          {zoneForm.type === 'custom' && zoneForm.polygon.length > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Zone boundary:</strong> {zoneForm.polygon.length} points defined on map
              </p>
            </div>
          )}

          {zoneForm.type === 'custom' && zoneForm.polygon.length === 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> After creating this zone, use "Draw Zone" on the map to define its boundary.
              </p>
            </div>
          )}

          {zoneForm.type === 'city' && zoneForm.cityName && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Coverage:</strong> This zone will cover the entire {zoneForm.cityName} metropolitan area.
              </p>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="secondary" onClick={() => { setShowModal(false); setEditingZone(null) }}>
              Cancel
            </Button>
            <Button onClick={handleSaveZone} disabled={!zoneForm.name || zoneForm.carriers.length === 0}>
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}