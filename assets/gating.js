/**
 * Content Gating
 * Free articles: do NOT include this script.
 * Locked articles: include this script to show preview + paywall.
 *
 * Unlock: visit success.html after payment → auto-sets localStorage key.
 * Or enter access code below.
 *
 * Usage: <script src="../assets/gating.js"></script> at end of <body>
 */
(function () {
  if (document.querySelector('.gating-applied')) return;

  // Check if subscriber (set by success.html after Stripe payment)
  if (localStorage.getItem('kb_subscriber') === 'true') return;

  var container = document.querySelector('.article-content');
  if (!container) return;

  // Select all direct content blocks
  var blocks = container.querySelectorAll('h2, h3, p, li, ul, ol, blockquote, .quote, figure, hr, video, .content-image');
  if (blocks.length < 6) return; // too short to gate

  // Show first ~35% of content blocks, then paywall
  var cutoff = Math.max(3, Math.floor(blocks.length * 0.35));
  var gatingPoint = blocks[cutoff];

  // Wrap everything from cutoff onward
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

  // Blur overlay with unlock code input
  var overlay = document.createElement('div');
  overlay.className = 'gating-overlay';
  overlay.style.cssText =
    'position:absolute;bottom:0;left:0;right:0;' +
    'background:linear-gradient(transparent 0%, rgba(250,249,246,.92) 45%, rgba(250,249,246,.98) 70%);' +
    'padding:100px 28px 40px;text-align:center;pointer-events:auto;';
  overlay.innerHTML =
    '<div style="max-width:420px;margin:0 auto;" id="gating-cta">' +
    '<p style="font-family:\'Noto Serif JP\',serif;font-size:16px;font-weight:300;color:#1a1814;margin-bottom:10px;">続きを読むには購読が必要です</p>' +
    '<p style="font-size:12px;color:#5a5650;line-height:2;margin-bottom:20px;">この記事の全文は、AI知識庫の購読者限定です。<br>月額¥980で全記事・全プロンプトが読み放題になります。</p>' +
    '<a href="../checkout.html?plan=monthly" style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:#1a1814;color:#faf9f6;font-size:11px;font-weight:500;letter-spacing:.08em;text-decoration:none;border-radius:2px;">月額¥980で読み放題 →</a>' +
    '<p style="font-size:10px;color:#9a9490;margin-top:14px;">すでに購読済みですか？</p>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin-top:6px;">' +
    '<input id="gating-code" type="text" placeholder="アクセスコードを入力" style="padding:7px 12px;border:1px solid #d4af7a;border-radius:2px;font-family:inherit;font-size:11px;width:180px;outline:none;">' +
    '<button id="gating-unlock" style="padding:7px 16px;background:#b8925a;color:#fff;border:none;border-radius:2px;font-family:inherit;font-size:11px;cursor:pointer;white-space:nowrap;">解除</button>' +
    '</div>' +
    '<p id="gating-error" style="font-size:10px;color:#c44d34;margin-top:6px;display:none;">コードが正しくありません</p>' +
    '</div>';

  wrapper.style.position = 'relative';
  wrapper.style.maxHeight = '280px';
  wrapper.style.overflow = 'hidden';
  wrapper.appendChild(overlay);

  // Access code check (hashed)
  var VALID_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'; // default: aiknowledge2026

  async function checkCode(code) {
    var msgBuffer = new TextEncoder().encode(code.trim());
    var hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    var hashHex = hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
    return hashHex === VALID_HASH;
  }

  document.getElementById('gating-unlock').addEventListener('click', function() {
    var code = document.getElementById('gating-code').value;
    checkCode(code).then(function(valid) {
      if (valid) {
        localStorage.setItem('kb_subscriber', 'true');
        wrapper.style.maxHeight = 'none';
        wrapper.style.overflow = 'visible';
        overlay.style.display = 'none';
      } else {
        document.getElementById('gating-error').style.display = '';
      }
    });
  });

  document.getElementById('gating-code').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('gating-unlock').click();
  });

  container.classList.add('gating-applied');
})();
