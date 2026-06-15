import pathlib, re
h = pathlib.Path(r"C:\Users\jding\kb-site\generator.html").read_text(encoding="utf-8")

# 1. Add CSS for new elements
css_new = """
.cover-prev{border-radius:12px;overflow:hidden;position:relative;width:100%;max-width:320px;margin:0 auto 12px;aspect-ratio:21/9;display:flex;align-items:center;justify-content:center;padding:20px;text-align:center}
.cover-prev.editorial{background:linear-gradient(135deg,#1a1814,#2a2520);color:rgba(250,249,246,.92)}
.cover-prev.minimal{background:#fff;color:#1a1814;border:1px solid var(--border)}
.cover-prev.bold{background:linear-gradient(135deg,#1a1814 0%,#3a3530 50%,#2563EB 100%);color:#fff}
.cover-prev .cv-title{font-family:Poppins,serif;font-size:clamp(14px,2.2vw,22px);font-weight:600;line-height:1.3;position:relative;z-index:1;max-width:90%}
.cover-prev .cv-byline{font-size:9px;opacity:.45;margin-top:8px;position:relative;z-index:1;letter-spacing:.08em}
.cover-prev .cv-bar{position:absolute;bottom:0;left:0;right:0;height:3px;z-index:1}
.cover-prev.editorial .cv-bar{background:var(--primary)}
.cover-prev.minimal .cv-bar{background:var(--ink)}
.cover-prev.bold .cv-bar{background:linear-gradient(90deg,var(--primary),var(--cta))}
.cm-scroll{display:flex;gap:10px;overflow-x:auto;padding:8px 0 12px;-webkit-overflow-scrolling:touch}
.cm-card{flex:0 0 140px;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--card);box-shadow:var(--shadow)}
.cm-card .cm-top{background:var(--primary-lt);padding:20px 12px;text-align:center;font-family:Poppins,serif;font-size:13px;font-weight:600;color:var(--primary);min-height:80px;display:flex;align-items:center;justify-content:center}
.cm-card .cm-bot{padding:8px 10px;font-size:10px;color:var(--ink-muted);text-align:center;border-top:1px solid var(--border-lt)}
.dl-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px}
.dl-section{border:1px solid var(--border);border-radius:12px;padding:16px;background:var(--card)}
.dl-section h4{font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.04em}
.dl-section .dl-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.dl-section .dl-actions .btn{font-size:11px;padding:6px 14px}
.dl-full{grid-column:1/-1}
.img-prompt-item{padding:8px 10px;border:1px solid var(--border-lt);border-radius:8px;margin-bottom:6px;font-size:12px;line-height:1.5}
.img-prompt-item strong{font-size:10px;color:var(--ink-muted);display:block;margin-bottom:2px}
.cover-style-select{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.cover-style-select button{padding:6px 14px;border:1px solid var(--border);border-radius:8px;background:var(--card);font-size:12px;cursor:pointer;font-family:var(--sans);transition:all .15s}
.cover-style-select button:hover{border-color:var(--primary)}
.cover-style-select button.active{background:var(--primary);color:#fff;border-color:var(--primary)}
@media(max-width:640px){.dl-grid{grid-template-columns:1fr}.cm-card{flex:0 0 110px}}
"""
css_insert = '.debug-info{display:none'
css_idx = h.find(css_insert[:20])
if css_idx > 0:
    h = h[:css_idx] + css_new + h[css_idx:]

