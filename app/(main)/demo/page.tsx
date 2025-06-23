import DemoPage from '@/components/demo/DemoPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Demo - See InfoRx in Action',
  description: 'Experience how InfoRx\'s AI-powered platform transforms complex medical information into clear, actionable insights. Interactive demo showcasing real healthcare scenarios.',
  keywords: 'InfoRx demo, AI healthcare demo, medical AI demonstration, Nigerian healthcare technology, interactive health platform demo',
  authors: [{ name: 'InfoRx Team' }],
  creator: 'InfoRx',
  publisher: 'InfoRx',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://inforx.ng/demo',
    title: 'Demo - See InfoRx in Action',
    description: 'Experience how InfoRx\'s AI-powered platform transforms complex medical information into clear, actionable insights.',
    siteName: 'InfoRx',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demo - See InfoRx in Action',
    description: 'Experience how InfoRx\'s AI-powered platform transforms complex medical information into clear, actionable insights.',
    creator: '@inforx_ng',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0A855C',
};

export default function DemoPageRoute() {
  return <DemoPage />;
}