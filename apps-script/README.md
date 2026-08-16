# Contact form → Google Sheet

## What this is for

The contact form on the portfolio used to call `setTimeout`, show a success tick
and throw the message away. Every enquiry anyone typed was lost, while they were
told it had arrived.

`ContactForm.gs` gives it somewhere real to land: a row in a Google Sheet you
own, plus an email notification so you do not have to remember to check.

## Setup (about 5 minutes)

1. **Create the Sheet.** New Google Sheet, name it something like
   `Portfolio Enquiries`. Copy its ID from the URL — the long string between
   `/d/` and `/edit`.
2. **script.google.com → New project.** Paste in the contents of
   `ContactForm.gs`.
3. **Fill in the two values at the top:** `SHEET_ID` and `NOTIFY_EMAIL`.
4. **Deploy → New deployment → Web app**
   - **Execute as: Me**
   - **Who has access: Anyone**
5. Authorise it. The "Google hasn't verified this app" warning is expected for
   your own unpublished script — Advanced → Go to (project) → Allow.
6. Copy the `/exec` URL.
7. In Vercel, set `VITE_CONTACT_ENDPOINT` to that URL, then redeploy. It is a
   build-time variable, so it needs a rebuild rather than just a restart.

## Checking it works

Open the `/exec` URL in a browser. It should return
`{"ok":true,"service":"portfolio-contact-form"}` — that confirms the deployment
without sending anything.

Then submit the real form and look for the row in the Sheet.

## Until it is configured

With `VITE_CONTACT_ENDPOINT` unset, the form does **not** pretend to send. It
tells the visitor it is not connected and shows the email address instead. That
is deliberate: a form that admits it is not wired up is much better than one that
quietly loses people.

## On security

The endpoint is public, which is unavoidable for a form anyone can use. What
keeps it safe is that it can only ever do one thing: append to your sheet and
mail your address. Neither destination is a parameter, so there is nothing for a
caller to redirect. The rate limit (20 an hour) is what stops it being used to
flood your inbox.
