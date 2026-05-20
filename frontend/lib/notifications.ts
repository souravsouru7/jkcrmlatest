"use client";

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { LocalNotifications } from "@capacitor/local-notifications";

export async function registerPushNotifications(
  onToken?: (token: string) => void,
  onNotification?: (data: unknown) => void
) {
  if (!Capacitor.isNativePlatform()) return;

  const permission = await PushNotifications.requestPermissions();
  if (permission.receive !== "granted") return;

  await PushNotifications.register();

  PushNotifications.addListener("registration", ({ value }) => {
    onToken?.(value);
  });

  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    onNotification?.(notification);
  });

  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    onNotification?.(action);
  });
}

let notifId = 1;

export async function scheduleLocalNotification({
  title,
  body,
  delaySeconds = 0,
}: {
  title: string;
  body: string;
  delaySeconds?: number;
}) {
  if (!Capacitor.isNativePlatform()) {
    console.info(`[Notification] ${title}: ${body}`);
    return;
  }

  const { display } = await LocalNotifications.checkPermissions();
  if (display !== "granted") {
    const result = await LocalNotifications.requestPermissions();
    if (result.display !== "granted") return;
  }

  const at = new Date(Date.now() + delaySeconds * 1000);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: notifId++,
        title,
        body,
        schedule: { at },
        sound: undefined,
        smallIcon: "ic_stat_icon_config_sample",
        iconColor: "#0d9488",
      },
    ],
  });
}

export async function notifyFollowUpDue(leadName: string, followUpType: string) {
  await scheduleLocalNotification({
    title: "Follow-up Due",
    body: `${followUpType} due for ${leadName}`,
  });
}

export async function notifyNewLead(leadName: string) {
  await scheduleLocalNotification({
    title: "New Lead",
    body: `${leadName} just submitted an enquiry`,
  });
}

export async function notifySiteVisitReminder(leadName: string, address: string) {
  await scheduleLocalNotification({
    title: "Site Visit Today",
    body: `${leadName} — ${address}`,
  });
}
