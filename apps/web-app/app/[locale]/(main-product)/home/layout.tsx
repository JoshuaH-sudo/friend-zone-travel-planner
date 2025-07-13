import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* App Name */}
          <h1 className="text-xl font-semibold text-foreground">
            Friend Zone Travel Planner
          </h1>
          
          {/* Logout Button */}
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button type="submit" variant="outline">
              Logout
            </Button>
          </form>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}