/* exported analyzeQuery */

/**
 * Posts lease text to the Netlify Function proxy, which calls the Anthropic API
 * server-side. Returns parsed JSON matching the output schema.
 *
 * @param {string} leaseText
 * @param {string} jurisdiction
 * @param {string} rent
 * @returns {Promise<object>}
 */
function analyzeQuery(leaseText, jurisdiction, rent) {
  return fetch('/.netlify/functions/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leaseText, jurisdiction, rent }),
  }).then(function (res) {
    if (!res.ok) {
      return res.json().then(function (body) {
        var msg = body && body.error ? body.error : 'Analysis failed. Please try again.';
        throw new Error(msg);
      });
    }
    return res.json();
  });
}
