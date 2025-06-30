"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Play, Heart, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function FinalCTA() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaButtonsRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Background parallax effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          yPercent: -10,
          ease: "none",
          overwrite: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Content fade-in animation
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
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

      // CTA buttons with bounce effect
      gsap.fromTo(
        ctaButtonsRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: ctaButtonsRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-sky-600 via-emerald-600 to-sky-700 relative overflow-hidden"
    >
      {/* Nigerian-themed background pattern */}
      <div ref={backgroundRef} className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute top-20 right-0 w-48 h-48 bg-white rounded-full translate-x-24 -translate-y-24" />
        <div className="absolute bottom-0 left-1/4 w-36 h-36 bg-white rounded-full translate-y-18" />
        <div className="absolute bottom-20 right-1/4 w-52 h-52 bg-white rounded-full translate-x-26 translate-y-26" />

        {/* Nigerian flag inspired elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-40 bg-white opacity-5 transform rotate-45" />
          <div className="w-2 h-40 bg-white opacity-5 transform -rotate-45 absolute top-0" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
        <div ref={contentRef}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to improve your
            <span className="block text-emerald-200 mt-2">
              healthcare experience?
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto mb-12">
            Join thousands of Nigerians using InfoRx for smarter health
            guidance. Transform complex medical information into clear,
            actionable insights.
          </p>

          {/* Social proof indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-blue-100">
              <Users className="h-5 w-5 text-emerald-300" />
              <span className="font-medium">50,000+ Users</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Heart className="h-5 w-5 text-emerald-300" />
              <span className="font-medium">95% Satisfaction</span>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Star className="h-5 w-5 text-emerald-300" />
              <span className="font-medium">4.9/5 Rating</span>
            </div>
          </div>
        </div>

        <div
          ref={ctaButtonsRef}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-5 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 min-w-[240px]"
            asChild
          >
            <Link href="/demo">
              <Play className="mr-3 h-6 w-6" />
              Try Demo
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="border-3 border-white text-white hover:bg-white hover:text-blue-700 px-10 py-5 text-xl font-semibold rounded-xl bg-transparent transition-all duration-300 min-w-[240px] [&>*]:text-white hover:[&>*]:text-blue-700"
            asChild
          >
            <Link href="/dashboard">
              Visit Dashboard
              <ArrowRight className="ml-3 h-6 w-6" />
            </Link>
          </Button>
        </div>

        {/* Institutional logos/trust indicators */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
          <h3 className="text-xl font-bold text-white mb-6">
            Trusted by Leading Nigerian Healthcare Institutions
          </h3>

          <div className="grid md:grid-cols-3 gap-6 text-blue-100 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                Lagos State
              </div>
              <div className="text-sm">Health Ministry Partnership</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                Nigerian Medical
              </div>
              <div className="text-sm">Association Certified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                Federal Ministry
              </div>
              <div className="text-sm">of Health Recognized</div>
            </div>
          </div>

          <p className="text-blue-100 text-sm">
            No disclaimer needed here - InfoRx is designed to complement, not
            replace, professional medical care.
          </p>
        </div>
      </div>
    </section>
  );
}