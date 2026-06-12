/* exported */

var SAMPLE_LEASE = [
  'RESIDENTIAL LEASE AGREEMENT',
  '',
  'This Residential Lease Agreement ("Agreement") is entered into as of January 1, 2025, by and between',
  'Oak Properties LLC ("Landlord") and the undersigned tenant(s) ("Tenant").',
  '',
  '1. PREMISES. Landlord hereby leases to Tenant the property located at 412 Elmwood Drive, Apt 2B,',
  'Springfield, IL 62701 ("Premises").',
  '',
  '2. TERM. The lease term begins on February 1, 2025 and ends on January 31, 2026.',
  '',
  '3. RENT & FEES. Tenant agrees to pay $1,850.00 per month, due on the 1st of each month.',
  'A late fee of $150 will be assessed for any payment received after the 5th of the month.',
  'An administrative processing fee of $75 will be charged for any returned checks or ACH failures.',
  'Tenant shall also pay a monthly "building maintenance contribution" of $45 in addition to rent.',
  '',
  "4. SECURITY DEPOSIT. Tenant shall deposit $3,700 (two months' rent) as a security deposit prior to",
  'occupancy. Landlord may use the deposit to cover any unpaid rent, damage beyond normal wear and tear,',
  'cleaning fees if the unit is not returned in move-in condition, and any other amounts owed by Tenant.',
  'Landlord shall return the deposit within 45 days of vacating, minus deductions.',
  '',
  '5. UTILITIES. Tenant is responsible for all utilities including gas, electric, water, sewer, trash,',
  "and internet. Landlord may, at Landlord's sole discretion, add a utility administration fee of up to",
  '$30/month for billing services.',
  '',
  '6. MAINTENANCE. Tenant agrees to promptly report any maintenance issues. Tenant shall be responsible',
  'for all repairs under $200 caused by Tenant negligence. Landlord shall be responsible for structural',
  'repairs and appliances, but reserves the right to charge Tenant for service calls deemed unnecessary.',
  'Landlord is not liable for damages resulting from failure of any appliance or system.',
  '',
  "7. ENTRY RIGHTS. Landlord or Landlord's agents may enter the Premises at any reasonable time with",
  '24-hour notice for inspections, repairs, or showings. In the event of an emergency, Landlord may',
  'enter without notice. Landlord reserves the right to conduct quarterly inspections of the Premises.',
  'Tenant shall not deny entry to Landlord or agents when proper notice has been given.',
  '',
  '8. PETS. No pets of any kind are permitted without prior written consent from Landlord. A',
  'non-refundable pet fee of $500 per pet plus a refundable pet deposit of $300 per pet is required.',
  'A monthly pet rent of $75 per pet will be added to the monthly rent.',
  '',
  '9. SUBLETTING. Tenant may not sublet the Premises or any portion thereof, assign this Agreement,',
  'or allow any other person to occupy the Premises without prior written consent, which Landlord may',
  "withhold in Landlord's sole and absolute discretion.",
  '',
  '10. TERMINATION. Tenant must provide 60 days written notice prior to vacating. Failure to provide',
  'adequate notice will result in forfeiture of the security deposit. Early termination requires',
  "payment of two months' rent as a termination fee. Landlord may terminate this Agreement with",
  '30 days notice for any lawful reason.',
  '',
  '11. RENEWAL. This Agreement will automatically renew on a month-to-month basis at the end of the',
  'lease term unless either party provides 60 days written notice of non-renewal. Landlord reserves',
  'the right to increase rent by up to 15% upon renewal without further negotiation.',
  '',
  '12. LIABILITY. Landlord shall not be liable for any personal injury or property damage sustained',
  "by Tenant, Tenant's guests, or invitees. Tenant agrees to indemnify and hold harmless Landlord",
  "from any and all claims arising out of Tenant's use of the Premises.",
  '',
  '13. ADDITIONAL TERMS. Smoking is prohibited anywhere on the property including balconies.',
  'Tenant is responsible for pest control treatments costing under $300. Tenant agrees to carry',
  "renter's insurance with minimum liability coverage of $100,000 and provide proof within 14 days.",
  'Landlord reserves the right to amend building rules with 30 days written notice.',
].join('\n');

var state = {
  current: 'idle',
  lastLeaseText: '',
  lastJurisdiction: '',
  lastRent: '',
};

function setState(next) {
  state.current = next;

  var inputPanel = document.getElementById('input-panel');
  var resultsPanel = document.getElementById('results-panel');
  var loadingPanel = document.getElementById('loading-panel');
  var errorPanel = document.getElementById('error-panel');
  var analyzeBtn = document.getElementById('analyze-btn');

  inputPanel.hidden = next !== 'idle' && next !== 'too-short';
  loadingPanel.hidden = next !== 'loading';
  resultsPanel.hidden = next !== 'success';
  errorPanel.hidden = next !== 'error';

  analyzeBtn.disabled = next === 'loading';
}

