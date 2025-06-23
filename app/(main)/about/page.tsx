import AboutIntroSection from '@/components/about/AboutIntroSection';
import OurStorySection from '@/components/about/OurStorySection';
import NigerianFocusSection from '@/components/about/NigerianFocusSection';
import TeamSection from '@/components/about/TeamSection';
import PartnersSection from '@/components/about/PartnersSection';
import ContactSection from '@/components/about/ContactSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About InfoRx - Simplifying Healthcare Through AI Innovation',
  description: 'Learn how InfoRx is revolutionizing healthcare in Nigeria with AI-powered medical guidance, making complex medical information accessible to every Nigerian community.',
  keywords: 'about InfoRx, healthcare AI Nigeria, medical technology, health platform Nigeria, Nigerian healthcare innovation',
  openGraph: {
    title: 'About InfoRx - Simplifying Healthcare Through AI Innovation',
    description: 'Learn how InfoRx is revolutionizing healthcare in Nigeria with AI-powered medical guidance, making complex medical information accessible to every Nigerian community.',
    type: 'website',
    locale: 'en_NG'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About InfoRx - Simplifying Healthcare Through AI Innovation',
    description: 'Learn how InfoRx is revolutionizing healthcare in Nigeria with AI-powered medical guidance.',
  }
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Mission Statement & Introduction */}
      <AboutIntroSection />
      
      {/* Our Story Timeline */}
      <OurStorySection />
      
      {/* Nigerian Healthcare Focus */}
      <NigerianFocusSection />
      
      {/* Meet the Team */}
      <TeamSection />
      
      {/* Partners & Collaborations */}
      <PartnersSection />
      
      {/* Contact Information */}
      <ContactSection />
    </main>
  );
}