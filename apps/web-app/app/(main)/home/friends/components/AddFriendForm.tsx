'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MapPin, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import createFriend from '../actions/createFriend'
import { getAddressCoordinates } from '@/lib/actions/google'

interface AddFriendFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  name: string
  street: string
  city: string
  state_province: string
  country: string
  postal_code: string
}

const AddFriendForm = ({ onSuccess, onCancel }: AddFriendFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    street: '',
    city: '',
    state_province: '',
    country: '',
    postal_code: '',
  })
  const [previewCoordinates, setPreviewCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const queryClient = useQueryClient()

  const createFriendMutation = useMutation({
    mutationFn: createFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      setFormData({
        name: '',
        street: '',
        city: '',
        state_province: '',
        country: '',
        postal_code: '',
      })
      setPreviewCoordinates(null)
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error creating friend:', error)
    },
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePreviewAddress = async () => {
    if (!formData.street || !formData.city || !formData.country) {
      return
    }

    setIsPreviewLoading(true)
    try {
      const addressParts = [
        formData.street,
        formData.city,
        formData.state_province,
        formData.country,
        formData.postal_code
      ].filter(Boolean)
      
      const fullAddress = addressParts.join(', ')
      const result = await getAddressCoordinates(fullAddress)
      
      if (result.status === 'OK' && result.results) {
        setPreviewCoordinates({
          lat: result.results.geometry.location.lat,
          lng: result.results.geometry.location.lng
        })
      }
    } catch (error) {
      console.error('Error previewing address:', error)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    createFriendMutation.mutate({
      name: formData.name.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      state_province: formData.state_province.trim() || undefined,
      country: formData.country.trim(),
      postal_code: formData.postal_code.trim() || undefined,
    })
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add New Friend</CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter friend's name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="123 Main Street"
                className={errors.street ? 'border-red-500' : ''}
              />
              {errors.street && <p className="text-sm text-red-500 mt-1">{errors.street}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="New York"
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <Label htmlFor="state_province">State/Province</Label>
                <Input
                  id="state_province"
                  value={formData.state_province}
                  onChange={(e) => handleInputChange('state_province', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="United States"
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Address Preview */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Address Preview</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePreviewAddress}
                disabled={isPreviewLoading || !formData.street || !formData.city || !formData.country}
              >
                {isPreviewLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                Preview Location
              </Button>
            </div>
            
            {previewCoordinates && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-sm text-green-800">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    Location found: {previewCoordinates.lat.toFixed(6)}, {previewCoordinates.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={createFriendMutation.isPending}
            >
              {createFriendMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding Friend...
                </>
              ) : (
                'Add Friend'
              )}
            </Button>
          </div>

          {createFriendMutation.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                {createFriendMutation.error.message}
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default AddFriendForm

