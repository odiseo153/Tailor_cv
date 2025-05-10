import About from "./components/Home/About";
import Benefits from "./components/Home/Benefits";
import ContactSection from "./components/Home/Contact";
import HeroSection from "./components/Home/HeroSection";
import HowItWorks from "./components/Home/HowItWorks";
import PricingPage from "./components/Home/PricingSection";



export default function Home() {

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
