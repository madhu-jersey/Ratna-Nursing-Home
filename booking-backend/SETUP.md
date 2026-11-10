# Online booking: setup

Bookings run through WhatsApp on **81798 98615**, with every request also saved in a Google Sheet and approved appointments placed on each doctor's Google Calendar.

1. The patient fills in the booking form (name, phone, day, time, and optionally doctor, department, email and a note).
2. The form sends the request to a small Google Apps Script that lives inside a Google Sheet. It adds a row to the **Appointments** sheet (status *Pending*) and emails the hospital the details, with a **Review and approve** button and a link to open a WhatsApp chat with the patient. If the patient gave an email, they get a "received, to be confirmed" email too.
3. The website then shows **Send on WhatsApp**, which opens a chat with 81798 98615 with the whole request already typed. Reception sees it in WhatsApp as usual.
4. Reception opens **Review and approve**, sets the date, time and **doctor**, and approves. The row turns *Approved*, the appointment goes on **that doctor's Google Calendar**, and the page shows **Send confirmation on WhatsApp**, which opens a chat with the patient and the confirmation already written. (Patients who gave an email also get it by email.) Declining offers a ready-written WhatsApp message too.

WhatsApp messages here are ordinary chats opened from links, so there is no WhatsApp Business API account and no message charge. If the online service is ever unreachable, the website still offers **Send on WhatsApp**, so no booking is lost.

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
4. Click **Deploy**, then **Authorize access**. Google warns that the app is unverified because you wrote it yourself: choose **Advanced > Go to (project name)**, then **Allow**. It asks to send email as you, to edit this spreadsheet, and to manage your calendars (for the doctors' appointment calendars).
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

## 4. Share each doctor's calendar

The script makes a calendar for a doctor the first time an appointment is approved for them, named like *Dr. Valluri Amrutha Ratna - Ratna appointments*, in the Google account that runs the script.

1. Approve one test appointment for each doctor (or wait for the first real one), so their calendar exists.
2. Open [Google Calendar](https://calendar.google.com) in that account. Under **My calendars**, point at the doctor's calendar, click the three dots, then **Settings and sharing**.
3. Under **Share with specific people**, add the doctor's Gmail address with **See all event details** (or **Make changes to events** if they will move appointments themselves).
4. The doctor accepts the invitation; the calendar then shows on their phone's Google Calendar app.

To use a calendar a doctor already has instead, put its Calendar ID (from that calendar's **Settings and sharing > Integrate calendar**) in `DOCTOR_CALENDARS` at the top of `Code.gs`, for example `DOCTOR_CALENDARS: { 'Dr. Bikkina Ghana Syam': 'abc123@group.calendar.google.com' }`. The account running the script needs permission to make changes to it.

## 5. Test it

1. On your phone, submit the form on the website with your own number, and choose a doctor.
2. Tap **Send on WhatsApp** and check the chat to 81798 98615 opens with your details typed in.
3. Check that a row appears in the **Appointments** tab (status *Pending*, with the doctor), and that the hospital inbox (`HOSPITAL_EMAIL`, currently `madhujersey9999@gmail.com`) got the "New appointment request" email.
4. In that email, click **Review and approve**, check the date, time and doctor, and click **Approve and add to the calendar**.
5. Check that the row now says *Approved* and *Added to ... calendar*, that the event is in the doctor's calendar at the right time, and that **Send confirmation on WhatsApp** opens a chat with your number and the confirmation written.

Emails can land in Spam the first few times. Marking them "Not spam" helps.

## Going live

- In `Code.gs`, change `HOSPITAL_EMAIL` to the hospital's own address. Check `HOSPITAL_PHONE`, `HOSPITAL_ADDRESS`, `OPD_HOURS`, `WHATSAPP_NUMBER` and `DOCTORS` too. The WhatsApp number on the website is `WHATSAPP` in `build/data.mjs`, and the doctor list there is `DOCTORS`; keep both files in step.
- This version (4) adds two columns at the end of the sheet, **Doctor** and **Calendar event**. An existing sheet gets them on the next request; earlier rows are not moved.
- After any change to the script: **Deploy > Manage deployments**, click the pencil, set *Version* to **New version**, and **Deploy**. The URL stays the same, so the website does not need rebuilding.
- The popup appears once per visit on the home page: when the visitor scrolls half a screen down, it waits 1.5 seconds and slides in (not while they are filling in the booking form). It does not come back in a visit where they have already sent a request. Adjust `popupScroll` and `popupDelay` in `build/data.mjs`.

## Which version is live?

Open the web app URL in a browser. It shows the version line from the top of `Code.gs`, for example **Version 2: 30-minute time slots, Sunday check**. If it shows no version line, that URL is still running older code: paste the latest `Code.gs` into the project that owns that URL and deploy a **New version** of the existing deployment.

If the script was made at [script.google.com](https://script.google.com) rather than from inside the sheet, put the sheet's ID in `SHEET_ID` at the top of `Code.gs` (the long code in the sheet's address, between `/d/` and `/edit`). Otherwise it creates its own *Ratna Nursing Home - Appointments* sheet in your Google Drive.

## Good to know

- **Daily limit:** a normal Gmail account can send about 100 emails a day from a script; Google Workspace accounts get about 1,500. Each request uses 1 email to the hospital, plus 1 to the patient for each step when they gave an email. A normal Gmail account can also create about 5,000 calendar events a day, far more than needed.
- **WhatsApp:** the website and the approval page only open chats with the message written in; a person taps send each time. Nothing is sent automatically, so there is no WhatsApp cost or account to set up.
- **Privacy:** the sheet holds patients' names, phone numbers and emails. Share it only with the staff who handle bookings, and do not make it public.
- **Spam protection:** the forms include a hidden field that bots fill in and people never see; those requests are ignored.
- **Only the email button can approve.** Each request has a secret link, and approving needs a click on the review page, so email virus-scanners that open links cannot approve anything by themselves.
