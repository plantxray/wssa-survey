# WSSA Invasive Plant Community Survey

Survey for the Weed Science Society of America (WSSA) Invasive Plant Committee, to be distributed at the 2027 WSSA Annual Meeting (Denver, Feb 8–11) and online.

Live at: https://www.plantxray.com/wssa-survey/

- `index.html`: the whole survey (questions, styling and logic in one file).
- `survey-to-google-sheet.gs`: Google Apps Script that saves responses to a Google Sheet. Setup steps are at the top of the file.

## Going live

The survey runs in preview mode (nothing saved) until `submitUrl` in the `SETTINGS` block near the top of `index.html` is set to the Apps Script web-app URL.

## Editing questions

Questions live in the `SURVEY_ALL` list in `index.html`. Sections can be switched off with `enabled: false`; question numbers update automatically.

## Tracking where responses come from

Add `?src=` to links and QR codes, e.g. `https://www.plantxray.com/wssa-survey/?src=denver2027`. The value appears in the `source` column of the response sheet.
