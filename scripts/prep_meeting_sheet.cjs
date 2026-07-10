/**
 * Prep Sheet for Meeting Booking
 * This script ensures the "Verified Emails" sheet has the required columns
 * for tracking conversions from Calendly.
 */

const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function prepSheet(spreadsheetId) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  // 1. Get current headers
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Verified Emails!A1:Z1',
  });
  
  const headers = response.data.values[0] || [];
  const requiredColumns = ['Meeting_Status', 'Meeting_Date', 'Meeting_Notes'];
  const missingColumns = requiredColumns.filter(c => !headers.includes(c));
  
  if (missingColumns.length === 0) {
    console.log("✅ All conversion columns already exist.");
    return;
  }
  
  // 2. Append missing headers
  const newHeaders = [...headers, ...missingColumns];
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'Verified Emails!A1',
    valueInputOption: 'RAW',
    resource: { values: [newHeaders] },
  });
  
  console.log(`🚀 Added missing columns: ${missingColumns.join(', ')}`);
}

// Usage: node prep_sheet.cjs YOUR_SPREADSHEET_ID
const sheetId = process.argv[2];
if (sheetId) {
  prepSheet(sheetId).catch(console.error);
} else {
  console.error("❌ Please provide a Spreadsheet ID.");
}
