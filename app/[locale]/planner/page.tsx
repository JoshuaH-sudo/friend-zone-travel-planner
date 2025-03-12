'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AddFriendForm } from '@/components/add-friend-form';
import { AvailabilityOverview } from '@/components/availability-overview';
import { FriendCalendar } from '@/components/friend-calendar';
import { ImportCalendar } from '@/components/import-calendar';
import { ExportCalendar } from '@/components/export-calendar';
import { StateManager } from '@/components/state-manager';
import type { Friend } from '@/lib/types';
import type { AppState } from '@/lib/json-export';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Calendar,
  Users,
  Download,
  Upload,
  Home,
  Save,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-selector';

export default function PlannerPage() {
  const t = useTranslations();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showStateManager, setShowStateManager] = useState(false);

  const addFriend = (friend: Friend) => {
    setFriends([...friends, friend]);
    setShowAddFriend(false);
    setShowImport(false);
  };

  const updateFriendAvailability = (friendId: string, dates: Date[]) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId ? { ...friend, availableDates: dates } : friend
      )
    );
  };

  const updateFriendTimezone = (friendId: string, timezone: string) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId ? { ...friend, timezone } : friend
      )
    );
  };

  const updateFriend = (updatedFriend: Friend) => {
    setFriends(
      friends.map((friend) =>
        friend.id === updatedFriend.id ? updatedFriend : friend
      )
    );
  };

  const removeFriend = (friendId: string) => {
    setFriends(friends.filter((friend) => friend.id !== friendId));
  };

  const getCurrentState = (): AppState => {
    return {
      groupName,
      friends,
    };
  };

  const restoreState = (state: AppState) => {
    setGroupName(state.groupName);
    setFriends(state.friends);
    setShowStateManager(false);
  };

  return (
    <main className='container mx-auto max-w-6xl p-4'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/'
              className='flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground'
            >
              <Home className='h-4 w-4' />
              <span className='text-sm'>{t('navigation.home')}</span>
            </Link>
            <h1 className='text-3xl font-bold'>{t('app.title')}</h1>
          </div>
          <div className='flex gap-2'>
            <Dialog open={showStateManager} onOpenChange={setShowStateManager}>
              <DialogTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Save className='h-4 w-4' />
                  {t('actions.saveState')}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-md'>
                <h2 className='mb-4 text-xl font-bold'>
                  {t('actions.saveState')}
                </h2>
                <StateManager
                  currentState={getCurrentState()}
                  onRestoreState={restoreState}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showImport} onOpenChange={setShowImport}>
              <DialogTrigger asChild>
                <Button variant='outline' className='flex items-center gap-2'>
                  <Download className='h-4 w-4' />
                  {t('actions.import')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className='mb-4 text-xl font-bold'>
                  {t('actions.importCalendar')}
                </h2>
                <ImportCalendar
                  onImport={addFriend}
                  onCancel={() => setShowImport(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showExport} onOpenChange={setShowExport}>
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  className='flex items-center gap-2'
                  disabled={friends.length === 0}
                >
                  <Upload className='h-4 w-4' />
                  {t('actions.export')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <h2 className='mb-4 text-xl font-bold'>
                  {t('actions.exportCalendars')}
                </h2>
                <ExportCalendar friends={friends} groupName={groupName} />
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => setShowAddFriend(true)}
              className='flex items-center gap-2'
            >
              <PlusCircle className='h-4 w-4' />
              {t('actions.addFriend')}
            </Button>

            <LanguageSwitcher />
            
            <ThemeToggle />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='group-name'>{t('app.title')}</Label>
          <Input
            id='group-name'
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('app.groupNamePlaceholder')}
            className='max-w-md'
          />
        </div>

        {showAddFriend && (
          <div className='rounded-lg border bg-card p-4'>
            <AddFriendForm
              onAddFriend={addFriend}
              onCancel={() => setShowAddFriend(false)}
            />
          </div>
        )}

        {friends.length > 0 ? (
          <Tabs defaultValue='calendars'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger
                value='calendars'
                className='flex items-center gap-2'
              >
                <Calendar className='h-4 w-4' />
                {t('navigation.calendars')}
              </TabsTrigger>
              <TabsTrigger value='overview' className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                {t('navigation.overview')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value='calendars' className='mt-4'>
              <ScrollArea className='h-[calc(100vh-300px)]'>
                <div className='grid gap-6 md:grid-cols-2'>
                  {friends.map((friend) => (
                    <FriendCalendar
                      key={friend.id}
                      friend={friend}
                      onUpdateAvailability={updateFriendAvailability}
                      onRemoveFriend={removeFriend}
                      onUpdateTimezone={updateFriendTimezone}
                      onUpdateFriend={updateFriend}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value='overview' className='mt-4'>
              <AvailabilityOverview friends={friends} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className='flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/50 p-12'>
            <h2 className='text-xl font-medium'>{t('app.noFriendsTitle')}</h2>
            <p className='max-w-md text-center text-muted-foreground'>
              {t('app.noFriendsDescription')}
            </p>
            <div className='mt-2 flex gap-2'>
              <Button onClick={() => setShowAddFriend(true)} className='gap-2'>
                <PlusCircle className='h-4 w-4' />
                {t('actions.addFriend')}
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowImport(true)}
                className='gap-2'
              >
                <Download className='h-4 w-4' />
                {t('actions.import')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
