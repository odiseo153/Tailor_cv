import Benefits from "./components/Benefits";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-black">
      <Header />
      <main>
        <HeroSection />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <CallToAction />
      </main>
      <Footer />
    </div>
  )
}

