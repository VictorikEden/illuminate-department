import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

webpush.setVapidDetails("mailto:illuminate@davidschristiancentre.org", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

type Reminder = { type: string; subject: string; title: string; body: string; url: string };
const day = (value: Date) => value.toISOString().slice(0, 10);
const dateDiff = (date: string, now: Date) => Math.ceil((new Date(`${date}T23:59:59`).getTime() - now.getTime()) / 86400000);

Deno.serve(async (request) => {
  if (request.headers.get("x-cron-secret") !== CRON_SECRET) return new Response("Unauthorized", { status: 401 });
  const { data: modules, error } = await db.from("app_modules").select("module,records");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const state = Object.fromEntries((modules ?? []).map((row) => [row.module, row.records ?? []]));
  const now = new Date();
  const reminders: Reminder[] = [];

  for (const member of state.members ?? []) {
    if (!member.birthday) continue;
    const birthday = new Date(`${member.birthday}T00:00:00`);
    const next = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
    if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(next.getFullYear() + 1);
    const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
    if (days === 1 || days === 0) reminders.push({ type: "birthday", subject: member.id, title: days ? "Birthday tomorrow" : "Birthday today", body: `${member.name}'s birthday is ${days ? "tomorrow" : "today"}.`, url: "./#members" });
  }
  for (const activity of state.activities ?? []) {
    const days = dateDiff(activity.date, now);
    if (days === 1 || days === 0) reminders.push({ type: "activity", subject: activity.id, title: days ? "Activity tomorrow" : "Activity today", body: `${activity.title} · ${activity.time || "time not set"} · ${activity.venue || "venue not set"}`, url: "./#activities" });
  }
  for (const contribution of state.contributionTypes ?? []) {
    const days = dateDiff(contribution.due, now);
    if (contribution.status === "Active" && (days === 3 || days === 1 || days === 0)) reminders.push({ type: "contribution", subject: contribution.id, title: "Contribution deadline", body: `${contribution.name} is due ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}.`, url: "./#contributions" });
  }
  for (const design of state.designs ?? []) {
    const days = dateDiff(design.date, now);
    if (days === 3 || days === 1 || days === 0) reminders.push({ type: "design", subject: design.id, title: "Design post reminder", body: `${design.title || "Scheduled design"} is due ${days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`}.`, url: "./#designs" });
  }

  const { data: subscriptions } = await db.from("push_subscriptions").select("id,subscription");
  let sent = 0;
  for (const reminder of reminders) {
    const fingerprint = `${day(now)}:${reminder.type}:${reminder.subject}`;
    const { error: logError } = await db.from("notification_log").insert({ fingerprint, notification_type: reminder.type, subject: reminder.subject });
    if (logError) continue;
    for (const row of subscriptions ?? []) {
      try {
        await webpush.sendNotification(row.subscription, JSON.stringify({ ...reminder, tag: fingerprint }));
        sent++;
      } catch (pushError) {
        const status = (pushError as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }
  return Response.json({ checked: reminders.length, sent });
});
