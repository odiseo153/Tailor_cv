"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'
import { useSession } from "next-auth/react"
import { Session } from "@/app/api/auth/[...nextauth]/route"
import ProfessionalProfile from '@/app/components/Profile/ProfessionalProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loading } from '../components/Loading'
import { useI18n } from '../context/I18nContext'


export default function Profile() {
  const { data: session, status } = useSession() as {
    data: Session | null;
    status: "loading" | "authenticated" | "unauthenticated";
  }
  const router = useRouter()
  const { t } = useI18n();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/')
    }
  }, [status, router])
  

  
  if (status === "loading") {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with quick actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl">{t('profile.quick_actions.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">

                <Button asChild variant="outline" className="w-full justify-start hover:bg-gray-100 transition-colors">
                  <Link href="/generar-cv">
                    <FileText className="mr-3 h-5 w-5 text-primary" />
                    {t('profile.quick_actions.generate_cv')}
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full justify-start hover:bg-gray-100 transition-colors">
                  <Link href="/profile/billing">
                    <CreditCard className="mr-3 h-5 w-5 text-primary" />
                    {t('profile.quick_actions.billing')}
                  </Link>
                </Button>

              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <ProfessionalProfile />
          </div>
        </div>
      </div>
    </div>
  )
}