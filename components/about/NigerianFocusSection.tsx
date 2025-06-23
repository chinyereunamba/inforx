'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Languages, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function NigerianFocusSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;
    
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => setHasAnimated(true)
          }
        }
      );

      // Left content slide in
      gsap.fromTo(
        leftContentRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: leftContentRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Right content slide in
      gsap.fromTo(
        rightContentRef.current,
        { opacity: 0, x: 50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: rightContentRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // CTA button bounce
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          overwrite: true,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const nigerianChallenges = [
    {
      icon: Languages,
      title: 'Language Barriers',
      description: 'Medical documents in complex English that many Nigerians struggle to understand'
    },
    {
      icon: MapPin,
      title: 'Rural Access',
      description: 'Limited healthcare infrastructure in remote areas across Nigeria\'s 36 states'
    },
    {
      icon: Heart,
      title: 'Affordability',
      description: 'High costs of medical consultations that put healthcare out of reach for many families'
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-emerald-50 to-blue-50"
      aria-labelledby="nigerian-focus-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="nigerian-focus-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Built for Nigeria, by Nigerians
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We understand the unique healthcare challenges facing Nigerian communities 
            because we're part of them.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Challenges */}
          <div ref={leftContentRef}>
            <h3 className="text-2xl font-bold text-slate-900 mb-8">
              Challenges We Address
            </h3>
            
            <div className="space-y-6">
              {nigerianChallenges.map((challenge) => {
                const IconComponent = challenge.icon;
                
                return (
                  <div
                    key={challenge.title}
                    className="bg-white rounded-xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-emerald-600" />
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                          {challenge.title}
                        </h4>
                        <p className="text-slate-600 leading-relaxed">
                          {challenge.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Solution */}
          <div ref={rightContentRef}>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                Our Nigerian Solution
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Support for Nigerian Pidgin and local languages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Understanding of local health challenges</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Affordable AI-powered healthcare guidance</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-700">Works on basic smartphones nationwide</span>
                </div>
              </div>

              <div ref={ctaRef}>
                <Button
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  asChild
                >
                  <Link href="/demo">
                    Explore Our Solutions
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Map Visual (Placeholder) */}
            <div className="mt-8 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8 text-center">
              <h4 className="text-lg font-bold text-slate-900 mb-4">
                Nationwide Coverage
              </h4>
              <p className="text-slate-600 mb-4">
                Serving all 36 states and FCT
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                <div>Lagos • Kano • Rivers</div>
                <div>Oyo • Kaduna • Imo</div>
                <div>Katsina • FCT • Delta</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}