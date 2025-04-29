'use client';

import type React from 'react';

import { useState } from 'react';
import {
  type AppState,
  downloadStateFile,
  readStateFile,
} from '@/lib/json-export';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Upload, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StateManagerProps {
  currentState: AppState;
  onRestoreState: (state: AppState) => void;
}

export function StateManager({
  currentState,
  onRestoreState,
}: StateManagerProps) {
  const t = useTranslations('stateManager');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    } else {
      setFile(null);
    }
  };

  const handleExport = () => {
    downloadStateFile(currentState);
  };

  const handleImport = async () => {
    if (!file) {
      setError(t('error.noFileSelected'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const state = await readStateFile(file);
      onRestoreState(state);
    } catch (err) {
      setError(t('error.failedToParse'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='space-y-4'>
        <h3 className='text-lg font-medium'>{t('actions.saveState')}</h3>
        <p className='text-sm text-muted-foreground'>
          {t('saveStateDescription')}
        </p>
        <Button
          onClick={handleExport}
          disabled={!currentState.groupName}
          className='gap-2'
        >
          <Save className='h-4 w-4' />
          {t('actions.saveState')}
        </Button>
        {!currentState.groupName && (
          <p className='text-xs text-destructive'>{t('error.noGroupName')}</p>
        )}
      </div>

      <div className='space-y-4 border-t pt-6'>
        <h3 className='text-lg font-medium'>{t('actions.restoreState')}</h3>
        <p className='text-sm text-muted-foreground'>
          {t('restoreStateDescription')}
        </p>

        <div className='space-y-2'>
          <Label htmlFor='state-file'>{t('label')}</Label>
          <Input
            id='state-file'
            type='file'
            accept='.json'
            onChange={handleFileChange}
            className='cursor-pointer'
          />
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleImport}
          disabled={!file || isLoading}
          className='gap-2'
        >
          {isLoading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              {t('importing')}
            </>
          ) : (
            <>
              <Upload className='h-4 w-4' />
              {t('actions.restoreState')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
