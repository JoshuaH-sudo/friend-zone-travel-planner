'use client';

import { useEffect, useState } from 'react';
import { AddFriendForm } from '@/components/friend-form/add-friend-form';
import { AvailabilityOverview } from '@/components/availability-overview/availability-overview';
import { FriendCalendar } from '@/components/friend-calander/friend-calendar';
import { WorkspaceActions } from '@/components/workspace-actions/workspace-actions';
import { EmptyState } from '@/components/empty-state';
import type { AvailableHours, Friend } from '@/lib/types';
import type { AppState } from '@/lib/json-export';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { TimezoneComparison } from '@/components/timezone/timezone-comparison';

export default function PlannerPage() {
  const t = useTranslations();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groupName, setGroupName] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const addFriend = (friend: Friend) => {
    setFriends([...friends, friend]);
    setShowAddFriend(false);
  };

  const onUpdateAvailableDates = (friendId: string, dates: Date[]) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId ? { ...friend, availableDates: dates } : friend
      )
    );
  };

  const onUpdateAvailableHours = (
    friendId: string,
    availableHours: Partial<AvailableHours>
  ) => {
    setFriends(
      friends.map((friend) =>
        friend.id === friendId
          ? {
              ...friend,
              availableHours: { ...friend.availableHours, ...availableHours },
            }
          : friend
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

  const restoreState = (state: AppState) => {
    setGroupName(state.groupName);
    setFriends(state.friends);
  };

  useEffect(() => {
    const storedState = localStorage.getItem('plannerState');
    console.log('Stored state:', storedState);
    if (storedState) {
      const state = JSON.parse(storedState as string);
      setGroupName(state.groupName);
      setFriends(state.friends);
    }
  }, []);

  useEffect(() => {
    // To prevent the initial render from setting the state in localStorage to empty,
    // When the user switches language / component unmounts.
    if (!isMounted) {
      return setIsMounted(true);
    }

    localStorage.setItem(
      'plannerState',
      JSON.stringify({
        groupName,
        friends,
      })
    );
  }, [groupName, friends, isMounted]);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-row items-end justify-between'>
        <div className='flex-grow space-y-2'>
          <Label htmlFor='group-name'>{t('app.groupName')}</Label>
          <Input
            id='group-name'
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('app.groupNamePlaceholder')}
            className='max-w-md'
          />
        </div>

        <WorkspaceActions
          friends={friends}
          groupName={groupName}
          onAddFriend={addFriend}
          onShowAddFriendForm={() => setShowAddFriend(true)}
          onRestoreState={restoreState}
        />
      </div>

      {showAddFriend && (
        <div className='rounded-lg border bg-card p-4'>
          <AddFriendForm
            friends={friends}
            onAddFriend={addFriend}
            onCancel={() => setShowAddFriend(false)}
          />
        </div>
      )}

      {friends.length > 0 ? (
        <Tabs defaultValue='calendars'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='calendars' className='flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              {t('navigation.calendars')}
            </TabsTrigger>
            <TabsTrigger value='timezone' className='flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              {t('navigation.timezone')}
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
                    friends={friends}
                    onUpdateAvailableDates={onUpdateAvailableDates}
                    onUpdateAvailableHours={onUpdateAvailableHours}
                    onRemoveFriend={removeFriend}
                    onUpdateFriend={updateFriend}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value='timezone' className='mt-4'>
            <TimezoneComparison friends={friends} />
          </TabsContent>
          <TabsContent value='overview' className='mt-4'>
            <AvailabilityOverview friends={friends} />
          </TabsContent>
        </Tabs>
      ) : (
        <EmptyState onShowAddFriend={() => setShowAddFriend(true)} />
      )}
    </div>
  );
}
