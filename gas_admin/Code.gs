const SPREADSHEET_ID = '1VKnnNhdN4e5gqjYRdhLNAsklcZR6KJ5hlYkwS7vF4Iw';

function doGet(e) {
  return HtmlService.createTemplateFromFile('admin')
    .evaluate()
    .setTitle('【薬局】問診回答管理')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSubmissions() {
  const CACHE_KEY = 'admin_submissions_cache';
  try {
    const cache = CacheService.getScriptCache();
    const cachedData = cache.get(CACHE_KEY);
    
    if (cachedData) {
      return { success: true, list: JSON.parse(cachedData) };
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    
    const lastRow = sheet.getLastRow();
    const lastCol = Math.min(sheet.getLastColumn(), 40); 
    
    if (lastRow <= 1) return { success: true, list: [] };
    
    const limit = 100;
    const startRow = Math.max(2, lastRow - limit + 1); 
    let numRows = lastRow - startRow + 1;
    
    if (numRows < 1) return { success: true, list: [] };

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
    
    const list = data.reverse().map((r, rowIdx) => {
      let o = {
        _rowIndex: startRow + numRows - 1 - rowIdx
      };
      headers.forEach((name, i) => { 
        if(name) {
          let val = r[i];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, "JST", "MM/dd HH:mm");
          }
          if (name === '電話番号' && typeof val === 'number') {
            val = '0' + String(val);
          }
          o[name] = val;
        }
      });
      return o;
    });

    const compactList = list.filter(item => {
      const isDeleted = String(item['削除フラグ'] || '').toUpperCase() === 'TRUE' || item['削除フラグ'] === true || item['削除フラグ'] === 1 || item['削除フラグ'] === '1';
      const nameStr = String(item['名前'] || '').trim();
      const isNoName = nameStr === '' || nameStr === '名前なし';
      return !isDeleted && !isNoName;
    }).map(item => {
      const compact = {};
      Object.keys(item).forEach(k => {
        const v = item[k];
        if (v !== '' && v !== null && v !== undefined) compact[k] = v;
      });
      return compact;
    });

    const jsonStr = JSON.stringify(compactList);
    if (jsonStr.length < 500000) { 
      cache.put(CACHE_KEY, jsonStr, 60);
    }

    return { success: true, list: compactList };
  } catch (e) {
    console.error(e.toString());
    return { success: false, error: e.toString() };
  }
}

function getNotebookData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('手帳データ');
    if (!sheet) return { success: true, list: [] };
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, list: [] };
    
    const limit = 100;
    const startRow = Math.max(2, lastRow - limit + 1);
    const numRows = lastRow - startRow + 1;
    
    const data = sheet.getRange(startRow, 1, numRows, 3).getValues();
    const list = data.reverse().map(r => {
      return {
        '日時': r[0] instanceof Date ? Utilities.formatDate(r[0], 'JST', 'MM/dd HH:mm') : String(r[0]),
        '氏名': r[1] || '',
        '医薬品名': r[2] || ''
      };
    }).filter(item => item['氏名'] || item['医薬品名']); 
    
    return { success: true, list: list };
  } catch (e) {
    console.error(e.toString());
    return { success: false, error: e.toString() };
  }
}

function markEntered(rowIndex, target) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const headers = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 40)).getValues()[0];
    const colName = (target === 'chozai') ? '調剤くん入力済' : 'MEDIXS入力済';
    let colIndex = headers.indexOf(colName) + 1;
    if (colIndex === 0) {
      colIndex = headers.length + 1;
      sheet.getRange(1, colIndex).setValue(colName).setBackground('#eeeeee').setFontWeight('bold');
    }
    sheet.getRange(rowIndex, colIndex).setValue('済');
    CacheService.getScriptCache().remove('admin_submissions_cache');
    return { success: true };
  } catch (err) {
    console.error(err.toString());
    return { success: false, error: err.toString() };
  }
}

function deleteRowLocal(e) {
  try {
    const rowIndex = parseInt(e.parameter ? e.parameter.rowIndex : e.rowIndex || e, 10);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const headers = sheet.getRange(1, 1, 1, Math.min(sheet.getLastColumn(), 40)).getValues()[0];
    let delColIndex = headers.indexOf('削除フラグ') + 1;
    if (delColIndex === 0) {
      delColIndex = headers.length + 1;
      sheet.getRange(1, delColIndex).setValue('削除フラグ').setBackground('#eeeeee').setFontWeight('bold');
    }
    sheet.getRange(rowIndex, delColIndex).setValue(true);
    CacheService.getScriptCache().remove('admin_submissions_cache');
    return { success: true };
  } catch (err) {
    console.error(err.toString());
    return { success: false, error: err.toString() };
  }
}
