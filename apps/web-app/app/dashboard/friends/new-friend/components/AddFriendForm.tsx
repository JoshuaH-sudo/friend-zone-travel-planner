'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const friendSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state_province: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  postal_code: z.string().optional(),
})

type FriendFormData = z.infer<typeof friendSchema>

const AddFriendForm = ({ onSuccess, onCancel }: AddFriendFormProps) => {
  const [previewCoordinates, setPreviewCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const queryClient = useQueryClient()

  const form = useForm<FriendFormData>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      name: '',
      street: '',
      city: '',
      state_province: '',
      country: '',
      postal_code: '',
    },
  })

  const { formState } = form
  const { isValid } = formState

  const { mutate: createFriendMutation, isPending: isCreateFriendPending } = useMutation({
    mutationFn: createFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      form.reset()
      setPreviewCoordinates(null)
      onSuccess?.()
    },
    onError: (error) => {
      console.error('Error creating friend:', error)
    },
  })

  const watchedValues = form.watch()

  const handlePreviewAddress = async () => {
    const { street, city, country, state_province, postal_code } = watchedValues
    
    if (!street || !city || !country) {
      return
    }

    setIsPreviewLoading(true)
    try {
      const addressParts = [
        street,
        city,
        state_province,
        country,
        postal_code
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

  const onSubmit = async (data: FriendFormData) => {
    createFriendMutation({
      name: data.name.trim(),
      street: data.street.trim(),
      city: data.city.trim(),
      state_province: data.state_province?.trim() || undefined,
      country: data.country.trim(),
      postal_code: data.postal_code?.trim() || undefined,
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter friend's name"
                disabled={isCreateFriendPending}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                {...form.register('street')}
                placeholder="123 Main Street"
                disabled={isCreateFriendPending}
              />
              {form.formState.errors.street && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.street.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register('city')}
                  placeholder="New York"
                  disabled={isCreateFriendPending}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state_province">State/Province</Label>
                <Input
                  id="state_province"
                  {...form.register('state_province')}
                  placeholder="NY"
                  disabled={isCreateFriendPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...form.register('country')}
                  placeholder="United States"
                  disabled={isCreateFriendPending}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  {...form.register('postal_code')}
                  placeholder="10001"
                  disabled={isCreateFriendPending}
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
                disabled={isPreviewLoading || !watchedValues.street || !watchedValues.city || !watchedValues.country}
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
              disabled={isCreateFriendPending || !isValid}
            >
              {isCreateFriendPending ? (
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

