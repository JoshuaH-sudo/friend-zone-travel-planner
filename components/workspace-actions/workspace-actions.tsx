'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { StateManager } from './state-manager';
import { ImportCalendar } from './import-calendar';
import { ExportCalendar } from './export-calendar';
import { PlusCircle, Download, Upload, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Friend } from '@/lib/types';
import type { AppState } from '@/lib/json-export';

interface WorkspaceActionsProps {
  friends: Friend[];
  groupName: string;
  onAddFriend: (friend: Friend) => void;
  onShowAddFriendForm: () => void;
  onRestoreState?: (state: AppState) => void;
}

export function WorkspaceActions({
  friends,
  groupName,
  onAddFriend,
  onShowAddFriendForm,
  onRestoreState,
}: WorkspaceActionsProps) {
  const t = useTranslations('workspace-actions');
  const [showStateManager, setShowStateManager] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const getCurrentState = (): AppState => {
    return {
      groupName,
      friends,
    };
  };

  const handleRestoreState = (state: AppState) => {
    if (onRestoreState) {
      onRestoreState(state);
    }
    setShowStateManager(false);
  };

  return (
    <div id="workspace-actions" className='flex gap-2'>
      <Dialog open={showStateManager} onOpenChange={setShowStateManager}>
        <DialogTrigger asChild>
          <Button variant='outline' className='flex items-center gap-2'>
            <Save className='h-4 w-4' />
            {t('saveState')}
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-md'>
          <h2 className='mb-4 text-xl font-bold'>
            {t('saveState')}
          </h2>
          <StateManager
            currentState={getCurrentState()}
            onRestoreState={handleRestoreState}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showImport} onOpenChange={setShowImport}>
        <DialogTrigger asChild>
          <Button variant='outline' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            {t('import')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <h2 className='mb-4 text-xl font-bold'>
            {t('importCalendar')}
          </h2>
          <ImportCalendar
            friends={friends}
            onImport={(friend) => {
              onAddFriend(friend);
              setShowImport(false);
            }}
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
            {t('export')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <h2 className='mb-4 text-xl font-bold'>
            {t('exportCalendars')}
          </h2>
          <ExportCalendar friends={friends} groupName={groupName} />
        </DialogContent>
      </Dialog>

      <Button
        onClick={onShowAddFriendForm}
        className='flex items-center gap-2'
      >
        <PlusCircle className='h-4 w-4' />
        {t('addFriend')}
      </Button>
    </div>
  );
}
