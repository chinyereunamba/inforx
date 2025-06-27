'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RoadmapHeader from './RoadmapHeader';
import CurrentStateSection from './CurrentStateSection';
import PhaseTimeline from './PhaseTimeline';
import DependencyMap from './DependencyMap';
import CallToActionSection from './CallToActionSection';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function RoadmapPage() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;

    const ctx = gsap.context(() => {
      // Page entrance animation
      const tl = gsap.timeline({
        onComplete: () => setHasAnimated(true)
      });

      tl.fromTo(
        '.roadmap-section',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.2,
          ease: 'power2.out',
          overwrite: true
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <main 
      ref={pageRef}
      className="min-h-screen bg-white"
      role="main"
      aria-label="InfoRx development roadmap"
    >
      {/* Header Section */}
      <div className="roadmap-section">
        <RoadmapHeader />
      </div>

      {/* Current State Assessment */}
      <div className="roadmap-section">
        <CurrentStateSection />
      </div>

      {/* Phase Timeline */}
      <div className="roadmap-section">
        <PhaseTimeline />
      </div>

      {/* Dependency Mapping */}
      <div className="roadmap-section">
        <DependencyMap />
      </div>

      {/* Call to Action */}
      <div className="roadmap-section">
        <CallToActionSection />
      </div>
    </main>
  );
}