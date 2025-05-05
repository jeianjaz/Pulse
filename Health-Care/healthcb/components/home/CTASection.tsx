"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-12 text-center shadow-xl"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied patients who have chosen our modern healthcare platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => router.push('/patient/login')}
              className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
