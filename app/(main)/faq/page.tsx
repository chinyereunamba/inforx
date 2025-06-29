"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Mail,
  MessageSquare,
  CheckCircle,
  Shield,
  HelpCircle,
  FileText, 
  ChevronDown,
  ChevronUp,
  Globe,
  Smartphone,
  Download,
  Clock,
  User,
  CreditCard,
  Headphones
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<any>;
}

interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

export default function FAQPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string>("system");
  const [hasAnimated, setHasAnimated] = useState(false);
  
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const faqItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Animation effect
  useEffect(() => {
    if (hasAnimated) return;
    
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      
      // Categories animation
      gsap.fromTo(
        categoriesRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: "power2.out",
          delay: 0.2
        }
      );
      
      // FAQ items staggered animation
      gsap.fromTo(
        ".faq-item",
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "back.out(1.5)",
          delay: 0.4,
          scrollTrigger: {
            trigger: ".faq-section",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
          },
          onComplete: () => setHasAnimated(true)
        }
      );
    }, pageRef);
    
    return () => ctx.revert();
  }, [hasAnimated]);

  // Handle expanding/collapsing FAQ items
  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
    
    // Animate the expansion
    if (expandedItem !== itemId) {
      gsap.fromTo(
        `#answer-${itemId}`,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  };
  
  // Handle category switching
  const setCategory = (categoryId: string) => {
    setExpandedCategory(categoryId);
    setExpandedItem(null);
    
    // Scroll to category section
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const faqCategories: FaqCategory[] = [
    {
      id: "system",
      title: "System & Features",
      items: [
        {
          id: "what-is",
          question: "What is InfoRx and how does it help with healthcare information?",
          answer: "InfoRx is an AI-powered healthcare platform designed to help patients understand complex medical information. It translates medical jargon from prescriptions, lab results, and scan reports into clear, simple language that anyone can understand. The system also securely stores your medical records and generates personalized health insights based on your documents.",
          icon: HelpCircle
        },
        {
          id: "document-types",
          question: "What types of medical documents can InfoRx interpret?",
          answer: "InfoRx can interpret most common medical document types, including prescriptions, laboratory test results, imaging reports (X-rays, MRIs, CT scans), doctor's notes, and discharge summaries. Our AI system is continuously improving to handle more specialized document types. For best results, upload clear, complete documents in PDF, DOCX, JPG, or PNG formats.",
          icon: FileText
        },
        {
          id: "languages",
          question: "Does InfoRx support languages other than English?",
          answer: "Yes, InfoRx currently supports English and Nigerian Pidgin, with plans to add more Nigerian languages in the future. Our AI interpreter is specially trained to understand medical terminology in these languages and provide clear explanations that respect cultural context.",
          icon: Globe
        }
      ]
    },
    {
      id: "security",
      title: "Security & Privacy",
      items: [
        {
          id: "data-protection",
          question: "How does InfoRx protect my sensitive medical information?",
          answer: "InfoRx employs bank-level security measures including end-to-end encryption for all data both in transit and at rest. We use role-based access controls, secure cloud infrastructure, and regular security audits. Your medical data is stored in isolated environments and protected by advanced access policies to ensure only you can access your information unless explicitly shared.",
          icon: Shield
        },
        {
          id: "data-sharing",
          question: "Who can access my medical data on InfoRx?",
          answer: "Only you have access to your medical data by default. No one at InfoRx, including administrators, can view your personal health information without your explicit permission. You can choose to securely share specific records with healthcare providers through our sharing feature, which allows you to control exactly what information is shared and for how long.",
          icon: User
        }
      ]
    },
    {
      id: "technical",
      title: "Technical Requirements",
      items: [
        {
          id: "devices",
          question: "What devices can I use to access InfoRx?",
          answer: "InfoRx is accessible on any device with an internet connection and web browser, including desktop computers, laptops, tablets, and smartphones. Our platform is fully responsive and optimized for all screen sizes. For the best experience, we recommend using the latest version of Chrome, Firefox, Safari, or Edge.",
          icon: Smartphone
        },
        {
          id: "app",
          question: "Is there a mobile app for InfoRx?",
          answer: "Currently, InfoRx is available as a web application that works excellently on mobile browsers. A dedicated mobile app for iOS and Android is under development and scheduled for release in Q4 2025. The web version is fully mobile-responsive and offers all features available on desktop.",
          icon: Smartphone
        }
      ]
    },
    {
      id: "data",
      title: "Data Management",
      items: [
        {
          id: "storage-duration",
          question: "How long is my data stored on InfoRx?",
          answer: "Your data remains stored on InfoRx for as long as you maintain an active account. You can delete individual records or your entire account at any time. When you delete records, they are permanently removed from our systems within 30 days. We maintain encrypted backups for disaster recovery purposes, which are automatically purged after 90 days.",
          icon: Clock
        },
        {
          id: "export",
          question: "Can I export or download my medical records from InfoRx?",
          answer: "Yes, you can download individual medical records or export your entire medical history at any time. InfoRx supports exports in PDF, CSV, and structured medical formats like CCD (Continuity of Care Document). This feature ensures you maintain complete control over your medical information and can easily share it with healthcare providers.",
          icon: Download
        }
      ]
    },
    {
      id: "support",
      title: "Support & Pricing",
      items: [
        {
          id: "cost",
          question: "Is there a cost to use InfoRx?",
          answer: "InfoRx offers a freemium model. Basic features including document uploads, storage, and basic interpretations are available for free. Premium features like advanced health insights, unlimited document storage, and priority support require a subscription starting at ₦2,500 per month. We also offer special pricing for healthcare providers and organizations.",
          icon: CreditCard
        },
        {
          id: "support",
          question: "How can I get technical support for InfoRx?",
          answer: "Support is available through multiple channels: our comprehensive help center, email support at support@inforx.ng, and live chat available Monday-Friday from 8am to 8pm WAT. Premium users receive priority support and access to our dedicated support line. We typically respond to all inquiries within 24 hours.",
          icon: Headphones
        }
      ]
    }
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find answers to common questions about InfoRx, our healthcare information platform
          </p>
        </div>
        
        {/* Categories Navigation */}
        <div ref={categoriesRef} className="mb-10">
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  expandedCategory === category.id
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-12 faq-section">
          {faqCategories.map((category) => (
            <div 
              key={category.id} 
              id={`category-${category.id}`}
              className={expandedCategory === category.id ? "block" : "hidden"}
            >
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">{category.title}</h2>
              
              <div className="space-y-4">
                {category.items.map((item, index) => {
                  const IconComponent = item.icon;
                  const isExpanded = expandedItem === item.id;
                  
                  return (
                    <div 
                      key={item.id}
                      ref={(el) => (faqItemRefs.current[index] = el)}
                      className="faq-item border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full text-left p-5 flex items-center justify-between bg-white"
                        aria-expanded={isExpanded}
                        aria-controls={`answer-${item.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span className="font-medium text-slate-900">
                            {item.question}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                      
                      <div 
                        id={`answer-${item.id}`}
                        className={`px-5 pb-5 ${isExpanded ? 'block' : 'hidden'}`}
                      >
                        <div className="pt-2 pl-11">
                          <p className="text-slate-700 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-8 border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Still Have Questions?</h2>
            <p className="text-slate-700 mb-6">
              Our team is ready to help you with any other questions you might have about InfoRx.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                className="bg-white"
                asChild
              >
                <a href="https://info-rx.org/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Us
                </a>
              </Button>
              
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat Support
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Get Started Guide</h3>
                <p className="text-slate-600 text-sm mb-4">
                  New to InfoRx? Learn how to use our platform with our step-by-step guide.
                </p>
                <a href="/guide" className="text-blue-600 hover:underline text-sm font-medium">
                  View Guide →
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Privacy Policy</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Learn how we protect your data and maintain your privacy.
                </p>
                <a href="/privacy" className="text-emerald-600 hover:underline text-sm font-medium">
                  Read Policy →
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Create Account</h3>
                <p className="text-slate-600 text-sm mb-4">
                  Sign up for free and start managing your healthcare information.
                </p>
                <a href="/auth/signup" className="text-purple-600 hover:underline text-sm font-medium">
                  Sign Up Now →
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}