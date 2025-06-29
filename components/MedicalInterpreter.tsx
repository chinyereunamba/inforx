"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  Copy, 
  ChevronDown, 
  Loader2, 
  Send, 
  FileText, 
  Check, 
  Volume2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import type {
  InterpreterState,
  ExampleSnippet,
  MedicalInterpretation,
} from "@/lib/types/medical-interpreter";
import { textToSpeech } from '@/lib/elevenlabs';
import { createClient } from "@/utils/supabase/client";
import { LoggingService } from "@/lib/services/logging-service";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const exampleSnippets: ExampleSnippet[] = [
  {
    id: "prescription",
    title: "Prescription",
    text: "Metformin 500mg - Take 1 tablet twice daily with meals for Type 2 diabetes management. Continue for 3 months then review. Avoid alcohol consumption.",
    type: "prescription",
  },
  {
    id: "lab_result",
    title: "Lab Result",
    text: "Complete Blood Count: WBC: 12,500/μL (High - Normal: 4,000-11,000), RBC: 4.2 million/μL (Normal), Hemoglobin: 10.5 g/dL (Low - Normal: 12-16), Platelets: 180,000/μL (Normal)",
    type: "lab_result",
  },
  {
    id: "scan_summary",
    title: "Scan Summary",
    text: "Abdominal Ultrasound: Liver appears normal in size and echogenicity. Gallbladder shows multiple small echogenic foci consistent with gallstones. No evidence of acute cholecystitis.",
    type: "scan_summary",
  },
];

