'use client';

import { useEffect } from 'react';
import HeroSection from './HeroSection';
import InteractiveDemoSection from './InteractiveDemoSection';
import FeaturesGrid from './FeaturesGrid';
import CallToActionSection from './CallToActionSection';

export default function DemoPage() {
  useEffect(() => {
    // Prefers-reduced-motion handling
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      // Disable or reduce animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--animation-delay', '0s');
    }

    // Intersection Observer for lazy loading images (if we add them later)
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => {
      imageObserver.disconnect();
    };
  }, []);

  return (
    <main 
      className="min-h-screen bg-white"
      role="main"
      aria-label="InfoRx product demonstration"
    >
      {/* Hero Section with animated title and CTAs */}
      <HeroSection />
      
      {/* Interactive Demo Section with before/after cards */}
      <InteractiveDemoSection />
      
      {/* Features Grid with hover animations and parallax */}
      <FeaturesGrid />
      
      {/* Call-to-Action with success metrics and floating CTA */}
      <CallToActionSection />
    </main>
  );
}