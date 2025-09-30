"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  FileText,
  Eye,
  Edit,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
  Settings,
  Download,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  OCRTextExtractionService,
  TextExtractionResult,
  OCRProgress,
} from "@/lib/services/ocr-text-extraction-service";

interface TextExtractionInterfaceProps {
  file: File;
  onTextExtracted: (result: TextExtractionResult) => void;
  onTextCorrected: (correctedText: string) => void;
  initialText?: string;
  className?: string;
}

const CONFIDENCE_LEVELS = {
  high: { min: 80, color: "text-green-600", bg: "bg-green-100" },
  medium: { min: 60, color: "text-yellow-600", bg: "bg-yellow-100" },
  low: { min: 0, color: "text-red-600", bg: "bg-red-100" },
};

const OCR_LANGUAGES = [
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "spa", label: "Spanish" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
];

export default function TextExtractionInterface({
  file,
  onTextExtracted,
  onTextCorrected,
  initialText = "",
  className = "",
}: TextExtractionInterfaceProps) {
  const [extractionResult, setExtractionResult] =
    useState<TextExtractionResult | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] =
    useState<OCRProgress | null>(null);
  const [editedText, setEditedText] = useState(initialText);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [autoCorrect, setAutoCorrect] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Start text extraction
  const handleExtractText = useCallback(async () => {
    setIsExtracting(true);
    setExtractionProgress({ status: "Initializing...", progress: 0 });

    try {
      const result = await OCRTextExtractionService.extractText(
        file,
        (progress) => {
          setExtractionProgress(progress);
        }
      );

      setExtractionResult(result);

      if (result.success) {
        const processedText = autoCorrect
          ? preprocessExtractedText(result.text)
          : result.text;

        setEditedText(processedText);
        onTextExtracted(result);
        toast.success("Text extraction completed successfully");
      } else {
        toast.error(`Text extraction failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Text extraction error:", error);
      toast.error("Text extraction failed");
    } finally {
      setIsExtracting(false);
      setExtractionProgress(null);
    }
  }, [file, autoCorrect, onTextExtracted]);

  // Preprocess extracted text for better readability
  const preprocessExtractedText = useCallback((text: string): string => {
    return (
      text
        // Fix common OCR mistakes
        .replace(/\b0\b/g, "O") // Replace isolated 0s with Os
        .replace(/\bl\b/g, "I") // Replace isolated ls with Is
        .replace(/rn/g, "m") // Common OCR mistake
        .replace(/\s+/g, " ") // Normalize whitespace
        .trim()
    );
  }, []);

  // Save corrected text
  const handleSaveText = useCallback(() => {
    onTextCorrected(editedText);
    setIsEditing(false);
    toast.success("Text corrections saved");
  }, [editedText, onTextCorrected]);

  // Copy text to clipboard
  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editedText);
      toast.success("Text copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy text");
    }
  }, [editedText]);

  // Download text as file
  const handleDownloadText = useCallback(() => {
    const blob = new Blob([editedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${file.name}_extracted.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded");
  }, [editedText, file.name]);

  // Get confidence level info
  const getConfidenceLevel = useCallback((confidence: number) => {
    if (confidence >= CONFIDENCE_LEVELS.high.min) return "high";
    if (confidence >= CONFIDENCE_LEVELS.medium.min) return "medium";
    return "low";
  }, []);

  // Get confidence color
  const getConfidenceColor = useCallback(
    (confidence: number) => {
      const level = getConfidenceLevel(confidence);
      return CONFIDENCE_LEVELS[level].color;
    },
    [getConfidenceLevel]
  );

  // Get confidence background
  const getConfidenceBackground = useCallback(
    (confidence: number) => {
      const level = getConfidenceLevel(confidence);
      return CONFIDENCE_LEVELS[level].bg;
    },
    [getConfidenceLevel]
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Extraction Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Extraction
            </CardTitle>

            <div className="flex items-center gap-2">
              {extractionResult && (
                <Badge
                  variant="outline"
                  className={`${getConfidenceBackground(
                    extractionResult.confidence
                  )} ${getConfidenceColor(extractionResult.confidence)}`}
                >
                  {extractionResult.confidence}% confidence
                </Badge>
              )}

              <Button
                onClick={handleExtractText}
                disabled={isExtracting}
                size="sm"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {extractionResult ? "Re-extract" : "Extract Text"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Extraction Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Language
              </label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OCR_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="auto-correct"
                checked={autoCorrect}
                onCheckedChange={setAutoCorrect}
              />
              <label htmlFor="auto-correct" className="text-sm text-slate-700">
                Auto-correct common OCR errors
              </label>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="show-original"
                checked={showOriginal}
                onCheckedChange={setShowOriginal}
              />
              <label htmlFor="show-original" className="text-sm text-slate-700">
                Show original text
              </label>
            </div>
          </div>

          {/* Extraction Progress */}
          {isExtracting && extractionProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{extractionProgress.status}</span>
                <span>{extractionProgress.progress}%</span>
              </div>
              <Progress value={extractionProgress.progress} className="h-2" />
            </div>
          )}

          {/* Extraction Results */}
          {extractionResult && (
            <div className="space-y-3">
              {extractionResult.success ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Text extraction completed using {extractionResult.method}
                    {extractionResult.processingTime &&
                      ` in ${(extractionResult.processingTime / 1000).toFixed(
                        1
                      )}s`}
                    {extractionResult.metadata?.wordCount &&
                      `. Extracted ${extractionResult.metadata.wordCount} words`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{extractionResult.error}</AlertDescription>
                </Alert>
              )}

              {/* Medical Content Analysis */}
              {extractionResult.success && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Medical Content Analysis
                  </h4>
                  <div className="text-sm text-blue-800">
                    {(() => {
                      const analysis =
                        OCRTextExtractionService.analyzeMedicalContent(
                          extractionResult.text
                        );
                      return (
                        <div className="space-y-1">
                          <p>
                            <strong>Suggested Type:</strong>{" "}
                            {analysis.suggestedType.replace("_", " ")}
                          </p>
                          <p>
                            <strong>Medical Terms Found:</strong>{" "}
                            {analysis.detectedTerms.length}
                          </p>
                          {analysis.detectedTerms.length > 0 && (
                            <p className="text-xs">
                              {analysis.detectedTerms.slice(0, 5).join(", ")}
                              {analysis.detectedTerms.length > 5 && "..."}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Text Editor */}
      {(extractionResult?.success || initialText) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Extracted Text
                {isEditing && <Badge variant="outline">Editing</Badge>}
              </CardTitle>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  disabled={!editedText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadText}
                  disabled={!editedText}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveText}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedText(extractionResult?.text || initialText);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    disabled={!editedText}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Text Editor */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Extracted text will appear here..."
                  className="min-h-[300px] font-mono text-sm"
                  readOnly={!isEditing}
                />

                {!isEditing && (
                  <div
                    className="absolute inset-0 bg-transparent cursor-pointer"
                    onClick={() => setIsEditing(true)}
                  />
                )}
              </div>

              {/* Original Text Comparison */}
              {showOriginal &&
                extractionResult?.text &&
                extractionResult.text !== editedText && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Original Extracted Text
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
                        {extractionResult.text}
                      </pre>
                    </div>
                  </div>
                )}

              {/* Text Statistics */}
              {editedText && (
                <div className="flex gap-6 text-sm text-slate-600 pt-2 border-t">
                  <span>
                    <strong>Characters:</strong> {editedText.length}
                  </span>
                  <span>
                    <strong>Words:</strong>{" "}
                    {editedText.split(/\s+/).filter((w) => w.length > 0).length}
                  </span>
                  <span>
                    <strong>Lines:</strong> {editedText.split("\n").length}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Tips */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 border border-blue-200">
        <h4 className="font-medium flex items-center mb-2">
          <Settings className="h-4 w-4 mr-2" />
          Extraction Tips
        </h4>
        <ul className="space-y-1 list-disc list-inside ml-2">
          <li>Ensure images are clear and well-lit for better OCR accuracy</li>
          <li>
            PDFs with selectable text will have higher extraction confidence
          </li>
          <li>Medical documents may contain specialized terminology</li>
          <li>Review and correct extracted text for accuracy</li>
          <li>
            Use the appropriate language setting for non-English documents
          </li>
        </ul>
      </div>
    </div>
  );
}
