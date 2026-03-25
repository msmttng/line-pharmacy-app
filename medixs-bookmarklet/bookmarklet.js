/**
 * MEDIXS 併用薬ペースト ブックマークレット v5.5
 * =============================================
 * 
 * 方式: 画面上に「コピーして次へ」巨大ボタンを表示
 * 
 * これが一番確実です。
 */
(function() {
  'use strict';

  var ex = document.getElementById('medixs-helper-panel');
  if (ex) ex.remove();
  var exs = document.getElementById('medixs-helper-style');
  if (exs) exs.remove();
  if (window._mhp_click_handler) document.removeEventListener('mousedown', window._mhp_click_handler, true);

  var style = document.createElement('style');
  style.id = 'medixs-helper-style';
  style.textContent = [
    '#medixs-helper-panel{position:fixed;top:10px;right:10px;z-index:2147483647;',
    'background:#1e293b;color:#fff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.6);',
    'font-family:Meiryo,sans-serif;width:340px;overflow:hidden;border:2px solid #2563eb}',
    '#medixs-helper-panel .mhp-hd{background:#2563eb;padding:10px 14px;font-weight:700;font-size:12px;display:flex;justify-content:space-between;cursor:move}',
    '#medixs-helper-panel .mhp-body{padding:15px}',
    '#medixs-helper-panel textarea{width:100%;height:100px;background:#0f172a;border:1px solid #334155;border-radius:8px;color:#fff;padding:10px;font-size:12px}',
    '#medixs-helper-panel .mhp-btn{width:100%;padding:15px;border:none;border-radius:10px;font-weight:700;cursor:pointer;margin-top:10px}',
    '#medixs-helper-panel .mhp-go{background:#2563eb;color:#fff;font-size:16px}',
    '#medixs-helper-panel .mhp-drug{background:rgba(255,255,255,.1);border-radius:8px;padding:12px;text-align:center;font-size:16px;font-weight:700;color:#93c5fd;margin:10px 0}',
    '#medixs-helper-panel .mhp-copy-now{background:#059669;color:#fff;font-size:18px;padding:16px;box-shadow:0 4px 15px rgba(5,150,105,.4)}',
    '#medixs-helper-panel .mhp-copy-now:active{transform:scale(.98)}',
    '#medixs-helper-panel .mhp-sub{display:flex;gap:8px;margin-top:10px}',
    '#medixs-helper-panel .mhp-sub button{flex:1;background:#334155;color:#94a3b8;border:none;padding:8px;border-radius:6px;font-size:11px;cursor:pointer}',
    '#medixs-helper-panel .mhp-list{list-style:none;margin-top:10px;max-height:80px;overflow-y:auto;font-size:11px;opacity:.6}'
  ].join('\n');
  document.head.appendChild(style);

  var panel = document.createElement('div');
  panel.id = 'medixs-helper-panel';
  panel.innerHTML = '<div class="mhp-hd"><span>💊 v5.5 併用薬ペースト</span><span style="cursor:pointer" id="mhp-close">✕</span></div><div class="mhp-body" id="mhp-body"></div>';
  document.body.appendChild(panel);

  var hd = panel.querySelector('.mhp-hd'), dragging = false, dx, dy;
  hd.addEventListener('mousedown', function(e){ if(e.target.id==='mhp-close')return; dragging=true; dx=e.clientX-panel.getBoundingClientRect().left; dy=e.clientY-panel.getBoundingClientRect().top; e.preventDefault(); });
  document.addEventListener('mousemove', function(e){ if(!dragging)return; panel.style.left=(e.clientX-dx)+'px'; panel.style.right='auto'; panel.style.top=(e.clientY-dy)+'px'; });
  document.addEventListener('mouseup', function(){ dragging=false; });
  document.getElementById('mhp-close').addEventListener('click', function(){ panel.remove(); style.remove(); });

  var body = document.getElementById('mhp-body'), drugLines = [], currentIndex = 0;

  showInputMode();

  function showInputMode() {
    body.innerHTML = '<textarea id="mhp-ta" placeholder="\u85AC\u54C1\u540D\u30921\u884C\u306B1\u3064"></textarea><button class="mhp-btn mhp-go" id="mhp-start">スタート</button>';
    document.getElementById('mhp-start').addEventListener('click', function(){
      drugLines = document.getElementById('mhp-ta').value.trim().split('\n').map(function(l){return l.trim()}).filter(function(l){return l.length>0});
      if(drugLines.length===0)return;
      currentIndex = 0;
      showPasteMode();
    });
  }

  function showPasteMode() {
    if(currentIndex >= drugLines.length) {
      body.innerHTML = '<div style="text-align:center;padding:20px;color:#4ade80;font-weight:700">✅ 全件完了！</div><button class="mhp-btn mhp-go" id="mhp-again">もう一度</button>';
      document.getElementById('mhp-again').addEventListener('click', showInputMode);
      return;
    }
    
    var drug = drugLines[currentIndex];
    body.innerHTML = 
      '<div style="text-align:center;font-size:12px;color:#94a3b8">' + (currentIndex+1) + ' / ' + drugLines.length + '</div>' +
      '<div class="mhp-drug">' + drug + '</div>' +
      '<button class="mhp-btn mhp-copy-now" id="mhp-main-btn">コピー ＋ 全選択</button>' +
      '<div style="text-align:center;font-size:11px;color:#94a3b8;margin-top:8px">1. 検索欄をクリック<br>2. 上の緑ボタンを押す<br>3. <b>Ctrl+V</b> で貼り付け</div>' +
      '<div class="mhp-sub"><button id="mhp-skip">スキップ</button><button id="mhp-rst">リセット</button></div>' +
      '<ul class="mhp-list">' + drugLines.map(function(l,i){ return '<li style="'+(i<currentIndex?'text-decoration:line-through;opacity:.3':'')+'">'+l+'</li>' }).join('') + '</ul>';

    document.getElementById('mhp-main-btn').addEventListener('click', function(){
      // クリップボードにコピー
      copyTo(drug);
      
      // 直前にフォーカスがあった要素を全選択
      var active = document.activeElement;
      if(active && active.tagName === 'INPUT') {
          active.select();
      } else {
          // 検索欄を探して強制全選択
          var input = document.querySelector('input[name="medicine_name_query"]') || document.querySelector('input.w100');
          if(input) { input.focus(); input.select(); }
      }
      
      // 次へ
      currentIndex++;
      showPasteMode();
    });

    document.getElementById('mhp-skip').addEventListener('click', function(){ currentIndex++; showPasteMode(); });
    document.getElementById('mhp-rst').addEventListener('click', showInputMode);
  }

  function copyTo(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

})();
