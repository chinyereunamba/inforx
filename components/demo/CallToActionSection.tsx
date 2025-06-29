"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUp,
  Download,
  Play,
  Users,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SuccessMetric } from "@/lib/types/demo";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const successMetrics: SuccessMetric[] = [
  {
    id: "active-users",
    label: "Active Users",
    value: "50K+",
    description: "Nigerians trust MediGuide",
    icon: "Users",
  },
  {
    id: "satisfaction",
    label: "Satisfaction Rate",
    value: "98%",
    description: "User satisfaction score",
    icon: "Star",
  },
  {
    id: "faster-diagnosis",
    label: "Faster Diagnosis",
    value: "85%",
    description: "Reduction in time to diagnosis",
    icon: "TrendingUp",
  },
  {
    id: "accuracy",
    label: "AI Accuracy",
    value: "99.2%",
    description: "Diagnostic accuracy rate",
    icon: "Award",
  },
];

const iconComponents = {
  Users,
  Star,
  TrendingUp,
  Award,
};

export default function CallToActionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement[]>([]);
  const floatingCTARef = useRef<HTMLDivElement>(null);
  const scrollTopButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main CTA animation
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
            onEnter: () => setIsVisible(true),
            onLeave: () => setIsVisible(false),
            onEnterBack: () => setIsVisible(true),
            onLeaveBack: () => setIsVisible(false),
          },
        }
      );

      // Staggered metrics animation
      metricsRef.current.forEach((metric, index) => {
        if (metric) {
          gsap.fromTo(
            metric,
            { opacity: 0, y: 30, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "back.out(1.7)",
              overwrite: true,
              scrollTrigger: {
                trigger: metric,
                start: "top 85%",
                end: "bottom 20%",
                toggleActions: "play none none none",
                once: true,
              },
              delay: index * 0.1,
            }
          );
        }
      });

      // Floating CTA for desktop
      if (window.innerWidth >= 1024) {
        gsap.set(floatingCTARef.current, {
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 50,
        });
      }

      // Scroll to top button animation
      gsap.fromTo(
        scrollTopButtonRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "body",
            start: "top -200px",
            end: "bottom bottom",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGetStarted = () => {
    // Animation for button click
    gsap.to(".cta-button", {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.out",
    });

    // Navigate to interpreter or sign up
    window.location.href = "/interpreter";
  };

  const handleContactEmail = () => {
    const subject = encodeURIComponent(
      "Partnership Inquiry - InfoRx Healthcare Platform"
    );
    const body = encodeURIComponent(`Hello InfoRx Team,

I'm interested in learning more about InfoRx and potential collaboration opportunities.

Please provide more information about:
- Partnership opportunities
- Product demonstrations
- Implementation in our organization

Best regards,
`);

    window.location.href = `mailto:hello@info-rx.org?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="py-24 bg-gradient-to-br from-blue-600 via-emerald-600 to-blue-700 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0A855C 0%, #0d9488 100%)",
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
          <div className="absolute top-20 right-0 w-32 h-32 bg-white rounded-full translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white rounded-full translate-y-12" />
          <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-white rounded-full translate-x-18 translate-y-18" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          {/* Success Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {successMetrics.map((metric, index) => {
              const IconComponent =
                iconComponents[metric.icon as keyof typeof iconComponents];

              return (
                <div
                  key={metric.id}
                  ref={(el) => {
                    if (el) metricsRef.current[index] = el;
                  }}
                  className="text-center text-white"
                >
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2">
                    {metric.value}
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    {metric.label}
                  </div>
                  <div className="text-sm text-emerald-100">
                    {metric.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Main CTA Content */}
          <div ref={ctaRef} className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Healthcare?
            </h2>

            <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed max-w-3xl mx-auto mb-8">
              Join thousands of Nigerians who have already improved their health
              outcomes with InfoRx's intelligent platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="cta-button bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#0A855C",
                }}
                aria-label="Start using InfoRx now"
              >
                <Download className="mr-2 h-6 w-6" />
                Get Started Now
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent [&>*]:text-white hover:[&>*]:text-emerald-700"
                style={{ borderRadius: "12px" }}
                asChild
              >
                <a href="/interpreter">
                  <Play className="mr-2 h-6 w-6" />
                  Try Demo Now
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-emerald-100 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-300 rounded-full" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-300 rounded-full" />
                <span>No setup required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-300 rounded-full" />
                <span>Available 24/7</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-emerald-400">
              <p className="text-emerald-200 text-sm mb-4">
                Trusted by leading healthcare institutions
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-white font-semibold">
                  Nigerian Medical Association
                </div>
                <div className="text-white font-semibold">
                  Lagos State Health Ministry
                </div>
                <div className="text-white font-semibold">WHO Nigeria</div>
                <div className="text-white font-semibold">
                  Federal Ministry of Health
                </div>
              </div>
            </div>

            <p className="text-lg text-slate-600 mb-8">
              Don&apos;t just read about the future of healthcare &mdash;
              experience it firsthand with our interactive demo.
            </p>
          </div>
        </div>
      </section>

      {/* Floating CTA for Desktop */}
      {/* <div ref={floatingCTARef} className="hidden lg:block">
        {!isVisible && (
          <Button
            onClick={handleGetStarted}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            style={{ borderRadius: "9999px" }}
            aria-label="Get started with InfoRx"
          >
            <Download className="mr-2 h-5 w-5" />
            Get Started
          </Button>
        )}
      </div> */}
      
      {/* Sticky CTA for Mobile */}
      {/*<div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        {!isVisible && (
          <Button
            onClick={handleGetStarted}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300"
            style={{ borderRadius: "12px" }}
            aria-label="Get started with InfoRx"
          >
            <Download className="mr-2 h-6 w-6" />
            Get Started Now
          </Button>
        )}
      </div> */}

      {/* Scroll to Top Button */}
      <button
        ref={scrollTopButtonRef}
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 flex items-center justify-center"
        style={{ borderRadius: "50%" }}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </>
  );
}