export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  try {
    const body = await req.json();
    const { title, description, market, advantage, sectionName } = body;
    // Hardcoding the API key as requested by the user
    const apiKey = "AIzaSyCfwzKUJ14krguy1t7vH9rLBLjrQ5nFBEU";

    const prompt = `You are a world-class venture capital analyst and startup strategist.

Idea: ${title}
Description: ${description}
Target Market: ${market}
Unfair Advantage: ${advantage}

Generate a detailed, investor-grade "${sectionName}" for this startup idea.
Be specific, use real numbers where possible, be honest about weaknesses.
Format output in clean markdown with tables where relevant.
Do not add preamble. Start directly with the content.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText, status: response.status }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