function showValidationError(msg) {
  var wrapper = document.getElementById('validation-error');
  var span = document.getElementById('validation-message');
  span.textContent = msg;
  wrapper.hidden = false;
}

function hideValidationError() {
  document.getElementById('validation-error').hidden = true;
}

function updateCharCounter(text) {
  var counter = document.getElementById('char-counter');
  var count = text.length;
  counter.textContent = count.toLocaleString() + ' character' + (count !== 1 ? 's' : '');
}

function buildResultsText(data) {
  var lines = ['LEASE PLAIN — ANALYSIS RESULTS', ''];
  lines.push('Tenant Score: ' + data.score + ' / 10');
  lines.push('');

  if (data.top_gotchas && data.top_gotchas.length) {
    lines.push('TOP GOTCHAS');
    data.top_gotchas.forEach(function (g) {
      lines.push('• [' + g.severity.toUpperCase() + '] ' + g.title + ': ' + g.detail);
    });
    lines.push('');
  }

  if (data.sections && data.sections.length) {
    lines.push('CLAUSE BREAKDOWN');
    data.sections.forEach(function (s) {
      lines.push(s.name + ' [' + s.flag_level.toUpperCase() + ']: ' + s.summary);
      if (s.notes) lines.push('  Note: ' + s.notes);
    });
    lines.push('');
  }

  if (data.hidden_fees && data.hidden_fees.length) {
    lines.push('HIDDEN FEES');
    data.hidden_fees.forEach(function (f) {
      lines.push('• ' + f.name + ': ' + f.amount_or_description);
    });
  }

  return lines.join('\n');
}

function handleSubmit(e) {
  e.preventDefault();
  hideValidationError();

  var leaseText = document.getElementById('lease-text').value.trim();
  var jurisdiction = document.getElementById('jurisdiction').value.trim();
  var rent = document.getElementById('monthly-rent').value.trim();

  if (leaseText.length < 200) {
    showValidationError(
      'Please paste a full lease agreement (at least 200 characters). This looks too short to analyze.'
    );
    return;
  }

  state.lastLeaseText = leaseText;
  state.lastJurisdiction = jurisdiction;
  state.lastRent = rent;

  runAnalysis(leaseText, jurisdiction, rent);
}

function runAnalysis(leaseText, jurisdiction, rent) {
  setState('loading');

  // Reset results panels
  document.getElementById('top-gotchas').hidden = true;
  document.getElementById('hidden-fees-section').hidden = true;

  analyzeQuery(leaseText, jurisdiction, rent)
    .then(function (data) {
      renderResults(data);
      setState('success');

      // Move focus to results heading
      var summary = document.getElementById('results-summary');
      summary.focus();
    })
    .catch(function (err) {
      setState('error');
      var msg = err && err.message ? err.message : 'Analysis failed. Please try again.';
      document.getElementById('error-message').textContent = msg;
    });
}

function handleCopy(data) {
  var btn = document.getElementById('copy-btn');
  var text = buildResultsText(data);

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      btn.textContent = 'Copied!';
      setTimeout(function () {
        btn.innerHTML = '';
        btn.appendChild(makeIcon('copy'));
        btn.appendChild(document.createTextNode(' Copy results'));
      }, 2000);
    });
  } else {
    // Fallback for older browsers
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('analyze-form');
  var leaseTextarea = document.getElementById('lease-text');
  var sampleBtn = document.getElementById('sample-btn');
  var retryBtn = document.getElementById('retry-btn');
  var restartBtn = document.getElementById('restart-btn');
  var copyBtn = document.getElementById('copy-btn');

  // Keep a reference to last rendered data for copy
  var lastData = null;

  // Char counter
  var counterDebounce;
  leaseTextarea.addEventListener('input', function () {
    clearTimeout(counterDebounce);
    counterDebounce = setTimeout(function () {
      updateCharCounter(leaseTextarea.value);
    }, 100);
  });

  // Sample lease
  sampleBtn.addEventListener('click', function () {
    leaseTextarea.value = SAMPLE_LEASE;
    updateCharCounter(SAMPLE_LEASE);
    leaseTextarea.focus();
    hideValidationError();
  });

  // Form submit
  form.addEventListener('submit', handleSubmit);

  // Retry
  retryBtn.addEventListener('click', function () {
    runAnalysis(state.lastLeaseText, state.lastJurisdiction, state.lastRent);
  });

  // Start over
  restartBtn.addEventListener('click', function () {
    setState('idle');
    document.getElementById('lease-text').focus();
  });

  // Copy results
  copyBtn.addEventListener('click', function () {
    if (lastData) handleCopy(lastData);
  });

  // Patch renderResults to capture data for copy
  var originalRender = renderResults;
  /* exported renderResults */
  window.renderResults = function (data) {
    lastData = data;
    originalRender(data);
  };
});
