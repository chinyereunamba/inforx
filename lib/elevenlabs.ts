/**
 * ElevenLabs Text-to-Speech API Client
 */
export async function textToSpeech(text: string): Promise<Blob> {
  // Use environment variable for API key
  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    throw new Error('ElevenLabs API key not found. Please set NEXT_PUBLIC_ELEVENLABS_API_KEY environment variable.');
  }
  
  // Use a Nigerian voice if available, or default to a general voice
  const voiceId = "nw6EIXCsQ89uJMjytYb8"; // Premium female voice

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_turbo_v2", // Use latest model for best quality
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
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData?.detail || response.statusText}`);
    }

    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    console.error("ElevenLabs API error:", error);
    throw error;
  }
}