import HeroSection from '@/components/homepage/HeroSection';
import ImpactMetrics from '@/components/homepage/ImpactMetrics';
import HealthcareChallenges from '@/components/homepage/HealthcareChallenges';
import SolutionFeatures from '@/components/homepage/SolutionFeatures';
import FinalCTA from '@/components/homepage/FinalCTA';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'InfoRx - Simplifying Healthcare Through Intelligent Innovation',
  description: 'AI-powered insights for lab results, prescriptions, and symptoms. Transform your healthcare experience with intelligent technology designed for Nigerian communities.',
  keywords: 'AI healthcare, Nigerian medical care, healthcare diagnostics, medical AI, telemedicine Nigeria, health technology, medical innovation',
  authors: [{ name: 'InfoRx Team' }],
  creator: 'InfoRx',
  publisher: 'InfoRx',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://info-rx.org',
    title: 'InfoRx - Simplifying Healthcare Through Intelligent Innovation',
    description: 'AI-powered insights for lab results, prescriptions, and symptoms. Transform your healthcare experience with intelligent technology.',
    siteName: 'InfoRx',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfoRx - Simplifying Healthcare Through Intelligent Innovation',
    description: 'AI-powered insights for lab results, prescriptions, and symptoms.',
    creator: '@chinyere_un',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white" role="main">
      {/* Hero Section with Nigerian healthcare professional imagery */}
      <HeroSection />
      
      {/* Impact Metrics with animated counters */}
      <ImpactMetrics />
      
      {/* Healthcare Challenges in Nigeria */}
      <HealthcareChallenges />
      
      {/* Solution Features with AI capabilities */}
      <SolutionFeatures />
      
      {/* Final CTA with Nigerian-themed design */}
      <FinalCTA />
    </main>
  );
}