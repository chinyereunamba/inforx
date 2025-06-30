import MedicalInterpreter from '@/components/MedicalInterpreter';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Health Interpreter - InfoRx',
  description: 'Convert medical text, prescriptions, lab results, and scan summaries into easy-to-understand explanations with InfoRx\'s AI-powered interpreter.',
  keywords: 'medical interpreter, AI health, prescription explanation, lab results, medical text analysis, healthcare AI, Nigerian medical care',
  openGraph: {
    title: 'AI Health Interpreter - InfoRx',
    description: 'Convert medical text, prescriptions, lab results, and scan summaries into easy-to-understand explanations with InfoRx\'s AI-powered interpreter.',
    type: 'website',
    locale: 'en_NG'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Health Interpreter - InfoRx',
    description: 'Convert medical text, prescriptions, lab results, and scan summaries into easy-to-understand explanations.',
  }
};

export default function InterpreterPage() {
  return (
    <main
      className="min-h-screen bg-white py-12 px-4"
      aria-label="InfoRx Interpreter demonstration"
    >
      <MedicalInterpreter />
    </main>
  );
}