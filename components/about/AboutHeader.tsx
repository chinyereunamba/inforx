'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Heart, Users, Award } from 'lucide-react';

export default function AboutHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Title animation
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', overwrite: true }
      )
      // Subtitle animation
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true },
        '-=0.4'
      )
      // Stats stagger animation
      .fromTo(
        statsRef.current,
        { opacity: 0, y: 20, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.5, 
          ease: 'back.out(1.7)',
          stagger: 0.1,
          overwrite: true
        },
        '-=0.3'
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Users, label: 'Patients Served', value: '50K+' },
    { icon: Heart, label: 'Success Rate', value: '95%' },
    { icon: Award, label: 'Years Experience', value: '10+' }
  ];

  return (
    <header 
      ref={headerRef}
      className="relative bg-gradient-to-br from-emerald-50 to-sky-50 py-20 lg:py-32"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Simplifying Healthcare Through
            <span className="text-emerald-500 block">Intelligent Innovation</span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-700 leading-relaxed max-w-3xl mx-auto mb-12"
          >
            InfoRx harnesses the power of artificial intelligence to make medical 
            information accessible, understandable, and actionable for everyone.
          </p>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={stat.label}
                  ref={(el) => {
                    if (el) statsRef.current[index] = el;
                  }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}