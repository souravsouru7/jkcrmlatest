// =========================================================================
// JK INTERIORS — PRODUCTION LEADS SYSTEM GOOGLE APPS SCRIPT
// =========================================================================
//
// INSTRUCTIONS FOR DEPLOYMENT:
// 1. Copy your Google Sheet ID from its URL.
//    Example: URL is docs.google.com/spreadsheets/d/1A-b-C-d-1234XYZ/edit
//    Your SPREADSHEET_ID is: 1A-b-C-d-1234XYZ
// 2. Paste your Google Sheet ID in the SPREADSHEET_ID variable below.
// 3. Open Extensions -> Apps Script in your Google Sheet.
// 4. Paste this complete script, replacing all previous code.
// 5. Update SELL_DO_API_URL and SELL_DO_API_KEY with actual Sell.do endpoints if ready.
// 6. Click "Deploy" -> "New deployment".
// 7. Select "Web app" (from settings cog). Configure:
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 8. Deploy, authorize permissions, and copy the generated Web App URL.
// 9. Update the Web App URL in main.js.
// =========================================================================

// CONFIGURATION
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your 44-character spreadsheet ID
const SHEET_NAME = 'Leads';
const LOG_SHEET_NAME = 'Logs';
const NOTIFICATION_EMAIL = 'digitalmojoleads@gmail.com';
const ENABLE_CRM_PUSH = false; // Disabled until CRM is decided
const SELL_DO_API_URL = 'YOUR_SELL_DO_API_ENDPOINT_HERE';
const SELL_DO_API_KEY = 'YOUR_SELL_DO_API_KEY_HERE';

/**
 * GET Webhook Endpoint - Health check endpoint to verify script status.
 */
