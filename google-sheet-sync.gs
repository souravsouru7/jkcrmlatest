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

function getCrmSheetSyncConfig() {
  return {
    spreadsheetId: "13wKh5QPhdqi8KlqyYabpTR_1JxdGTCZrTqYfLrE0dD8",
    webhookUrl: "https://api.jktaskmangement.online/api/public/google-sheet",
    webhookSecret: "jk-sheet-sync-2026", // must match SHEET_WEBHOOK_SECRET in backend .env
    targetSheetName: "Meta Ads",
    syncedColumnHeader: "CRM Synced",
    syncedMarker: "YES",
    expectedLeadHeaders: [
      "Date",
      "Email",
      "Name",
      "Phone Number",
      "DOB",
      "What type of home do you have?",
      "What is your estimated interior budget?",
      "Which location is your property in?",
      "Quality",
      "Quality Type",
      "Initial Comments",
      "Call 1",
      "Call 2",
      "Call 3",
      "Call 4",
      "Call 5",
    ],
  };
}

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

  const config = getCrmSheetSyncConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);

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
  const config = getCrmSheetSyncConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.targetSheetName) || ss.getSheets()[0];
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
  const config = getCrmSheetSyncConfig();
  if (sheet.getName() !== config.targetSheetName) return;
  const rowIndex = e.range.getRow();
  syncCrmSheetRow(sheet, rowIndex);
}

/**
 * Triggered on any sheet change — scans for unsynced rows.
 */
function onCrmSheetChange(e) {
  if (e.changeType !== "INSERT_ROW" && e.changeType !== "EDIT") return;
  const config = getCrmSheetSyncConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.targetSheetName);
  if (!sheet) {
    Logger.log(`Sheet not found: ${config.targetSheetName}`);
    return;
  }
  syncCrmSheetAllUnsyncedRows(sheet);
}

/**
 * Manually run this from the editor to sync ALL existing unsynced rows at once.
 */
function syncCrmSheetAllNow() {
  const config = getCrmSheetSyncConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.targetSheetName);
  if (!sheet) {
    Logger.log(`Sheet not found: ${config.targetSheetName}`);
    return;
  }
  const synced = syncCrmSheetAllUnsyncedRows(sheet);
  Logger.log(`Done! ${synced} new lead(s) sent to CRM.`);
}

/**
 * Use this only when you want to resend old rows.
 * It clears the CRM Synced column on the target sheet.
 */
function resetCrmSheetSyncStatus() {
  const config = getCrmSheetSyncConfig();
  const ss = SpreadsheetApp.openById(config.spreadsheetId);
  const sheet = ss.getSheetByName(config.targetSheetName);
  if (!sheet) {
    Logger.log(`Sheet not found: ${config.targetSheetName}`);
    return;
  }

  const headers = getCrmSheetHeaders(sheet);
  const syncedCol = ensureCrmSheetSyncedColumn(sheet, headers);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("No rows to reset.");
    return;
  }

  sheet.getRange(2, syncedCol, lastRow - 1, 1).clearContent();
  Logger.log(`Reset CRM sync status for ${lastRow - 1} row(s) on ${sheet.getName()}.`);
}

// ---- Internal helpers ----------------------------------------

function syncCrmSheetAllUnsyncedRows(sheet) {
  const headers = getCrmSheetHeaders(sheet);
  if (!hasCrmSheetLeadHeaders(headers)) {
    Logger.log(`Skipped sheet ${sheet.getName()}: missing Name or Phone Number header`);
    return 0;
  }
  const syncedCol = ensureCrmSheetSyncedColumn(sheet, headers);
  const lastRow = sheet.getLastRow();
  let count = 0;
  const config = getCrmSheetSyncConfig();

  for (let row = 2; row <= lastRow; row++) {
    const syncedValue = sheet.getRange(row, syncedCol).getValue();
    if (syncedValue === config.syncedMarker || syncedValue === "SKIP") continue;

    const rowData = getCrmSheetRowAsObject(sheet, headers, row);
    if (!rowData) continue;
    if (!hasCrmSheetRequiredLeadFields(rowData)) {
      sheet.getRange(row, syncedCol).setValue("SKIP");
      Logger.log(`Skipped row ${row} on ${sheet.getName()}: missing Name or Phone Number`);
      continue;
    }

    const ok = sendCrmSheetRowToCRM(rowData, sheet.getName());
    if (ok) {
      sheet.getRange(row, syncedCol).setValue(config.syncedMarker);
      count++;
      Utilities.sleep(300); // avoid hammering the server
    }
  }
  return count;
}

