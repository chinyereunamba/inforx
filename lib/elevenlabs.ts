/**
 * ElevenLabs Text-to-Speech Client Interface
 * Now uses server-side API route to protect API key
 */
export async function textToSpeech(text: string): Promise<Blob> {
  try {
    const response = await fetch('/api/elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Failed to generate speech: ${response.status}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Text-to-speech error:", error);
    throw error;
  }
}