# 2. Replace step-7 HTML
step7_old_start = h.find('<div class=\"step\" id=\"step-7\">')
step7_old_end = h.find('<div class=\"step\" id=\"step-8\">')
step7_new = """<div class="step" id="step-7"><div class="panel">
<div class="panel-title"><span class="step-badge">06</span><span class="lang-cn">配图预览</span><span class="lang-jp">画像プレビュー</span></div>
<div class="panel-desc"><span class="lang-cn">AI 推荐配图风格。小红书显示卡片预览。</span><span class="lang-jp">AIが画像スタイルを提案。プレビューで確認できます。</span></div>
<div id="rec-result"><div class="loading"><span class="spinner"></span><span class="lang-cn">加载中...</span><span class="lang-jp">読み込み中...</span></div></div>
<div id="card-mockup-area" style="display:none"><h4 style="font-size:12px;font-weight:600;color:var(--ink-muted);margin-bottom:6px"><span class="lang-cn">卡片预览</span><span class="lang-jp">カードプレビュー</span></h4><div class="cm-scroll" id="cmScroll"></div></div>
<div class="btn-actions" id="step7-actions" style="display:none"><button class="btn btn-ghost" onclick="goToStep(6)">← <span class="lang-cn">返回质检</span><span class="lang-jp">診断に戻る</span></button><span class="spacer"></span><button class="btn btn-primary" onclick="goToStep(8)"><span class="lang-cn">进入完成页</span><span class="lang-jp">完了ページへ</span> →</button></div>
</div></div>"""
if step7_old_start > 0 and step7_old_end > 0:
    h = h[:step7_old_start] + step7_new + h[step7_old_end:]

# 3. Replace step-8 HTML
step8_old_start = h.find('<div class=\"step\" id=\"step-8\">')
step8_old_end = h.find('<div class=\"step\" id=\"step-done\">')
step8_new = """<div class="step" id="step-8"><div class="panel">
<div class="panel-title"><span class="step-badge">07</span><span class="lang-cn">完成 · 下载</span><span class="lang-jp">完了 · 保存</span></div>
<div class="panel-desc"><span class="lang-cn">你的内容已生成，预览并下载。</span><span class="lang-jp">コンテンツが生成されました。プレビューと保存が可能です。</span></div>
<div class="dl-grid">
<div class="dl-section"><h4><span class="lang-cn">📄 文章</span><span class="lang-jp">📄 記事</span></h4><div class="content-box" id="final-article" style="font-size:12px;max-height:180px;overflow-y:auto"></div><div class="dl-actions"><button class="btn btn-ghost" onclick="downloadMD()">.md</button><button class="btn btn-ghost" onclick="downloadTXT()">.txt</button></div></div>
<div class="dl-section"><h4><span class="lang-cn">🖼 封面</span><span class="lang-jp">🖼 表紙</span></h4><div class="cover-style-select" id="coverStyleSelect"><button data-style="editorial" class="active"><span class="lang-cn">杂志风</span><span class="lang-jp">雑誌風</span></button><button data-style="minimal"><span class="lang-cn">极简</span><span class="lang-jp">ミニマル</span></button><button data-style="bold"><span class="lang-cn">冲击</span><span class="lang-jp">インパクト</span></button></div><div id="coverPreview"></div><div class="dl-actions"><button class="btn btn-ghost" onclick="downloadCoverPrompt()">📋 <span class="lang-cn">复制指令</span><span class="lang-jp">コピー</span></button></div></div>
<div class="dl-section dl-full"><h4><span class="lang-cn">🎨 配图推荐</span><span class="lang-jp">🎨 画像提案</span></h4><div id="final-image-prompts" style="max-height:180px;overflow-y:auto"></div><div class="dl-actions"><button class="btn btn-ghost" onclick="downloadImagePrompts()"><span class="lang-cn">下载配图指令</span><span class="lang-jp">画像指示を保存</span></button></div></div>
</div>
<div class="btn-actions" style="justify-content:center;border:none;gap:10px"><button class="btn btn-primary" onclick="downloadAll()"><span class="lang-cn">📦 一键全部下载</span><span class="lang-jp">📦 すべて保存</span></button><button class="btn btn-ghost" onclick="resetAll()"><span class="lang-cn">重新开始</span><span class="lang-jp">最初から</span></button></div>
</div></div>"""
if step8_old_start > 0 and step8_old_end > 0:
    h = h[:step8_old_start] + step8_new + h[step8_old_end:]

