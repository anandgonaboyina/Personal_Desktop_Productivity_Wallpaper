import fallbackQuotes from './quotes.json';

export interface Quote {
  text: string;
  author: string;
}

export async function fetchQuote(): Promise<Quote> {
  try {
    // Attempt to fetch from Quotable API (often unstable, but good when it works)
    const res = await fetch('https://api.quotable.io/quotes/random?tags=inspirational|motivational|wisdom', { 
      cache: 'no-store',
      // Short timeout so we don't hang the UI if it's down
      signal: AbortSignal.timeout(3000) 
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return { text: data[0].content, author: data[0].author };
      }
    }
  } catch (err) {
    console.warn('Quote API failed, falling back to massive local JSON dataset');
  }

  // Fallback to our robust local JSON (~1600 quotes)
  const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
  // type.fit format is { text: string, author: string }
  const q = fallbackQuotes[randomIndex] as { text: string; author: string | null };
  
  return {
    text: q.text || 'Keep pushing forward.',
    // Clean up type.fit suffix bug
    author: (q.author || 'Unknown').replace(', type.fit', ''), 
  };
}
