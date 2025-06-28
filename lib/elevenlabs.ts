// /lib/elevenlabs.ts
export async function textToSpeech(summary: string): Promise<Blob> {
  const apiKey = process.env.ELEVENLABS_API_KEY!;
  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: summary,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  if (!response.ok) {
    throw new Error(`TTS failed: ${response.statusText}`);
  }

  const audioBlob = await response.blob();
  return audioBlob;
}
