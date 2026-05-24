/**
 * Content Gating — article paywall
 * Free articles: do NOT include this script.
 * Locked articles: include this script to show preview + paywall.
 *
 * Unlock methods (in order):
 *   1. Already unlocked (localStorage kb_subscriber = true)
 *   2. Email verification — calls /api/check-subscription to query Stripe
 *   3. Access code (legacy fallback)
 *
 * Usage: <script src="../assets/gating.js"></script> at end of <body>
 */
(function () {
  if (document.querySelector('.gating-applied')) return;

  // Admin bypass via URL hash — bookmark with #admin to auto-unlock on any device
  if (window.location.hash === '#admin') {
    localStorage.setItem('kb_email', 'yokonaora@gmail.com');
    localStorage.setItem('kb_subscriber', 'true');
  }

  // Already unlocked via payment or previous email verification
  if (localStorage.getItem('kb_subscriber') === 'true') return;

  // Admin bypass via stored email
  if (localStorage.getItem('kb_email') === 'yokonaora@gmail.com') {
    localStorage.setItem('kb_subscriber', 'true');
    return;
  }

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
    // Access code (legacy fallback)
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

  function unlock() {
    localStorage.setItem('kb_subscriber', 'true');
    wrapper.style.maxHeight = 'none';
    wrapper.style.overflow = 'visible';
    overlay.style.display = 'none';
  }

  // ── Email verification ──
  document.getElementById('gating-verify').addEventListener('click', function () {
    var email = document.getElementById('gating-email').value.trim();
    if (!email) return;

    // Admin bypass
    if (email === 'yokonaora@gmail.com') {
      localStorage.setItem('kb_email', email);
      localStorage.setItem('kb_subscriber', 'true');
      unlock();
      return;
    }

    document.getElementById('gating-error').style.display = 'none';
    document.getElementById('gating-loading').style.display = '';
    document.getElementById('gating-verify').disabled = true;

    fetch('/api/check-subscription?email=' + encodeURIComponent(email))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('gating-loading').style.display = 'none';
        document.getElementById('gating-verify').disabled = false;
        if (data.active) {
          localStorage.setItem('kb_email', email);
          unlock();
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

  // ── Access code (legacy) ──
  var VALID_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';

  async function checkCode(code) {
    var msgBuffer = new TextEncoder().encode(code.trim());
    var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    var hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    return hashHex === VALID_HASH;
  }

  document.getElementById('gating-unlock').addEventListener('click', function () {
    var code = document.getElementById('gating-code').value;
    checkCode(code).then(function (valid) {
      if (valid) {
        unlock();
      }
    });
  });

  document.getElementById('gating-code').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('gating-unlock').click();
  });

  container.classList.add('gating-applied');
})();
