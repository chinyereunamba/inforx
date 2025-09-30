"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pill,
  Clock,
  AlertTriangle,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Users,
  Zap,
  Heart,
} from "lucide-react";
import {
  PrescriptionAnalysis,
  DrugInteraction,
  SafetyAlert,
} from "@/lib/services/prescription-analysis";

interface PrescriptionAnalysisViewProps {
  recordId?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }>;
  autoAnalyze?: boolean;
}

interface AnalysisResponse {
  success: boolean;
  analysis: PrescriptionAnalysis;
  insights: {
    riskLevel: "low" | "medium" | "high";
    adherenceRisk: "low" | "high";
    monitoringRequired: boolean;
    criticalInteractions: number;
  };
  metadata: {
    analyzedAt: string;
    totalMedications: number;
    complexityScore: number;
    recordId?: string;
  };
}

export function PrescriptionAnalysisView({
  recordId,
  medications,
  autoAnalyze = false,
}: PrescriptionAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoAnalyze && (recordId || medications)) {
      handleAnalyze();
    }
  }, [recordId, medications, autoAnalyze]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = recordId ? { recordId } : { medications };

      const response = await fetch("/api/prescription-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze prescription");
      }

      setAnalysis(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "severe":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "mild":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
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
            <Pill className="h-5 w-5" />
            Prescription Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
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
            <Pill className="h-5 w-5" />
            Prescription Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleAnalyze} className="mt-4" variant="outline">
            <Pill className="h-4 w-4 mr-2" />
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
            <Pill className="h-5 w-5" />
            Prescription Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Pill className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Analyze your prescription for drug interactions, scheduling, and
              safety alerts.
            </p>
            <Button onClick={handleAnalyze}>
              <Pill className="h-4 w-4 mr-2" />
              Analyze Prescription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Prescription Analysis Overview
            </CardTitle>
            <Button onClick={handleAnalyze} variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.metadata.totalMedications}
              </div>
              <div className="text-sm text-gray-600">Medications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.metadata.complexityScore}
              </div>
              <div className="text-sm text-gray-600">Complexity Score</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  analysis.insights.criticalInteractions > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {analysis.insights.criticalInteractions}
              </div>
              <div className="text-sm text-gray-600">Critical Interactions</div>
            </div>
            <div className="text-center">
              <Badge
                variant="outline"
                className={getSeverityColor(analysis.insights.riskLevel)}
              >
                {getRiskLevelIcon(analysis.insights.riskLevel)}
                {analysis.insights.riskLevel.charAt(0).toUpperCase() +
                  analysis.insights.riskLevel.slice(1)}{" "}
                Risk
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      {analysis.analysis.safetyAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Alerts ({analysis.analysis.safetyAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.analysis.safetyAlerts.map((alert, index) => (
                <Alert
                  key={index}
                  variant={
                    alert.severity === "critical" || alert.severity === "high"
                      ? "destructive"
                      : "default"
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {alert.medication}
                      <Badge
                        variant="outline"
                        className={getSeverityColor(alert.severity)}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="mt-1">
                      {alert.message}
                    </AlertDescription>
                    <div className="mt-2 text-sm font-medium">
                      Action: {alert.action}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drug Interactions */}
      {analysis.analysis.drugInteractions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Drug Interactions ({analysis.analysis.drugInteractions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.drugInteractions.map((interaction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">
                      {interaction.medication1} + {interaction.medication2}
                    </div>
                    <Badge
                      variant="outline"
                      className={getSeverityColor(interaction.severity)}
                    >
                      {interaction.severity}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-2">
                    {interaction.description}
                  </p>
                  <div className="text-sm">
                    <div className="font-medium">Management:</div>
                    <p className="text-gray-600">{interaction.management}</p>
                  </div>
                  <div className="text-sm mt-2">
                    <div className="font-medium">Clinical Significance:</div>
                    <p className="text-gray-600">
                      {interaction.clinicalSignificance}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medication Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Medication Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.analysis.medicationSchedule.map((schedule, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h5 className="font-semibold text-lg mb-2">
                  {schedule.medicationName}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium mb-1">Times:</div>
                    <div className="flex flex-wrap gap-2">
                      {schedule.times.map((time, timeIndex) => (
                        <Badge key={timeIndex} variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Instructions:</div>
                    <p className="text-sm text-gray-600">
                      {schedule.instructions}
                    </p>
                  </div>
                </div>
                {schedule.foodRequirements &&
                  schedule.foodRequirements !== "any" && (
                    <div className="mt-2">
                      <div className="font-medium">Food Requirements:</div>
                      <Badge variant="outline" className="mt-1">
                        {schedule.foodRequirements.replace("_", " ")}
                      </Badge>
                    </div>
                  )}
                {schedule.specialInstructions && (
                  <div className="mt-2">
                    <div className="font-medium">Special Instructions:</div>
                    <p className="text-sm text-gray-600">
                      {schedule.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medication Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.analysis.medications.map((medication, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-lg">{medication.name}</h5>
                  <div className="flex gap-2">
                    {medication.isHighRisk && (
                      <Badge variant="destructive">High Risk</Badge>
                    )}
                    {medication.category && (
                      <Badge variant="outline">{medication.category}</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Dosage:</span>{" "}
                        {medication.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span>{" "}
                        {medication.frequency}
                      </div>
                      {medication.duration && (
                        <div>
                          <span className="font-medium">Duration:</span>{" "}
                          {medication.duration}
                        </div>
                      )}
                      {medication.genericName && (
                        <div>
                          <span className="font-medium">Generic Name:</span>{" "}
                          {medication.genericName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    {medication.maxDailyDose && (
                      <div className="mb-2">
                        <span className="font-medium">Max Daily Dose:</span>{" "}
                        {medication.maxDailyDose}
                      </div>
                    )}
                    {medication.pregnancyCategory && (
                      <div className="mb-2">
                        <span className="font-medium">Pregnancy Category:</span>
                        <Badge variant="outline" className="ml-2">
                          {medication.pregnancyCategory}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                {medication.enhancedInstructions && (
                  <div className="mt-3">
                    <div className="font-medium">Instructions:</div>
                    <p className="text-sm text-gray-600 mt-1">
                      {medication.enhancedInstructions}
                    </p>
                  </div>
                )}

                {medication.safetyWarnings &&
                  medication.safetyWarnings.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium">Safety Warnings:</div>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {medication.safetyWarnings.map(
                          (warning, warningIndex) => (
                            <li
                              key={warningIndex}
                              className="flex items-start gap-2"
                            >
                              <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500" />
                              {warning}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {medication.sideEffects &&
                  medication.sideEffects.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium">Common Side Effects:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.sideEffects.map((effect, effectIndex) => (
                          <Badge
                            key={effectIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {effect}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {medication.contraindications &&
                  medication.contraindications.length > 0 && (
                    <div className="mt-3">
                      <div className="font-medium">Contraindications:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {medication.contraindications.map(
                          (contra, contraIndex) => (
                            <Badge
                              key={contraIndex}
                              variant="destructive"
                              className="text-xs"
                            >
                              {contra}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adherence Recommendations */}
      {analysis.analysis.adherenceRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Adherence Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.adherenceRecommendations.map(
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

      {/* Analysis Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Analyzed on{" "}
              {new Date(analysis.metadata.analyzedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-4">
              <div>
                Complexity Score: {analysis.metadata.complexityScore}/100
              </div>
              <div>Risk Level: {analysis.insights.riskLevel}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
