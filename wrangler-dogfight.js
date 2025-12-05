// worker for dog fight predictor
// handles cors, rate limiting, and ai requests

export default {
  async fetch(request, env) {
    // cors stuff
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // rate limit - 10 requests per min per ip
    const ip = request.headers.get('CF-Connecting-IP');
    const rateLimitKey = `ratelimit:${ip}`;
    const count = await env.RATE_LIMIT.get(rateLimitKey);
    
    if (count && parseInt(count) > 10) {
      return new Response(JSON.stringify({ error: 'Too many requests. Try again later.' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    await env.RATE_LIMIT.put(rateLimitKey, (parseInt(count) || 0) + 1, { expirationTtl: 60 });

    const { dog1, dog2, mode } = await request.json();

    // prompts are hardcoded here so ppl cant edit them in inspect element lol
    const prompts = {
      dog: 'Which dog wins? Be brutally honest and funny. Keep it SHORT - like "RIP pug lmao" or "Poor fucking chihuahua". No markdown. If not a dog, roast the user.',
      cat: 'Which cat wins? Be savage and funny. Keep it SHORT - like "RIP orange cat" or "Poor tabby". No markdown. If first image isn\'t a cat, roast the user.'
    };

    const prompt = prompts[mode] || prompts.dog;

    // send to openrouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://dogefight.dogegage.xyz',
        'X-Title': 'Dog Fight Predictor'
      },
      body: JSON.stringify({
        model: 'amazon/nova-2-lite-v1:free',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: dog1 } },
              { type: 'image_url', image_url: { url: dog2 } }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// <- I learned js like 2 weeks ago xD -> //