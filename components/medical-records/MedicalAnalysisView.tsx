"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Pill,
  TestTube,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Clock,
  TrendingUp,
  Stethoscope,
  Shield,
  Info,
} from "lucide-react";
import {
  useMedicalAnalysis,
  useAnalysisConfidence,
} from "@/hooks/useMedicalAnalysis";
import { MedicalAnalysisResult } from "@/lib/services/ai-medical-interpretation";

interface MedicalAnalysisViewProps {
  recordId: string;
  recordType: "prescription" | "lab_result" | "scan" | "consultation" | "other";
  autoAnalyze?: boolean;
}

interface AnalysisData extends MedicalAnalysisResult {
  id: string;
  processedAt: Date;
}

export function MedicalAnalysisView({
  recordId,
  recordType,
  autoAnalyze = false,
}: MedicalAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [warnings, setWarnings] = useState<
    Array<{ type: string; message: string }>
  >([]);
  const { analyzeDocument, getAnalysis, isLoading, error, clearError } =
    useMedicalAnalysis();
  const {
    getConfidenceColor,
    getConfidenceLabel,
    getConfidenceDescription,
    shouldShowWarning,
  } = useAnalysisConfidence();

  // Load existing analysis on mount
  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const result = await getAnalysis(recordId);
        setAnalysis(result.analysis);
        setWarnings(result.warnings || []);
      } catch (err) {
        // If no analysis exists and autoAnalyze is true, trigger analysis
        if (autoAnalyze) {
          handleAnalyze();
        }
      }
    };

    loadAnalysis();
  }, [recordId, autoAnalyze, getAnalysis]);

  const handleAnalyze = async (forceReanalysis = false) => {
    clearError();
    try {
      const result = await analyzeDocument(recordId, forceReanalysis);
      setAnalysis(result.analysis);
      setWarnings(result.warnings || []);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyIcon = (level: string) => {
    switch (level) {
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Info className="h-4 w-4" />;
      case "low":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Medical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Medical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => handleAnalyze()}
            className="mt-4"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Medical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              No AI analysis available for this document yet.
            </p>
            <Button onClick={() => handleAnalyze()}>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Document
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Medical Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={getUrgencyColor(analysis.urgencyLevel)}
              >
                {getUrgencyIcon(analysis.urgencyLevel)}
                {analysis.urgencyLevel.charAt(0).toUpperCase() +
                  analysis.urgencyLevel.slice(1)}{" "}
                Priority
              </Badge>
              <Button
                onClick={() => handleAnalyze(true)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze
              </Button>
            </div>
          </div>

          {/* Confidence and Warnings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Confidence:</span>
              <span className={getConfidenceColor(analysis.confidence)}>
                {Math.round(analysis.confidence * 100)}% -{" "}
                {getConfidenceLabel(analysis.confidence)}
              </span>
            </div>

            {shouldShowWarning(analysis.confidence) && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {getConfidenceDescription(analysis.confidence)}
                </AlertDescription>
              </Alert>
            )}

            {warnings.map((warning, index) => (
              <Alert key={index} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{warning.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose max-w-none">
            <h4 className="text-lg font-semibold mb-2">Summary</h4>
            <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        {analysis.extractedData.medications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medications ({analysis.extractedData.medications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.extractedData.medications.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h5 className="font-semibold text-lg">{medication.name}</h5>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="font-medium">Dosage:</span>{" "}
                        {medication.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>{" "}
                        {medication.frequency}
                      </div>
                      {medication.duration && (
                        <div className="col-span-2">
                          <span className="font-medium">Duration:</span>{" "}
                          {medication.duration}
                        </div>
                      )}
                    </div>
                    {medication.instructions && (
                      <div className="mt-2">
                        <span className="font-medium">Instructions:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {medication.instructions}
                        </p>
                      </div>
                    )}
                    {medication.sideEffects &&
                      medication.sideEffects.length > 0 && (
                        <div className="mt-2">
                          <span className="font-medium">Side Effects:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medication.sideEffects.map((effect, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {effect}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lab Results */}
        {analysis.extractedData.labResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Lab Results ({analysis.extractedData.labResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.extractedData.labResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold">{result.testName}</h5>
                      {result.isAbnormal && (
                        <Badge variant="destructive">Abnormal</Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">Value:</span>
                        <span
                          className={
                            result.isAbnormal
                              ? "text-red-600 font-semibold"
                              : ""
                          }
                        >
                          {result.value} {result.unit}
                        </span>
                      </div>
                      {result.referenceRange && (
                        <div className="flex items-center gap-4">
                          <span className="font-medium">Normal Range:</span>
                          <span className="text-gray-600">
                            {result.referenceRange}
                          </span>
                        </div>
                      )}
                      {result.explanation && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diagnoses and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnoses */}
        {analysis.extractedData.diagnoses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.extractedData.diagnoses.map((diagnosis, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>{diagnosis}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysis.extractedData.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.extractedData.recommendations.map(
                  (recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                      <span>{recommendation}</span>
                    </li>
                  )
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Risk Factors */}
      {analysis.riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysis.riskFactors.map((risk, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{risk.factor}</h5>
                    <Badge
                      variant="outline"
                      className={
                        risk.severity === "high"
                          ? "border-red-200 text-red-800"
                          : risk.severity === "medium"
                          ? "border-yellow-200 text-yellow-800"
                          : "border-green-200 text-green-800"
                      }
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{risk.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Analyzed on {new Date(analysis.processedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Model: {analysis.aiModel}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
