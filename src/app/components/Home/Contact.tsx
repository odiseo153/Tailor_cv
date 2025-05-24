'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Shield, Send, Mail, Phone, MapPin } from "lucide-react"
import { useState } from 'react';
import { Message } from "@/app/utils/Message"
import { motion } from "framer-motion"
import { useI18n } from "@/app/context/I18nContext"

export default function ContactSection() {
  const { t } = useI18n();
  
  const industries = [
    t("home.contact.industries.technology"),
    t("home.contact.industries.finance"),
    t("home.contact.industries.healthcare"),
    t("home.contact.industries.education"),
    t("home.contact.industries.marketing"),
    t("home.contact.industries.manufacturing"),
    t("home.contact.industries.retail"),
    t("home.contact.industries.hospitality"),
    t("home.contact.industries.construction"),
    t("home.contact.industries.legal"),
    t("home.contact.industries.media"),
    t("home.contact.industries.nonprofit"),
    t("home.contact.industries.government"),
    t("home.contact.industries.transportation"),
    t("home.contact.industries.energy"),
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name || !formData.email || !formData.industry || !formData.message) {
      Message.errorMessage('Por favor, completa todos los campos.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Error al enviar el mensaje: ${response.status}`);
      }

      console.log(data);

      Message.successMessage(t("home.contact.success"));
      setFormData({ name: '', email: '', industry: '', message: '' });
    } catch (error) {
      console.error(error);
      Message.errorMessage(t("home.contact.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-3 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {t("home.contact.tagline")}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t("home.contact.title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("home.contact.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
          {/* Información de contacto */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-xl h-full flex flex-col justify-between">
              <div>
                <motion.h3 variants={itemVariants} className="text-2xl font-bold mb-6">{t("home.contact.letsTalk")}</motion.h3>
                <motion.p variants={itemVariants} className="text-blue-100 mb-10">
                  {t("home.contact.commitment")}
                </motion.p>

                <motion.div variants={itemVariants} className="space-y-6">
                  <div className="flex items-start">
                    <Mail className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">{t("home.contact.email")}</p>
                      <p className="text-blue-100">soporte@tailorcv.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">{t("home.contact.phone")}</p>
                      <p className="text-blue-100">+34 91 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-blue-200 mt-1 mr-4" />
                    <div>
                      <p className="font-medium">{t("home.contact.location")}</p>
                      <p className="text-blue-100">{t("home.contact.address")}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Horario y redes sociales */}
              <motion.div variants={itemVariants} className="mt-12 pt-6 border-t border-blue-500/30">
                <p className="font-medium mb-2">{t("home.contact.businessHours")}</p>
                <p className="text-blue-100 mb-4">{t("home.contact.businessHoursTime")}</p>
                
                <div className="flex space-x-4 mt-4">
                  {['facebook', 'twitter', 'instagram', 'linkedin'].map((social, i) => (
                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                      <span className="sr-only">{social}</span>
                      <div className="w-5 h-5 text-white"></div>
                    </a>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Formulario de contacto */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t("home.contact.sendMessage")}</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                      {t("home.contact.fullName")} <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder={t("home.contact.namePlaceholder")}
                      onChange={handleChange} 
                      value={formData.name} 
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                      Email <span className="text-red-500 ml-1">*</span>
                    </label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder={t("home.contact.emailPlaceholder")}
                      onChange={handleChange} 
                      value={formData.email} 
                      className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="industry" className="text-sm font-medium text-gray-700 flex items-center">
                    {t("home.contact.yourIndustry")} <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="space-y-2">
                    <select 
                      id="industry"
                      name="industry"
                      value={formData.industry} 
                      onChange={handleChange}
                      aria-label={t("home.contact.yourIndustry")}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                      <option value="">{t("home.contact.industryPlaceholder")}</option>
                      {industries.map((industry, index) => (
                        <option key={index} value={industry}>{industry}</option>
                      ))}
                      <option value="other">{t("home.contact.otherIndustry")}</option>
                    </select>
                    
                    {formData.industry === "other" && (
                      <Input
                        id="industryCustom"
                        name="industry"
                        type="text"
                        placeholder={t("home.contact.specifyIndustry")}
                        onChange={handleChange}
                        value={formData.industry}
                        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center">
                    {t("home.contact.message")} <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder={t("home.contact.messagePlaceholder")}
                    rows={4} 
                    onChange={handleChange} 
                    value={formData.message} 
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? t("home.contact.sending") : t("home.contact.sendButton")}</span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{t("home.contact.dataProtected")}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-sm text-gray-600">{t("home.contact.gdprCompliant")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      
      </div>
    </section>
  )
}
