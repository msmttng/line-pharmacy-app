/**
 * MEDIXS 併用薬ペースト ブックマークレット
 * ========================================
 * LINE薬局アプリ (admin.html) の手帳データから取得した
 * 薬品名リストを、MEDIXS薬歴の併用薬入力画面に自動ペーストする
 * 
 * 使い方:
 * 1. admin.html で手帳データの「コピー」ボタンをクリック
 * 2. MEDIXS で患者を選択し、服薬指導画面を開く
 * 3. 併用薬 [F3] をクリックしてモーダルを開く
 * 4. このブックマークレットを実行
 * 5. 薬品名が自動で入力される
 */
(function() {
  'use strict';

  // ======== スタイル付きUIを作成 ========
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #medixs-paste-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); z-index: 99999;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Segoe UI', 'Meiryo', sans-serif;
    }
    #medixs-paste-dialog {
      background: white; border-radius: 12px; padding: 24px;
      min-width: 420px; max-width: 600px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    #medixs-paste-dialog h3 {
      margin: 0 0 16px; font-size: 1.1rem; color: #1a1a2e;
      display: flex; align-items: center; gap: 8px;
    }
    #medixs-paste-dialog textarea {
      width: 100%; min-height: 200px; border: 2px solid #e0e0e0;
      border-radius: 8px; padding: 12px; font-size: 0.9rem;
      font-family: 'Consolas', 'Meiryo', monospace; resize: vertical;
      box-sizing: border-box; line-height: 1.6;
    }
    #medixs-paste-dialog textarea:focus {
      border-color: #2563eb; outline: none;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
    }
    .medixs-paste-info {
      font-size: 0.8rem; color: #6b7280; margin: 8px 0 16px;
    }
    .medixs-paste-btns {
      display: flex; gap: 10px; justify-content: flex-end;
    }
    .medixs-paste-btns button {
      padding: 10px 20px; border: none; border-radius: 8px;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .medixs-btn-cancel {
      background: #f3f4f6; color: #374151;
    }
    .medixs-btn-cancel:hover { background: #e5e7eb; }
    .medixs-btn-paste {
      background: #2563eb; color: white;
      box-shadow: 0 2px 8px rgba(37,99,235,0.3);
    }
    .medixs-btn-paste:hover {
      background: #1d4ed8;
      box-shadow: 0 4px 12px rgba(37,99,235,0.4);
    }
    .medixs-paste-status {
      margin-top: 12px; padding: 10px 14px; border-radius: 8px;
      font-size: 0.85rem; display: none;
    }
    .medixs-paste-status.success {
      display: block; background: #dcfce7; color: #166534;
      border: 1px solid #bbf7d0;
    }
    .medixs-paste-status.error {
      display: block; background: #fee2e2; color: #991b1b;
      border: 1px solid #fecaca;
    }
  `;
  document.head.appendChild(styleEl);

  // ======== ダイアログ作成 ========
  const overlay = document.createElement('div');
  overlay.id = 'medixs-paste-overlay';
  overlay.innerHTML = `
    <div id="medixs-paste-dialog">
      <h3>💊 併用薬ペースト</h3>
      <textarea id="medixs-paste-input" placeholder="薬品名を1行に1つずつ入力\n例:\nアムロジピン錠5mg\nメトホルミン錠250mg\nロスバスタチン錠2.5mg"></textarea>
      <div class="medixs-paste-info">
        ヒント: admin.html で手帳データの「コピー」後、ここに貼り付け (Ctrl+V)
      </div>
      <div class="medixs-paste-btns">
        <button class="medixs-btn-cancel" id="medixs-btn-cancel">キャンセル</button>
        <button class="medixs-btn-paste" id="medixs-btn-paste">併用薬に入力</button>
      </div>
      <div class="medixs-paste-status" id="medixs-paste-status"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ======== クリップボードから自動読み取り ========
  const textarea = document.getElementById('medixs-paste-input');
  navigator.clipboard.readText().then(function(clipText) {
    if (clipText && clipText.trim()) {
      textarea.value = clipText.trim();
      textarea.select();
    }
  }).catch(function() {
    // クリップボード読み取り失敗時はそのまま（手動貼り付け）
  });

  // ======== キャンセルボタン ========
  document.getElementById('medixs-btn-cancel').addEventListener('click', function() {
    cleanup();
  });

  // ======== 貼り付けボタン ========
  document.getElementById('medixs-btn-paste').addEventListener('click', function() {
    const input = textarea.value.trim();
    if (!input) {
      showStatus('error', '薬品名が入力されていません');
      return;
    }

    const drugLines = input.split('\n')
      .map(function(l) { return l.trim(); })
      .filter(function(l) { return l.length > 0; });

    if (drugLines.length === 0) {
      showStatus('error', '有効な薬品名がありません');
      return;
    }

    // 併用薬モーダルの入力フィールドを探す
    var filled = fillMedixsFields(drugLines);
    if (filled > 0) {
      showStatus('success', '✅ ' + filled + '件の薬品名を入力しました（' + drugLines.length + '件中）');
      setTimeout(function() { cleanup(); }, 2000);
    }
  });

  // ======== MEDIXSの併用薬フィールドに入力 ========
  function fillMedixsFields(drugLines) {
    // 併用薬モーダル内のテキスト入力フィールドを探す
    // MEDIXSはReact SPAなので、動的DOMを検索
    var allInputs = document.querySelectorAll('input[type="text"], input:not([type])');
    
    // 医薬品情報の入力フィールドを特定
    // 併用薬モーダル内で、コメントフィールドや検索フィールドを除外
    var medInputs = [];
    
    for (var i = 0; i < allInputs.length; i++) {
      var inp = allInputs[i];
      // 可視性チェック
      if (!inp.offsetParent) continue;
      var rect = inp.getBoundingClientRect();
      if (rect.width < 100) continue; // 小さすぎるフィールドは除外
      
      // 「医薬品情報」列の入力フィールドかどうか判定
      // 位置ベースで判定：モーダル内の左側の広い入力フィールド
      // 幅が300px以上のもの（医薬品名フィールドは広い）
      if (rect.width >= 300) {
        medInputs.push(inp);
      }
    }

    if (medInputs.length === 0) {
      // 幅での判定がうまくいかない場合、別の方法を試す
      // テーブル行ごとの最初のinputを取得
      var rows = document.querySelectorAll('tr, [class*="row"], [class*="Row"]');
      rows.forEach(function(row) {
        var inputs = row.querySelectorAll('input[type="text"], input:not([type])');
        if (inputs.length >= 2 && inputs[0].offsetParent) {
          // 最初のinputが医薬品名、2番目がコメントと想定
          medInputs.push(inputs[0]);
        }
      });
    }

    if (medInputs.length === 0) {
      // 最終手段：すべての可視テキストinputから位置で判定
      var visibleInputs = [];
      for (var j = 0; j < allInputs.length; j++) {
        var el = allInputs[j];
        if (el.offsetParent && el.getBoundingClientRect().top > 100) {
          visibleInputs.push(el);
        }
      }
      // 偶数番目（0, 2, 4...）が医薬品名と仮定
      for (var k = 0; k < visibleInputs.length; k += 2) {
        medInputs.push(visibleInputs[k]);
      }
    }

    if (medInputs.length === 0) {
      showStatus('error', '併用薬の入力フィールドが見つかりません。\n併用薬モーダル [F3] を開いてから実行してください。');
      return 0;
    }

    // 入力フィールド数と薬品数を比較
    var filled = 0;
    for (var m = 0; m < drugLines.length && m < medInputs.length; m++) {
      setInputValue(medInputs[m], drugLines[m]);
      filled++;
    }

    // フィールドが足りない場合は警告
    if (drugLines.length > medInputs.length) {
      showStatus('error', '⚠ 入力行が足りません。「+」ボタンで行を追加してから再実行してください。\n' +
        '入力済み: ' + filled + '件 / 残り: ' + (drugLines.length - filled) + '件');
      return filled;
    }

    return filled;
  }

  // ======== Reactコンポーネントに対応したvalue設定 ========
  function setInputValue(input, value) {
    // React のState管理に対応するため、nativeInputValueSetter を使用
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    ).set;
    
    nativeInputValueSetter.call(input, value);
    
    // React の onChange を発火させるためのイベント
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // フォーカス→ブラー でバリデーションを発火
    input.focus();
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // ======== ステータス表示 ========
  function showStatus(type, message) {
    var statusEl = document.getElementById('medixs-paste-status');
    statusEl.className = 'medixs-paste-status ' + type;
    statusEl.textContent = message;
    statusEl.style.display = 'block';
  }

  // ======== クリーンアップ ========
  function cleanup() {
    var ov = document.getElementById('medixs-paste-overlay');
    if (ov) ov.remove();
    styleEl.remove();
  }

  // ESCキーで閉じる
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      cleanup();
      document.removeEventListener('keydown', escHandler);
    }
  });
})();
