import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();

  if (!name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const payload = {
    name,
    phone,
    email: String(body.email ?? "").trim(),
    project_type: String(body.projectType ?? "").trim(),
    budget: String(body.budget ?? "").trim(),
    location: String(body.location ?? "").trim(),
    message: String(body.message ?? "").trim(),
    source: String(body.source ?? "Website").trim(),
    utm_source: String(body.utm_source ?? "").trim(),
    utm_medium: String(body.utm_medium ?? "").trim(),
    utm_campaign: String(body.utm_campaign ?? "").trim(),
    utm_term: String(body.utm_term ?? "").trim(),
    utm_content: String(body.utm_content ?? "").trim(),
    utm_adgroup: String(body.utm_adgroup ?? "").trim(),
    utm_matchtype: String(body.utm_matchtype ?? "").trim(),
    utm_device: String(body.utm_device ?? "").trim(),
    utm_ad: String(body.utm_ad ?? "").trim(),
    srd: String(body.srd ?? "").trim(),
    gad_source: String(body.gad_source ?? "").trim(),
    gad_campaignid: String(body.gad_campaignid ?? "").trim(),
    gbraid: String(body.gbraid ?? "").trim(),
    gclid: String(body.gclid ?? "").trim(),
  };

  /* ── 1. Forward to Google Apps Script (leads sheet) ── */
  const gasUrl = process.env.GOOGLE_SCRIPT_URL;
  if (gasUrl) {
    try {
      await fetch(gasUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error("GAS forward failed", err);
    }
  }

  /* ── 2. Forward to internal CRM ── */
  const crmUrl = process.env.CRM_URL;
  const crmApiKey = process.env.CRM_API_KEY;

  if (crmUrl && crmApiKey) {
    try {
      const res = await fetch(`${crmUrl}/api/public/lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": crmApiKey,
        },
        body: JSON.stringify({
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          project: payload.project_type,
          budget: payload.budget,
          location: payload.location,
          message: payload.message,
          source: payload.source,
        }),
      });
      if (!res.ok) {
        console.error("CRM error", res.status, await res.text());
      }
    } catch (err) {
      console.error("CRM fetch failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
