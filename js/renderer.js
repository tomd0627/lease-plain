/* exported renderResults, makeIcon */

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
  low: '#b91c1c',
  mid: '#b45309',
  high: '#166534',
};

var ICONS = {
  'alert-circle':
    '<circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>',
  'alert-triangle':
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'check-circle': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'dollar-sign':
    '<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  'file-plus':
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M9 15h6"/><path d="M12 18v-6"/>',
  'file-text':
    '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'layout-grid':
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  receipt:
    '<path d="M12 17V7"/><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  search: '<path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/>',
  'wifi-off':
    '<path d="M12 20h.01"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/><path d="M5 12.859a10 10 0 0 1 5.17-2.69"/><path d="M19 12.859a10 10 0 0 0-2.007-1.523"/><path d="M2 8.82a15 15 0 0 1 4.177-2.643"/><path d="M22 8.82a15 15 0 0 0-11.288-3.764"/><path d="m2 2 20 20"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
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
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = ICONS[name] || '';
  return svg;
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
    icon.setAttribute('class', 'hidden-fees-list__icon');

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

function renderResults(data) {
  renderScore(data.score);
  renderGotchas(data.top_gotchas);
  renderClauses(data.sections);
  renderHiddenFees(data.hidden_fees);
}
