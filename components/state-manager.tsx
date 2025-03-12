"use client"

import type React from "react"

import { useState } from "react"
import { type AppState, downloadStateFile, readStateFile } from "@/lib/json-export"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Upload, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface StateManagerProps {
  currentState: AppState
  onRestoreState: (state: AppState) => void
}

export function StateManager({ currentState, onRestoreState }: StateManagerProps) {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleExport = () => {
    downloadStateFile(currentState)
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const state = await readStateFile(file)
      onRestoreState(state)
    } catch (err) {
      setError("Failed to parse the state file. Please make sure it's a valid JSON file.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t("actions.saveState")}</h3>
        <p className="text-sm text-muted-foreground">{t("state.saveStateDescription")}</p>
        <Button onClick={handleExport} className="gap-2">
          <Save className="h-4 w-4" />
          {t("actions.saveState")}
        </Button>
      </div>

      <div className="border-t pt-6 space-y-4">
        <h3 className="text-lg font-medium">{t("actions.restoreState")}</h3>
        <p className="text-sm text-muted-foreground">{t("state.restoreStateDescription")}</p>

        <div className="space-y-2">
          <Label htmlFor="state-file">{t("state.stateFile")}</Label>
          <Input id="state-file" type="file" accept=".json" onChange={handleFileChange} className="cursor-pointer" />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleImport} disabled={!file || isLoading} className="gap-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("state.importing")}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {t("actions.restoreState")}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

