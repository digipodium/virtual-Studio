"use client";

import { motion } from "framer-motion";

import Features from "./(main)/Features/page";
import CTA from "./(main)/CTA/page";
import FAQ from "./(main)/FAQ/page";
import Testimonial from "./(main)/testimonial/page";
import Contact from "./(main)/contact/page";
import Home from "./(main)/Home/page";


const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Page() {
  return (
    <main className="flex flex-col">

      <motion.section
        id="Home"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >

     

        <Home />
      </motion.section>

      <motion.section
        id="Features"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <Features />
      </motion.section>

      <motion.section
        id="Demo"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >

        <Testimonial />
      </motion.section>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <CTA />
      </motion.div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <FAQ />
      </motion.div>

      <motion.section
        id="contact"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <Contact />
      </motion.section>

    </main>
  );
}