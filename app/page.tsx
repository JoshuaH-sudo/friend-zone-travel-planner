"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Upload, Download, Globe } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function LandingPage() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{t("app.title")}</span>
          </div>
          <Link href="/planner">
            <Button>{t("actions.add")}</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("landing.title")} <span className="text-primary">{t("landing.titleHighlight")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">{t("landing.subtitle")}</p>
            <Link href="/planner">
              <Button size="lg" className="gap-2">
                <Calendar className="h-5 w-5" />
                {t("landing.startPlanning")}
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">{t("landing.features")}</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("landing.featureManagement.title")}</h3>
                <p className="text-muted-foreground">{t("landing.featureManagement.description")}</p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("landing.featureTimezone.title")}</h3>
                <p className="text-muted-foreground">{t("landing.featureTimezone.description")}</p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("landing.featureOverview.title")}</h3>
                <p className="text-muted-foreground">{t("landing.featureOverview.description")}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Download className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("landing.featureImport.title")}</h3>
                <p className="text-muted-foreground">{t("landing.featureImport.description")}</p>
              </div>

              <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="bg-primary/10 p-3 rounded-full mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("landing.featureExport.title")}</h3>
                <p className="text-muted-foreground">{t("landing.featureExport.description")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold mb-6">{t("landing.readyToStart")}</h2>
            <p className="text-xl text-muted-foreground mb-8">{t("landing.readyDescription")}</p>
            <Link href="/planner">
              <Button size="lg">{t("landing.goToPlanner")}</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t("landing.copyright", { year: currentYear.toString() })}</p>
        </div>
      </footer>
    </div>
  )
}

