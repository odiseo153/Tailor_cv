"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/app/context/I18nContext";

export default function VideoPromoSection() {
  const { t } = useI18n();
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const sceneKeys = [
    "pain",
    "logo",
    "analysis",
    "optimize",
    "templates",
    "interview",
    "cta",
  ];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentScene((prev) => (prev + 1) % sceneKeys.length);
      }, 4000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const sceneType = sceneKeys[currentScene];

  return (
    <section className="py-20 bg-gradient-to-b from-[#050508] to-[#0a0a0f]">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("video.title")}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("video.description")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #050508 0%, #0a0a0f 50%, #0f0f14 100%)",
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute w-[600px] h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Scene content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={sceneType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                {sceneType === "pain" && (
                  <>
                    <div className="w-20 h-20 mx-auto mb-8 rounded-full border-2 border-red-500/50 flex items-center justify-center">
                      <span className="text-4xl text-red-500">✕</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {t("video.scenes.pain.title")}
                    </h3>
                    <p className="text-gray-400 text-lg">
                      {t("video.scenes.pain.subtitle")}
                    </p>
                    <div className="flex justify-center gap-8 md:gap-12 mt-8 md:mt-12">
                      <div>
                        <div className="text-3xl md:text-4xl font-bold text-red-500">
                          70%
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                          {t("video.scenes.pain.rejected")}
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl md:text-4xl font-bold text-red-500">
                          6s
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                          {t("video.scenes.pain.reviewTime")}
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl md:text-4xl font-bold text-red-500">
                          ATS
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                          {t("video.scenes.pain.gatekeeper")}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {sceneType === "logo" && (
                  <>
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl" />
                      <svg
                        viewBox="0 0 48 48"
                        className="w-full h-full relative z-10"
                      >
                        <defs>
                          <linearGradient
                            id="g"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#00d4ff" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M8 40V8h8l8 24 8-24h8v32h-8V20l-8 20h-8l-8-20v20H8z"
                          fill="url(#g)"
                        />
                      </svg>
                    </div>
                    <h3 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
                      {t("video.scenes.logo.title")}
                    </h3>
                    <p className="text-cyan-400 text-xl font-medium">
                      {t("video.scenes.logo.subtitle")}
                    </p>
                    <div className="flex justify-center gap-3 md:gap-4 mt-6 md:mt-8 flex-wrap px-4">
                      <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm">
                        {t("video.scenes.logo.feature1")}
                      </span>
                      <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm">
                        {t("video.scenes.logo.feature2")}
                      </span>
                      <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-gray-300 text-sm">
                        {t("video.scenes.logo.feature3")}
                      </span>
                    </div>
                  </>
                )}

                {sceneType === "analysis" && (
                  <>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t("video.scenes.analysis.title")}
                    </h3>
                    <p className="text-gray-400 mb-8">
                      {t("video.scenes.analysis.subtitle")}
                    </p>
                    <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 w-36 md:w-40">
                        <div className="text-xs text-gray-500 uppercase mb-2">
                          {t("video.scenes.analysis.match")}
                        </div>
                        <div className="text-3xl font-bold text-cyan-400">
                          87%
                        </div>
                      </div>
                      <div className="text-3xl md:text-4xl text-cyan-400">
                        →
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 w-36 md:w-40">
                        <div className="text-xs text-gray-500 uppercase mb-2">
                          {t("video.scenes.analysis.compatibility")}
                        </div>
                        <div className="text-3xl font-bold text-green-500">
                          {t("video.scenes.analysis.high")}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {sceneType === "optimize" && (
                  <>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t("video.scenes.optimize.title")}
                    </h3>
                    <p className="text-gray-400 mb-6 md:mb-8">
                      {t("video.scenes.optimize.subtitle")}
                    </p>
                    <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 md:p-4">
                        <div className="text-red-400 text-sm">
                          {t("video.scenes.optimize.original")}
                        </div>
                      </div>
                      <div className="text-cyan-400 text-xl">→</div>
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 md:p-4">
                        <div className="text-green-400 text-sm">
                          {t("video.scenes.optimize.improved")}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-8 text-4xl md:text-5xl font-bold text-green-500">
                      94 {t("video.scenes.optimize.atsScore")}
                    </div>
                  </>
                )}

                {sceneType === "templates" && (
                  <>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t("video.scenes.templates.title")}
                    </h3>
                    <p className="text-gray-400 mb-6 md:mb-8">
                      {t("video.scenes.templates.subtitle")}
                    </p>
                    <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                      <div className="w-28 md:w-32 h-20 md:h-24 bg-white rounded-lg border-2 border-white/10 flex items-center justify-center">
                        <span className="text-gray-800 text-xs md:text-sm font-medium">
                          {t("video.scenes.templates.modern")}
                        </span>
                      </div>
                      <div className="w-28 md:w-32 h-20 md:h-24 bg-white rounded-lg border-2 border-white/10 flex items-center justify-center">
                        <span className="text-gray-800 text-xs md:text-sm font-medium">
                          {t("video.scenes.templates.minimal")}
                        </span>
                      </div>
                      <div className="w-28 md:w-32 h-20 md:h-24 bg-white rounded-lg border-2 border-cyan-500 flex items-center justify-center">
                        <span className="text-gray-800 text-xs md:text-sm font-medium">
                          {t("video.scenes.templates.professional")}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {sceneType === "interview" && (
                  <>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      {t("video.scenes.interview.title")}
                    </h3>
                    <p className="text-gray-400 mb-6 md:mb-8">
                      {t("video.scenes.interview.subtitle")}
                    </p>
                    <div className="flex justify-center gap-3 md:gap-4 flex-wrap px-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 max-w-xs">
                        <div className="text-cyan-400 text-xs uppercase mb-2">
                          {t("video.scenes.interview.technical")}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Describe database optimization
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 max-w-xs">
                        <div className="text-amber-400 text-xs uppercase mb-2">
                          {t("video.scenes.interview.systemDesign")}
                        </div>
                        <div className="text-gray-300 text-sm">
                          Design URL shortener
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {sceneType === "cta" && (
                  <>
                    <div className="w-20 h-20 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-2xl" />
                      <svg
                        viewBox="0 0 48 48"
                        className="w-full h-full relative z-10"
                      >
                        <defs>
                          <linearGradient
                            id="g2"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#00d4ff" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M8 40V8h8l8 24 8-24h8v32h-8V20l-8 20h-8l-8-20v20H8z"
                          fill="url(#g2)"
                        />
                      </svg>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 px-4">
                      {t("video.scenes.cta.title")}
                    </h3>
                    <button className="mt-4 px-6 md:px-8 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl font-semibold text-black">
                      {t("video.scenes.cta.button")}
                    </button>
                    <div className="mt-6 text-cyan-400">
                      {t("video.scenes.cta.usersCount")}
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {sceneKeys.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentScene(i);
                  setIsPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentScene ? "bg-cyan-400 w-6" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-6 right-6 p-2 rounded-full bg-white/10 border border-white/10"
          >
            {isPlaying ? (
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-white ml-0.5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap justify-center gap-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white/70 text-sm">{t("video.feature1")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white/70 text-sm">{t("video.feature2")}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <svg
              className="w-5 h-5 text-cyan-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-white/70 text-sm">{t("video.feature3")}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
