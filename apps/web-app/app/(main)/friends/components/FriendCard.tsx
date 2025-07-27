'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { MapPin, Edit, Trash2, Eye } from 'lucide-react'
import { Friend } from '../hooks/useGetFriends'

interface FriendCardProps {
  friend: Friend
  onViewMap: (friend: Friend) => void
  onEdit: (friend: Friend) => void
  onDelete: (friend: Friend) => void
  isMapVisible: boolean
}

const FriendCard = ({ friend, onViewMap, onEdit, onDelete, isMapVisible }: FriendCardProps) => {
  const getFormattedAddress = (friend: Friend) => {
    const addressParts = [
      friend.street,
      friend.city,
      friend.state_province,
      friend.country,
      friend.postal_code
    ].filter(Boolean)
    
    return addressParts.length > 0 ? addressParts.join(', ') : friend.location
  }

  const getShortAddress = (friend: Friend) => {
    const parts = []
    if (friend.city) parts.push(friend.city)
    if (friend.country) parts.push(friend.country)
    
    return parts.length > 0 ? parts.join(', ') : friend.location
  }

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isMapVisible ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{friend.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate">{getShortAddress(friend)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewMap(friend)}
              className="h-8 w-8 p-0"
              title={isMapVisible ? 'Hide map' : 'View on map'}
            >
              <Eye className={`h-4 w-4 ${isMapVisible ? 'text-blue-600' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(friend)}
              className="h-8 w-8 p-0"
              title="Edit friend"
            >
              <Edit className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(friend)}
              className="h-8 w-8 p-0 hover:text-red-600"
              title="Delete friend"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p className="truncate" title={getFormattedAddress(friend)}>
              {getFormattedAddress(friend)}
            </p>
          </div>
          
          {friend.destinations && (
            <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Linked to destination</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Added {new Date(friend.created_at || '').toLocaleDateString()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewMap(friend)}
              className="text-xs"
            >
              {isMapVisible ? 'Hide Map' : 'View Location'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FriendCard

