import Features from "@/components/pages/Features";
import Home from "@/components/pages/Home";
import CTA from "@/components/pages/CTA";
import FAQ from "@/components/pages/FAQ";
import Testimonial from "@/components/pages/testimonial";
import Contact from "@/components/pages/contact";
export default function VirtualStudio(){
  return(
    <main className="flex flex-col">
     <Home />
     <Features />
     <Testimonial/>
     <CTA />
     <FAQ />
     <Contact />
     

     </main>
  );
}