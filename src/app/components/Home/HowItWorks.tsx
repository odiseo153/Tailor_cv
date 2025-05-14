"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Wand2, Download, Check } from "lucide-react"
import { useI18n } from "@/app/context/I18nContext"

export default function HowItWorks(){
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useI18n();
  
  const steps = [
    {
      title: t("home.howItWorks.step1"),
      icon: <Upload className="h-6 w-6 mr-3 text-blue-600" />,
      description: t("home.howItWorks.step1Description"),
      features: [
        t("home.howItWorks.step1Feature1"),
        t("home.howItWorks.step1Feature2"),
        t("home.howItWorks.step1Feature3"),
      ],
      visual: (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
            <div className="h-8 w-24 bg-blue-600 rounded text-white flex items-center justify-center text-xs">
              <Upload className="h-3 w-3 mr-1" /> Upload
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="h-4 w-full bg-gray-100 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-8 bg-green-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-4/5 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="bg-white p-3 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-8 bg-blue-100 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded"></div>
                  <div className="h-3 w-3/5 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: t("home.howItWorks.step2"),
      icon: <Wand2 className="h-6 w-6 mr-3 text-indigo-600" />,
      description: t("home.howItWorks.step2Description"),
      features: [
        t("home.howItWorks.step2Feature1"),
        t("home.howItWorks.step2Feature2"),
        t("home.howItWorks.step2Feature3")
      ],
      visual: (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="h-5 w-5 rounded-full bg-primary/20"></div>
              <div className="h-5 w-5 rounded-full bg-gray-200"></div>
              <div className="h-5 w-5 rounded-full bg-gray-200"></div>
            </div>
            <div className="h-6 w-20 bg-success/10 rounded-full flex items-center justify-center">
              <div className="h-2 w-12 bg-success rounded-full"></div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-1">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded"></div>
                  <div className="h-4 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-5/6 bg-muted rounded"></div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="h-full bg-primary/5 rounded border border-primary/20 p-2">
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-primary/20 rounded"></div>
                    <div className="h-3 w-3/4 bg-primary/20 rounded"></div>
                    <div className="h-3 w-5/6 bg-primary/20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-px w-full bg-muted"></div>
            
            <div className="flex justify-between items-center">
              <div className="h-8 w-24 bg-primary rounded text-white flex items-center justify-center text-xs">
                <Wand2 className="h-3 w-3 mr-1" /> Optimize
              </div>
              <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: t("home.howItWorks.step3"),
      icon: <Download className="h-6 w-6 mr-3 text-green-600" />,
      description: t("home.howItWorks.step3Description"),
      features: [
        t("home.howItWorks.step3Feature1"),
        t("home.howItWorks.step3Feature2"),
        t("home.howItWorks.step3Feature3")
      ],
      visual: (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="flex space-x-1">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <Download className="h-3 w-3 text-gray-500" />
              </div>
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
                <div className="h-3 w-3 text-gray-500 rounded-sm"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="h-28 bg-gradient-to-r from-gray-50 to-white rounded border border-gray-100"></div>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-8 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-50 rounded border border-gray-200 flex items-center justify-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-primary/5 rounded border border-primary/20 flex items-center justify-center">
                <div className="h-3 w-16 bg-primary/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="section bg-white">
      <div className="container mx-auto px-6 py-24">
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-3 px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {t("home.howItWorks.tagline")}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              {t("home.howItWorks.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("home.howItWorks.description")}
            </p>
          </motion.div>
        </div>

        {/* Main content */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Tabs Navigation */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {steps.map((step, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center p-4 cursor-pointer transition-all ${activeTab === idx ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'} ${idx !== steps.length - 1 ? 'border-b border-gray-200' : ''}`}
                  onClick={() => setActiveTab(idx)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${activeTab === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className={`font-medium ${activeTab === idx ? 'text-blue-800' : 'text-gray-800'}`}>{step.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-fade-in">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  {steps[activeTab].icon}
                  <h3 className="text-2xl font-bold text-gray-900">{steps[activeTab].title}</h3>
                </div>
                <p className="text-gray-700 mb-4">{steps[activeTab].description}</p>

                <ul className="space-y-3 mb-8">
                  {steps[activeTab].features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check size={20} className="text-green-500 mr-2 flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Representation */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-lg border border-gray-100 animate-fade-in">
                {steps[activeTab].visual}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}