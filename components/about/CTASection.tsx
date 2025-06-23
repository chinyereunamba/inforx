'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { gsap } from 'gsap';

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const { fadeInAnimation } = useScrollAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        fadeInAnimation([contentRef.current], { overwrite: true });
      }

      if (buttonRef.current) {
        fadeInAnimation([buttonRef.current], {
          duration: 0.6,
          delay: 0.2,
          ease: 'back.out(1.7)',
          overwrite: true
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [fadeInAnimation]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-emerald-600 to-sky-600 relative overflow-hidden"
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
            Ready to Experience the Future of Healthcare?
          </h2>
          
          <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed max-w-3xl mx-auto mb-8">
            Join thousands of users who have already transformed their healthcare journey 
            with InfoRx's intelligent platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-emerald-100 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-300 rounded-full" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-300 rounded-full" />
              <span>No commitment required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-300 rounded-full" />
              <span>24/7 support included</span>
            </div>
          </div>
        </div>

        <div ref={buttonRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Download className="mr-2 h-5 w-5" />
            Get Started Now
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-emerald-700 px-8 py-4 text-lg font-semibold rounded-xl bg-transparent [&>*]:text-white hover:[&>*]or:text-emerald-700"
          >
            <Calendar className="mr-2 h-5 w-5 hover:[&>*]or:text-emerald-700" />
            Schedule Demo
            <ArrowRight className="ml-2 h-5 w-5 hover:[&>*]or:text-emerald-700" />
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-emerald-400">
          <p className="text-emerald-200 text-sm mb-4">Trusted by healthcare professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-white font-semibold">WHO</div>
            <div className="text-white font-semibold">FDA Cleared</div>
            <div className="text-white font-semibold">HIPAA Compliant</div>
            <div className="text-white font-semibold">ISO 27001</div>
          </div>
        </div>
      </div>
    </section>
  );
}