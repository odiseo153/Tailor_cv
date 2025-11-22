'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Shield, Send, Mail, Phone, MapPin, Instagram, Linkedin, Facebook } from "lucide-react"
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
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    industry: '',
    message: '',
    industryOther: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const fields = [
    { name: "name", label: t("home.contact.fullName") },
    { name: "email", label: "Email" },
    { name: "industry", label: t("home.contact.yourIndustry") },
    { name: "message", label: t("home.contact.message") }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === "industry" && value !== "other" ? { industryOther: '' } : {}) // Reset industryOther if another industry picked
    }));
    setMissingFields([]); // Clean missing on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    let fieldList = ["name", "email", "industry", "message"];
    let missing = fieldList.filter(f => {
      if (f === "industry" && formData.industry === "other") return !formData.industryOther;
      return !formData[f as keyof typeof formData];
    });
    if (missing.length) {
      setMissingFields(missing);
      Message.errorMessage(
        "Por favor completa los campos: " +
        missing.map(name =>
          name === "name" ? t("home.contact.fullName")
          : name === "email" ? "Email"
          : name === "industry" ? t("home.contact.yourIndustry")
          : name === "message" ? t("home.contact.message")
          : name
        ).join(', ')
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/email', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          industry: formData.industry === "other" ? formData.industryOther : formData.industry
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      Message.successMessage(t("home.contact.success"));
      setFormData({ name: '', email: '', industry: '', message: '', industryOther: '' });
    } catch {
      Message.errorMessage(t("home.contact.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animaciones simples
  const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: (i:number) => ({
      opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 }
    })
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration: .7 } }
          }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 mb-3 rounded-full bg-gradient-to-r from-blue-100 via-indigo-100 to-blue-200 shadow text-blue-700 text-sm font-medium">
            <Mail className="w-4 h-4 text-blue-600" /> {t("home.contact.tagline")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow">
            {t("home.contact.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mt-2">
            {t("home.contact.description")}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div
            className="flex-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={0}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-700 shadow-2xl rounded-3xl px-8 py-8 flex flex-col gap-10 justify-between relative overflow-hidden">
              {/* Efecto Glow decorativo */}
              <div className="absolute left-0 top-0 w-32 h-32 bg-blue-300/30 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute right-0 bottom-0 w-28 h-28 bg-indigo-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
              <div>
                <motion.h3
                  variants={fade}
                  custom={1}
                  className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-lg mr-2" />
                    {t("home.contact.letsTalk")}
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-300 animate-pulse shadow-lg ml-2" />
                  </span>
                </motion.h3>
                <motion.p variants={fade} custom={2} className="text-blue-100 mb-7">{t("home.contact.commitment")}</motion.p>
                <motion.ul 
                  variants={fade} 
                  custom={3} 
                  className="flex flex-col gap-5 text-sm mt-3"
                >
                  <li className="flex items-center gap-4 bg-gradient-to-r from-blue-600/60 to-indigo-700/80 rounded-xl px-4 py-3 shadow-lg hover:from-blue-700/70 hover:to-indigo-800/80 transition">
                    <span className="flex justify-center items-center w-10 h-10 rounded-full bg-white/10 border border-blue-200/20 shadow">
                      <Mail className="w-6 h-6 text-blue-100" />
                    </span>
                    <span className="flex flex-col">
                      <span className="uppercase tracking-wide font-semibold text-xs text-blue-200">{t("home.contact.email")}</span>
                      <span className="font-medium text-base text-blue-50">odiseorincon@gmail.com</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-4 bg-gradient-to-r from-blue-600/60 to-indigo-700/80 rounded-xl px-4 py-3 shadow-lg hover:from-blue-700/70 hover:to-indigo-800/80 transition">
                    <span className="flex justify-center items-center w-10 h-10 rounded-full bg-white/10 border border-blue-200/20 shadow">
                      <Phone className="w-6 h-6 text-blue-100" />
                    </span>
                    <span className="flex flex-col">
                      <span className="uppercase tracking-wide font-semibold text-xs text-blue-200">{t("home.contact.phone")}</span>
                      <span className="font-medium text-base text-blue-50">+829-789-0766</span>
                    </span>
                  </li>
                  <li className="flex items-center gap-4 bg-gradient-to-r from-blue-600/60 to-indigo-700/80 rounded-xl px-4 py-3 shadow-lg hover:from-blue-700/70 hover:to-indigo-800/80 transition">
                    <span className="flex justify-center items-center w-10 h-10 rounded-full bg-white/10 border border-blue-200/20 shadow">
                      <MapPin className="w-6 h-6 text-blue-100" />
                    </span>
                    <span className="flex flex-col">
                      <span className="uppercase tracking-wide font-semibold text-xs text-blue-200">{t("home.contact.location")}</span>
                      <span className="font-medium text-base text-blue-50">{t("home.contact.address")}</span>
                    </span>
                  </li>
                </motion.ul>
              </div>
              <div>
                <div className="mt-0 pt-4 border-t border-blue-200/30">
                  <div className="flex items-center gap-2 text-xs text-blue-100 mb-2">
                    <Shield className="h-4 w-4 text-blue-200" />
                    <span>{t("home.contact.dataProtected")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-green-200" />
                    <span>{t("home.contact.gdprCompliant")}</span>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  {[
                    { name: 'Facebook', url: 'https://www.facebook.com/Odise0', icon: <Facebook />},
                    { name: 'Instagram', url: 'https://www.instagram.com/odiseo153/', icon: <Instagram />},
                    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/odiseo-esmerlin-rincon-sanchez-48053524b/', icon: <Linkedin /> }
                  ].map(s => (
                    <a key={s.name} href={s.url} aria-label={s.name}
                      className="w-10 h-10 flex items-center justify-center bg-white/10 text-white rounded-full hover:bg-white/20 transition"
                      target="_blank" rel="noopener noreferrer"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="flex-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
            custom={1}
          >
            <div className="bg-white  rounded-3xl shadow-2xl border border-gray-100 px-8 py-8 relative">
              <motion.form onSubmit={handleSubmit} className="flex flex-col gap-6" initial="hidden" animate="visible">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      id="name"
                      name="name"
                      placeholder={t("home.contact.namePlaceholder")}
                      onChange={handleChange}
                      value={formData.name}
                      className={`border-2 px-3 py-2 rounded-md text-base w-full focus:border-blue-400 ${missingFields.includes('name') ? 'border-red-400' : 'border-gray-200'}`}
                      aria-invalid={missingFields.includes('name')}
                      aria-label={t("home.contact.fullName")}
                    />
                    <span className="block text-xs text-gray-500 mt-1">{t("home.contact.fullName")} *</span>
                  </div>
                  <div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t("home.contact.emailPlaceholder")}
                      onChange={handleChange}
                      value={formData.email}
                      className={`border-2 px-3 py-2 rounded-md text-base w-full focus:border-blue-400 ${missingFields.includes('email') ? 'border-red-400' : 'border-gray-200'}`}
                      aria-invalid={missingFields.includes('email')}
                      aria-label="Email"
                    />
                    <span className="block text-xs text-gray-500 mt-1">Email *</span>
                  </div>
                </div>

                <div>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`w-full h-10 px-3 border-2 rounded-md bg-white text-base focus:border-indigo-500 ${missingFields.includes('industry') ? 'border-red-400' : 'border-gray-200'}`}
                    aria-invalid={missingFields.includes('industry') ? 'true' : 'false'}
                    aria-label={t("home.contact.yourIndustry")}
                  >
                    <option value="">{t("home.contact.industryPlaceholder")}</option>
                    {industries.map((industry, index) => (
                      <option key={index} value={industry}>{industry}</option>
                    ))}
                    <option value="other">{t("home.contact.otherIndustry")}</option>
                  </select>
                  {formData.industry === "other" && (
                    <Input
                      id="industryOther"
                      name="industryOther"
                      type="text"
                      placeholder={t("home.contact.specifyIndustry")}
                      onChange={handleChange}
                      value={formData.industryOther}
                      className={`mt-2 border-2 px-3 py-2 rounded-md text-base w-full focus:border-blue-400 ${missingFields.includes('industry') ? 'border-red-400' : 'border-gray-200'}`}
                    />
                  )}
                  <span className="block text-xs text-gray-500 mt-1">{t("home.contact.yourIndustry")} *</span>
                </div>

                <div>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder={t("home.contact.messagePlaceholder")}
                    rows={4}
                    onChange={handleChange}
                    value={formData.message}
                    className={`h-24 border-2 px-3 py-2 rounded-md text-base w-full focus:border-indigo-500 resize-none ${missingFields.includes('message') ? 'border-red-400' : 'border-gray-200'}`}
                    aria-invalid={missingFields.includes('message')}
                  />
                  <span className="block text-xs text-gray-500 mt-1">{t("home.contact.message")} *</span>
                </div>

                {missingFields.length > 0 && (
                  <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm flex gap-2 items-center">
                    <span>
                      {missingFields.map(name =>
                        name === "name" ? t("home.contact.fullName") :
                        name === "email" ? "Email" :
                        name === "industry" ? t("home.contact.yourIndustry") :
                        name === "message" ? t("home.contact.message") : name
                      ).join(', ')}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg text-lg uppercase tracking-wide transition"
                >
                  <Send className="h-5 w-5" />
                  <span>{isSubmitting ? t("home.contact.sending") : t("home.contact.sendButton")}</span>
                </Button>
              </motion.form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
