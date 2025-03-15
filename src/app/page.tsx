import Benefits from "./components/Home/Benefits";
import ContactSection from "./components/Home/Contact";
import HeroSection from "./components/Home/HeroSection";
import HowItWorks from "./components/Home/HowItWorks";
import PricingSection from "./components/Home/PricingSection";



export default function Home() {

  return (
    <div className="min-h-screen ">
      <main>
        <HeroSection />
        <HowItWorks />
        <Benefits /> 
        <ContactSection />
      </main>
    </div>
  )
}








