'use client'

import { useEffect } from "react";
import About from "./components/Home/About";
import Benefits from "./components/Home/Benefits";
import ContactSection from "./components/Home/Contact";
import HeroSection from "./components/Home/HeroSection";
import HowItWorks from "./components/Home/HowItWorks";

export default function Home() {

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/groq');
      const data = await response.json();
      console.log(data);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen ">
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="benefits">
          <Benefits />
        </section>

        <section id="contact">
          <ContactSection />
        </section>
      </main>
    </div>
  )
}
