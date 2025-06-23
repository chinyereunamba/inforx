'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { gsap } from 'gsap';

export default function DisclaimerBanner() {
  const bannerRef = useRef<HTMLElement>(null);
  
  const { fadeInAnimation } = useScrollAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (bannerRef.current) {
        fadeInAnimation([bannerRef.current], {
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true
        });
      }
    }, bannerRef);

    return () => ctx.revert();
  }, [fadeInAnimation]);

  return (
    <section 
      ref={bannerRef}
      className="py-16 bg-amber-50 border-y border-amber-200"
      role="region"
      aria-labelledby="disclaimer-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-amber-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 
                id="disclaimer-heading"
                className="text-xl font-bold text-slate-900 mb-4 flex items-center"
              >
                <Info className="h-5 w-5 mr-2 text-amber-600" />
                Medical Disclaimer
              </h3>
              
              <div className="space-y-3 text-slate-700 leading-relaxed">
                <p>
                  <strong>InfoRx is an AI-powered health information platform designed to assist and educate.</strong> 
                  Our technology provides general health information and guidance but does not replace professional 
                  medical advice, diagnosis, or treatment.
                </p>
                
                <p>
                  Always consult with qualified healthcare professionals for medical concerns. In case of medical 
                  emergencies, contact your local emergency services immediately. InfoRx's AI recommendations 
                  should be used as supplementary information alongside professional medical care.
                </p>
                
                <div className="bg-amber-50 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-amber-800">
                    <strong>Important:</strong> This platform is not intended to diagnose, treat, cure, or prevent 
                    any disease. Individual results may vary, and medical decisions should always involve healthcare 
                    professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}