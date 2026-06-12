/* exported renderResults */

var FLAG_CONFIG = {
  ok: { label: 'Standard', icon: 'check-circle', cssClass: 'flag-badge--ok' },
  review: { label: 'Review', icon: 'alert-circle', cssClass: 'flag-badge--review' },
  risky: { label: 'Risky', icon: 'x-circle', cssClass: 'flag-badge--risky' },
};

var SEVERITY_CONFIG = {
  high: { label: 'High risk', icon: 'alert-triangle', color: '#b91c1c' },
  medium: { label: 'Medium risk', icon: 'alert-circle', color: '#b45309' },
  low: { label: 'Low risk', icon: 'info', color: '#166534' },
};

var SCORE_COLORS = {
  low: '#b91c1c', // 1-3
  mid: '#b45309', // 4-6
  high: '#166534', // 7-10
};

function el(tag, attrs, children) {
  var node = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(function (k) {
      if (k === 'className') {
        node.className = attrs[k];
      } else if (k === 'textContent') {
        node.textContent = attrs[k];
      } else {
        node.setAttribute(k, attrs[k]);
      }
    });
  }
  if (children) {
    children.forEach(function (child) {
      if (child) node.appendChild(child);
    });
  }
  return node;
}

function makeIcon(name) {
  var i = document.createElement('i');
  i.setAttribute('data-lucide', name);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function makeFlagBadge(flagLevel) {
  var cfg = FLAG_CONFIG[flagLevel] || FLAG_CONFIG.ok;
  var badge = el('span', { className: 'flag-badge ' + cfg.cssClass });
  badge.appendChild(makeIcon(cfg.icon));
  badge.appendChild(document.createTextNode(cfg.label));
  badge.setAttribute('aria-label', 'Flag level: ' + cfg.label);
  return badge;
}

function renderScore(score) {
  var ring = document.getElementById('score-ring');
  var valueEl = document.getElementById('score-value');
  var subtitle = document.getElementById('results-subtitle');

  var clamped = Math.max(1, Math.min(10, score));
  var pct = clamped * 10;
  var color = clamped <= 3 ? SCORE_COLORS.low : clamped <= 6 ? SCORE_COLORS.mid : SCORE_COLORS.high;
  var label =
    clamped <= 3
      ? 'Very landlord-favorable'
      : clamped <= 5
        ? 'Below average for tenants'
        : clamped <= 7
          ? 'Average tenant protections'
          : 'Tenant-friendly lease';

  ring.style.setProperty('--score-pct', pct);
  ring.style.setProperty('--score-color', color);
  ring.setAttribute('aria-label', 'Tenant score: ' + clamped + ' out of 10. ' + label);
  valueEl.textContent = clamped;
  subtitle.textContent = label;
}

function renderGotchas(gotchas) {
  var section = document.getElementById('top-gotchas');
  var list = document.getElementById('gotchas-list');

  if (!gotchas || gotchas.length === 0) return;

  list.innerHTML = '';
  gotchas.forEach(function (g) {
    var sev = SEVERITY_CONFIG[g.severity] || SEVERITY_CONFIG.medium;
    var card = el('div', { className: 'gotcha-card' });
    card.style.setProperty('--gotcha-color', sev.color);

    var sevEl = el('div', { className: 'gotcha-card__severity', style: 'color:' + sev.color });
    sevEl.appendChild(makeIcon(sev.icon));
    sevEl.appendChild(document.createTextNode(sev.label));

    var title = el('p', { className: 'gotcha-card__title', textContent: g.title });
    var detail = el('p', { className: 'gotcha-card__detail', textContent: g.detail });

    card.appendChild(sevEl);
    card.appendChild(title);
    card.appendChild(detail);
    list.appendChild(card);
  });

  section.hidden = false;
}

function renderClauses(sections) {
  var grid = document.getElementById('clause-grid');
  grid.innerHTML = '';

  (sections || []).forEach(function (s) {
    var card = el('article', { className: 'clause-card' });
    card.setAttribute(
      'aria-label',
      s.name + ': ' + (FLAG_CONFIG[s.flag_level] || FLAG_CONFIG.ok).label
    );

    var header = el('div', { className: 'clause-card__header' });
    header.appendChild(el('h4', { className: 'clause-card__name', textContent: s.name }));
    header.appendChild(makeFlagBadge(s.flag_level));

    var summary = el('p', { className: 'clause-card__summary', textContent: s.summary });

    card.appendChild(header);
    card.appendChild(summary);

    if (s.excerpt) {
      var pre = el('pre', { className: 'clause-card__excerpt' });
      var code = el('code');
      code.textContent = s.excerpt;
      pre.appendChild(code);
      card.appendChild(pre);
    }

    if (s.notes) {
      card.appendChild(el('p', { className: 'clause-card__notes', textContent: s.notes }));
    }

    grid.appendChild(card);
  });
}

function renderHiddenFees(fees) {
  var section = document.getElementById('hidden-fees-section');
  var list = document.getElementById('hidden-fees-list');

  if (!fees || fees.length === 0) return;

  list.innerHTML = '';
  fees.forEach(function (fee) {
    var li = document.createElement('li');
    var icon = makeIcon('dollar-sign');
    icon.className = 'hidden-fees-list__icon';

    var textWrap = el('div', { className: 'fee-text' });
    textWrap.appendChild(el('span', { className: 'fee-name', textContent: fee.name }));
    if (fee.amount_or_description) {
      textWrap.appendChild(
        el('p', { className: 'fee-desc', textContent: fee.amount_or_description })
      );
    }

    li.appendChild(icon);
    li.appendChild(textWrap);
    list.appendChild(li);
  });

  section.hidden = false;
}

/**
 * Populates the results panel with data returned from the analysis function.
 * @param {object} data
 */
function renderResults(data) {
  renderScore(data.score);
  renderGotchas(data.top_gotchas);
  renderClauses(data.sections);
  renderHiddenFees(data.hidden_fees);

  // Re-run Lucide icon replacement on newly injected elements
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}
