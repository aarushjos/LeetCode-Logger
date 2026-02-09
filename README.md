# LeetCode Logger

LeetCode Logger is a Chrome extension that automatically logs solved LeetCode problems into a Google Spreadsheet owned by the user.

The goal of this extension is to help users track their LeetCode progress over time without any manual data entry.

---

## Features
- Automatically detects solved LeetCode problems
- Appends problem details to a Google Sheet
- Works directly from leetcode.com
- Uses Google OAuth for secure authentication

---

## How It Works
1. Install the Chrome extension
2. Sign in with your Google account
3. Select or configure a Google Spreadsheet
4. When a LeetCode problem is solved, the extension appends a new row to the spreadsheet

Each logged entry may include:
- Problem title
- Problem difficulty
- Problem URL
- Date solved

---

## Google API Usage
This extension uses the **Google Sheets API** to append rows to a Google Spreadsheet selected by the user.

The extension only requests the following OAuth scope:
https://www.googleapis.com/auth/spreadsheets


No other Google services (such as Google Drive, Gmail, or Calendar) are accessed.

---

## Data Privacy
- All data is written only to a spreadsheet owned by the user
- The extension does not collect, store, or transmit data to any external servers
- No data is sold or shared with third parties
- Users can revoke Google account access at any time through their Google Account settings

---

## Privacy Policy
The full privacy policy is available here:  
[View Privacy Policy](https://docs.google.com/document/d/1jiw9jxR0KlrMe2Ju2A1XWsRVuh5AFV4AfnbyOx5mnDo/view)

---

## Permissions Explanation
- **storage**: Save user configuration locally
- **identity**: Authenticate the user with Google OAuth
- **activeTab**: Detect activity on LeetCode problem pages
- **notifications**: Notify the user when a problem is logged successfully

---

## Contact
If you have questions or concerns, contact:

**Email:** joshiaarush5@gmail.com
