import dynamic from "next/dynamic";
import HeroSection from "./components/Home/HeroSection";

// Lazy load non-critical sections below the fold
const About = dynamic(() => import("./components/Home/About"));
const Benefits = dynamic(() => import("./components/Home/Benefits"));
const Capabilities = dynamic(() => import("./components/Home/Capabilities"));
const ContactSection = dynamic(() => import("./components/Home/Contact"));
const HowItWorks = dynamic(() => import("./components/Home/HowItWorks"));

export default function Home() {
  return (
    <div className="min-h-screen ">
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <section id="capabilities">
          <Capabilities />
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
  );
}
