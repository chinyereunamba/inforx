"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FinalCTA() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Content fade-in animation
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          overwrite: true,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
            onEnter: () => setHasAnimated(true),
          },
        }
      );

      // CTA button with pulsing animation
      gsap.fromTo(
        ctaButtonRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: ctaButtonRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      // Infinite pulse animation for the primary button
      gsap.to(".pulse-button", {
        scale: 1.05,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-teal-600 to-teal-800 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-20 -translate-y-20" />
        <div className="absolute top-20 right-0 w-32 h-32 bg-white rounded-full translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-white rounded-full translate-y-12" />
        <div className="absolute bottom-20 right-1/4 w-36 h-36 bg-white rounded-full translate-x-18 translate-y-18" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div ref={contentRef} className="mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>

          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Don&apos;t wait for healthcare to come to you. Take control of your
            health journey with InfoRx today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-teal-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-300 rounded-full" />
              <span>Free to download</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-300 rounded-full" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-teal-300 rounded-full" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        <div
          ref={ctaButtonRef}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button
            size="lg"
            className="pulse-button bg-white text-teal-700 hover:bg-teal-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="mr-2 h-5 w-5" />
            Download InfoRx Now
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-teal-700 px-8 py-4 text-lg font-semibold rounded-xl"
          >
            Schedule a Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-teal-500">
          <p className="text-teal-200 text-sm mb-4">
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
          </div>
        </div>
      </div>
    </section>
  );
}
