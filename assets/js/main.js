// Language switch
function switchLang(lang) {
  document.querySelectorAll('.lang-content').forEach(el => {
    el.style.display = el.classList.contains(lang) ? 'block' : 'none';
  });
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === (lang === 'cn' ? '中文' : '日本語'));
  });
  localStorage.setItem('kb-lang', lang);
}

// Init language
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('kb-lang') || 'cn';
  switchLang(saved);
});
