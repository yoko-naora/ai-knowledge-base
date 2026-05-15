// Language switch — body class 方式（首页と統一、inline style に依存しない）
function switchLang(lang) {
  document.body.classList.toggle('show-jp', lang === 'jp');
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === (lang === 'cn' ? '中文' : '日本語'));
  });
  localStorage.setItem('kb-lang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('kb-lang') || 'cn';
  switchLang(saved);
});
