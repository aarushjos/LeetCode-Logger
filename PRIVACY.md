# Privacy Policy – LeetCode Logger

**Effective Date:** February 9, 2026  
**Last Updated:** February 9, 2026

## Introduction

LeetCode Logger is a Chrome extension that helps users automatically track their LeetCode problem-solving progress by logging solved problems to Google Sheets. This privacy policy explains what data we collect, how we use it, and your rights regarding your data.

## Data We Collect

### 1. Authentication Information

- **Google Account Email Address:** Used for OAuth 2.0 authentication
- **OAuth Access Tokens:** Temporary tokens to access the Google Sheets API
- **OAuth Refresh Tokens:** Used to maintain your signed-in state

### 2. User Preferences

- **Spreadsheet ID:** The ID of your chosen Google Sheet
- **Auto-logging Setting:** Whether auto-logging is enabled or disabled
- **Pending Problems:** Temporarily stored when auto-logging is turned off

### 3. LeetCode Problem Data

- **Problem Name:** Title of the solved problem
- **Difficulty Level:** Easy, Medium, or Hard
- **Topic/Category:** Problem category (e.g., Arrays, Strings)
- **Problem URL:** Direct link to the LeetCode problem
- **User Notes:** Optional notes added when logging problems

## How We Collect Data

- **Google Authentication:** Collected via Google OAuth 2.0 when you sign in
- **LeetCode Pages:** Extracted from the LeetCode website when you solve problems
- **User Input:** Notes and preferences you provide through the extension interface

## How We Use Your Data

Your data is used exclusively for the following purposes:

- **Authentication:** Securely connect you to the Google Sheets API
- **Problem Detection:** Identify when a LeetCode problem is successfully solved
- **Data Logging:** Write problem details to your personal Google Sheet
- **Preference Management:** Remember your settings across browser sessions
- **Notifications:** Inform you when problems are logged or when action is required

### We do NOT use your data for:

- Advertising or marketing
- Tracking your browsing behavior
- Analytics or user profiling
- Any purpose other than the core functionality described above

## Data Storage and Security

### Where Your Data Is Stored

- **OAuth Tokens and Preferences:** Stored locally in your browser using Chrome’s secure storage APIs
- **Problem Data:** Written directly to **your** Google Sheet (you retain full control)
- **No External Servers:** No data is stored, transmitted, or backed up on external servers

### Security Measures

- All communications use HTTPS encryption
- OAuth tokens are managed by Chrome’s built-in identity API
- No passwords are stored or transmitted
- Data flow: **LeetCode → Extension → Your Google Sheet**

## Data Sharing and Third Parties

### We Do NOT Share Your Data

We do not:

- Sell your information
- Share data with third parties for marketing
- Use data for advertising
- Provide data to brokers or analytics companies

### Third-Party Services Used

The extension integrates with the following services:

- **Google Sheets API**  
  Purpose: Write problem data to your spreadsheet  
  Privacy Policy: https://policies.google.com/privacy

- **Google OAuth 2.0**  
  Purpose: Secure authentication  
  Privacy Policy: https://policies.google.com/privacy

- **LeetCode.com**  
  Purpose: Detect solved problems (read-only page access)  
  Note: We do not access your LeetCode account credentials

## Your Rights and Control

### Access Your Data

- All logged problem data lives in **your** Google Sheet
- View or export data anytime from Google Sheets
- OAuth tokens can be viewed in Chrome developer tools

### Modify Your Data

- Edit or delete entries directly in your Google Sheet
- Change auto-logging preferences in the extension
- Update or remove notes at any time

### Delete Your Data

To fully delete your data:

- **Sign out:** Clears OAuth tokens and preferences from local storage
- **Uninstall the extension:** Removes all local extension data
- **Revoke access:** Remove “LeetCode Logger” from Google Account permissions
- **Delete spreadsheet:** Permanently removes all logged problem data

## Data Retention

- **OAuth Tokens:** Retained until you sign out, revoke access, or uninstall
- **User Preferences:** Retained until sign-out or uninstall
- **Problem Data:** Stored indefinitely in your Google Sheet (you control retention)

No data is retained on external servers.

## Permissions Explained

| Permission                   | Why We Need It              | What Is Accessed                  |
| ---------------------------- | --------------------------- | --------------------------------- |
| identity                     | Google OAuth authentication | Google account email for sign-in  |
| storage                      | Save preferences locally    | Settings and spreadsheet ID       |
| activeTab                    | Detect solved problems      | Current LeetCode page (read-only) |
| notifications                | User feedback               | Browser notifications             |
| https://leetcode.com/*       | Monitor problem pages       | Solved problem details            |
| https://www.googleapis.com/* | Sheets API access           | Write data to your spreadsheet    |

All permissions are used strictly for core functionality.

## Children’s Privacy

This extension is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If such data is discovered, please contact us immediately.

## Changes to This Privacy Policy

We may update this policy from time to time. When changes occur:

- The **Last Updated** date will be revised
- Significant changes may be communicated through the extension
- Continued use of the extension constitutes acceptance of the updated policy

## Data Protection and Compliance

This extension is designed to comply with:

- Chrome Web Store Developer Program Policies
- Google API Services User Data Policy
- GDPR principles
- CCPA principles

### GDPR Rights (EU Users)

If you are located in the European Union, you have the right to:

- Access your personal data
- Correct inaccurate data
- Request deletion of data
- Object to data processing
- Request data portability

## Contact Information

For questions or concerns regarding this privacy policy or your data:

- **Email:** joshiaarush5@gmail.com
- **GitHub:** https://github.com/aarushjos/LeetCode-Logger
- **Chrome Web Store:** Not published yet

We aim to respond to all inquiries within 30 days.

## Your Consent

By installing and using **LeetCode Logger**, you acknowledge that you have read and understood this privacy policy and agree to its terms.

To withdraw consent, uninstall the extension and revoke access via your Google Account settings.

## Transparency Commitment

We are committed to transparency and user privacy. This extension:

- Clearly discloses data collection and usage
- Gives users full control over their data
- Avoids unnecessary data collection
- Prioritizes privacy-first design

**Document Version:** 1.0  
**Effective Date:** February 9, 2026
