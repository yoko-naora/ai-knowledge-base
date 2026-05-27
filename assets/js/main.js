// Language switch — body class 方式（首页と統一、inline style に依存しない）
function switchLang(lang) {
  document.body.classList.toggle('show-jp', lang === 'jp');
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === (lang === 'cn' ? '中文' : '日本語'));
  });
  localStorage.setItem('kb-lang', lang);
}

// Admin bypass — proactive check before gating.js runs
// Works via #admin hash (first visit) or stored email (subsequent visits)
if (window.location.hash === '#admin') {
  localStorage.setItem('kb_email', 'yokonaora@gmail.com');
  localStorage.setItem('kb_subscriber', 'true');
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
} else if (localStorage.getItem('kb_email') === 'yokonaora@gmail.com') {
  localStorage.setItem('kb_subscriber', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('kb-lang') || 'cn';
  switchLang(saved);
});

// Pageview beacon
(function() {
  var page = location.pathname || '/';
  var ref = document.referrer || 'direct';
  try {
    fetch('/api/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: page, ref: ref }),
    }).catch(function() {});
  } catch(e) {}
})();
