"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Shield,
  Phone,
  Mail,
  User,
  Heart,
  Pill,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface CriticalHealthIndicator {
  type:
    | "lab_result"
    | "vital_sign"
    | "medication_interaction"
    | "symptom"
    | "ai_analysis";
  severity: "high" | "critical";
  finding: string;
  recommendation: string;
  source: string;
  confidence?: number;
  metadata?: Record<string, any>;
}

interface EmergencyProfile {
  id: string;
  personalInfo: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    phoneNumber?: string;
    email?: string;
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    bloodType?: string;
    currentMedications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      instructions?: string;
    }>;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  };
  recentCriticalEvents?: Array<{
    title: string;
    description?: string;
    eventDate: string;
    severity: string;
  }>;
  lastUpdated: string;
}

export default function EmergencyAlerts() {
  const [indicators, setIndicators] = useState<CriticalHealthIndicator[]>([]);
  const [emergencyProfile, setEmergencyProfile] =
    useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [creatingAlert, setCreatingAlert] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([loadHealthIndicators(), loadEmergencyProfile()]);
    } catch (error) {
      console.error("Error loading emergency data:", error);
      toast.error("Failed to load emergency data");
    } finally {
      setLoading(false);
    }
  };

  const loadHealthIndicators = async () => {
    try {
      const response = await fetch("/api/emergency/alerts");
      const data = await response.json();

      if (data.success) {
        setIndicators(data.indicators || []);
      }
    } catch (error) {
      console.error("Error loading health indicators:", error);
    }
  };

  const loadEmergencyProfile = async () => {
    try {
      const response = await fetch("/api/emergency/profile");
      const data = await response.json();

      if (data.success) {
        setEmergencyProfile(data.profile);
      }
    } catch (error) {
      console.error("Error loading emergency profile:", error);
    }
  };

  const analyzeHealthIndicators = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/emergency/alerts");
      const data = await response.json();

      if (data.success) {
        setIndicators(data.indicators || []);
        toast.success(
          `Analysis complete. Found ${data.indicators?.length || 0} indicators.`
        );
      } else {
        throw new Error(data.error || "Failed to analyze health indicators");
      }
    } catch (error) {
      console.error("Error analyzing health indicators:", error);
      toast.error("Failed to analyze health indicators");
    } finally {
      setAnalyzing(false);
    }
  };

  const createEmergencyAlert = async (indicator: CriticalHealthIndicator) => {
    setCreatingAlert(true);
    try {
      const alertLevel =
        indicator.severity === "critical" ? "critical" : "urgent";

      const response = await fetch("/api/emergency/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indicator,
          alertLevel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Emergency alert created and sent successfully");
        await loadHealthIndicators();
      } else {
        throw new Error(data.error || "Failed to create emergency alert");
      }
    } catch (error) {
      console.error("Error creating emergency alert:", error);
      toast.error("Failed to create emergency alert");
    } finally {
      setCreatingAlert(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lab_result":
        return <Activity className="h-4 w-4" />;
      case "medication_interaction":
        return <Pill className="h-4 w-4" />;
      case "vital_sign":
        return <Heart className="h-4 w-4" />;
      case "symptom":
        return <AlertTriangle className="h-4 w-4" />;
      case "ai_analysis":
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Critical Indicators Alert */}
      {indicators.filter((i) => i.severity === "critical").length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Health Indicators Detected!</strong> You have{" "}
            {indicators.filter((i) => i.severity === "critical").length}{" "}
            critical health indicators that require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="indicators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="indicators">Health Indicators</TabsTrigger>
          <TabsTrigger value="profile">Emergency Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Health Indicators
                </span>
                <Button
                  onClick={analyzeHealthIndicators}
                  disabled={analyzing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${
                      analyzing ? "animate-spin" : ""
                    }`}
                  />
                  {analyzing ? "Analyzing..." : "Analyze"}
                </Button>
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your medical data for critical health
                indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              {indicators.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium text-green-700">
                    No Critical Indicators Found
                  </p>
                  <p className="text-muted-foreground">
                    Your recent medical data shows no critical health
                    indicators.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {indicators.map((indicator, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg ${
                        indicator.severity === "critical"
                          ? "border-red-200 bg-red-50"
                          : "border-yellow-200 bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getTypeIcon(indicator.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant={getSeverityColor(indicator.severity)}
                              >
                                {indicator.severity.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {indicator.source}
                              </span>
                              {indicator.confidence && (
                                <span className="text-sm text-muted-foreground">
                                  ({Math.round(indicator.confidence * 100)}%
                                  confidence)
                                </span>
                              )}
                            </div>
                            <h4 className="font-medium mb-1">
                              {indicator.finding}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {indicator.recommendation}
                            </p>
                            {indicator.metadata && (
                              <div className="text-xs text-muted-foreground">
                                <strong>Details:</strong>{" "}
                                {JSON.stringify(indicator.metadata, null, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                        {indicator.severity === "critical" && (
                          <Button
                            onClick={() => createEmergencyAlert(indicator)}
                            disabled={creatingAlert}
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {creatingAlert ? "Creating..." : "Create Alert"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {emergencyProfile ? (
            <>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </label>
                      <p className="font-medium">
                        {emergencyProfile.personalInfo.fullName ||
                          "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </label>
                      <p className="font-medium">
                        {emergencyProfile.personalInfo.dateOfBirth
                          ? format(
                              new Date(
                                emergencyProfile.personalInfo.dateOfBirth
                              ),
                              "PPP"
                            )
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Gender
                      </label>
                      <p className="font-medium capitalize">
                        {emergencyProfile.personalInfo.gender || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Blood Type
                      </label>
                      <p className="font-medium">
                        {emergencyProfile.medicalInfo.bloodType ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Medical Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Allergies
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {emergencyProfile.medicalInfo.allergies.length > 0 ? (
                        emergencyProfile.medicalInfo.allergies.map(
                          (allergy, index) => (
                            <Badge key={index} variant="destructive">
                              {allergy}
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          No known allergies
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Chronic Conditions
                    </label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {emergencyProfile.medicalInfo.chronicConditions.length >
                      0 ? (
                        emergencyProfile.medicalInfo.chronicConditions.map(
                          (condition, index) => (
                            <Badge key={index} variant="secondary">
                              {condition}
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          No chronic conditions
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Current Medications
                    </label>
                    <div className="space-y-2 mt-1">
                      {emergencyProfile.medicalInfo.currentMedications.length >
                      0 ? (
                        emergencyProfile.medicalInfo.currentMedications.map(
                          (medication, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">
                                  {medication.name}
                                </span>
                                <Badge variant="outline">
                                  {medication.dosage}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {medication.frequency}
                                {medication.instructions &&
                                  ` - ${medication.instructions}`}
                              </p>
                            </div>
                          )
                        )
                      ) : (
                        <span className="text-muted-foreground">
                          No current medications
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {emergencyProfile.emergencyContact ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Name
                        </label>
                        <p className="font-medium">
                          {emergencyProfile.emergencyContact.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Relationship
                        </label>
                        <p className="font-medium capitalize">
                          {emergencyProfile.emergencyContact.relationship}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Phone
                          </label>
                          <p className="font-medium flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {emergencyProfile.emergencyContact.phoneNumber}
                          </p>
                        </div>
                        {emergencyProfile.emergencyContact.email && (
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Email
                            </label>
                            <p className="font-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {emergencyProfile.emergencyContact.email}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No emergency contact configured
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Please add an emergency contact in your profile settings
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Critical Events */}
              {emergencyProfile.recentCriticalEvents &&
                emergencyProfile.recentCriticalEvents.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Recent Critical Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {emergencyProfile.recentCriticalEvents.map(
                          (event, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{event.title}</h4>
                                <Badge variant="destructive">
                                  {event.severity}
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {event.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {format(new Date(event.eventDate), "PPp")}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium">
                  Emergency Profile Not Available
                </p>
                <p className="text-muted-foreground">
                  Unable to load emergency profile information
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
