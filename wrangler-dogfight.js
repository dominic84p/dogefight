// worker for dog fight predictor
// handles cors, rate limiting, and ai requests
// switched from openrouter to gemini cuz openrouter has dogshit limits (50/day or sum vs 1500/day lol)
// I couldnt find out how to do the base64 thing so AI did it

export default {
  async fetch(request, env) {
    // cors stuff so browser doesnt cry //
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    // rate limit 10 requests per min per ip //
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

    // prompts are hardcoded here so ppl cant edit them in inspect element lol //
    const prompts = {
      dog: 'Which dog wins? Give each dog a vague funny description like "angry chihuahua" or "fluffy cloud dog". KEEP IT SUPER SHORT - like "angry chihuahua wins" or "cloud dog loses because i dont like it". Sometimes pick winners for random petty reasons. No long descriptions. No markdown. If not a dog, roast the user.',
      cat: 'Which cat wins? Give each cat a vague funny description like "hello kitty cat" or "christmas light cat". KEEP IT SUPER SHORT - like "hello kitty cat wins" or "christmas cat loses because i said so". Sometimes pick winners for random petty reasons. No long descriptions. No markdown. If not a cat, roast the user.',
      ran: 'Which object wins? Give each object a vague funny description. KEEP IT SUPER SHORT - like "hello kitty cat wins" or "tank loses because i dont like tanks". Sometimes pick winners for random petty reasons. No long descriptions. No markdown. If not an object (ex: Chat screenshot), roast the user.',
      debug: 'Describe EXACTLY what you see on both images, Make sure to use non complex descriptions like "cat in tub" '
    };

    const prompt = prompts[mode] || prompts.dog;

    // gemini needs base64 images not urls //
    // this function fetches the image and converts it to base64 //
    async function imageToBase64(url) {
      if (url.startsWith('data:')) {
        // already base64 from user upload //
        return url.split('base64,')[1];
      }
      // fetch image and convert to base64 (chunk it so big images dont crash) //
      const imgResponse = await fetch(url);
      const buffer = await imgResponse.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      const chunkSize = 0x8000; // 32KB chunk //
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      return btoa(binary);
    }

    const img1Data = await imageToBase64(dog1);
    const img2Data = await imageToBase64(dog2);

    // send to gemini (way better than openrouter btw) //
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: img1Data } },
            { inline_data: { mime_type: 'image/jpeg', data: img2Data } }
          ]
        }]
      })
    });

    const data = await response.json();
    
    // convert gemini response to match openrouter format so i dont have to change frontend code //
    const formattedData = {
      choices: [{
        message: {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Error: ' + (data.error?.message || 'Unknown error')
        }
      }],
      error: data.error
    };

    return new Response(JSON.stringify(formattedData), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// <- I learned js like 2 weeks ago xD -> //