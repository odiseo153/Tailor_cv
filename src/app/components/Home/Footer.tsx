"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { nameApp } from "@/app/utils/NameApp";
import { useI18n } from "@/app/context/I18nContext";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 py-16 mt-auto">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo y descripción */}
          <div className="space-y-6">
            <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent hover:from-indigo-500 hover:to-blue-600 transition-all">
              {nameApp}
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  {social === 'facebook' && <Facebook className="w-5 h-5" />}
                  {social === 'twitter' && <Twitter className="w-5 h-5" />}
                  {social === 'instagram' && <Instagram className="w-5 h-5" />}
                  {social === 'linkedin' && <Linkedin className="w-5 h-5" />}
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{t("footer.quickLinks")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("header.home")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("header.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("header.how_it_works")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("header.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{t("footer.legal")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">{t("footer.contact")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-indigo-400 mt-1" />
                <a href="mailto:odiseorincon@gmail.com" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  odiseorincon@gmail.com
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-indigo-400 mt-1" />
                <a href="tel:+18297890766" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  +829-789-0766
                </a>
              </li>
              
            </ul>
          </div>
        </div>

        <Separator className="my-12 border-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-indigo-400">{nameApp}</span>. {t("footer.rights")}
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
              {t("footer.terms")}
            </Link>
            <Link href="/cookies" className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
              {t("footer.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