# 4. Update step-7 JS in goToStep
# Find the step-7 handling block and replace it
old_step7_js = 'if(n==7){document.getElementById("rec-result").innerHTML='
new_step7_js = 'if(n==7){document.getElementById("rec-result").innerHTML='
old_step7_js_end = old_step7_js[:40]  # unique prefix
# Actually, let me find the exact block
step7_js_start = h.find('if(n==7){document.getElementById("rec-result").innerHTML=')
# Find next step handler
step8_js_start = h.find('if(n==8){')
if step7_js_start > 0 and step8_js_start > 0:
    new_step7_js = """if(n==7){document.getElementById("rec-result").innerHTML='<div class="loading"><span class="spinner"></span><span class="lang-cn">加载中...</span><span class="lang-jp">読み込み中...</span></div>';document.getElementById("card-mockup-area").style.display="none";document.getElementById("step7-actions").style.display="none";callApi("recommend-prompts",{topic:S.topic||""}).then(function(d){S.recommendedPrompts=d;var isJP=localStorage.getItem("kb-lang")==="jp";var cs=d.recommended||[];var h="";h+='<div class="content-box"><strong>'+(isJP?"おすすめカテゴリー:":"推荐分类:")+'</strong> '+(cs.length?cs.map(function(c){return c.cat}).join(" + "):(isJP?"該当なし":"暂无推荐"))+'</div>';if(cs.length){h+='<div class="check-group" style="margin-bottom:8px">';cs.forEach(function(c){var ps=c.prompts||[];ps.slice(0,2).forEach(function(p){h+='<div class="check-row" style="cursor:default"><div><div class="cl">'+c.cat+" #"+(p.id||"")+'</div><div class="cl-sub" style="overflow:hidden;text-overflow:ellipsis;max-height:2.8em">'+(p.title||"")+"</div></div></div>"})});h+="</div>"}document.getElementById("rec-result").innerHTML=h;
var cmArea=document.getElementById("card-mockup-area");var cmScroll=document.getElementById("cmScroll");if(S.platform==="小红书"&&cs.length){cmArea.style.display="block";var cards="";for(var ci=0;ci<6;ci++){var catIdx=ci%Math.max(cs.length,1);var st=cs[catIdx];var catName=st?st.cat:"";cards+='<div class="cm-card"><div class="cm-top">'+(S.topic||"内容").slice(0,8)+'</div><div class="cm-bot">'+(ci+1)+"/6 "+(isJP?"枚目":"张")+" "+(catName||"")+"</div></div>"}cmScroll.innerHTML=cards}else{cmArea.style.display="none"}document.getElementById("step7-actions").style.display="flex";saveState()}).catch(function(e){document.getElementById("rec-result").innerHTML='<div class="error-msg">'+(localStorage.getItem("kb-lang")==="jp"?"読み込み失敗: ":"加载失败: ")+e.message+"</div>"})}"""
    h = h[:step7_js_start] + new_step7_js + h[step8_js_start:]

# 5. Update step-8 JS to show download page content
old_step8_js = 'if(n==8){document.getElementById("cover-result").innerHTML='
step8_handler = h.find('if(n==8){document.getElementById("cover-result").innerHTML=')
# Find the end of step-8 handler (next function or end of goToStep)
next_func = h.find('function generateDraft2', step8_handler)
if step8_handler > 0 and next_func > 0:
    new_step8_js = """if(n==8){
var isJP=localStorage.getItem("kb-lang")==="jp";var t=S.draft2||S.draft1||{};
// article
document.getElementById("final-article").innerHTML=(t.title?"<strong>"+t.title+"</strong><br><br>":"")+(t.body||(isJP?"(本文なし)":"(无正文)"));
// cover
renderCover();
// image prompts
var ipDiv=document.getElementById("final-image-prompts");var rp=S.recommendedPrompts;var iph="";
if(rp&&rp.recommended){rp.recommended.forEach(function(c){var ps=c.prompts||[];ps.slice(0,3).forEach(function(p){iph+='<div class="img-prompt-item"><strong>'+c.cat+" #"+(p.id||"")+'</strong>'+(p.title||"")+"</div>"})})}
if(!iph)iph=(isJP?"(提案なし)":"(暂无推荐)");
ipDiv.innerHTML=iph;
// wire cover style buttons
document.querySelectorAll("#coverStyleSelect button").forEach(function(b){b.onclick=function(){document.querySelectorAll("#coverStyleSelect button").forEach(function(x){x.classList.remove("active")});this.classList.add("active");renderCover()}});
saveState()
}"""
    h = h[:step8_handler] + new_step8_js + h[next_func:]

