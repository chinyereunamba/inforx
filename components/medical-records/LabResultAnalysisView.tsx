"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TestTube,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  BarChart3,
  Info,
  Heart,
  Zap,
  Shield,
} from "lucide-react";
import {
  LabResultAnalysis,
  EnhancedLabResult,
  HealthInsight,
} from "@/lib/services/lab-result-analysis";

interface LabResultAnalysisViewProps {
  recordId?: string;
  labResults?: Array<{
    testName: string;
    value: string;
    unit?: string;
    referenceRange?: string;
    isAbnormal: boolean;
  }>;
  patientGender?: "male" | "female";
  autoAnalyze?: boolean;
}

interface AnalysisResponse {
  success: boolean;
  analysis: LabResultAnalysis;
  insights: {
    totalTests: number;
    abnormalCount: number;
    criticalCount: number;
    categoriesAffected: string[];
    riskLevel: "low" | "medium" | "high" | "critical";
    hasImprovement: boolean;
    hasDeterioration: boolean;
  };
  metadata: {
    analyzedAt: string;
    patientGender: string;
    recordId?: string;
    hasTrendData: boolean;
  };
}

export function LabResultAnalysisView({
  recordId,
  labResults,
  patientGender,
  autoAnalyze = false,
}: LabResultAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (autoAnalyze && (recordId || labResults)) {
      handleAnalyze();
    }
  }, [recordId, labResults, autoAnalyze]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = recordId
        ? { recordId, patientGender }
        : { labResults, patientGender };

      const response = await fetch("/api/lab-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze lab results");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "severe_abnormal":
        return "bg-red-100 text-red-800 border-red-200";
      case "moderate_abnormal":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "mild_abnormal":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "worsening":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case "stable":
        return <Activity className="h-4 w-4 text-blue-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Lab Result Analysis
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
            <TestTube className="h-5 w-5" />
            Lab Result Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleAnalyze} className="mt-4" variant="outline">
            <TestTube className="h-4 w-4 mr-2" />
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
            <TestTube className="h-5 w-5" />
            Lab Result Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TestTube className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Analyze your lab results for abnormal values, trends, and health
              insights.
            </p>
            <Button onClick={handleAnalyze}>
              <TestTube className="h-4 w-4 mr-2" />
              Analyze Lab Results
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
              <TestTube className="h-5 w-5" />
              Lab Result Analysis Overview
            </CardTitle>
            <Button onClick={handleAnalyze} variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.insights.totalTests}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  analysis.insights.abnormalCount > 0
                    ? "text-orange-600"
                    : "text-green-600"
                }`}
              >
                {analysis.insights.abnormalCount}
              </div>
              <div className="text-sm text-gray-600">Abnormal</div>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  analysis.insights.criticalCount > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {analysis.insights.criticalCount}
              </div>
              <div className="text-sm text-gray-600">Critical</div>
            </div>
            <div className="text-center">
              <Badge
                variant="outline"
                className={getStatusColor(
                  analysis.analysis.overallAssessment.status
                )}
              >
                {analysis.analysis.overallAssessment.status.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Overall Assessment:</div>
            <p className="text-gray-700">
              {analysis.analysis.overallAssessment.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Critical Results Alert */}
      {analysis.analysis.criticalResults.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <div className="font-semibold">Critical Values Detected</div>
            <AlertDescription>
              {analysis.analysis.criticalResults.length} critical lab values
              require immediate medical attention. Please contact your
              healthcare provider immediately.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Health Insights */}
      {analysis.analysis.healthInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Insights ({analysis.analysis.healthInsights.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.healthInsights.map((insight, index) => (
                <Alert
                  key={index}
                  variant={
                    insight.severity === "critical" ? "destructive" : "default"
                  }
                >
                  <Shield className="h-4 w-4" />
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {insight.title}
                      <Badge
                        variant="outline"
                        className={getSeverityColor(insight.severity)}
                      >
                        {insight.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="mt-1">
                      {insight.description}
                    </AlertDescription>
                    <div className="mt-2">
                      <div className="text-sm font-medium">Related Tests:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {insight.relatedTests.map((test, testIndex) => (
                          <Badge
                            key={testIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium">
                        Recommendations:
                      </div>
                      <ul className="text-sm text-gray-600 mt-1 space-y-1">
                        {insight.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Analysis */}
      {analysis.analysis.trendAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis ({analysis.analysis.trendAnalysis.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.analysis.trendAnalysis.map((trend, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold">{trend.testName}</h5>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(trend.trend)}
                      <Badge variant="outline">
                        {trend.trendPercentage > 0 ? "+" : ""}
                        {trend.trendPercentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {trend.interpretation}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trend.values.map((value, valueIndex) => (
                      <div
                        key={valueIndex}
                        className="text-xs bg-gray-50 px-2 py-1 rounded"
                      >
                        {new Date(value.date).toLocaleDateString()}:{" "}
                        {value.value}
                        {value.isAbnormal && (
                          <span className="text-red-600 ml-1">*</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results by Category */}
      <div className="space-y-4">
        {Object.entries(
          analysis.analysis.results.reduce((acc, result) => {
            const category = result.category || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(result);
            return acc;
          }, {} as Record<string, EnhancedLabResult[]>)
        ).map(([category, results]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {category} ({results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold">{result.testName}</h5>
                      <div className="flex items-center gap-2">
                        {result.isCritical && (
                          <Badge variant="destructive">Critical</Badge>
                        )}
                        {result.isAbnormal && !result.isCritical && (
                          <Badge
                            variant="outline"
                            className={getSeverityColor(
                              result.severity || "mild"
                            )}
                          >
                            {result.severity || "abnormal"}
                          </Badge>
                        )}
                        {!result.isAbnormal && (
                          <Badge
                            variant="outline"
                            className={getSeverityColor("normal")}
                          >
                            Normal
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Value:</span>
                            <span
                              className={
                                result.isAbnormal
                                  ? "text-red-600 font-semibold ml-2"
                                  : "ml-2"
                              }
                            >
                              {result.value} {result.unit}
                            </span>
                          </div>
                          {result.normalRange && (
                            <div>
                              <span className="font-medium">Normal Range:</span>
                              <span className="text-gray-600 ml-2">
                                {result.normalRange.min} -{" "}
                                {result.normalRange.max}{" "}
                                {result.normalRange.unit}
                              </span>
                            </div>
                          )}
                          {result.referenceRange && (
                            <div>
                              <span className="font-medium">
                                Reference Range:
                              </span>
                              <span className="text-gray-600 ml-2">
                                {result.referenceRange}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {result.percentileDeviation !== undefined && (
                          <div className="mb-2">
                            <span className="font-medium">Deviation:</span>
                            <span className="ml-2">
                              {result.percentileDeviation > 0 ? "+" : ""}
                              {result.percentileDeviation.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {result.trendDirection && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Trend:</span>
                            {getTrendIcon(result.trendDirection)}
                            <span className="capitalize">
                              {result.trendDirection}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {result.explanation && (
                      <div className="mt-3">
                        <div className="font-medium">
                          What this test measures:
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {result.explanation}
                        </p>
                      </div>
                    )}

                    {result.clinicalSignificance && (
                      <div className="mt-3">
                        <div className="font-medium">
                          Clinical Significance:
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {result.clinicalSignificance}
                        </p>
                      </div>
                    )}

                    {result.possibleCauses &&
                      result.possibleCauses.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium">Possible Causes:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {result.possibleCauses.map((cause, causeIndex) => (
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

                    {result.followUpRecommendations &&
                      result.followUpRecommendations.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium">
                            Follow-up Recommendations:
                          </div>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {result.followUpRecommendations.map(
                              (rec, recIndex) => (
                                <li
                                  key={recIndex}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle className="h-3 w-3 mt-0.5 text-green-500" />
                                  {rec}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.analysis.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.analysis.recommendations.map(
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
              <Info className="h-4 w-4" />
              Analyzed on{" "}
              {new Date(analysis.metadata.analyzedAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-4">
              <div>Patient Gender: {analysis.metadata.patientGender}</div>
              <div>Risk Level: {analysis.insights.riskLevel}</div>
              {analysis.metadata.hasTrendData && (
                <div>Trend Data: Available</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
