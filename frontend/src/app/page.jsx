import Features from "./Features/page";
import CTA from "./CTA/page";
import FAQ from "./FAQ/page";
import Testimonial from "./testimonial/page";
import Contact from "./contact/page";
import Home from "./Home/page";

export default function Page() {
  return (
    <main className="flex flex-col">

       <section id="Home">
        <Home />
      </section>

      <section id="Features">
        <Features />
      </section>

      <section id="Demo">
        <Testimonial />
      </section>

      <CTA />

      <FAQ />

      <section id="contact">
        <Contact />
      </section>

    </main>
  );
}