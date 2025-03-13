import type React from "react"
import { Check, X, Leaf, Rocket, Crown, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function PricingSection() {
  return (
    <section className="container mx-auto px-4 py-8 md:px-8 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold mb-3">Planes de Precios</h2>
        <p className="text-muted-foreground text-sm md:text-base">
          Para candidatos ocasionales, profesionales serios y equipos empresariales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Free Plan */}
        <Card className="border-border bg-[#F3F4F6] hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-background">
                <Leaf className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Free</CardTitle>
            <div className="flex justify-center items-baseline mt-4">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="ml-1 text-muted-foreground">/mes</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <FeatureItem included>3 ofertas de trabajo</FeatureItem>
              <FeatureItem included>Perfil básico</FeatureItem>
              <FeatureItem included={false}>Soporte prioritario</FeatureItem>
              <FeatureItem included={false}>Estadísticas avanzadas</FeatureItem>
              <FeatureItem included={false}>Personalización de CV</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Empezar Gratis
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-primary relative scale-[1.05] shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] z-10">
          <div className="absolute -top-3 right-0 left-0 flex justify-center">
            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500">Más Popular</Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#3B82F6] to-[#6366F1] opacity-[0.03] rounded-lg" />
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Premium</CardTitle>
            <div className="flex justify-center items-baseline mt-4">
              <span className="text-4xl font-extrabold">$20</span>
              <span className="ml-1 text-muted-foreground">/mes</span>
            </div>
            <CardDescription className="text-center mt-2">Facturación anual ahorra un 30%</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <FeatureItem included>Ofertas ilimitadas</FeatureItem>
              <FeatureItem included>Perfil destacado</FeatureItem>
              <FeatureItem included>
                Soporte prioritario
                <InfoTooltip content="Respuesta en menos de 24 horas" />
              </FeatureItem>
              <FeatureItem included>Estadísticas avanzadas</FeatureItem>
              <FeatureItem included={false}>Personalización de CV</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              Probar 7 Días Gratis
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-[#F59E0B] hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] hover:border-[#F59E0B]/80">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[#FEF3C7]">
                <Crown className="h-6 w-6 text-[#F59E0B]" />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Super</CardTitle>
            <div className="flex justify-center items-baseline mt-4">
              <span className="text-4xl font-extrabold">$99</span>
              <span className="ml-1 text-muted-foreground">/mes</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              <FeatureItem included>Ofertas ilimitadas</FeatureItem>
              <FeatureItem included>Perfil destacado premium</FeatureItem>
              <FeatureItem included>
                Soporte 24/7
                <InfoTooltip content="Soporte telefónico y por chat" />
              </FeatureItem>
              <FeatureItem included>Estadísticas avanzadas</FeatureItem>
              <FeatureItem included>Personalización de CV</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7] hover:text-[#B45309]"
            >
              Contactar para Empresas
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 overflow-x-auto">
        <h3 className="text-xl font-bold mb-6 text-center">Comparativa de Planes</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b">Característica</th>
              <th className="text-center p-3 border-b">Free</th>
              <th className="text-center p-3 border-b bg-blue-50">Premium</th>
              <th className="text-center p-3 border-b">Super</th>
            </tr>
          </thead>
          <tbody>
            <ComparisonRow feature="CVs Ilimitados" free={false} premium={true} super={true} />
            <ComparisonRow feature="Soporte 24/7" free={false} premium={false} super={true} />
            <ComparisonRow feature="Alertas de Empleo" free={true} premium={true} super={true} />
            <ComparisonRow feature="Estadísticas Avanzadas" free={false} premium={true} super={true} />
            <ComparisonRow feature="Personalización de Perfil" free={false} premium={true} super={true} />
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FeatureItem({ included, children }: { included: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <span className="mr-2 mt-0.5">
        {included ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
      </span>
      <span className={cn("text-sm", !included && "text-muted-foreground")}>{children}</span>
    </li>
  )
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground inline ml-1 cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ComparisonRow({
  feature,
  free,
  premium,
  super: superPlan,
}: {
  feature: string
  free: boolean
  premium: boolean
  super: boolean
}) {
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-3 text-sm">{feature}</td>
      <td className="p-3 text-center">
        {free ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
      </td>
      <td className="p-3 text-center bg-blue-50">
        {premium ? (
          <Check className="h-5 w-5 text-green-500 mx-auto" />
        ) : (
          <X className="h-5 w-5 text-red-500 mx-auto" />
        )}
      </td>
      <td className="p-3 text-center">
        {superPlan ? (
          <Check className="h-5 w-5 text-green-500 mx-auto" />
        ) : (
          <X className="h-5 w-5 text-red-500 mx-auto" />
        )}
      </td>
    </tr>
  )
}

