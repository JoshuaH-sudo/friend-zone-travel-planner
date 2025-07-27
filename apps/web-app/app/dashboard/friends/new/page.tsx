'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AddFriendForm from '../components/AddFriendForm'

const NewFriendPage = () => {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard/friends')
  }

  const handleCancel = () => {
    router.push('/dashboard/friends')
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/friends')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Friends
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Add New Friend</h1>
            <p className="text-muted-foreground">
              Add a friend and their location to your network
            </p>
          </div>
        </div>

        {/* Add Friend Form */}
        <AddFriendForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </main>
  )
}

export default NewFriendPage
