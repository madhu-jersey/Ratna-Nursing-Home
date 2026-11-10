# Online booking: setup

Bookings run entirely through WhatsApp on **81798 98615** (during testing, **70750 09876**; see `WHATSAPP` in `build/data.mjs`). No email is used. Every request is also saved in a Google Sheet, and approved appointments go on each doctor's Google Calendar.

**Patient (two steps)**
1. Fills in the booking form: name, phone, day and time, and optionally a doctor, department and a note.
2. Taps **Book on WhatsApp**. WhatsApp opens with the request typed out for 81798 98615, and they tap send. At the same moment the website saves the request to the **Appointments** sheet (status *Pending*).

**Reception**
1. A WhatsApp booking arrives. Open the **Pending bookings** page from the reception phone's home screen (step 4 below sets it up).
2. Enter the reception PIN. The phone remembers it after the first time.
3. Tap the new booking (newest is at the top). Check the doctor, date and time, and tap **Approve and add to the calendar**. The row turns *Approved* and the appointment goes on that doctor's calendar.
4. Tap **Send confirmation on WhatsApp**. The chat with the patient opens with the confirmation written; tap send. (Declining offers a ready-written message too.)

The patient's message carries only their details and a request ID, never a link, so patients never see the reception page. The PIN keeps it to reception. WhatsApp chats here are ordinary chats opened from links: there is no WhatsApp Business API, no account to set up with Meta, and no message charge.

It takes about ten minutes. Do it while signed in to the Google account that should **own** the sheet and the doctors' calendars.

## 1. Create the sheet and paste the script

1. Go to [sheets.new](https://sheets.new) to create a blank Google Sheet. Name it *Ratna Nursing Home - Appointments*. (Already done? Use the existing sheet.)
2. In the sheet, open **Extensions > Apps Script**.
3. Delete the old code, paste in everything from [`Code.gs`](Code.gs), and press **Save**.

## 2. Set the reception PIN

1. In Apps Script, open **Project Settings** (the gear on the left).
2. Under **Script properties**, click **Add script property**. Property: `RECEPTION_PIN`. Value: a 6-digit number only reception knows.
3. Click **Save script properties**.

The PIN lives only here, never in the code, because the website's code is public on GitHub. To change it, edit the value; phones that remembered the old PIN ask again.

## 3. Deploy it as a web app

1. Click **Deploy > New deployment** (or, if it is already deployed, **Deploy > Manage deployments**, the pencil, *Version*: **New version**, **Deploy**; the URL stays the same).
2. For a new deployment: click the gear next to *Select type*, choose **Web app**, set **Execute as: Me** and **Who has access: Anyone**. ("Anyone" lets the website save requests and lets reception open the approval link. It does not give anyone access to the sheet.)
3. Click **Deploy**, then **Authorize access**. Google warns that the app is unverified because you wrote it yourself: choose **Advanced > Go to (project name)**, then **Allow**. It asks to edit this spreadsheet and to manage your calendars (for the doctors' appointment calendars).
4. Copy the **Web app URL**. It ends in `/exec`.
5. Open that URL in a browser. It should say **Version 6: reception page, no link for patients**.

## 4. Connect the website

The website already uses `https://script.google.com/macros/s/AKfycby5nvfryN77hhQnPOOInQ4dlVIn1rTB7vC11l4UZhE-xcr3PhbhdliDxU-tStmvDYMu/exec`. If you made a **new** deployment with a different URL, paste it into `BOOKING.endpoint` in [`build/data.mjs`](../build/data.mjs), run `npm run build` and publish the site.

The WhatsApp number on the website is `WHATSAPP` in `build/data.mjs`, and the doctor list is `DOCTORS`. Keep the doctor list in step with `DOCTORS` at the top of `Code.gs`.

## 4b. Put the Pending bookings page on reception's phone

1. On the reception phone, open `https://script.google.com/macros/s/AKfycby5nvfryN77hhQnPOOInQ4dlVIn1rTB7vC11l4UZhE-xcr3PhbhdliDxU-tStmvDYMu/exec?view=reception` in Chrome (or Safari on an iPhone).
2. Enter the PIN. The page lists every booking still waiting for a decision.
3. Add it to the home screen: in Chrome, the three-dot menu, then **Add to Home screen**; in Safari, the Share button, then **Add to Home Screen**. Name it *Bookings*.

From then on, reception taps **Bookings** whenever a WhatsApp booking comes in. Tap **Refresh** on the page to see new ones.

## 5. Share each doctor's calendar

The script makes a calendar for a doctor the first time an appointment is approved for them, named like *Dr. Valluri Amrutha Ratna - Ratna appointments*, in the Google account that runs the script.

1. Approve one test appointment for each doctor (or wait for the first real one), so their calendar exists.
2. Open [Google Calendar](https://calendar.google.com) in that account. Under **My calendars**, point at the doctor's calendar, click the three dots, then **Settings and sharing**.
3. Under **Share with specific people**, add the doctor's Gmail address with **See all event details** (or **Make changes to events** if they will move appointments themselves).
4. The doctor accepts the invitation; the calendar then shows on their phone's Google Calendar app.

To use a calendar a doctor already has instead, put its Calendar ID (from that calendar's **Settings and sharing > Integrate calendar**) in `DOCTOR_CALENDARS` at the top of `Code.gs`, for example `DOCTOR_CALENDARS: { 'Dr. Bikkina Ghana Syam': 'abc123@group.calendar.google.com' }`. The account running the script needs permission to make changes to it.

## 6. Test it

1. On your phone, book on the website with your own name and number, and choose a doctor. Tap **Book on WhatsApp** and send the message.
2. Check a row appears in the **Appointments** tab with status *Pending* and the doctor.
3. On the reception phone, open **Bookings** (the Pending bookings page), enter the PIN, tap your booking, check the details, and tap **Approve and add to the calendar**.
4. Check the row now says *Approved* and *Added to ... calendar*, that the event is in the doctor's calendar at the right time, and that **Send confirmation on WhatsApp** opens a chat with your number and the confirmation written.

## Good to know

- **Changing a booking:** move or delete the event in the doctor's calendar, and tell the patient in the WhatsApp chat. The sheet keeps the record of what was approved.
- **If saving ever fails** (no signal at the moment of booking), the patient's WhatsApp message still has every detail, so reception can book them by hand; that booking just won't be on the Pending bookings page.
- **Spam protection:** the forms include a hidden field that bots fill in and people never see; those requests are ignored. The same request sent twice is saved once.
- **Privacy:** the sheet holds patients' names and phone numbers. Share it only with the staff who handle bookings, and do not make it public. Keep the PIN to reception.
- **Calendar limit:** a normal Gmail account can create about 5,000 calendar events a day, far more than needed.
- **Which version is live?** Open the web app URL in a browser; it shows the version line from the top of `Code.gs`. If it shows an older version, paste the latest `Code.gs` and deploy a **New version** of the existing deployment.
- If the script was made at [script.google.com](https://script.google.com) rather than from inside the sheet, put the sheet's ID in `SHEET_ID` at the top of `Code.gs` (the long code in the sheet's address, between `/d/` and `/edit`). Otherwise it creates its own *Ratna Nursing Home - Appointments* sheet in your Google Drive.
