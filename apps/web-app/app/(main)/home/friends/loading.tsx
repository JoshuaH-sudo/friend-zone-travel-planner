import { Loader2 } from 'lucide-react'

export default function Loading() {
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

