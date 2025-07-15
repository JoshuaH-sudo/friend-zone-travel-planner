'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, Loader2 } from 'lucide-react';
import useUpdateRouteName from '@/lib/hooks/useUpdateRouteName';

interface RouteNameInputProps {
  routeId: string;
  initialName: string;
}

const RouteNameInput = ({ routeId, initialName }: RouteNameInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [tempName, setTempName] = useState(initialName);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateRouteMutation = useUpdateRouteName({
    onSuccess: (updatedRoute) => {
      setName(updatedRoute.name);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error('Failed to update route name:', error);
      setTempName(name); // Revert to original name on error
    },
  });

  const handleSave = async () => {
    if (tempName.trim() === '') {
      setTempName(name);
      setIsEditing(false);
      return;
    }

    updateRouteMutation.mutate({
      routeId,
      name: tempName.trim(),
    });
  };

  const handleCancel = () => {
    setTempName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Handle click outside to exit edit mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isEditing && !updateRouteMutation.isPending) {
          handleCancel();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, updateRouteMutation.isPending]);

  return (
    <div className='grow space-y-2'>
      <Label htmlFor='route-name'>Route Name</Label>
      <div ref={containerRef} className='flex items-center gap-2'>
        {isEditing ? (
          <>
            <Input
              id='route-name'
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Enter route name'
              className='max-w-md'
              autoFocus
              disabled={updateRouteMutation.isPending}
            />
            <div className='flex gap-1 animate-in slide-in-from-left-3 duration-300 ease-out'>
              <Button
                size='sm'
                variant='outline'
                onClick={handleSave}
                disabled={updateRouteMutation.isPending}
                className='transition-all duration-200 hover:scale-105'
              >
                {updateRouteMutation.isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Check className='h-4 w-4' />
                )}
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleCancel}
                disabled={updateRouteMutation.isPending}
                className='transition-all duration-200 hover:scale-105'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </>
        ) : (
          <>
            <Input
              id='route-name'
              value={name}
              readOnly
              className='max-w-md cursor-pointer'
              onClick={() => setIsEditing(true)}
            />
            <Button
              size='sm'
              variant='outline'
              onClick={() => setIsEditing(true)}
              className='transition-all duration-200 hover:scale-105'
            >
              <Edit className='h-4 w-4' />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RouteNameInput;
