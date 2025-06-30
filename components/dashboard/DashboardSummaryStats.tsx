"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Hospital,
  Brain,
  Upload,
  Calendar,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useMedicalRecords } from '@/hooks/useMedicalRecordsHook';
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSummaryStats() {
  const { stats, loadingStats: loading, statsError: error } = useMedicalRecords();


  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-none rounded-xl">
            <CardContent className="p-6">
              <Skeleton className="w-12 h-12 rounded-full bg-slate-200 mb-4" />
              <Skeleton className="h-7 bg-slate-200 rounded w-1/2 mb-2" />
              <Skeleton className="h-4 bg-slate-200 rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Records Card */}
      <Card className="rounded-xl border border-slate-200 hover:border-emerald-200 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.totalRecords}
              </h3>
              <p className="text-sm text-slate-500">Total Records</p>
            </div>
          </div>

          {stats.totalRecords > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>With files</span>
                <span>
                  {stats.recordsWithFiles} of {stats.totalRecords}
                </span>
              </div>
              <Progress
                value={(stats.recordsWithFiles / stats.totalRecords) * 100}
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospitals Card */}
      <Card className="rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
              <Hospital className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {Object.keys(stats.recordsByHospital).length}
              </h3>
              <p className="text-sm text-slate-500">Hospitals</p>
            </div>
          </div>

          {stats.topHospitals && stats.topHospitals.length > 0 && (
            <div className="mt-4 space-y-2">
              {stats.topHospitals.slice(0, 2).map((hospital) => (
                <div
                  key={hospital.hospital}
                  className="flex justify-between text-xs"
                >
                  <span
                    className="text-slate-600 truncate max-w-[70%]"
                    title={hospital.hospital}
                  >
                    {hospital.hospital}
                  </span>
                  <span className="text-sky-600 font-medium">
                    {hospital.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Interpretations Card */}
      <Card className="rounded-xl border border-slate-200 hover:border-purple-200 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.recordsWithFiles}
              </h3>
              <p className="text-sm text-slate-500">AI Interpretations</p>
            </div>
          </div>

          {stats.recordsWithFiles > 0 && (
            <div className="mt-4">
              <div className="text-xs text-slate-500 mb-1 flex items-center">
                <CheckCircle className="h-3 w-3 text-purple-600 mr-1" />
                <span>All uploads processed successfully</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Used Card */}
      <Card className="rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">
                {stats.formattedTotalFileSize}
              </h3>
              <p className="text-sm text-slate-500">Storage Used</p>
            </div>
          </div>

          {stats.averageFileSize && stats.totalRecords > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Average file size</span>
                <span>{stats.averageFileSize}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
