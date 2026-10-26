# Online booking: setup

The booking form and the popup send each request to a small Google Apps Script that lives inside a Google Sheet. It:

1. Adds the request as a row in the **Appointments** sheet (status *Pending*).
2. Emails the hospital the details with a **Review and approve** button.
3. Emails the patient that the request is received and **waiting for confirmation**.
4. When the hospital approves (choosing the date and time), updates the row to *Approved* and emails the patient the **confirmation**. Declining emails the patient to call reception.

The sheet can be downloaded as Excel at any time (File > Download > Microsoft Excel), and every hospital email has a "download as Excel" link.

It takes about ten minutes. Do it while signed in to the Google account that should **send** the emails and **own** the sheet. For testing, that is `venkatamadhupinnana@gmail.com`. New requests are delivered to `HOSPITAL_EMAIL` in the script, which can be a different inbox.

## 1. Create the sheet and paste the script

1. Go to [sheets.new](https://sheets.new) to create a blank Google Sheet. Name it *Ratna Nursing Home - Appointments*.
2. In the sheet, open **Extensions > Apps Script**.
3. Delete the sample code, paste in everything from [`Code.gs`](Code.gs), and press **Save**.

## 2. Deploy it as a web app

1. In Apps Script, click **Deploy > New deployment**.
2. Click the gear next to *Select type* and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**. ("Anyone" lets the website send requests. It does not give anyone access to the sheet.)
4. Click **Deploy**, then **Authorize access**. Google warns that the app is unverified because you wrote it yourself: choose **Advanced > Go to (project name)**, then **Allow**. It asks to send email as you and to edit this spreadsheet.
5. Copy the **Web app URL**. It ends in `/exec`.

## 3. Connect the website

1. Open [`build/data.mjs`](../build/data.mjs) and paste the URL into `BOOKING.endpoint`:
   ```js
   export const BOOKING = {
     endpoint: 'https://script.google.com/macros/s/XXXXXXXX/exec',
     popupDelay: 20
   };
   ```
2. Run `npm run build` and publish the site as usual.

## 4. Test it

1. Submit the form on the website with your own email address.
2. Check that a row appears in the **Appointments** tab (with status *Pending*), that the hospital inbox (`HOSPITAL_EMAIL`, currently `madhujersey9999@gmail.com`) got the "New appointment request" email, and that you got the "to be confirmed" email.
3. In the hospital email, click **Review and approve**, set a date and time, and click **Approve and email the patient**.
4. Check that the row now says *Approved* with the date and time, and that the confirmation email arrived.

Emails can land in Spam the first few times. Marking them "Not spam" helps.

## Going live

- In `Code.gs`, change `HOSPITAL_EMAIL` to the hospital's own address. Check `HOSPITAL_PHONE`, `HOSPITAL_ADDRESS` and `OPD_HOURS` too.
- After any change to the script: **Deploy > Manage deployments**, click the pencil, set *Version* to **New version**, and **Deploy**. The URL stays the same, so the website does not need rebuilding.
- The popup appears once per visit on the home page: when the visitor scrolls half a screen down, it waits 1.5 seconds and slides in (not while they are filling in the booking form). It does not come back in a visit where they have already sent a request. Adjust `popupScroll` and `popupDelay` in `build/data.mjs`.

## Which version is live?

Open the web app URL in a browser. It shows the version line from the top of `Code.gs`, for example **Version 2: 30-minute time slots, Sunday check**. If it shows no version line, that URL is still running older code: paste the latest `Code.gs` into the project that owns that URL and deploy a **New version** of the existing deployment.

If the script was made at [script.google.com](https://script.google.com) rather than from inside the sheet, put the sheet's ID in `SHEET_ID` at the top of `Code.gs` (the long code in the sheet's address, between `/d/` and `/edit`). Otherwise it creates its own *Ratna Nursing Home - Appointments* sheet in your Google Drive.

## Good to know

- **Daily limit:** a normal Gmail account can send about 100 emails a day from a script; Google Workspace accounts get about 1,500. Each request uses 2 emails, plus 1 when it is approved or declined.
- **Privacy:** the sheet holds patients' names, phone numbers and emails. Share it only with the staff who handle bookings, and do not make it public.
- **Spam protection:** the forms include a hidden field that bots fill in and people never see; those requests are ignored.
- **Only the email button can approve.** Each request has a secret link, and approving needs a click on the review page, so email virus-scanners that open links cannot approve anything by themselves.
