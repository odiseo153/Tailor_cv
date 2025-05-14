"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { nameApp } from "@/app/utils/NameApp";
import CVPreview from "./CVPreview";
import { useI18n } from "@/app/context/I18nContext";

export default function HeroSection() {
  const { t } = useI18n();
  
  return (
    <section className="bg-gradient-to-b py-28 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-12 relative">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg className="absolute -top-24 -right-24 w-96 h-96 text-blue-100 opacity-30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M40.9,-59.7C52.9,-53.5,62.3,-41.4,69.5,-27.5C76.7,-13.7,81.7,2,78.3,15.2C74.9,28.5,63.1,39.4,50.3,49.1C37.6,58.8,23.9,67.2,8.8,70.8C-6.4,74.4,-23,73.1,-37.9,66.4C-52.8,59.6,-66,47.4,-72.3,32.6C-78.6,17.9,-78.1,0.6,-73.5,-14.2C-68.9,-29,-60.2,-41.2,-48.6,-47.8C-37,-54.4,-22.5,-55.3,-8.6,-60.1C5.3,-64.9,28.9,-65.8,40.9,-59.7Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute -bottom-32 -left-32 w-96 h-96 text-blue-100 opacity-30" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M42.8,-66.2C51.4,-58.9,51.3,-39.7,57.6,-23.3C64,-6.9,77,-3.5,79.5,1.5C82,6.4,74.1,12.8,67.7,19.9C61.3,27.1,56.4,35,48.8,42.7C41.1,50.3,30.7,57.6,18.8,61.9C6.9,66.2,-6.7,67.4,-19.3,65.3C-32,63.2,-43.8,57.8,-50.2,48.7C-56.6,39.6,-57.8,27,-58.8,15.7C-59.8,4.4,-60.7,-5.5,-60.6,-17.3C-60.5,-29,-59.5,-42.6,-51.7,-50.3C-43.8,-58,-29.2,-59.8,-15.7,-62.2C-2.3,-64.5,10.9,-67.4,22.4,-68.1C33.9,-68.8,42.7,-67.3,42.8,-66.2Z" transform="translate(100 100)" />
          </svg>
        </div>
        
        {/* Texto */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="md:w-1/2 md:pr-16 text-center md:text-left z-10"
        >
          <div className="inline-block mb-3 px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {t("home.hero.tagline")}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t("home.hero.title")}</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Link
              href="/generar-cv"
              className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            >
              {t("home.hero.createButton")}
            </Link>
            <Link
              href="#how-it-works"
              className="inline-block bg-white text-blue-600 border-2 border-blue-600 font-semibold py-3 px-8 rounded-full text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {t("home.hero.howItWorksButton")}
            </Link>
          </div>
          
          <div className="mt-8 flex items-center justify-center md:justify-start">
            <span className="flex items-center">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </span>
            <span className="text-sm font-medium">{t("home.hero.satisfiedUsers")}</span>
          </div>
        </motion.div>

        {/* Imagen de CV */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className="md:w-1/2 z-10"
        >
          <div className="relative w-full">
            <div className="absolute -top-3 -left-3 right-3 bottom-3 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-xl -z-10"></div>
            <div className="p-2 bg-white rounded-xl shadow-2xl transform hover:rotate-1 hover:scale-105 transition-all duration-500">
              <CVPreview />
            </div>
            
            {/* Elementos decorativos */}
            <div className="absolute -top-6 -right-6 bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold shadow-lg">
              <span className="text-xs">¡PRO!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
