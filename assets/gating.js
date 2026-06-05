/**
 * Content Gating — article paywall
 * Free articles: do NOT include this script.
 * Locked articles: include this script to show preview + paywall.
 *
 * Unlock methods:
 *   1. Already unlocked (localStorage kb_subscriber = true)
 *   2. Email verification — calls /api/check-subscription to query Stripe
 *   3. Access code — calls /api/check-subscription?code=xxx (server-side verification)
 *
 * Usage: <script src="../assets/gating.js"></script> at end of <body>
 *
 * SECURITY: All verification happens server-side. No hardcoded bypasses.
 * No admin hash, no hardcoded emails, no client-side code comparison.
 */
(function () {
  if (document.querySelector('.gating-applied')) return;

  // Already unlocked via payment or previous email/code verification
  if (localStorage.getItem('kb_subscriber') === 'true') return;

  var container = document.querySelector('.article-content');
  if (!container) return;

  var blocks = container.querySelectorAll('h2, h3, p, li, ul, ol, blockquote, .quote, figure, hr, video, .content-image');
  if (blocks.length < 6) return;

  var cutoff = Math.max(3, Math.floor(blocks.length * 0.35));
  var gatingPoint = blocks[cutoff];

  var wrapper = document.createElement('div');
  wrapper.className = 'gated-content';
  wrapper.style.cssText = 'position:relative;';

  var next = gatingPoint;
  while (next) {
    var current = next;
    next = current.nextElementSibling;
    wrapper.appendChild(current);
  }
  container.appendChild(wrapper);

  var overlay = document.createElement('div');
  overlay.className = 'gating-overlay';
  overlay.style.cssText =
    'position:absolute;bottom:0;left:0;right:0;' +
    'background:linear-gradient(transparent 0%, rgba(250,249,246,.92) 45%, rgba(250,249,246,.98) 70%);' +
    'padding:100px 28px 40px;text-align:center;pointer-events:auto;';

  overlay.innerHTML =
    '<div style="max-width:420px;margin:0 auto;" id="gating-cta">' +
    '<p style="font-family:\'Noto Serif JP\',serif;font-size:16px;font-weight:300;color:#1a1814;margin-bottom:10px;">続きを読むには購読が必要です</p>' +
    '<p style="font-size:12px;color:#5a5650;line-height:2;margin-bottom:20px;">この記事の全文は、AI知識庫の購読者限定です。<br>月額¥2,980で全記事・全プロンプトが読み放題になります。</p>' +
    '<a href="../checkout.html?plan=monthly" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#1a1814;color:#faf9f6;font-size:11px;font-weight:500;letter-spacing:.08em;text-decoration:none;border-radius:2px;margin-bottom:20px;">月額¥2,980で読み放題 →</a>' +
    // Email verification (primary)
    '<p style="font-size:10px;color:#9a9490;margin-top:14px;">すでに購読済みですか？<br>登録したメールアドレスで認証してください</p>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin-top:6px;">' +
    '<input id="gating-email" type="email" placeholder="メールアドレスを入力" style="padding:7px 12px;border:1px solid #d4af7a;border-radius:2px;font-family:inherit;font-size:11px;width:200px;outline:none;">' +
    '<button id="gating-verify" style="padding:7px 16px;background:#b8925a;color:#fff;border:none;border-radius:2px;font-family:inherit;font-size:11px;cursor:pointer;white-space:nowrap;">認証</button>' +
    '</div>' +
    '<p id="gating-error" style="font-size:10px;color:#c44d34;margin-top:6px;display:none;">メールアドレスの確認に失敗しました。購読が有効かご確認ください。</p>' +
    '<p id="gating-loading" style="font-size:10px;color:#9a9490;margin-top:6px;display:none;">確認中...</p>' +
    // Access code (server-side verified)
    '<p style="font-size:9px;color:#c0bbb5;margin-top:18px;">アクセスコードをお持ちですか？</p>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin-top:4px;">' +
    '<input id="gating-code" type="text" placeholder="アクセスコード" style="padding:5px 10px;border:1px solid #ddd;border-radius:2px;font-family:inherit;font-size:10px;width:150px;outline:none;">' +
    '<button id="gating-unlock" style="padding:5px 12px;background:transparent;color:#9a9490;border:1px solid #ddd;border-radius:2px;font-family:inherit;font-size:10px;cursor:pointer;white-space:nowrap;">解除</button>' +
    '</div>' +
    '</div>';

  wrapper.style.position = 'relative';
  wrapper.style.maxHeight = '280px';
  wrapper.style.overflow = 'hidden';
  wrapper.appendChild(overlay);

  function unlock(email) {
    localStorage.setItem('kb_subscriber', 'true');
    if (email) localStorage.setItem('kb_email', email);
    wrapper.style.maxHeight = 'none';
    wrapper.style.overflow = 'visible';
    overlay.style.display = 'none';
  }

  // ── Email verification (server-side via Stripe) ──
  document.getElementById('gating-verify').addEventListener('click', function () {
    var email = document.getElementById('gating-email').value.trim();
    if (!email) return;

    document.getElementById('gating-error').style.display = 'none';
    document.getElementById('gating-loading').style.display = '';
    document.getElementById('gating-verify').disabled = true;

    fetch('/api/check-subscription?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('gating-loading').style.display = 'none';
        document.getElementById('gating-verify').disabled = false;
        if (data.active) {
          unlock(email);
        } else {
          document.getElementById('gating-error').style.display = '';
        }
      })
      .catch(function () {
        document.getElementById('gating-loading').style.display = 'none';
        document.getElementById('gating-verify').disabled = false;
        document.getElementById('gating-error').style.display = '';
      });
  });

  document.getElementById('gating-email').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('gating-verify').click();
  });

  // ── Access code verification (server-side, not client hash) ──
  document.getElementById('gating-unlock').addEventListener('click', function () {
    var code = document.getElementById('gating-code').value.trim();
    if (!code) return;

    document.getElementById('gating-error').style.display = 'none';
    document.getElementById('gating-loading').style.display = '';
    document.getElementById('gating-unlock').disabled = true;

    fetch('/api/check-subscription?code=' + encodeURIComponent(code))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('gating-loading').style.display = 'none';
        document.getElementById('gating-unlock').disabled = false;
        if (data.active) {
          unlock(null);
        } else {
          document.getElementById('gating-error').style.display = '';
        }
      })
      .catch(function () {
        document.getElementById('gating-loading').style.display = 'none';
        document.getElementById('gating-unlock').disabled = false;
        document.getElementById('gating-error').style.display = '';
      });
  });

  document.getElementById('gating-code').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('gating-unlock').click();
  });

  container.classList.add('gating-applied');
})();