function syncCrmSheetRow(sheet, rowIndex) {
  const headers = getCrmSheetHeaders(sheet);
  if (!hasCrmSheetLeadHeaders(headers)) {
    Logger.log(`Skipped sheet ${sheet.getName()}: missing Name or Phone Number header`);
    return;
  }
  const syncedCol = ensureCrmSheetSyncedColumn(sheet, headers);
  const syncedValue = sheet.getRange(rowIndex, syncedCol).getValue();
  const config = getCrmSheetSyncConfig();
  if (syncedValue === config.syncedMarker || syncedValue === "SKIP") return;

  const rowData = getCrmSheetRowAsObject(sheet, headers, rowIndex);
  if (!rowData) return;
  if (!hasCrmSheetRequiredLeadFields(rowData)) {
    sheet.getRange(rowIndex, syncedCol).setValue("SKIP");
    Logger.log(`Skipped row ${rowIndex} on ${sheet.getName()}: missing Name or Phone Number`);
    return;
  }

  const ok = sendCrmSheetRowToCRM(rowData, sheet.getName());
  if (ok) sheet.getRange(rowIndex, syncedCol).setValue(config.syncedMarker);
}

function getCrmSheetHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  return sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
}

function ensureCrmSheetSyncedColumn(sheet, headers) {
  const config = getCrmSheetSyncConfig();
  let col = headers.findIndex(h => String(h).trim() === config.syncedColumnHeader);
  if (col === -1) {
    col = headers.length;
    sheet.getRange(1, col + 1).setValue(config.syncedColumnHeader);
  }
  return col + 1; // 1-based
}

function getCrmSheetRowAsObject(sheet, headers, rowIndex) {
  const values = sheet.getRange(rowIndex, 1, 1, headers.length).getDisplayValues()[0];
  const obj = {};
  const config = getCrmSheetSyncConfig();
  headers.forEach((h, i) => {
    const header = String(h || "").trim();
    if (
      header &&
      header !== config.syncedColumnHeader &&
      config.expectedLeadHeaders.includes(header)
    ) {
      obj[header] = values[i] !== undefined ? String(values[i]).trim() : "";
    }
  });
  // Skip empty rows
  const hasData = Object.values(obj).some(v => v !== "");
  return hasData ? obj : null;
}

function hasCrmSheetLeadHeaders(headers) {
  const normalized = headers.map(h => String(h).toLowerCase().trim());
  return normalized.includes("name") && normalized.includes("phone number");
}

function getCrmSheetValue(rowData, names) {
  const keys = Object.keys(rowData);
  for (const name of names) {
    const target = String(name).toLowerCase().trim();
    const key = keys.find(k => String(k).toLowerCase().trim() === target);
    if (key && String(rowData[key] || "").trim()) return String(rowData[key]).trim();
  }
  return "";
}

function hasCrmSheetRequiredLeadFields(rowData) {
  const name = getCrmSheetValue(rowData, ["Name"]);
  const phone = getCrmSheetValue(rowData, ["Phone Number"]);
  return Boolean(name && phone);
}

function sendCrmSheetRowToCRM(rowData, sheetName) {
  const config = getCrmSheetSyncConfig();
  const payload = JSON.stringify({ row: rowData, sheetName });
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "x-sheet-secret": config.webhookSecret },
    payload: payload,
    muteHttpExceptions: true,
  };
  try {
    const response = UrlFetchApp.fetch(config.webhookUrl, options);
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
