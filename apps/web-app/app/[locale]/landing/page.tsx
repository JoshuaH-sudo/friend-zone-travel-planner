import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Friend Zone Travel Planner
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plan amazing trips with your friends. Coordinate destinations, manage itineraries, 
            and make unforgettable memories together.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🗺️ Plan Together
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Collaborate with friends to create the perfect travel itinerary. 
                Add destinations, set dates, and coordinate your adventure.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Manage Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Keep track of your travel companions and their locations. 
                Easily see who's joining which part of your journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🚀 Travel Smart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize routes, manage destinations, and ensure everyone 
                knows the plan. Make group travel stress-free.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