# 6. Add renderCover and new download functions
# Find the end of downloadTXT function
dtxt_end = h.find('function copyCoverPrompt')
if dtxt_end < 0:
    dtxt_end = h.find('function finish()')
    
new_funcs = """
function renderCover(){var isJP=localStorage.getItem("kb-lang")==="jp";var t=S.draft2||S.draft1||{};var title=t.title||S.topic||(isJP?"(タイトルなし)":"(无标题)");var style="editorial";document.querySelectorAll("#coverStyleSelect button").forEach(function(b){if(b.classList.contains("active"))style=b.dataset.style});var h="";h+='<div class="cover-prev '+style+'"><div class="cv-title">'+title+'</div><div class="cv-byline">'+(isJP?"創作センター":"用AI看图作图")+'</div><div class="cv-bar"></div></div>';document.getElementById("coverPreview").innerHTML=h}
function downloadCoverPrompt(){var isJP=localStorage.getItem("kb-lang")==="jp";var t=S.draft2||S.draft1||{};var style="editorial";document.querySelectorAll("#coverStyleSelect button").forEach(function(b){if(b.classList.contains("active"))style=b.dataset.style});var p=(isJP?"【表紙指示】\\n":"【封面指令】\\n")+"style: "+style+"\\ntitle: "+(t.title||S.topic||"")+"\\n"+(isJP?"※ 創作センターで生成":"※ 由创作中心生成");var b=new Blob([p],{type:"text/plain;charset=utf-8"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="cover-prompt.txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function downloadImagePrompts(){var isJP=localStorage.getItem("kb-lang")==="jp";var rp=S.recommendedPrompts;var p="";if(rp&&rp.recommended){rp.recommended.forEach(function(c){p+="--- "+c.cat+" ---\\n";var ps=c.prompts||[];ps.forEach(function(q){p+="#"+(q.id||"")+" "+(q.title||"")+"\\n"})})}if(!p)p=(isJP?"(提案なし)":"(暂无推荐)");var b=new Blob([p],{type:"text/plain;charset=utf-8"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download="image-prompts.txt";document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u)}
function downloadAll(){downloadMD();setTimeout(function(){downloadTXT()},200);setTimeout(function(){downloadCoverPrompt()},400);setTimeout(function(){downloadImagePrompts()},600)}
"""
# Insert before finish()
h = h[:dtxt_end] + new_funcs + h[dtxt_end:]

# 7. Remove old step-done (now merged into step-8)
# Find step-done div and remove it
sd_start = h.find('<div class=\"step\" id=\"step-done\">')
sd_end = h.find('</main>', sd_start)
if sd_start > 0 and sd_end > 0:
    # Find the closing </div></div> of step-done
    sd_close = h.rfind('</div>', sd_start, sd_end)
    # Remove from step-done start to after the panel/step close
    # The step-done has: <div id="step-done">...panel...</div></div>
    # Find the last two </div> tags
    sd_close1 = h.rfind('</div>', sd_start, sd_end)
    sd_close2 = h.rfind('</div>', sd_start, sd_close1 - 2) if sd_close1 > 0 else -1
    if sd_close2 > 0:
        h = h[:sd_start] + h[sd_close1 + 6:]

# Write back
pathlib.Path(r"C:\Users\jding\kb-site\generator.html").write_text(h, encoding="utf-8")
print("Done - updated steps 7, 8, removed step-done")
