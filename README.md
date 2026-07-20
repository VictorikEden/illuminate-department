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

## Data and exports

- Browser persistence uses local storage.
- JSON backup includes all app records.
- Member records export as CSV.
- Meeting agendas and work rosters open a clean A4 landscape print view for browser printing/PDF and can download as PNG or JPG.

For privacy, do not use real sensitive member information on a shared computer.
