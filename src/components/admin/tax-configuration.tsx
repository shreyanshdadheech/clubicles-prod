'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TaxConfiguration } from '@/types'
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  CreditCard,
  Loader2
} from 'lucide-react'

interface TaxConfigurationProps {
  onTaxUpdate?: (taxes: TaxConfiguration[]) => void
}

export function TaxConfigurationComponent({ onTaxUpdate }: TaxConfigurationProps) {
  const [taxes, setTaxes] = useState<TaxConfiguration[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTax, setEditingTax] = useState<TaxConfiguration | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    percentage: 0,
    isEnabled: true,
    appliesTo: 'booking' as 'booking' | 'owner_payout' | 'both',
    description: ''
  })

  // Fetch tax configurations from API
  const fetchTaxConfigurations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/tax-configurations')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tax configurations')
      }
      
      setTaxes(result.data)
      onTaxUpdate?.(result.data)
    } catch (err: any) {
      console.error('Error fetching tax configurations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxConfigurations()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      percentage: 0,
      isEnabled: true,
      appliesTo: 'booking',
      description: ''
    })
  }

  const handleAddTax = async () => {
    if (!formData.name || formData.percentage < 0) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/admin/tax-configurations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          percentage: formData.percentage,
          isEnabled: formData.isEnabled,
          appliesTo: formData.appliesTo,
          description: formData.description
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create tax configuration')
      }

      // Refresh the list
      await fetchTaxConfigurations()
      setIsAddDialogOpen(false)
      resetForm()
    } catch (err: any) {
      console.error('Error creating tax configuration:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditTax = async () => {
    if (!editingTax || !formData.name || formData.percentage < 0) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/tax-configurations/${editingTax.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          percentage: formData.percentage,
          isEnabled: formData.isEnabled,
          appliesTo: formData.appliesTo,
          description: formData.description
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update tax configuration')
      }

      // Refresh the list
      await fetchTaxConfigurations()
      setIsEditDialogOpen(false)
      setEditingTax(null)
      resetForm()
    } catch (err: any) {
      console.error('Error updating tax configuration:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTax = async (taxId: string) => {
    if (!confirm('Are you sure you want to delete this tax configuration?')) return

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/tax-configurations/${taxId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete tax configuration')
      }

      // Refresh the list
      await fetchTaxConfigurations()
    } catch (err: any) {
      console.error('Error deleting tax configuration:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async (taxId: string) => {
    try {
      setSaving(true)
      setError(null)

      const tax = taxes.find(t => t.id === taxId)
      if (!tax) return

      const response = await fetch(`/api/admin/tax-configurations/${taxId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isEnabled: !tax.isEnabled
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update tax configuration')
      }

      // Refresh the list
      await fetchTaxConfigurations()
    } catch (err: any) {
      console.error('Error toggling tax configuration:', err)
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (tax: TaxConfiguration) => {
    setEditingTax(tax)
    setFormData({
      name: tax.name,
      percentage: tax.percentage,
      isEnabled: tax.isEnabled,
      appliesTo: tax.appliesTo,
      description: tax.description || ''
    })
    setIsEditDialogOpen(true)
  }

  const getAppliesTexToBadgeColor = (appliesTo: string) => {
    switch (appliesTo) {
      case 'booking': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'owner_payout': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
      case 'both': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            Tax Configuration
          </h2>
          <p className="text-gray-400">Manage tax rates and fees for bookings and owner payouts</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-white text-black hover:bg-gray-100 font-medium px-6 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => {
                resetForm()
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Tax
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Add New Tax Configuration</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300 font-medium">Tax Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., GST, Platform Fee"
                  className="bg-white border-gray-300 text-black placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="percentage" className="text-gray-300 font-medium">Percentage (%)</Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  className="bg-white border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applies_to" className="text-gray-300 font-medium">Applies To</Label>
                <Select value={formData.appliesTo} onValueChange={(value: any) => setFormData({ ...formData, appliesTo: value })}>
                  <SelectTrigger className="bg-white border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300 rounded-lg">
                    <SelectItem value="booking" className="text-black hover:bg-gray-100 focus:bg-gray-100">Customer Booking (added to bill)</SelectItem>
                    <SelectItem value="owner_payout" className="text-black hover:bg-gray-100 focus:bg-gray-100">Owner Payout (deducted from earnings)</SelectItem>
                    <SelectItem value="both" className="text-black hover:bg-gray-100 focus:bg-gray-100">Both Booking & Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300 font-medium">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this tax"
                  className="bg-white border-gray-300 text-black placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Switch
                  checked={formData.isEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
                />
                <Label className="text-gray-300 font-medium">Enable this tax immediately</Label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTax}
                  disabled={saving}
                  className="bg-white text-black hover:bg-gray-100 font-medium rounded-lg disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Tax Configuration'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-green-500/10 rounded-full w-fit mx-auto">
                <Settings className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{taxes.filter(tax => tax.isEnabled).length}</p>
              <p className="text-sm text-gray-400">Active Taxes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {taxes.filter(tax => tax.isEnabled && (tax.appliesTo === 'booking' || tax.appliesTo === 'both')).length}
              </p>
              <p className="text-sm text-gray-400">Customer Taxes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-orange-500/10 rounded-full w-fit mx-auto">
                <DollarSign className="w-6 h-6 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">
                {taxes.filter(tax => tax.isEnabled && (tax.appliesTo === 'owner_payout' || tax.appliesTo === 'both')).length}
              </p>
              <p className="text-sm text-gray-400">Owner Deductions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
          <CardContent className="p-6 pt-4 text-center">
            <div className="space-y-2">
              <div className="p-3 bg-purple-500/10 rounded-full w-fit mx-auto">
                <Percent className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{taxes.length}</p>
              <p className="text-sm text-gray-400">Total Configs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Configuration List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Tax Configurations</h3>
          {loading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-12 pt-4 text-center">
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin mx-auto" />
                <div>
                  <h4 className="text-white font-semibold mb-2">Loading Tax Configurations</h4>
                  <p className="text-gray-400">Please wait while we fetch your tax settings...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : taxes.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-12 pt-4 text-center">
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-full w-fit mx-auto">
                  <Settings className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">No Tax Configurations</h4>
                  <p className="text-gray-400 mb-4">Get started by creating your first tax configuration</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-white text-black hover:bg-gray-100 font-medium rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tax Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {taxes.map((tax) => (
              <Card key={tax.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-200">
                <CardContent className="p-6 pt-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{tax.name}</h3>
                        <Badge className={getAppliesTexToBadgeColor(tax.appliesTo)}>
                          {tax.appliesTo === 'booking' && 'Customer Booking'}
                          {tax.appliesTo === 'owner_payout' && 'Owner Payout'}  
                          {tax.appliesTo === 'both' && 'Both'}
                        </Badge>
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-lg">
                          <Percent className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">{tax.percentage}%</span>
                        </div>
                        <Badge className={tax.isEnabled 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }>
                          {tax.isEnabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {tax.description && (
                        <p className="text-gray-400 text-sm leading-relaxed">{tax.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created {new Date(tax.createdAt).toLocaleDateString()} • 
                        Last updated {new Date(tax.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleEnabled(tax.id)}
                        disabled={saving}
                        className={`rounded-lg border transition-colors disabled:opacity-50 ${
                          tax.isEnabled 
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20' 
                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : tax.isEnabled ? (
                          <>
                            <ToggleRight className="w-4 h-4 mr-1" />
                            Enabled
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 mr-1" />
                            Disabled
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(tax)}
                        disabled={saving}
                        className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg disabled:opacity-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTax(tax.id)}
                        disabled={saving}
                        className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Tax Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-gray-300 font-medium">Tax Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., GST, Platform Fee"
                className="bg-white border-gray-300 text-black placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-percentage" className="text-gray-300 font-medium">Percentage (%)</Label>
              <Input
                id="edit-percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                className="bg-white border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-applies_to" className="text-gray-300 font-medium">Applies To</Label>
              <Select value={formData.appliesTo} onValueChange={(value: any) => setFormData({ ...formData, appliesTo: value })}>
                <SelectTrigger className="bg-white border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300 rounded-lg">
                  <SelectItem value="booking" className="text-black hover:bg-gray-100 focus:bg-gray-100">Customer Booking (added to bill)</SelectItem>
                  <SelectItem value="owner_payout" className="text-black hover:bg-gray-100 focus:bg-gray-100">Owner Payout (deducted from earnings)</SelectItem>
                  <SelectItem value="both" className="text-black hover:bg-gray-100 focus:bg-gray-100">Both Booking & Payout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-gray-300 font-medium">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this tax"
                className="bg-white border-gray-300 text-black placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.isEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnabled: checked })}
              />
              <Label className="text-gray-300 font-medium">Enable this tax immediately</Label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditTax}
                disabled={saving}
                className="bg-white text-black hover:bg-gray-100 font-medium rounded-lg disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
