"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Scan,
  Eye,
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  BookOpen,
  Target,
  Activity,
  Stethoscope,
  FileText,
  Info,
  Clock,
  MapPin,
} from "lucide-react";
import {
  ScanAnalysis,
  ScanFinding,
  SpecialistReferral,
  PatientEducation,
} from "@/lib/services/medical-scan-analysis";

interface MedicalScanAnalysisViewProps {
  recordId?: string;
  scanText?: string;
  scanType?:
    | "x-ray"
    | "ct_scan"
    | "mri"
    | "ultrasound"
    | "mammogram"
    | "bone_scan";
  anatomicalRegion?:
    | "chest"
    | "abdomen"
    | "pelvis"
    | "head"
    | "spine"
    | "extremities";
  autoAnalyze?: boolean;
}

interface AnalysisResponse {
  success: boolean;
  analysis: ScanAnalysis;
  insights: {
    totalFindings: number;
    abnormalFindings: number;
    urgentFindings: number;
    requiresFollowUp: boolean;
    specialistReferralsNeeded: number;
    overallSeverity: string;
    urgencyLevel: string;
    keyCategories: string[];
  };
  metadata: {
    analyzedAt: string;
    scanType: string;
    anatomicalRegion: string;
    recordId?: string;
    textLength?: number;
  };
}

