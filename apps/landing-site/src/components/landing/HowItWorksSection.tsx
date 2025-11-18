"use client";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Link2, Settings, Shield } from "lucide-react";
const MotionDiv = motion.div;
const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Your Providers",
    description: "Link your existing cloud storage accounts in seconds. We support all major providers with secure OAuth authentication.",
  },
  {
    number: "02",
    icon: Settings,
    title: "Manage Your Files",
    description: "Access, organize, and search files across all providers from one unified dashboard. No more switching between apps.",
  },
  {
    number: "03",
    icon: Shield,
    title: "Share Securely",
    description: "Create secure sharing links with custom permissions, expiration dates, and password protection. Track all access in real-time.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process.
          </p>
        </MotionDiv>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <Card className="h-full border-2 hover:border-blue-200 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 relative z-10">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-5xl font-bold text-blue-100 mb-2">
                        {step.number}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}