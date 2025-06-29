"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  RefreshCw,
  FileText,
  Pill,
  Stethoscope,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { useMedicalSummary } from "@/hooks/useMedicalSummary";
import { MedicalSummary as MedicalSummaryType } from "@/lib/types/medical-summaries";
import { useAuthStore } from "@/lib/auth-store";
import { LoggingService } from "@/lib/services/logging-service";

interface MedicalSummaryProps {
  selectedRecordIds?: string[];
  onSummaryGenerated?: (summary: MedicalSummaryType) => void;
}

function MedicalSummary({
  selectedRecordIds = [],
  onSummaryGenerated,
}: MedicalSummaryProps) {
  const { summary, loading, error, generateSummary, fetchLatestSummary } =
    useMedicalSummary();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateSummary = async () => {
    if (selectedRecordIds.length === 0) {
      return;
    }

    try {
      setIsGenerating(true);
      const newSummary = await generateSummary(selectedRecordIds);
      if (onSummaryGenerated) {
        onSummaryGenerated(newSummary);
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (selectedRecordIds.length === 0) {
      return;
    }

    try {
      setIsGenerating(true);
      const newSummary = await generateSummary(selectedRecordIds);
      if (onSummaryGenerated) {
        onSummaryGenerated(newSummary);
      }
    } catch (err) {
      console.error("Failed to regenerate summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading && !summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Health Summary
          </CardTitle>
          <CardDescription>Loading your medical summary...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={fetchLatestSummary}
            variant="outline"
            className="mt-4"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Summary Button */}
      {selectedRecordIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Generate Health Summary</CardTitle>
            <CardDescription>
              Create an AI-powered summary from {selectedRecordIds.length}{" "}
              selected record{selectedRecordIds.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating || loading}
              className="w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating Summary...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate My Health Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display Summary */}
      {summary && (
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Health Summary
                </CardTitle>
                <CardDescription>
                  Generated from {summary.record_count} medical record
                  {summary.record_count !== 1 ? "s" : ""} • Last updated{" "}
                  {new Date(summary.last_updated).toLocaleDateString()}
                </CardDescription>
              </div>
              {selectedRecordIds.length > 0 && (
                <Button
                  onClick={handleRegenerateSummary}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Text */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Health Overview</h3>
              <p className="text-slate-700 leading-relaxed">
                {summary.summary_text}
              </p>
            </div>

            {/* Conditions */}
            {summary.conditions_identified.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-red-600" />
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.conditions_identified.map((condition, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {summary.medications_mentioned.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  Medications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.medications_mentioned.map((medication, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {medication}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tests */}
            {summary.tests_performed.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Medical Tests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.tests_performed.map((test, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Patterns */}
            {summary.patterns_identified.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Health Patterns
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.patterns_identified.map((pattern, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Factors */}
            {summary.risk_factors.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Risk Factors
                </h3>
                <div className="flex flex-wrap gap-2">
                  {summary.risk_factors.map((risk, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {summary.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {summary.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <Alert className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This summary is generated by AI and should be reviewed by
                healthcare professionals. It is not a substitute for
                professional medical advice, diagnosis, or treatment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* No Summary State */}
      {!summary && !loading && !error && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Health Summary
            </CardTitle>
            <CardDescription>
              Generate an AI-powered summary of your medical records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">
                No health summary available yet. Select some medical records and
                generate your first summary.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Log page view
  useEffect(() => {
    if (user) {
      LoggingService.logAction(user, LoggingService.actions.PAGE_VIEW, {
        page: "dashboard_overview",
      }).catch((error) => {
        console.error("Failed to log page view:", error);
      });
    }
  }, [user]);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <MedicalSummary />
    </div>
  );
}
