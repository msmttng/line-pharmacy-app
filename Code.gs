const SPREADSHEET_ID = '1Xe52ARdmONGVAoaPn7EIslLAYioXk77GRSQ39cRhr_k';
const PDF_FOLDER_NAME = '初回問診票_印刷用'; // Googleドライブに自動作成されるフォルダ名

function doGet(e) {
  const action = e.parameter.action;

  // 問診票データ取得
  if (action === 'get') {
    const data = getSubmissions();
    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 未印刷PDFキューを返す
  if (action === 'getPrintQueue') {
    return ContentService.createTextOutput(JSON.stringify(getPrintQueue()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 印刷済みマークを更新
  if (action === 'markPrinted') {
    const rowIndex = parseInt(e.parameter.rowIndex, 10);
    return ContentService.createTextOutput(JSON.stringify(markPrinted(rowIndex)))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const page = (e.parameter.admin === 'true') ? 'admin' : 'index';
  return HtmlService.createTemplateFromFile(page)
    .evaluate()
    .setTitle('【薬局】初回問診票')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = submitToSpreadsheet(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * データを保存（存在しない場合はヘッダーを自動作成）
 */
function submitToSpreadsheet(data) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    
    // シートが空ならヘッダーを更新/作成
    if (sheet.getLastColumn() === 0 || sheet.getRange(1, 1).getValue() === "") {
      const headers = [
        '日時', '名前', '電話番号', 
        '状態', '妊婦体重', '授乳婦体重', '小児体重',
        '薬アレルギー', 'アレルギー詳細', 
        '食品アレルギー', '食品詳細', 
        '環境アレルギー',
        '副作用', '副作用詳細', 
        '他院処方', '他院詳細', 
        '市販薬', '市販薬詳細', 
        '飲食物', '飲食物詳細',
        '既往歴', '既往歴詳細', 
        '運転', '高所', 'ソフトコンタクト', '酒', '煙草', 
        'ジェネリック', '備考', 'お薬手帳'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setBackground('#eeeeee').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const tMap = {
      'yes': 'あり', 'no': 'なし',
      'prefer': 'ジェネリックで大丈夫', 'avoid': '先発医薬品を希望する', 'ag': 'オーソライズド・ジェネリックでなら希望',
      'occasionally': '時々', 'daily': '毎日',
      'cold': '風邪薬', 'pain': '痛み止め', 'rhinitis': '鼻炎薬', 'stomach': '胃腸薬',
      'constipation': '便秘薬', 'kanpo': '漢方薬', 'eye': '目薬', 'vitamin': 'ビタミン',
      'mineral': 'ミネラル', 'multi-mineral': 'マルチミネラル', 'iron': '鉄', 'zinc': '亜鉛', 
      'magnesium': 'マグネシウム', 'calcium': 'カルシウム', 'dha-epa': 'DHA/EPA', 'protein': 'プロテイン',
      'coffee-tea': 'コーヒー・紅茶', 'grapefruit': 'グレープフルーツジュース', 'dairy': '乳製品',
      'hayfever': '花粉症', 'housedust': 'ハウスダスト', 'mite': 'ダニ',
      'dog-cat': '犬・猫', 'temp': '寒暖差', 'perennial': '通年性', 'testing': 'アレルギーの検査中',
      'hypertension': '高血圧', 'diabetes': '糖尿病', 'heart': '心臓病', 
      'kidney': '腎臓病', 'liver': '肝臓病', 'asthma': '喘息', 
      'epilepsy': 'てんかん', 'glaucoma': '緑内障', 'prostate': '前立腺肥大',
      'other': 'その他',
      'pregnant': '妊娠中', 'breastfeeding': '授乳中', 'pediatric': '小児'
    };

    const hayfeverTypeLabels = {
        'sugi': 'スギ', 'hinoki': 'ヒノキ', 'ine': 'イネ', 'butakusa': 'ブタクサ', 'kamogaya': 'カモガヤ'
    };

    const translate = (val) => {
      if (!val) return 'なし';
      if (Array.isArray(val)) {
        return val.map(v => tMap[v] || v).join(', ');
      }
      if (typeof val === 'string' && val.includes(',')) {
        return val.split(',').map(v => tMap[v.trim()] || v.trim()).join(', ');
      }
      return tMap[val] || val;
    };

    let pWeight = '', bWeight = '', pedWeight = '';
    if (data['patient-condition'] === 'pregnant') pWeight = data.weight || '';
    if (data['patient-condition'] === 'breastfeeding') bWeight = data.weight || '';
    if (data['patient-condition'] === 'pediatric') pedWeight = data.weight || '';

    let bookletVal = 'なし';
    if (data['booklet'] === 'yes') {
      bookletVal = 'あり' + (data['booklet-type'] === 'paper' ? '(紙)' : (data['booklet-type'] === 'digital' ? '(電子)' : ''));
    }

    // 電話番号（先頭の0が消えないよう文字列として保持）
    const phoneStr = data.phone ? String(data.phone) : '';

    const row = [
      new Date(), 
      data.name || '', 
      phoneStr, 
      // patient-conditionはnone→該当なし、alcoholはnone→飲まないと個別に変換
      translate(data['patient-condition'] === 'none' ? '該当なし' : data['patient-condition']) || '該当なし',
      pWeight,
      bWeight,
      pedWeight,
      translate(data['drug-allergy']), 
      data['drug-allergy-detail'] || '', 
      translate(data['food-allergy']), 
      data['food-allergy-detail'] || '', 
      (() => {
        let envAllergies = Array.isArray(data['env-allergy']) ? data['env-allergy'].map(v => tMap[v] || v) : [tMap[data['env-allergy']] || data['env-allergy']];
        envAllergies = envAllergies.filter(Boolean); // Remove empty strings/nulls

        if (data['env-allergy'] && data['env-allergy'].includes('hayfever') && data['hayfever-type'] && data['hayfever-type'].length > 0) {
            const types = data['hayfever-type'].map(t => hayfeverTypeLabels[t] || t).join('・');
            envAllergies = envAllergies.map(a => a === '花粉症' ? `花粉症(${types})` : a);
        }
        return envAllergies.length > 0 ? envAllergies.join(', ') : 'なし';
      })(),
      translate(data['side-effect']), 
      data['side-effect-detail'] || '', 
      translate(data['current-presc']), 
      data['current-presc-detail'] || '', 
      translate(data['otc-list']), 
      data['otc-suppl-detail'] || '', 
      translate(data['food-drink']),
      data['food-drink-detail'] || '',
      translate(data.history), 
      data['history-other-detail'] || '', 
      translate(data.driving), 
      translate(data['height-work']), 
      translate(data['soft-contact']),
      // alcoholは'none'→'飲まない'と個別に変換
      data.alcohol === 'none' ? '飲まない' : translate(data.alcohol), 
      translate(data.smoking), 
      translate(data.generic), 
      data.memo || '',
      bookletVal
    ];
    sheet.appendRow(row);

    // appendRowは数値に自動変換するため、電話番号セル(C列)をテキスト書式にして再設定
    const lastRow = sheet.getLastRow();
    const phoneCell = sheet.getRange(lastRow, 3);
    phoneCell.setNumberFormat('@');
    phoneCell.setValue(phoneStr);

    // データ元カラム(AE列=31)に「web問診」を記録
    sheet.getRange(lastRow, 31).setValue('web問診');

    // 書き込み後にキャッシュをクリアして直後の読み取りで即時反映されるようにする
    const scriptCache = CacheService.getScriptCache();
    scriptCache.remove('submissions_cache_v2'); // 旧キー
    scriptCache.remove('submissions_cache_v3'); // 現行キー

    // PDF自動生成
    createAndSavePdf(data);

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: e.toString() };
  }
}

/**
 * データの取得（キャッシュを利用した高速化版）
 * ※ キャッシュキーv3: 古いキャッシュ(v2)を無効化して最新データを確実に取得
 */
function getSubmissions() {
  const CACHE_KEY = 'submissions_cache_v3';
  try {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(CACHE_KEY);
    
    // キャッシュがあればGoogle APIを叩かずに即座に返す（超高速）
    if (cachedData) {
      return { success: true, list: JSON.parse(cachedData) };
    }

    // キャッシュがない場合のみスプレッドシートを取得
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    
    const lastRow = sheet.getLastRow();
    const lastCol = Math.min(sheet.getLastColumn(), 35); // ヘッダー数(データ元等含む)
    
    if (lastRow <= 1) return { success: true, list: [] };
    
    // 必要最小限のデータを最後に取得 (上限100行)
    const limit = 100;
    const startRow = Math.max(2, lastRow - limit + 1); // 一番下の最新データから最大100件
    let numRows = lastRow - startRow + 1;
    
    if (numRows < 1) return { success: true, list: [] };

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
    
    // 逆順（最新が上）にしてオブジェクトにマッピング
    const list = data.reverse().map(r => {
      let o = {};
      headers.forEach((name, i) => { 
        if(name) {
          let val = r[i];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, "JST", "MM/dd HH:mm");
          }
          // 電話番号が数値として保存されていた場合、先頭の0を補完する
          if (name === '電話番号' && typeof val === 'number') {
            val = '0' + String(val);
          }
          o[name] = val;
        }
      });
      return o;
    });

    // 空文字フィールドを除外してJSONサイズを削減
    const compactList = list.map(item => {
      const compact = {};
      Object.keys(item).forEach(k => {
        const v = item[k];
        if (v !== '' && v !== null && v !== undefined) compact[k] = v;
      });
      return compact;
    });

    // 取得したデータを最大5分（300秒）キャッシュ
    // ※ 新規投稿時はsubmitToSpreadsheetがキャッシュを即時削除するため安全
    // ※ CacheServiceの上限512KBに収まるよう軽量化済み
    const jsonStr = JSON.stringify(compactList);
    if (jsonStr.length < 500000) { // 500KB以内のみキャッシュ
      cache.put(CACHE_KEY, jsonStr, 300);
    }

    return { success: true, list: compactList };
  } catch (e) {
    console.error(e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * PDF保存先フォルダを取得（なければ自動作成）
 */
function getPdfFolder() {
  const folders = DriveApp.getFoldersByName(PDF_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  // 初回のみ作成
  const newFolder = DriveApp.createFolder(PDF_FOLDER_NAME);
  console.log('PDFフォルダを新規作成しました: ' + PDF_FOLDER_NAME);
  return newFolder;
}

/**
 * 問診票データからPDFを生成してGoogleドライブに保存する
 */
function createAndSavePdf(data) {
  try {
    const tMap = {
      'yes': 'あり', 'no': 'なし',
      'prefer': 'ジェネリックで大丈夫', 'avoid': '先発医薬品を希望する', 'ag': 'オーソライズド・ジェネリックでなら希望',
      'occasionally': '時々', 'daily': '毎日',
      'cold': '風邪薬', 'pain': '痛み止め', 'rhinitis': '鼻炎薬', 'stomach': '胃腸薬',
      'constipation': '便秘薬', 'kanpo': '漢方薬', 'eye': '目薬', 'vitamin': 'ビタミン',
      'mineral': 'ミネラル', 'multi-mineral': 'マルチミネラル', 'iron': '鉄', 'zinc': '亜鉛',
      'magnesium': 'マグネシウム', 'calcium': 'カルシウム', 'dha-epa': 'DHA/EPA', 'protein': 'プロテイン',
      'coffee-tea': 'コーヒー・紅茶', 'grapefruit': 'グレープフルーツジュース', 'dairy': '乳製品',
      'hayfever': '花粉症', 'housedust': 'ハウスダスト', 'mite': 'ダニ',
      'dog-cat': '犬・猫', 'temp': '寒暖差', 'perennial': '通年性', 'testing': 'アレルギーの検査中',
      'hypertension': '高血圧', 'diabetes': '糖尿病', 'heart': '心臓病',
      'kidney': '腎臓病', 'liver': '肝臓病', 'asthma': '喘息',
      'epilepsy': 'てんかん', 'glaucoma': '緑内障', 'prostate': '前立腺肥大',
      'other': 'その他',
      'pregnant': '妊娠中', 'breastfeeding': '授乳中', 'pediatric': '小児',
      'none': '該当なし'
    };
    const hayfeverTypeLabels = {
      'sugi': 'スギ', 'hinoki': 'ヒノキ', 'ine': 'イネ', 'butakusa': 'ブタクサ', 'kamogaya': 'カモガヤ'
    };
    const t = (val) => {
      if (!val || val === 'no') return 'なし';
      if (Array.isArray(val)) return val.map(v => tMap[v] || v).join('、');
      if (typeof val === 'string' && val.includes(',')) return val.split(',').map(v => tMap[v.trim()] || v.trim()).join('、');
      return tMap[val] || val;
    };

    // 環境アレルギーの整形（花粉症の種類を含む）
    let envAllergyStr = 'なし';
    if (data['env-allergy'] && data['env-allergy'] !== 'no') {
      const envArr = Array.isArray(data['env-allergy']) ? data['env-allergy'] : data['env-allergy'].split(',').map(s => s.trim());
      let labels = envArr.map(v => tMap[v] || v);
      if (envArr.includes('hayfever') && data['hayfever-type'] && data['hayfever-type'].length > 0) {
        const types = data['hayfever-type'].map(t2 => hayfeverTypeLabels[t2] || t2).join('・');
        labels = labels.map(l => l === '花粉症' ? `花粉症(${types})` : l);
      }
      envAllergyStr = labels.join('、');
    }

    // 患者状態・体重
    const condition = data['patient-condition'];
    let conditionStr = tMap[condition] || condition || '該当なし';
    if (condition === 'pregnant' && data.weight)  conditionStr += `（体重: ${data.weight}kg）`;
    if (condition === 'breastfeeding' && data.weight) conditionStr += `（体重: ${data.weight}kg）`;
    if (condition === 'pediatric' && data.weight)   conditionStr += `（体重: ${data.weight}kg）`;

    // お薬手帳
    let bookletStr = 'なし';
    if (data['booklet'] === 'yes') {
      bookletStr = 'あり' + (data['booklet-type'] === 'paper' ? '（紙）' : data['booklet-type'] === 'digital' ? '（電子）' : '');
    }

    // ファイル名用の日時
    const now = new Date();
    const dateStr = Utilities.formatDate(now, 'JST', 'yyyyMMdd_HHmm');
    const displayDate = Utilities.formatDate(now, 'JST', 'yyyy年MM月dd日 HH:mm');
    const patientName = data.name || '不明';
    const fileName = `${dateStr}_${patientName}.pdf`;

    // PDF用HTML本文
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Noto Sans JP', serif; font-size: 13pt; color: #222; margin: 20mm 15mm; }
  h1 { text-align: center; font-size: 17pt; border-bottom: 2px solid #333; padding-bottom: 6px; margin-bottom: 4px; }
  .subtitle { text-align: center; font-size: 10pt; color: #555; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
  th { background: #eeeeee; text-align: left; padding: 5px 8px; font-size: 11pt; width: 38%; border: 1px solid #aaa; }
  td { padding: 5px 8px; font-size: 11pt; border: 1px solid #aaa; }
  .section-title { background: #333; color: #fff; padding: 4px 10px; font-size: 12pt; margin: 14px 0 4px; }
  .memo { border: 1px solid #aaa; padding: 8px; min-height: 40px; font-size: 11pt; white-space: pre-wrap; }
  .footer { text-align: right; font-size: 9pt; color: #888; margin-top: 20px; }
</style>
</head>
<body>
<h1>初回問診票</h1>
<p class="subtitle">受付日時: ${displayDate}</p>

<div class="section-title">■ 基本情報</div>
<table>
  <tr><th>氏名</th><td>${patientName}</td></tr>
  <tr><th>電話番号</th><td>${data.phone || ''}</td></tr>
  <tr><th>状態</th><td>${conditionStr}</td></tr>
</table>

<div class="section-title">■ アレルギー</div>
<table>
  <tr><th>薬アレルギー</th><td>${t(data['drug-allergy'])}${ data['drug-allergy'] === 'yes' && data['drug-allergy-detail'] ? '：' + data['drug-allergy-detail'] : ''}</td></tr>
  <tr><th>食品アレルギー</th><td>${t(data['food-allergy'])}${ data['food-allergy'] === 'yes' && data['food-allergy-detail'] ? '：' + data['food-allergy-detail'] : ''}</td></tr>
  <tr><th>環境アレルギー</th><td>${envAllergyStr}</td></tr>
</table>

<div class="section-title">■ 薬・医療歴</div>
<table>
  <tr><th>副作用</th><td>${t(data['side-effect'])}${ data['side-effect'] === 'yes' && data['side-effect-detail'] ? '：' + data['side-effect-detail'] : ''}</td></tr>
  <tr><th>他院処方</th><td>${t(data['current-presc'])}${ data['current-presc'] === 'yes' && data['current-presc-detail'] ? '：' + data['current-presc-detail'] : ''}</td></tr>
  <tr><th>市販薬・サプリ</th><td>${t(data['otc-list'])}${ data['otc-list'] && data['otc-list'] !== 'no' && data['otc-suppl-detail'] ? '：' + data['otc-suppl-detail'] : ''}</td></tr>
  <tr><th>既往歴</th><td>${t(data.history)}${ data.history && data.history !== 'no' && data['history-other-detail'] ? '：' + data['history-other-detail'] : ''}</td></tr>
</table>

<div class="section-title">■ 生活習慣・確認事項</div>
<table>
  <tr><th>飲食物（注意）</th><td>${t(data['food-drink'])}${ data['food-drink'] && data['food-drink'] !== 'no' && data['food-drink-detail'] ? '：' + data['food-drink-detail'] : ''}</td></tr>
  <tr><th>車の運転</th><td>${t(data.driving)}</td></tr>
  <tr><th>高所作業</th><td>${t(data['height-work'])}</td></tr>
  <tr><th>ソフトコンタクト</th><td>${t(data['soft-contact'])}</td></tr>
  <tr><th>飲酒</th><td>${data.alcohol === 'none' ? '飲まない' : t(data.alcohol)}</td></tr>
  <tr><th>喫煙</th><td>${t(data.smoking)}</td></tr>
</table>

<div class="section-title">■ ジェネリック・お薬手帳</div>
<table>
  <tr><th>ジェネリック</th><td>${t(data.generic)}</td></tr>
  <tr><th>お薬手帳</th><td>${bookletStr}</td></tr>
</table>

<div class="section-title">■ 備考</div>
<div class="memo">${data.memo || '（なし）'}</div>

<p class="footer">このPDFはシステムにより自動生成されました</p>
</body>
</html>`;

    // HTMLからPDFへ変換
    const blob = HtmlService.createHtmlOutput(html)
      .getAs('application/pdf')
      .setName(fileName);

    // バイト配列を取得（Base64化とファイル保存の両方に使用）
    const pdfBytes = blob.getBytes();
    const pdfBase64 = Utilities.base64Encode(pdfBytes);

    // ★ 印刷キューを先に登録（ドライブ保存が失敗しても印刷は可能にする）
    addToPrintQueue(fileName, patientName, pdfBase64);
    console.log('印刷キューに登録完了: ' + fileName);

    // Googleドライブに保存（消費済みblobではなくバイト配列から新しいBlobを作成）
    try {
      const folder = getPdfFolder();
      const newBlob = Utilities.newBlob(pdfBytes, 'application/pdf', fileName);
      folder.createFile(newBlob);
      console.log('PDF保存完了: ' + fileName);
    } catch (driveErr) {
      console.error('Googleドライブ保存エラー（印刷キューには登録済み）: ' + driveErr.toString());
      logError('DriveApp.createFile', driveErr.toString());
    }

  } catch (err) {
    // PDF生成に失敗してもスプレッドシートへの書き込みには影響しない
    console.error('PDF生成エラー: ' + err.toString());
    logError('createAndSavePdf', err.toString());
  }
}

/**
 * テスト用：ダミーデータでPDFを生成して動作確認する
 * GASエディタでこの関数を選択して「実行」ボタンをクリックしてください
 */
function testPdfCreation() {
  const dummyData = {
    name: 'テスト太郎',
    phone: '090-0000-0000',
    'patient-condition': 'none',
    'drug-allergy': 'yes',
    'drug-allergy-detail': 'ロキソニンで胃が荒れる',
    'food-allergy': 'no',
    'env-allergy': ['hayfever', 'housedust'],
    'hayfever-type': ['sugi', 'hinoki'],
    'side-effect': 'no',
    'current-presc': 'yes',
    'current-presc-detail': '内科でアムロジピン',
    'otc-list': ['pain', 'vitamin'],
    'otc-suppl-detail': 'イブ・ビタミンC',
    'food-drink': 'grapefruit',
    'food-drink-detail': '',
    history: ['hypertension', 'diabetes'],
    'history-other-detail': '',
    driving: 'yes',
    'height-work': 'no',
    'soft-contact': 'no',
    alcohol: 'occasionally',
    smoking: 'no',
    generic: 'prefer',
    memo: 'これはテスト用のPDFです。',
    booklet: 'yes',
    'booklet-type': 'digital'
  };
  createAndSavePdf(dummyData);
  console.log('テスト完了。Googleドライブの「' + PDF_FOLDER_NAME + '」フォルダを確認してください。');
}

// ============================================================
// 印刷キュー管理 (Sheet2)
// ============================================================

const PRINT_SHEET_NAME = '印刷キュー';

/**
 * 印刷管理シートを取得（なければ自動作成）
 */
function getPrintQueueSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(PRINT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(PRINT_SHEET_NAME);
    // ヘッダー設定
    sheet.getRange(1, 1, 1, 5).setValues([[
      '受付日時', '氏名', 'ファイル名', 'Base64 PDF', '印刷済み'
    ]]).setBackground('#eeeeee').setFontWeight('bold');
    sheet.setFrozenRows(1);
    // Base64列は非表示にして右クリック・表示を加ずに裏データとして保管
    sheet.hideColumns(4);
    console.log('印刷キューシートを新規作成しました');
  }
  return sheet;
}

/**
 * PDFを印刷キューに追加
 */
function addToPrintQueue(fileName, patientName, pdfBase64) {
  try {
    const sheet = getPrintQueueSheet();
    sheet.appendRow([new Date(), patientName, fileName, pdfBase64, false]);
    console.log('印刷キューに登録: ' + fileName);
  } catch (err) {
    console.error('印刷キュー登録エラー: ' + err.toString());
  }
}

/**
 * 未印刷PDFのリストを返す（PowerShellから呼び出す）
 */
function getPrintQueue() {
  try {
    const sheet = getPrintQueueSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, list: [] };

    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const list = [];

    data.forEach((row, i) => {
      const printed = row[4];
      if (printed === false || printed === '' || printed === 'false') {
        const datetime = row[0] instanceof Date
          ? Utilities.formatDate(row[0], 'JST', 'yyyy/MM/dd HH:mm:ss')
          : String(row[0]);
        list.push({
          rowIndex: i + 2,      // シートの実障行番号（2始まり）
          datetime: datetime,
          name: row[1],
          fileName: row[2],
          pdfBase64: row[3]    // Base64エンコードされたPDF
        });
      }
    });

    return { success: true, list: list };
  } catch (err) {
    console.error(err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * 指定行を印刷済みにマーク（PowerShellから呼び出す）
 */
function markPrinted(rowIndex) {
  try {
    const sheet = getPrintQueueSheet();
    sheet.getRange(rowIndex, 5).setValue(true);
    console.log('印刷済みに更新: 行' + rowIndex);
    return { success: true };
  } catch (err) {
    console.error(err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * キャッシュを手動クリアする（管理画面に最新データが表示されない時に実行）
 * GASエディタでこの関数を選択して「実行」ボタンをクリックしてください
 */
function clearCache() {
  const cache = CacheService.getScriptCache();
  cache.remove('submissions_cache_v2'); // 旧キー
  cache.remove('submissions_cache_v3'); // 現行キー
  console.log('キャッシュ（v2/v3）をクリアしました。admin.htmlをリロードすると最新データが表示されます。');
}

/**
 * エラーログをスプレッドシートに記録する（デバッグ用）
 */
function logError(source, message) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = ss.getSheetByName('エラーログ');
    if (!logSheet) {
      logSheet = ss.insertSheet('エラーログ');
      logSheet.getRange(1, 1, 1, 3).setValues([['日時', '発生元', 'エラー内容']])
        .setBackground('#ffcccc').setFontWeight('bold');
      logSheet.setFrozenRows(1);
    }
    logSheet.appendRow([new Date(), source, message]);
  } catch (e) {
    console.error('エラーログ記録失敗: ' + e.toString());
  }
}

/**
 * 過去データの「データ元」を一括設定する（初回のみ実行）
 * - 空欄 or 'LINE問診' の行 → 「web問診」
 * - 「AI読取」が既にある行 → そのまま
 * GASエディタでこの関数を選択して「実行」ボタンをクリックしてください
 */
function backfillDataSource() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) { console.log('データなし'); return; }

  const DATA_COL = 31; // AE列
  const range = sheet.getRange(2, DATA_COL, lastRow - 1, 1);
  const values = range.getValues();
  let updated = 0;

  for (let i = 0; i < values.length; i++) {
    const val = String(values[i][0]).trim();
    if (val === '' || val === 'undefined' || val === 'null') {
      values[i][0] = 'web問診';
      updated++;
    } else if (val === 'LINE問診') {
      values[i][0] = 'web問診';
      updated++;
    }
    // 'AI読取' はそのまま
  }

  range.setValues(values);
  const cache = CacheService.getScriptCache();
  cache.remove('submissions_cache_v2');
  cache.remove('submissions_cache_v3');
  console.log('データ元を一括更新しました: ' + updated + '行を「web問診」に設定');
}
