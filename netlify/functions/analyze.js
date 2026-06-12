const https = require('https');

const SYSTEM_PROMPT = `You are a tenant rights attorney with 15 years of residential lease experience. \
Analyze the provided lease and return ONLY valid JSON — no markdown, no explanation, no code fences. \
Flag any clause that restricts tenant rights beyond standard, any fee that exceeds typical market norms, \
and any language that could be used against the tenant in a dispute. Do not give legal advice — \
summarize and flag for the tenant's awareness. Never fabricate clauses not present in the provided text.

Return this exact JSON structure:
{
  "score": <integer 1-10, tenant-friendliness>,
  "top_gotchas": [
    { "title": "...", "detail": "...", "severity": "high|medium|low" }
  ],
  "sections": [
    {
      "name": "Rent & Fees",
      "summary": "...",
      "flag_level": "ok|review|risky",
      "excerpt": "...",
      "notes": "..."
    }
  ],
  "hidden_fees": [
    { "name": "...", "amount_or_description": "..." }
  ]
}

The sections array must include entries for each of these categories (use exactly these names):
Rent & Fees, Security Deposit, Maintenance, Entry Rights, Termination, Pets, Subletting, Renewal, Liability, Additional Terms.
If a category has no relevant clause, set flag_level to "ok", summary to "No specific clause found", and excerpt to "".`;

function callAnthropicAPI(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Anthropic API error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured on server.' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body.' }) };
  }

  const { leaseText, jurisdiction, rent } = payload;

  if (!leaseText || leaseText.trim().length < 200) {
    return {
      statusCode: 422,
      body: JSON.stringify({
        error: 'Lease text too short. Please provide at least 200 characters.',
      }),
    };
  }

  let userContent = `Analyze this lease agreement:\n\n${leaseText}`;
  if (jurisdiction) userContent += `\n\nJurisdiction: ${jurisdiction}`;
  if (rent) userContent += `\nMonthly rent: $${rent}`;

  try {
    const response = await callAnthropicAPI({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const text = response.content[0].text;
    const parsed = JSON.parse(text);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Analysis failed. Please try again.' }),
    };
  }
};
