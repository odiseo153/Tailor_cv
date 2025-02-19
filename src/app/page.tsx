import Benefits from "./components/Home/Benefits";
import CallToAction from "./components/Home/CallToAction";
import HeroSection from "./components/Home/HeroSection";
import HowItWorks from "./components/Home/HowItWorks";
import Testimonials from "./components/Home/Testimonials";



export default function Home() {

  return (
    <div className="min-h-screen flex flex-col text-black">
      <main>
        <HeroSection />
        <HowItWorks />
        <Benefits /> 
        <Testimonials />
        <CallToAction />
      </main>
    </div>
  )
}



//¡Oops! Error al generar CV: Error al procesar la solicitud para generar el CV. Detalles: invalid json response body at https://api.deepseek.com/chat/completions reason: Unexpected end of JSON input





