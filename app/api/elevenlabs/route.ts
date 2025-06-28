import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { LoggingService } from "@/lib/services/logging-service";

/**
 * API route for text-to-speech using ElevenLabs
 * POST /api/elevenlabs
 */
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: "Text is required and must be a string" }, 
        { status: 400 }
      );
    }
    
    // Get API key from server environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured on server" }, 
        { status: 500 }
      );
    }
    
    // Get authenticated user for logging
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    // Nigerian voice ID - using a premium female voice
    const voiceId = "nw6EIXCsQ89uJMjytYb8";
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2", // Latest model for best quality
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0, // Neutral style
          use_speaker_boost: true
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status} - ${errorData?.detail || response.statusText}` }, 
        { status: response.status }
      );
    }
    
    // Log this action
    if (user) {
      await supabase.from('logs').insert([{
        user_id: user.id,
        action: 'text_to_speech',
        metadata: {
          text_length: text.length,
          success: true
        }
      }]);
    }
    
    // Get audio content as array buffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Return the audio as a response with appropriate headers
    return new Response(audioArrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600" // Cache for 1 hour
      }
    });
    
  } catch (error) {
    console.error("ElevenLabs API route error:", error);
    return NextResponse.json(
      { error: "Failed to process text-to-speech request" }, 
      { status: 500 }
    );
  }
}