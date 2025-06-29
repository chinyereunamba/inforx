"use client";
import React, { useEffect, useState } from "react";
import { FileText, Brain, AlertCircle, Lightbulb, Stethoscope } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { LoggingService } from "@/lib/services/logging-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MedicalInterpreter from "@/components/MedicalInterpreter";

export default function InterpreterPage() {
  const { user } = useAuthStore();

  // Log page view on component mount
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "interpreter",
      }).catch((error) => {
        console.error("Failed to log page view:", error);
      });
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-noto text-gray-900 mb-2">AI Health Interpreter</h1>
          <p className="text-gray-600 max-w-3xl">
            Upload a medical document or paste text for AI-powered interpretation. Our advanced AI will analyze your medical information and provide clear, simple explanations.
          </p>
        </div>
        
        <Button
          variant="outline"
          className="lg:self-start"
          asChild
        >
          <a href="https://info-rx.org/faq" target="_blank" rel="noopener noreferrer">
            <AlertCircle className="h-4 w-4 mr-2" />
            How it Works
          </a>
        </Button>
      </div>
      
      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Brain className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
                <p className="text-sm text-gray-600">Process any medical text</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Simple Explanations</h3>
                <p className="text-sm text-gray-600">Easy to understand terms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Medical Guidance</h3>
                <p className="text-sm text-gray-600">Clear next steps & warnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Interpreter Component */}
      <MedicalInterpreter />
    </div>
  );
}