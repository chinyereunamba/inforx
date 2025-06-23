import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - InfoRx Medical Interpreter',
  description: 'Access your medical document interpretation dashboard with advanced AI-powered analysis and personalized healthcare insights.',
  keywords: 'medical dashboard, document interpretation, healthcare AI, medical analysis, InfoRx dashboard',
  openGraph: {
    title: 'Dashboard - InfoRx Medical Interpreter',
    description: 'Access your medical document interpretation dashboard with advanced AI-powered analysis and personalized healthcare insights.',
    type: 'website',
    locale: 'en_NG'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - InfoRx Medical Interpreter',
    description: 'Access your medical document interpretation dashboard with advanced AI-powered analysis.',
  }
};

export default function DashboardPage() {
  return <DashboardLayout />;
}