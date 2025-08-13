'use client';

import { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, Home, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Friend {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
}

export interface FriendAccommodationSelectorProps {
  friends: Friend[];
  isLoading: boolean;
  error: Error | null;
  selectedFriendId: string | null;
  onSelectFriend: (friendId: string, name: string, address: string) => void;
  onRefresh: () => void;
}

const FriendAccommodationSelector: FC<FriendAccommodationSelectorProps> = ({
  friends,
  isLoading,
  error,
  selectedFriendId,
  onSelectFriend,
  onRefresh,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Finding friends nearby...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Failed to load friends</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="text-xs"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-sm">No friends found near this location</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="mt-2 text-xs"
        >
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium mb-2">Select a friend to stay with:</h3>
        <RadioGroup value={selectedFriendId || undefined} className="gap-2">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-start space-x-2">
              <RadioGroupItem 
                value={friend.id} 
                id={`friend-${friend.id}`} 
                className="mt-1"
                onClick={() => onSelectFriend(friend.id, friend.name, friend.location)}
              />
              <Label 
                htmlFor={`friend-${friend.id}`}
                className="flex-1 cursor-pointer"
              >
                <Card className={`hover:shadow-md transition-shadow ${selectedFriendId === friend.id ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      {friend.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {friend.location}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </ScrollArea>
  );
};

export default FriendAccommodationSelector;