function doGet(e) {
  logAction('Health Check', 'Health check doGet endpoint accessed.');
  
  const status = {
    'status': 'healthy',
    'timestamp': new Date().toISOString(),
    'message': 'JK Interiors Production Leads Webhook endpoint is active.',
    'configuredSheet': SHEET_NAME,
    'spreadsheetIdConfigured': (SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE' && SPREADSHEET_ID !== ''),
    'crmConfigured': (SELL_DO_API_URL !== 'YOUR_SELL_DO_API_ENDPOINT_HERE' && SELL_DO_API_URL !== '')
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(status))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

/**
 * POST Webhook Endpoint - Receives form submissions from the landing page.
 */
function doPost(e) {
  try {
    logAction('Lead Received', 'Processing incoming lead request...');
    
    // Parse incoming JSON data or fallback to query parameters
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || SPREADSHEET_ID === '') {
      throw new Error('SPREADSHEET_ID configuration is missing. Please set your Spreadsheet ID at the top of the Apps Script.');
    }
    
    const doc = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = doc.getSheetByName(SHEET_NAME);
    
    // Select specific Google Sheet tab; insert it if it does not exist
    if (!sheet) {
      sheet = doc.insertSheet(SHEET_NAME);
    }
    
    // If the sheet is empty, initialize it with default headers
    if (sheet.getLastRow() === 0) {
      const defaultHeaders = [
        'Date', 'Name', 'Phone', 'Email', 'Project Type', 'Location', 'Message',
        'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Term', 'UTM Content',
        'UTM AdGroup', 'UTM MatchType', 'UTM Device', 'UTM Ad', 'SRD',
        'GAD Source', 'GAD CampaignID', 'GBRAID', 'GCLID',
        'CRM Status', 'Lead ID', 'Notification Status'
      ];
      sheet.appendRow(defaultHeaders);
    }
    
    // Read column headers from Row 1 of the selected tab only
    const lastCol = Math.max(1, sheet.getLastColumn());
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // Map form data dynamically using matching header names (not column position)
    const rowValues = getPayloadValue(headers, payload);
    
    // Append every lead as a new row (allowing duplicates)
    sheet.appendRow(rowValues);
    const newRowIndex = sheet.getLastRow();
    logAction('Sheet Updated', 'Inserted lead row successfully at index ' + newRowIndex);
    
    // Send email notification with fixed notification email logic
    const emailStatus = sendLeadEmailNotification(payload);
    
    // Update Notification Status in Google Sheet
    updateNotificationStatusInSheet(sheet, newRowIndex, headers, emailStatus);
    
    // Push lead data to CRM (Sell.do) with retry logic up to 3 times
    const crmResult = pushToCRMWithRetry(payload);
    
    // Update CRM status and Lead ID back into the same row in sheet
    updateCRMStatusInSheet(sheet, newRowIndex, headers, crmResult);
    
    const responseObj = {
      'result': 'success',
      'row': newRowIndex,
      'notification_status': emailStatus,
      'crm_status': crmResult.status,
      'crm_lead_id': crmResult.leadId
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(responseObj))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    logAction('Error', 'Critical failure in doPost: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

/**
 * Normalizes strings to assist in dynamic field mapping
 */
function normalizeKey(str) {
  if (!str) return '';
  return str.toString().toLowerCase().replace(/[\s_\-\*]/g, '');
}

/**
 * Dynamically maps incoming payload keys to sheet headers
 */
function getPayloadValue(headers, payload) {
  // Normalize incoming payload keys
  const normalizedPayload = {};
  for (let key in payload) {
    normalizedPayload[normalizeKey(key)] = payload[key];
  }
  
  return headers.map(header => {
    const normHeader = normalizeKey(header);
    
    // Handle system populated values
    if (normHeader === 'timestamp' || normHeader === 'date') {
      return new Date();
    }
    
    if (normHeader === 'crmstatus' || normHeader === 'leadid' || normHeader === 'notificationstatus') {
      return ''; // Populated after respective functions run
    }
    
    // Fallback mappings for clean UI names to standard CRM keys
    if (normHeader === 'name' && normalizedPayload['yourname'] !== undefined) {
      return normalizedPayload['yourname'];
    }
    if (normHeader === 'location' && normalizedPayload['projectlocation'] !== undefined) {
      return normalizedPayload['projectlocation'];
    }
    if (normHeader === 'projecttype' && normalizedPayload['yourproject'] !== undefined) {
      return normalizedPayload['yourproject'];
    }
    
    // Direct matches
    return normalizedPayload[normHeader] !== undefined ? normalizedPayload[normHeader] : '';
  });
}

/**
 * Sends a notification email to a fixed, reliable config recipient
 */
function sendLeadEmailNotification(payload) {
  if (!NOTIFICATION_EMAIL || NOTIFICATION_EMAIL === 'YOUR_NOTIFICATION_EMAIL_HERE') {
    logAction('Email Skip', 'Notification email address is not configured. Skipping email.');
    return 'Failed';
  }
  
  try {
    const subject = '✦ New Lead Captured: ' + (payload.name || payload.yourname || 'Anonymous');
    
    const body = 'A new lead has been captured from the website.\n\n' +
                 'Name: ' + (payload.name || payload.yourname || 'N/A') + '\n' +
                 'Phone: ' + (payload.phone || 'N/A') + '\n' +
                 'Email: ' + (payload.email || 'N/A') + '\n' +
                 'Project Type: ' + (payload.project_type || payload.yourproject || 'N/A') + '\n' +
                 'Location: ' + (payload.location || payload.projectlocation || 'N/A') + '\n' +
                 'Message: ' + (payload.message || 'N/A') + '\n\n' +
                 'UTM/Campaign Tracking Parameters:\n' +
                 'Source: ' + (payload.utm_source || 'N/A') + '\n' +
                 'Medium: ' + (payload.utm_medium || 'N/A') + '\n' +
                 'Campaign: ' + (payload.utm_campaign || 'N/A') + '\n' +
                 'AdGroup: ' + (payload.utm_adgroup || 'N/A') + '\n' +
                 'Matchtype: ' + (payload.utm_matchtype || 'N/A') + '\n' +
                 'Device: ' + (payload.utm_device || 'N/A') + '\n' +
                 'Ad: ' + (payload.utm_ad || 'N/A') + '\n' +
                 'SRD: ' + (payload.srd || 'N/A') + '\n' +
                 'GAD Source: ' + (payload.gad_source || 'N/A') + '\n' +
                 'GAD CampaignID: ' + (payload.gad_campaignid || 'N/A') + '\n' +
                 'GBRAID: ' + (payload.gbraid || 'N/A') + '\n' +
                 'GCLID: ' + (payload.gclid || 'N/A') + '\n\n' +
                 'Google Spreadsheet dynamically updated.';
                 
    MailApp.sendEmail(NOTIFICATION_EMAIL, subject, body);
    logAction('Email Sent', 'Notification email sent successfully to ' + NOTIFICATION_EMAIL);
    return 'Sent';
  } catch (emailErr) {
    logAction('Email Error', 'Failed to send notification email to ' + NOTIFICATION_EMAIL + ': ' + emailErr.toString());
    return 'Failed';
  }
}

/**
 * Pushes data to CRM API with 3 retries and logs detailed error responses.
 */
function pushToCRMWithRetry(leadData) {
  const maxRetries = 3;
  let attempt = 0;
  let success = false;
  let result = { status: 'Not Sent', leadId: 'N/A' };

  if (!ENABLE_CRM_PUSH) {
    logAction('CRM Skip', 'CRM integration is disabled (ENABLE_CRM_PUSH = false), skipping API push.');
    return { status: 'Disabled', leadId: 'N/A' };
  }

  const isUrlPlaceholder = (SELL_DO_API_URL === 'YOUR_SELL_DO_API_ENDPOINT_HERE' || !SELL_DO_API_URL || SELL_DO_API_URL === '');
  const isKeyPlaceholder = (SELL_DO_API_KEY === 'YOUR_SELL_DO_API_KEY_HERE' || !SELL_DO_API_KEY || SELL_DO_API_KEY === '');

  if (isUrlPlaceholder || isKeyPlaceholder) {
    logAction('CRM Skip', 'CRM API URL or Key is missing/unconfigured. Skipping API push.');
    return { status: 'Not Configured', leadId: 'N/A' };
  }

  // Construct standard CRM payload format
  const payload = {
    "sell_do": {
      "form": {
        "lead": {
          "name": leadData.name || leadData.yourname || '',
          "email": leadData.email || '',
          "phone": leadData.phone || '',
          "project_type": leadData.project_type || leadData.yourproject || '',
          "location": leadData.location || leadData.projectlocation || '',
          "message": leadData.message || ''
        },
        "note": {
          "content": `UTM Source: ${leadData.utm_source || ''}, Medium: ${leadData.utm_medium || ''}, Campaign: ${leadData.utm_campaign || ''}`
        }
      },
      "api_key": SELL_DO_API_KEY
    }
  };

  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload),
    'muteHttpExceptions': true // Ensures Apps Script doesn't crash on bad HTTP codes
  };

  while (attempt < maxRetries && !success) {
    attempt++;
    try {
      logAction('CRM Push Attempt', 'Attempt ' + attempt + ' to push lead to CRM...');
      const response = UrlFetchApp.fetch(SELL_DO_API_URL, options);
      const responseCode = response.getResponseCode();
      const responseText = response.getContentText();
      
      if (responseCode === 200 || responseCode === 201) {
        const resJson = JSON.parse(responseText);
        const leadId = (resJson.sell_do && resJson.sell_do.lead_id) || resJson.lead_id || 'SUCCESS';
        
        result.status = 'Success';
        result.leadId = leadId;
        success = true;
        
        logAction('CRM Success', 'Successfully pushed lead to Sell.do on attempt ' + attempt + '. CRM Lead ID: ' + leadId);
      } else {
        throw new Error("HTTP Response Status: " + responseCode + " | Response Body: " + responseText);
      }
    } catch (err) {
      const errorMsg = err.toString();
      logAction('CRM Failure', 'Attempt ' + attempt + ' failed. Reason: ' + errorMsg);
      
      if (attempt < maxRetries) {
        Utilities.sleep(1000 * attempt); // Wait with exponential backoff
      } else {
        result.status = 'Failed';
        result.leadId = 'N/A';
        logAction('CRM Fatal Failure', 'All 3 push attempts failed. Last error details: ' + errorMsg);
      }
    }
  }
  
  return result;
}

/**
 * Updates columns mapping to headers matching "crmstatus" and "leadid"
 */
function updateCRMStatusInSheet(sheet, rowNum, headers, crmResult) {
  try {
    const crmStatusIndex = headers.findIndex(h => normalizeKey(h) === 'crmstatus');
    const leadIdIndex = headers.findIndex(h => normalizeKey(h) === 'leadid');

    if (crmStatusIndex !== -1) {
      sheet.getRange(rowNum, crmStatusIndex + 1).setValue(crmResult.status);
    }
    if (leadIdIndex !== -1) {
      sheet.getRange(rowNum, leadIdIndex + 1).setValue(crmResult.leadId);
    }
    logAction('Row CRM Status Update', 'Row ' + rowNum + ' status updated to ' + crmResult.status);
  } catch (err) {
    logAction('CRM Sheet Update Error', 'Failed to write CRM status back to sheet: ' + err.toString());
  }
}

/**
 * Updates column matching header "notificationstatus"
 */
function updateNotificationStatusInSheet(sheet, rowNum, headers, status) {
  try {
    const notifStatusIndex = headers.findIndex(h => normalizeKey(h) === 'notificationstatus');
    if (notifStatusIndex !== -1) {
      sheet.getRange(rowNum, notifStatusIndex + 1).setValue(status);
    }
  } catch (err) {
    logAction('Notification Sheet Update Error', 'Failed to write notification status back to sheet: ' + err.toString());
  }
}

/**
 * Centralized Action Logging Sheet targeting specific Spreadsheet ID
 */
function logAction(action, details) {
  try {
    if (SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || SPREADSHEET_ID === '') {
      console.warn("Spreadsheet ID is unconfigured. Log action: [" + action + "] -> " + details);
      return;
    }
    
    const doc = SpreadsheetApp.openById(SPREADSHEET_ID);
    let logSheet = doc.getSheetByName(LOG_SHEET_NAME);
    
    if (!logSheet) {
      logSheet = doc.insertSheet(LOG_SHEET_NAME);
      logSheet.appendRow(['Timestamp', 'Action', 'Details']);
    }
    
    logSheet.appendRow([new Date(), action, details]);
  } catch (e) {
    console.error("Failed to log action: " + e.toString());
  }
}
