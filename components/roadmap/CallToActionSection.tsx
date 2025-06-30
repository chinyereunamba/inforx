"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  ChartLine,
  Github,
  Heart,
  Mail,
  Play,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { handleContactEmail } from "@/lib/fnc";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CallToActionSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Content animation
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

      // Actions animation
      gsap.fromTo(
        actionsRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          overwrite: true,
          scrollTrigger: {
            trigger: actionsRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none none",
            once: true,
          },
          delay: 0.2,
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
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48" />
        <div className="absolute top-20 right-0 w-64 h-64 bg-white rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white rounded-full translate-y-24" />
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-white rounded-full translate-x-40 translate-y-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <div ref={contentRef}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Ready to join our mission?
          </h2>

          <p className="text-xl md:text-2xl text-sky-100 leading-relaxed max-w-4xl mx-auto mb-12">
            InfoRx is transforming healthcare technology in Nigeria. Be part of
            the journey as we build the future of accessible medical care.
          </p>

          {/* Value propositions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Rocket /> Cutting-Edge Technology
              </h3>
              <p className="text-sky-100 text-sm">
                Work with the latest AI and healthcare technologies to solve
                real-world problems
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <Heart /> Social Impact
              </h3>
              <p className="text-sky-100 text-sm">
                Directly improve healthcare outcomes for millions of Nigerians
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-6 border border-white border-opacity-20">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-center gap-2">
                <ChartLine /> Growing Platform
              </h3>
              <p className="text-sky-100 text-sm">
                Join a rapidly growing platform with ambitious goals and clear
                roadmap
              </p>
            </div>
          </div>
        </div>

        <div ref={actionsRef} className="space-y-8">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="cta-button bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/demo">
                <Play className="mr-3 h-6 w-6 text-emerald-700" />
                Try Demo Now
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent [&>*]:text-white hover:[&>*]:text-emerald-700"
              asChild
            >
              <Link href="/about">
                Learn More
                <ArrowRight className="ml-3 h-6 w-6 hover:bg-emerald-700" />
              </Link>
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sky-100">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              <a
                href="https://github.com/chinyereunamba/inforx"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                View on GitHub
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span
                onClick={handleContactEmail}
                className="hover:text-white transition-colors duration-200"
              >
                Contact Team
              </span>
            </div>
          </div>

          {/* Timeline CTA */}
          {/* <div className="bg-gradient-to-r from-emerald-500 to-sky-500 rounded-2xl p-8 mt-12 border border-white border-opacity-20">
            <h3 className="text-2xl font-bold text-white mb-4">
              📅 Stay Updated on Our Progress
            </h3>
            <p className="text-white opacity-90 mb-6">
              Follow our development journey and be the first to know about new features and milestones.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">Weekly Progress Updates</span>
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">Feature Previews</span>
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">Beta Access</span>
              <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full">Community Feedback</span>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
