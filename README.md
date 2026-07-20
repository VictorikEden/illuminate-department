# Illuminate Department Management System

A responsive, database-free management application for the Illuminate Department of David's Christian Center.

## Use locally

Open `index.html` in a modern browser. Records are saved only in that browser. Use **Backup** regularly and **Restore** when moving to another browser or device.

## Publish with GitHub Pages

1. Create a GitHub repository and upload all files from this folder.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.

No build step is required.

## Enable shared Supabase data

1. Open your Supabase project and select **SQL Editor**.
2. Create a new query, paste the complete contents of `supabase-schema.sql`, and click **Run**.
3. Under **Authentication → URL Configuration**, add your final GitHub Pages address as the Site URL and an allowed redirect URL.
4. Publish these files to GitHub Pages, open the site, and create the first department leader account.
5. If email confirmation is enabled, confirm the message Supabase sends before signing in.

The first authenticated session automatically uploads the existing LocalStorage records when the cloud table is empty. Later changes synchronize for every signed-in leader. LocalStorage remains an offline fallback.

For a closed department workspace, disable public sign-ups in Supabase after all leaders have registered, or invite/manage users from the Supabase dashboard.

## Enable device push notifications

1. Run the updated `supabase-schema.sql` again in the Supabase SQL Editor. It safely adds the notification tables without removing existing data.
2. In **Edge Functions**, create a function named `send-reminders` and use `supabase/functions/send-reminders/index.ts` as its source. Disable JWT verification for this function because it is protected by the separate `CRON_SECRET` header.
3. Add the three values from the separately delivered `SUPABASE_NOTIFICATION_SECRETS.txt` file under **Edge Functions → Secrets**. Never upload that secrets file to GitHub.
4. Deploy the function.
5. Under **Integrations → Cron**, create an hourly HTTP job:
   - Method: `POST`
   - URL: `https://kfeiwfvmvppepehywcgw.supabase.co/functions/v1/send-reminders`
   - Header: `x-cron-secret` with the supplied `CRON_SECRET` value
   - Body: `{}`
6. Publish the updated GitHub Pages files. Each leader can then open their account menu and choose **Enable** under Device notifications.

Notification subscriptions are per browser/device. On iPhone or iPad, install the PWA from Safari before enabling notifications.

If an iPhone previously displayed “the string did not match the expected pattern,” publish the latest app files, remove the old Home Screen copy, open the GitHub Pages site in Safari, and use **Add to Home Screen** again. Web Push requires iOS/iPadOS 16.4 or later.

The top-bar notification bell opens the in-app Notification Center. It lists upcoming birthdays, activities, contribution deadlines, and design post dates. Read status is kept on each device. The app remains installable from the browser's normal **Install app** or **Add to Home Screen** command; no installation button is shown in the app navigation.

## Enable shared design-file storage

Run the latest `supabase-schema.sql` again in the SQL Editor. It creates a private `design-files` Storage bucket and policies that permit authenticated department leaders to upload, download, replace, and delete files. Existing database records are preserved.

Design files are private: downloading requires a signed-in Supabase session. The bucket accepts files up to 50 MB. The Designs page stores the file path, original filename, content type, and size alongside the existing design record.

## Data and exports

- Browser persistence uses local storage.
- JSON backup includes all app records.
- Member records export as CSV.
- Meeting agendas and work rosters open a clean A4 landscape print view for browser printing/PDF and can download as PNG or JPG.

For privacy, do not use real sensitive member information on a shared computer.
