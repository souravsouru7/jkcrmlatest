// ============================================================
// JK Interiors CRM — Google Sheet Sync Script
// ============================================================
// SETUP STEPS:
// 1. Open your Google Sheet
// 2. Click Extensions → Apps Script
// 3. Add a new script file named crm-sheet-sync
// 4. Paste this entire file into that new file
// 5. Click Save, then run "testCrmSheetAccess" once
// 6. Run "setupCrmSheetSync" once manually
// 7. Run "syncCrmSheetAllNow" once to sync old rows
// 8. Grant permissions when prompted
// ============================================================

// ---- CONFIG (edit these) ------------------------------------
const SPREADSHEET_ID = "13wKh5QPhdqi8KlqyYabpTR_1JxdGTCZrTqYfLrE0dD8";
const CRM_WEBHOOK_URL = "https://api.jktaskmangement.online/api/public/google-sheet";
const WEBHOOK_SECRET  = "jk-sheet-sync-2026";   // must match SHEET_WEBHOOK_SECRET in backend .env
const SYNCED_COLUMN_HEADER = "CRM Synced";       // header added automatically to track synced rows
const SYNCED_MARKER = "YES";
// -------------------------------------------------------------

/**
 * Run this ONCE manually from the Apps Script editor to install the CRM sync triggers.
 * After that it runs automatically on every form submit or new row.
 */
function setupCrmSheetSync() {
  // Remove only this CRM sync's triggers. Leave existing Meta/Facebook triggers untouched.
  ScriptApp.getProjectTriggers().forEach(t => {
    const handler = t.getHandlerFunction();
    if (handler === "onCrmSheetNewRow" || handler === "onCrmSheetChange") {
      ScriptApp.deleteTrigger(t);
    }
  });

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // If the sheet is linked to a Google Form, use onFormSubmit for real-time sync
  ScriptApp.newTrigger("onCrmSheetNewRow")
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  // Also add onChange so manually added rows are caught too
  ScriptApp.newTrigger("onCrmSheetChange")
    .forSpreadsheet(ss)
    .onChange()
    .create();

  Logger.log("Triggers installed. CRM sync is active.");
  Logger.log("New rows will automatically appear as CRM leads.");
}

/**
 * Run this first if Apps Script shows a generic/unknown error.
 * It verifies that this script can open your sheet and read headers.
 */
function testCrmSheetAccess() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  const headers = getCrmSheetHeaders(sheet);
  Logger.log("Spreadsheet: " + ss.getName());
  Logger.log("Sheet: " + sheet.getName());
  Logger.log("Headers: " + headers.join(" | "));
}

/**
 * Triggered on Google Form submit — sends the new row immediately.
 */
function onCrmSheetNewRow(e) {
  const sheet = e.range.getSheet();
  const rowIndex = e.range.getRow();
  syncCrmSheetRow(sheet, rowIndex);
}

/**
 * Triggered on any sheet change — scans for unsynced rows.
 */
function onCrmSheetChange(e) {
  if (e.changeType !== "INSERT_ROW" && e.changeType !== "EDIT") return;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ss.getSheets().forEach(sheet => syncCrmSheetAllUnsyncedRows(sheet));
}

/**
 * Manually run this from the editor to sync ALL existing unsynced rows at once.
 */
function syncCrmSheetAllNow() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let synced = 0;
  ss.getSheets().forEach(sheet => {
    synced += syncCrmSheetAllUnsyncedRows(sheet);
  });
  Logger.log(`Done! ${synced} new lead(s) sent to CRM.`);
}

// ---- Internal helpers ----------------------------------------

function syncCrmSheetAllUnsyncedRows(sheet) {
  const headers = getCrmSheetHeaders(sheet);
  const syncedCol = ensureCrmSheetSyncedColumn(sheet, headers);
  const lastRow = sheet.getLastRow();
  let count = 0;

  for (let row = 2; row <= lastRow; row++) {
    const syncedValue = sheet.getRange(row, syncedCol).getValue();
    if (syncedValue === SYNCED_MARKER) continue;

    const rowData = getCrmSheetRowAsObject(sheet, headers, row);
    if (!rowData) continue;

    const ok = sendCrmSheetRowToCRM(rowData, sheet.getName());
    if (ok) {
      sheet.getRange(row, syncedCol).setValue(SYNCED_MARKER);
      count++;
      Utilities.sleep(300); // avoid hammering the server
    }
  }
  return count;
}

function syncCrmSheetRow(sheet, rowIndex) {
  const headers = getCrmSheetHeaders(sheet);
  const syncedCol = ensureCrmSheetSyncedColumn(sheet, headers);
  const syncedValue = sheet.getRange(rowIndex, syncedCol).getValue();
  if (syncedValue === SYNCED_MARKER) return;

  const rowData = getCrmSheetRowAsObject(sheet, headers, rowIndex);
  if (!rowData) return;

  const ok = sendCrmSheetRowToCRM(rowData, sheet.getName());
  if (ok) sheet.getRange(rowIndex, syncedCol).setValue(SYNCED_MARKER);
}

function getCrmSheetHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function ensureCrmSheetSyncedColumn(sheet, headers) {
  let col = headers.findIndex(h => String(h).trim() === SYNCED_COLUMN_HEADER);
  if (col === -1) {
    col = headers.length;
    sheet.getRange(1, col + 1).setValue(SYNCED_COLUMN_HEADER);
  }
  return col + 1; // 1-based
}

function getCrmSheetRowAsObject(sheet, headers, rowIndex) {
  const values = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  const obj = {};
  headers.forEach((h, i) => {
    if (h && String(h).trim() && String(h).trim() !== SYNCED_COLUMN_HEADER) {
      obj[String(h).trim()] = values[i] !== undefined ? String(values[i]).trim() : "";
    }
  });
  // Skip empty rows
  const hasData = Object.values(obj).some(v => v !== "");
  return hasData ? obj : null;
}

function sendCrmSheetRowToCRM(rowData, sheetName) {
  const payload = JSON.stringify({ row: rowData, sheetName });
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-sheet-secret": WEBHOOK_SECRET },
    payload: payload,
    muteHttpExceptions: true,
  };
  try {
    const response = UrlFetchApp.fetch(CRM_WEBHOOK_URL, options);
    const code = response.getResponseCode();
    if (code === 200 || code === 201) {
      Logger.log("Lead sent: " + (rowData["Name"] || rowData["name"] || JSON.stringify(rowData)));
      return true;
    } else {
      Logger.log("CRM error " + code + ": " + response.getContentText());
      return false;
    }
  } catch (err) {
    Logger.log("Network error: " + err.message);
    return false;
  }
}
