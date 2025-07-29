'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useGetFriends, { Friend } from './hooks/useGetFriends'
import FriendCard from './components/FriendCard'
import FriendMapView from './components/FriendMapView'
import DeleteFriendDialog from './components/DeleteFriendDialog'

const FriendsPage = () => {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [deletingFriend, setDeletingFriend] = useState<Friend | null>(null)
  const router = useRouter()
  
  const { data: friends = [], isLoading, error } = useGetFriends()

  const handleViewMap = (friend: Friend) => {
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null)
    } else {
      setSelectedFriend(friend)
    }
  }

  const handleEdit = (friend: Friend) => {
    router.push(`/dashboard/friends/${friend.id}`)
  }

  const handleDelete = (friend: Friend) => {
    setDeletingFriend(friend)
  }

  const handleAddNewFriend = () => {
    router.push('/dashboard/friends/new-friend')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Friends</h1>
            <p className="text-muted-foreground">
              There was an error loading your friends. Please try again later.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Friends</h1>
            <p className="text-muted-foreground">
              Manage your friends and their locations for easy trip planning
            </p>
          </div>
          <Button 
            onClick={handleAddNewFriend}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Friend
          </Button>
        </div>

        {friends.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">No friends yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start building your network by adding friends and their locations. 
              This will make it easier to plan trips and meetups!
            </p>
            <Button 
              onClick={handleAddNewFriend}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Friend
            </Button>
          </div>
        ) : (
          /* Friends Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Friend Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  All Friends ({friends.length})
                </h2>
              </div>
              
              <div className="space-y-4">
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onViewMap={handleViewMap}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isMapVisible={selectedFriend?.id === friend.id}
                  />
                ))}
              </div>
            </div>

            {/* Right Column - Map Preview */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              {selectedFriend ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Location Preview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFriend(null)}
                    >
                      Close Preview
                    </Button>
                  </div>
                  <div className="h-[500px] relative">
                    <FriendMapView friend={selectedFriend} />
                  </div>
                </div>
              ) : (
                <div className="h-[500px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted/10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a friend to preview their location
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Click on any friend card to see their location on the map
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteFriendDialog
          friend={deletingFriend}
          open={!!deletingFriend}
          onOpenChange={(open) => !open && setDeletingFriend(null)}
        />
      </div>
    </main>
  )
}

export default FriendsPage

