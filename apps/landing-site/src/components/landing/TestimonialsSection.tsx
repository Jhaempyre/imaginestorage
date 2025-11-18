import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    content: "Imaginary Storage transformed how our team manages files across multiple cloud providers. The developer API is incredibly well-documented and easy to integrate.",
    rating: 5,
  },
  {
    name: "Michael Rodriguez",
    role: "Lead Developer at DataSync",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    content: "The security features and granular permissions give us peace of mind. We've reduced our storage management overhead by 70% since switching.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Product Manager at CloudBase",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    content: "Finally, a unified solution that works seamlessly with all our storage providers. The widget integration was surprisingly straightforward.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Founder at StartupHub",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    content: "The multi-provider support is a game-changer. We can now offer our users flexibility without building separate integrations for each provider.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Trusted by Developers
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what teams are saying about Imaginary Storage.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}