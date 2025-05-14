"use client"

import { motion } from "framer-motion"
import { FileText, Zap, Target, Award, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/app/context/I18nContext"

export default function About() {
  const { t } = useI18n();

  // Features ahora usando las traducciones
  const features = [
    {
      icon: FileText,
      title: t("home.about.features.customResumes"),
      description: t("home.about.features.customResumesDesc"),
    },
    {
      icon: Zap,
      title: t("home.about.features.aiAnalysis"),
      description: t("home.about.features.aiAnalysisDesc"),
    },
    {
      icon: Target,
      title: t("home.about.features.optimizedProcess"),
      description: t("home.about.features.optimizedProcessDesc"),
    },
    {
      icon: Award,
      title: t("home.about.features.successRate"),
      description: t("home.about.features.successRateDesc"),
    },
  ]

  // Variantes de animación
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const cardHover = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl bg-gradient-to-b from-gray-50 via-white to-blue-50">
      {/* Sección de Título */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center mb-20"
      >
        <div className="inline-block mb-4 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {t("home.about.tagline")}
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {t("home.about.title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t("home.about.description")}
        </p>
      </motion.div>

      {/* Sección de Misión */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center"
      >
        <div className="flex flex-col justify-center order-2 md:order-1">
          <div className="inline-block mb-4 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            {t("home.about.missionTagline")}
          </div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">{t("home.about.missionTitle")}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {t("home.about.missionDescription")}
          </p>
          <ul className="space-y-4 mb-8">
            {[
              t("home.about.mission1"),
              t("home.about.mission2"),
              t("home.about.mission3")
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="mr-3 mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative h-96 rounded-xl overflow-hidden shadow-2xl order-1 md:order-2">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl filter blur-sm opacity-50"></div>
          <img
            src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
            alt="Interfaz de la plataforma TailorCV"
            className="w-full h-full object-cover rounded-xl relative"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
        </div>
      </motion.div>

      {/* Sección de Características */}
      <div className="mb-24">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            {t("home.about.featuresTagline")}
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">{t("home.about.featuresTitle")}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t("home.about.featuresDescription")}
          </p>
        </motion.div>
          
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card 
              key={i}
              className="border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 * i }}
                whileHover="hover"
                variants={cardHover}
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="rounded-2xl p-10 mb-16 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 rounded-2xl"></div>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {t("home.about.statsTagline")}
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">{t("home.about.statsTitle")}</h2>
            <p className="text-lg text-gray-600">{t("home.about.statsDescription")}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: t("home.about.stats.users") },
              { value: "85%", label: t("home.about.stats.rate") },
              { value: "10x", label: t("home.about.stats.timeSaving") },
              { value: "24/7", label: t("home.about.stats.support") }
            ].map((stat, index) => (
              <div key={index} className="flex flex-col items-center group">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</span>
                <span className="text-gray-600">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Final */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="text-center py-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl"
      >
        <h2 className="text-3xl font-bold mb-4 text-white">{t("home.about.ctaTitle")}</h2>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
          {t("home.about.ctaDescription")}
        </p>
        <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          {t("home.about.ctaButton")}
        </Button>
      </motion.div>
    </div>
  )
}