export default function MedicalInterpreter() {
  const [state, setState] = useState<InterpreterState>({
    inputText: "",
    selectedLanguage: "english",
    isLoading: false,
    result: null,
    error: null,
  });

  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);


  const containerRef = useRef<HTMLDivElement>(null);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const resultsCardsRef = useRef<HTMLDivElement[]>([]);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Page load animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sequential fade-in of form elements
      const elements = [
        ".header-section",
        ".language-selector",
        ".text-input-section",
        ".submit-button",
        ".examples-section",
      ];

      elements.forEach((selector, index) => {
        gsap.fromTo(
          selector,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: index * 0.1,
            ease: "power2.out",
            overwrite: true,
          }
        );
      });

      // Results section slide-up
      gsap.fromTo(
        resultsSectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          delay: 0.2,
          ease: "power2.out",
          overwrite: true,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Results transition animations
  useEffect(() => {
    if (state.result && resultsCardsRef.current.length > 0) {
      const ctx = gsap.context(() => {
        // Fade out placeholder first
        gsap.to(".placeholder-content", {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          ease: "power2.out",
        });

        // Progressive reveal of result sections
        gsap.fromTo(
          ".results-header",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: 0.2,
          }
        );

        gsap.fromTo(
          resultsCardsRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.15,
            delay: 0.4,
          }
        );
      }, containerRef);

      return () => ctx.revert();
    }
  }, [state.result]);

  // Loading animation
  useEffect(() => {
    if (state.isLoading && loadingRef.current) {
      const ctx = gsap.context(() => {
        // Typing indicator animation
        gsap.fromTo(
          ".typing-dots",
          { opacity: 0.3 },
          {
            opacity: 1,
            duration: 0.8,
            ease: "power2.inOut",
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
          }
        );
      }, loadingRef);

      return () => ctx.revert();
    }
  }, [state.isLoading]);

  const handleInputChange = (value: string) => {
    setState((prev) => ({ ...prev, inputText: value, error: null }));
  };

  const handleLanguageChange = (language: "english" | "pidgin") => {
    setState((prev) => ({ ...prev, selectedLanguage: language }));
  };

  const handleExampleClick = (
    snippet: ExampleSnippet,
    event?: React.MouseEvent
  ) => {
    setState((prev) => ({ ...prev, inputText: snippet.text, error: null }));

    // Button click animation
    if (event?.currentTarget) {
      gsap.to(event.currentTarget, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      });
    }
  };

  const validateInput = (text: string): string | null => {
    if (!text.trim()) {
      return "Please enter medical text to interpret";
    }
    if (text.trim().length < 10) {
      return "Please provide more detailed medical information (at least 10 characters)";
    }
    if (text.length > 5000) {
      return "Text is too long. Please keep it under 5000 characters";
    }
    return null;
  };

  /**
   * Parse the API response into structured medical interpretation
   * The API returns formatted text with emojis and sections that need to be parsed
   */
  const parseApiResponse = (response: string): MedicalInterpretation => {
    // Initialize default values
    let simpleExplanation = "";
    let recommendedActions: string[] = [];
    let medicalAttentionIndicators: string[] = [];

    try {
      // Split the response into sections based on emoji markers
      const sections = response.split(/(?=📘|💡|⚠️)/);

      sections.forEach((section) => {
        const cleanSection = section.trim();

        if (cleanSection.startsWith("📘")) {
          // Extract explanation section
          const explanationMatch = cleanSection.match(
            /📘.*?:\s*([\s\S]*?)(?=💡|⚠️|$)/
          );
          if (explanationMatch) {
            simpleExplanation = explanationMatch[1].trim();
          }
        } else if (cleanSection.startsWith("💡")) {
          // Extract recommended actions
          const actionsMatch = cleanSection.match(
            /💡.*?:\s*([\s\S]*?)(?=⚠️|$)/
          );
          if (actionsMatch) {
            const actionsText = actionsMatch[1].trim();
            // Split by numbered items or bullet points
            recommendedActions = actionsText
              .split(/\n/)
              .map((item) => item.replace(/^[\d\-•\*\.]\s*/, "").trim())
              .filter((item) => item.length > 0);
          }
        } else if (cleanSection.startsWith("⚠️")) {
          // Extract medical attention indicators
          const indicatorsMatch = cleanSection.match(/⚠️.*?:\s*([\s\S]*)/);
          if (indicatorsMatch) {
            const indicatorsText = indicatorsMatch[1].trim();
            // Split by numbered items or bullet points
            medicalAttentionIndicators = indicatorsText
              .split(/\n/)
              .map((item) => item.replace(/^[\d\-•\*\.]\s*/, "").trim())
              .filter((item) => item.length > 0);
          }
        }
      });

      // Fallback: if parsing fails, use the entire response as explanation
      if (
        !simpleExplanation &&
        !recommendedActions.length &&
        !medicalAttentionIndicators.length
      ) {
        simpleExplanation = response.trim();
        recommendedActions = [
          "Consult with your healthcare provider for detailed guidance",
        ];
        medicalAttentionIndicators = [
          "Seek immediate medical attention if you experience concerning symptoms",
        ];
      }
    } catch (error) {
      console.error("Error parsing API response:", error);
      // Fallback to safe defaults
      simpleExplanation =
        "Your medical information has been processed. Please consult with a healthcare professional for detailed interpretation.";
      recommendedActions = [
        "Schedule an appointment with your healthcare provider",
        "Bring this document to your next medical consultation",
      ];
      medicalAttentionIndicators = [
        "Contact your doctor if you have concerns",
        "Seek immediate care for urgent symptoms",
      ];
    }

    return {
      simpleExplanation,
      recommendedActions,
      medicalAttentionIndicators,
    };
  };
  /**
   * Call the AI API to interpret medical text
   * Handles the API request, response parsing, and error handling
   */
  const callInterpretationApi = async (
    text: string,
    language: "english" | "pidgin"
  ): Promise<MedicalInterpretation> => {
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: text,
          language: language === "english" ? "English" : "Nigerian Pidgin",
        }),
      });

      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      // Validate the response structure
      if (!data.result) {
        throw new Error("Invalid response format from API");
      }

      // Parse the formatted response into structured data
      return parseApiResponse(data.result);
    } catch (error) {
      console.error("API call failed:", error);

      // Provide user-friendly error handling
      if (error instanceof TypeError) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async () => {
    // Validate input before making API call
    const validationError = validateInput(state.inputText);
    if (validationError) {
      setState((prev) => ({ ...prev, error: validationError }));
      return;
    }

    // Set loading state and clear previous results/errors
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      result: null,
    }));
    
    // Log the action
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        LoggingService.logAction(user, LoggingService.actions.AI_INTERPRET, {
          language: state.selectedLanguage,
          text_length: state.inputText.length,
          type: state.inputText.length > 100 ? 'long_text' : 'short_text'
        });
      }
    } catch (error) {
      console.error("Failed to log interpreter usage:", error);
      // Continue without failing the interpretation
    }

    try {
      // Call the real API instead of simulation
      const interpretation = await callInterpretationApi(
        state.inputText,
        state.selectedLanguage
      );

      // Update state with successful result
      setState((prev) => ({
        ...prev,
        isLoading: false,
        result: {
          interpretation,
          originalText: prev.inputText,
          language: prev.selectedLanguage,
          timestamp: new Date(),
        },
      }));
    } catch (error) {
      // Handle API errors gracefully
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to interpret medical text. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleCopyToClipboard = async (text: string, cardId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCard(cardId);

      // Copy success animation
      gsap.fromTo(
        `[data-card="${cardId}"] .copy-button`,
        { scale: 1 },
        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
      );

      setTimeout(() => setCopiedCard(null), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const formatActionItems = (items: string[]) => {
    return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  };
const playAudio = async (text: string) => {
  // If audio is already playing, stop it
  if (isSpeaking) {
    if (audioRef.current) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current = null;
    }
    setIsSpeaking(false);
    return;
  }

  setIsLoadingAudio(true);
  setAudioError(null);

  try {
    // Call the server-side API to get audio blob
    const audioBlob = await textToSpeech(text);
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Setup event handlers
    audio.addEventListener('play', () => {
      setIsSpeaking(true);
      setIsLoadingAudio(false);
    });

    audio.addEventListener('ended', () => {
      setIsSpeaking(false);
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
    });

    audio.addEventListener('error', (event) => {
      console.error('Audio playback error:', event);
      setIsSpeaking(false);
      setIsLoadingAudio(false);
      setAudioError('Failed to play audio. Please try again later.');
      URL.revokeObjectURL(audioUrl);
      audioRef.current = null;
    });

    audioRef.current = audio;
    audio.play();

  } catch (error) {
    console.error('Text-to-speech error:', error);
    setIsLoadingAudio(false);
    setAudioError(error instanceof Error 
      ? error.message 
      : 'Failed to generate speech. Please try again later.');
  }
};

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        audioRef.current = null;
      }
    };
  }, []);

  
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout - 2 columns on desktop, single column on mobile */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Section - 40% width on desktop */}
          <div ref={inputSectionRef} className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="header-section text-center lg:text-left">
              <h1 className="text-3xl font-noto md:text-4xl font-bold text-gray-700 mb-4">
                AI Health Interpreter
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Paste your prescription, lab result or scan summary and get a
                clear explanation.
              </p>
            </div>

            {/* Input Form Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
              {/* Language Selector */}
              <div className="language-selector space-y-2">
                <label
                  className="block text-sm font-semibold text-gray-700"
                  htmlFor="language-select"
                >
                  Select Your Preferred Language
                </label>
                <div className="relative">
                  <select
                    id="language-select"
                    value={state.selectedLanguage}
                    onChange={(e) =>
                      handleLanguageChange(
                        e.target.value as "english" | "pidgin"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white text-gray-700 font-medium"
                    aria-label="Select preferred language"
                  >
                    <option value="english">English</option>
                    <option value="pidgin">Nigerian Pidgin</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Text Input Area */}
              <div className="text-input-section space-y-2">
                <label
                  className="block text-sm font-semibold text-gray-700"
                  htmlFor="medical-text"
                >
                  Medical Text
                </label>
                <textarea
                  id="medical-text"
                  value={state.inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Paste your medical document here (prescription, lab results, scan reports, etc.)"
                  className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-gray-700 leading-relaxed"
                  disabled={state.isLoading}
                  maxLength={5000}
                  aria-describedby="char-counter error-message"
                />
                <div
                  id="char-counter"
                  className="text-right text-sm text-gray-500"
                >
                  {state.inputText.length}/5000 characters
                </div>
              </div>

              {/* Error Display */}
              {state.error && (
                <div
                  id="error-message"
                  className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                  role="alert"
                >
                  {state.error}
                </div>
              )}

              {/* Submit Button */}
              <div className="submit-button">
                <Button
                  onClick={handleSubmit}
                  disabled={state.isLoading || !state.inputText.trim()}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  aria-label={
                    state.isLoading
                      ? "Interpreting medical text"
                      : "Interpret medical text"
                  }
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Interpret Medical Text
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Interpret Medical Text
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Example Buttons Section */}
            <div className="examples-section space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Try These Examples
              </h3>
              <div className="grid gap-3">
                {exampleSnippets.map((snippet) => (
                  <button
                    key={snippet.id}
                    onClick={(event) => handleExampleClick(snippet, event)}
                    className="p-4 bg-white border border-gray-200 rounded-lg text-left hover:border-green-300 hover:bg-green-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group"
                    disabled={state.isLoading}
                    aria-label={`Load ${snippet.title} example`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-700 group-hover:text-green-700">
                        {snippet.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {snippet.text.substring(0, 100)}...
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section - 60% width on desktop */}
          <div ref={resultsSectionRef} className="lg:col-span-3">
            {/* Loading State */}
            {state.isLoading && (
              <div
                ref={loadingRef}
                className="flex items-center justify-center h-64 bg-white rounded-xl shadow-lg border border-gray-200"
              >
                <div className="text-center">
                  <div className="flex justify-center space-x-2 mb-4">
                    <div className="typing-dots w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="typing-dots w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="typing-dots w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Analyzing your medical text...
                  </p>
                  <div className="w-48 bg-gray-200 rounded-full h-2 mx-auto">
                    <div
                      className="bg-green-500 h-2 rounded-full animate-pulse"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {state.result && (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="results-header text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">
                    Medical Interpretation Results
                  </h2>
                  <p className="text-gray-600">
                    Generated on {state.result.timestamp.toLocaleDateString()} •
                    Language:{" "}
                    {state.result.language === "english"
                      ? "English"
                      : "Nigerian Pidgin"}
                  </p>
                </div>

                {/* Results Cards */}
                <div className="grid gap-6">
                  {/* Simple Explanation Card */}
                  <div
                    ref={(el) => {
                      if (el) resultsCardsRef.current[0] = el;
                    }}
                    data-card="explanation"
                    className="bg-white rounded-xl shadow-md border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">
                          📘 Simple Explanation
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            state.result!.interpretation.simpleExplanation,
                            "explanation"
                          )
                        }
                        className="copy-button p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Copy to clipboard"
                        aria-label="Copy explanation to clipboard"
                      >
                        {copiedCard === "explanation" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {audioError && (
                        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                          {audioError}
                        </div>
                      )}
                      {state.result
                        ? state.result.interpretation.simpleExplanation
                        : null}
                    </p>
                  </div>

                  {/* Recommended Actions Card */}
                  <div
                    ref={(el) => {
                      if (el) resultsCardsRef.current[1] = el;
                    }}
                    data-card="actions"
                    className="bg-white rounded-xl shadow-md border border-yellow-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Lightbulb className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">
                          💡 Recommended Actions
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            formatActionItems(
                              state.result!.interpretation.recommendedActions
                            ),
                            "actions"
                          )
                        }
                        className="copy-button p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Copy actions to clipboard"
                        aria-label="Copy recommended actions to clipboard"
                      >
                        {copiedCard === "actions" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {state.result.interpretation.recommendedActions.map(
                        (action, actionIndex) => (
                          <li
                            key={actionIndex}
                            className="flex items-start gap-3"
                          >
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-700 font-semibold text-sm">
                                {actionIndex + 1}
                              </span>
                            </div>
                            <span className="text-gray-700 leading-relaxed">
                              {action}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Medical Attention Indicators Card */}
                  <div
                    ref={(el) => {
                      if (el) resultsCardsRef.current[2] = el;
                    }}
                    data-card="warnings"
                    className="bg-white rounded-xl shadow-md border border-red-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700">
                          ⚠️ Medical Attention Indicators
                        </h3>
                      </div>
                      <button
                        onClick={() =>
                          handleCopyToClipboard(
                            state.result!.interpretation.medicalAttentionIndicators.join(
                              "\n"
                            ),
                            "warnings"
                          )
                        }
                        className="copy-button p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="Copy warnings to clipboard"
                        aria-label="Copy medical attention indicators to clipboard"
                      >
                        {copiedCard === "warnings" ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {state.result.interpretation.medicalAttentionIndicators.map(
                        (indicator, indicatorIndex) => (
                          <li key={indicatorIndex} className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700 leading-relaxed">
                              {indicator}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-2">
                        Important Medical Disclaimer
                      </h4>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        This interpretation is for educational purposes only and
                        should not replace professional medical advice. Always
                        consult with qualified healthcare providers for medical
                        decisions, diagnosis, and treatment plans. In case of
                        medical emergencies, contact emergency services
                        immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Initial State - Placeholder */}
            {!state.isLoading && !state.result && (
              <div className="placeholder-content flex items-center justify-center h-64 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-600 mb-2">
                    Ready to interpret your medical text
                  </p>
                  <p className="text-sm text-gray-500">
                    Enter your medical information on the left to get started
                  </p>
                  <p className="text-gray-500 text-xs mt-2">
                    You'll be able to read and listen to an AI-generated explanation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
