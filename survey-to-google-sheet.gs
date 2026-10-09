/**
 * WSSA Invasive Plant Community Survey: response collector
 * ---------------------------------------------------------
 * Saves each survey response as a row in a Google Sheet.
 * Email addresses (only from people who opt in) go to a separate
 * "Contacts" tab, at a random row, with no response ID or timestamp,
 * so they can't be matched back to anyone's answers.
 *
 * SETUP (about 5 minutes, once)
 * 1. Create a new Google Sheet, e.g. "WSSA IPC Survey Responses".
 * 2. In the Sheet: Extensions > Apps Script. Delete the sample code
 *    and paste this whole file. Save.
 * 3. Deploy > New deployment > Select type: Web app.
 *      Description:     Survey collector
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Click Deploy and authorize when asked.
 * 4. Copy the Web app URL (ends in /exec).
 * 5. Open "WSSA Invasive Plant Survey.html" in a text editor, find
 *    SETTINGS near the top, and paste the URL into submitUrl:
 *      submitUrl: "https://script.google.com/macros/s/XXXX/exec",
 * 6. Host the HTML file anywhere that serves static pages (WSSA's
 *    website, GitHub Pages, Netlify, a university web space).
 *    Add ?src=denver2027 (or similar) to links and QR codes to see
 *    where responses came from in the "source" column.
 *
 * Columns are created automatically from the first response, and new
 * columns are added if questions change later.
 * If you edit this script after deploying: Deploy > Manage deployments
 * > Edit > Version: New version, so the same URL keeps working.
 */

const RESPONSES_TAB = "Responses";
const CONTACTS_TAB = "Contacts";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (data.row) appendRow_(ss, RESPONSES_TAB, data.row, false);
    if (data.contact && data.contact.email) {
      appendRow_(ss, CONTACTS_TAB, {
        email: String(data.contact.email).slice(0, 200),
        interests: String(data.contact.interests || "").slice(0, 500)
      }, true);
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, message: "Survey collector is running." });
}

function appendRow_(ss, tabName, obj, randomPosition) {
  const sh = ss.getSheetByName(tabName) || ss.insertSheet(tabName);
  let headers = sh.getLastColumn() > 0
    ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].filter(String)
    : [];
  const newKeys = Object.keys(obj).filter(k => headers.indexOf(k) === -1);
  if (newKeys.length) {
    headers = headers.concat(newKeys);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  // Prefix values that a spreadsheet would treat as formulas.
  const values = headers.map(h => {
    let v = obj[h] === undefined || obj[h] === null ? "" : obj[h];
    if (typeof v === "string" && /^[=+\-@]/.test(v)) v = "'" + v;
    return v;
  });
  const last = sh.getLastRow();
  if (randomPosition && last > 1) {
    const r = 2 + Math.floor(Math.random() * last); // 2 .. last+1
    if (r <= last) {
      sh.insertRowBefore(r);
      sh.getRange(r, 1, 1, values.length).setValues([values]);
      return;
    }
  }
  sh.appendRow(values);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