export function MedicalScanAnalysisView({
  recordId,
  scanText,
  scanType,
  anatomicalRegion,
  autoAnalyze = false,
}: MedicalScanAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoAnalyze && (recordId || scanText)) {
      handleAnalyze();
    }
  }, [recordId, scanText, autoAnalyze]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = recordId
        ? { recordId, scanType, anatomicalRegion }
        : { scanText, scanType, anatomicalRegion };

      const response = await fetch("/api/scan-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze scan");
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
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "semi_urgent":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "non_urgent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "routine":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pathological":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "anatomical_variant":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "artifact":
        return <Info className="h-4 w-4 text-blue-600" />;
      case "incidental":
        return <Eye className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Medical Scan Analysis
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
            <Scan className="h-5 w-5" />
            Medical Scan Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleAnalyze} className="mt-4" variant="outline">
            <Scan className="h-4 w-4 mr-2" />
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
            <Scan className="h-5 w-5" />
            Medical Scan Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Scan className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Analyze your medical scan report for findings, severity
              assessment, and recommendations.
            </p>
            <Button onClick={handleAnalyze}>
              <Scan className="h-4 w-4 mr-2" />
              Analyze Scan Report
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
              <Scan className="h-5 w-5" />
              Scan Analysis Overview
            </CardTitle>
            <Button onClick={handleAnalyze} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.insights.totalFindings}
              </div>
              <div className="text-sm text-gray-600">Total Findings</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  analysis.insights.abnormalFindings > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {analysis.insights.abnormalFindings}
              </div>
              <div className="text-sm text-gray-600">Abnormal</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  analysis.insights.urgentFindings > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {analysis.insights.urgentFindings}
              </div>
              <div className="text-sm text-gray-600">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analysis.insights.specialistReferralsNeeded}
              </div>
              <div className="text-sm text-gray-600">Referrals</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <Badge
                variant="outline"
                className={getSeverityColor(analysis.insights.overallSeverity)}
              >
                {analysis.insights.overallSeverity} Severity
              </Badge>
            </div>
            <div className="text-center">
              <Badge
                variant="outline"
                className={getUrgencyColor(analysis.insights.urgencyLevel)}
              >
                {analysis.insights.urgencyLevel.replace("_", " ")} Priority
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {analysis.analysis.anatomicalRegion}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Overall Impression:</div>
            <p className="text-gray-700">
              {analysis.analysis.overallAssessment.impression}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Findings Alert */}
      {analysis.insights.urgentFindings > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <div className="font-semibold">Urgent Findings Detected</div>
            <AlertDescription>
              {analysis.insights.urgentFindings} urgent findings require
              immediate medical attention. Please contact your healthcare
              provider immediately.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Key Findings */}
      {analysis.analysis.overallAssessment.keyFindings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Key Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.overallAssessment.keyFindings.map(
                (finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                    <span>{finding}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Detailed Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detailed Findings ({analysis.analysis.findings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.analysis.findings.map((finding, index) => (
              <div key={finding.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(finding.category)}
                    <h5 className="font-semibold">{finding.description}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    {finding.isUrgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={getSeverityColor(finding.severity)}
                    >
                      {finding.severity}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {finding.category.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{finding.location}</span>
                      </div>
                      {finding.measurements && (
                        <div>
                          <span className="font-medium">Measurements:</span>
                          <div className="ml-2 text-sm">
                            {finding.measurements.size && (
                              <div>Size: {finding.measurements.size}</div>
                            )}
                            {finding.measurements.dimensions && (
                              <div>
                                Dimensions: {finding.measurements.dimensions}
                              </div>
                            )}
                            {finding.measurements.volume && (
                              <div>Volume: {finding.measurements.volume}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Follow-up Required:</span>
                        {finding.requiresFollowUp ? (
                          <CheckCircle className="h-4 w-4 text-orange-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span>{finding.requiresFollowUp ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-medium">Clinical Significance:</div>
                  <p className="text-sm text-gray-600 mt-1">
                    {finding.clinicalSignificance}
                  </p>
                </div>

                {finding.possibleCauses.length > 0 && (
                  <div className="mt-3">
                    <div className="font-medium">Possible Causes:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {finding.possibleCauses.map((cause, causeIndex) => (
                        <Badge
                          key={causeIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cause}
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

      {/* Specialist Referrals */}
      {analysis.analysis.specialistReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Specialist Referrals (
              {analysis.analysis.specialistReferrals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.specialistReferrals.map((referral, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{referral.specialty}</h5>
                    <Badge
                      variant="outline"
                      className={getUrgencyColor(referral.urgency)}
                    >
                      {referral.urgency}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Reason:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {referral.reason}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium">Expected Timeframe:</span>
                      <span className="ml-2 text-sm">
                        {referral.expectedTimeframe}
                      </span>
                    </div>

                    {referral.preparationInstructions &&
                      referral.preparationInstructions.length > 0 && (
                        <div>
                          <div className="font-medium">
                            Preparation Instructions:
                          </div>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {referral.preparationInstructions.map(
                              (instruction, instrIndex) => (
                                <li
                                  key={instrIndex}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                                  {instruction}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Recommendations ({analysis.analysis.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.recommendations.map(
                (recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold capitalize">
                        {recommendation.type.replace("_", " ")}
                      </h5>
                      <Badge
                        variant="outline"
                        className={getSeverityColor(recommendation.priority)}
                      >
                        {recommendation.priority} priority
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendation.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Timeframe:</span>
                          <span className="ml-2 text-sm">
                            {recommendation.timeframe}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">Rationale:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          {recommendation.rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follow-up Instructions */}
      {analysis.analysis.followUpInstructions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Follow-up Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.followUpInstructions.map(
                (instruction, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>{instruction}</span>
                  </li>
                )
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Patient Education */}
      {analysis.analysis.patientEducation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Patient Education
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.patientEducation.map((education, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h5 className="font-semibold mb-2">{education.topic}</h5>

                  <div className="space-y-3">
                    <div>
                      <div className="font-medium">Explanation:</div>
                      <p className="text-sm text-gray-600 mt-1">
                        {education.explanation}
                      </p>
                    </div>

                    <div>
                      <div className="font-medium">What to Expect:</div>
                      <p className="text-sm text-gray-600 mt-1">
                        {education.whatToExpect}
                      </p>
                    </div>

                    <div>
                      <div className="font-medium">When to Seek Help:</div>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {education.whenToSeekHelp.map((help, helpIndex) => (
                          <li
                            key={helpIndex}
                            className="flex items-start gap-2"
                          >
                            <AlertTriangle className="h-3 w-3 mt-0.5 text-orange-500" />
                            {help}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clinical Correlation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Clinical Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            {analysis.analysis.overallAssessment.clinicalCorrelation}
          </p>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Analyzed on{" "}
              {new Date(analysis.metadata.analyzedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-4">
              <div>
                Scan Type: {analysis.metadata.scanType.replace("_", " ")}
              </div>
              <div>Region: {analysis.metadata.anatomicalRegion}</div>
              {analysis.metadata.textLength && (
                <div>Text Length: {analysis.metadata.textLength} chars</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
