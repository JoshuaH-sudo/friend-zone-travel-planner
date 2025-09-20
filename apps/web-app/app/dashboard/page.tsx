import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Users, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div className='space-y-4 text-center'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Welcome to Friend Zone Travel Planner
        </h1>
        <p className='text-muted-foreground mx-auto max-w-2xl text-xl'>
          Plan, organize and meet with friends effortlessly - no matter where
          they are.
        </p>
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        <Card className='transition-shadow hover:shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plane className='text-primary h-5 w-5' />
              Plan a Trip
            </CardTitle>
            <CardDescription>
              Start planning your next adventure with friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='/dashboard/trips'>View Trips</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='text-primary h-5 w-5' />
              Manage Friends
            </CardTitle>
            <CardDescription>
              Add friends and manage their availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className='w-full'>
              <Link href='dashboard/friends'>View Friends</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className='transition-shadow hover:shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='text-primary h-5 w-5' />
              Check Availability
            </CardTitle>
            <CardDescription>
              See when everyone is free for your next hangout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant='outline' className='w-full' disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className='space-y-6'>
        <h2 className='text-center text-2xl font-semibold'>Features</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div className='flex items-start space-x-4'>
            <div className='flex-shrink-0'>
              <MapPin className='text-primary h-6 w-6' />
            </div>
            <div>
              <h3 className='font-semibold'>Timezone Support</h3>
              <p className='text-muted-foreground'>
                No more asking "what time is it over there?" Let Friend-zone
                answer it for you.
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-4'>
            <div className='flex-shrink-0'>
              <Users className='text-primary h-6 w-6' />
            </div>
            <div>
              <h3 className='font-semibold'>Friend Management</h3>
              <p className='text-muted-foreground'>
                Add your friends and let Friend-zone sort out all the hassle
                with thinking about what timezone they are in.
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-4'>
            <div className='flex-shrink-0'>
              <Calendar className='text-primary h-6 w-6' />
            </div>
            <div>
              <h3 className='font-semibold'>Availability Overview</h3>
              <p className='text-muted-foreground'>
                Compare all your friends availabilities in an easy to see and
                exportable calendar.
              </p>
            </div>
          </div>

          <div className='flex items-start space-x-4'>
            <div className='flex-shrink-0'>
              <Plane className='text-primary h-6 w-6' />
            </div>
            <div>
              <h3 className='font-semibold'>Trip Planning</h3>
              <p className='text-muted-foreground'>
                Plan your trips with friends and coordinate schedules
                seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
