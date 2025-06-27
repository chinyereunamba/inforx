import RoadmapPage from '@/components/roadmap/RoadmapPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Development Roadmap - InfoRx',
  description: 'Explore InfoRx\'s comprehensive development roadmap and feature rollout timeline. See what\'s coming next in Nigerian healthcare technology.',
  keywords: 'InfoRx roadmap, healthcare development, AI medical features, Nigerian healthcare technology timeline',
  openGraph: {
    title: 'Development Roadmap - InfoRx',
    description: 'Explore InfoRx\'s comprehensive development roadmap and feature rollout timeline.',
    type: 'website',
    locale: 'en_NG'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Development Roadmap - InfoRx',
    description: 'Explore InfoRx\'s comprehensive development roadmap and feature rollout timeline.',
  }
};

export default function RoadmapPageRoute() {
  return <RoadmapPage />;
}