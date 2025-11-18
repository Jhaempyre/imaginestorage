"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const codeSnippet = `import { ImaginaryStorage } from '@imaginary/storage';

const storage = new ImaginaryStorage({
  apiKey: process.env.IMAGINARY_API_KEY
});

// Upload a file
const file = await storage.upload({
  file: myFile,
  provider: 'google-drive',
  folder: '/documents'
});

// Share with permissions
const link = await storage.share(file.id, {
  permissions: 'read',
  expiresIn: '7d'
});`;

const benefits = [
  "Full TypeScript support with auto-completion",
  "Webhook support for real-time events",
  "Built-in retry logic and error handling",
  "Support for all major cloud providers",
  "Comprehensive API documentation",
  "Active community and support",
];

export default function DeveloperSection() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Code snippet has been copied successfully.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
            For Developers
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built for Integration
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful APIs and SDKs to embed cloud storage functionality directly into your applications.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gray-900 border-gray-800 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white h-8"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="p-6 overflow-x-auto">
                  <code className="text-sm text-gray-300 font-mono leading-relaxed">
                    {codeSnippet}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Everything you need to build
            </h3>
            <ul className="space-y-4 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button className="bg-blue-600 hover:bg-blue-700 group">
              View Documentation
              <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}