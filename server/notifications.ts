import { storage } from "./storage";

interface ExpoPushMessage {
  to: string;
  sound?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(userId: string, title: string, body: string, data?: Record<string, unknown>) {
  try {
    const user = await storage.getUser(userId);
    if (!user?.pushToken) {
      console.log(`No push token for user ${userId}, skipping notification`);
      return { success: false, reason: 'no_push_token' };
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log(`Push notification sent to user ${userId}:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`Failed to send push notification to user ${userId}:`, error);
    return { success: false, error };
  }
}

export async function sendBookingRequestNotification(ownerId: string, renterName: string, itemTitle: string, bookingId: string) {
  return sendPushNotification(
    ownerId,
    'Nova rezervacija!',
    `${renterName} želi da rezerviše "${itemTitle}"`,
    { type: 'booking_request', bookingId }
  );
}

export async function sendBookingRequestConfirmationToRenter(renterId: string, itemTitle: string, bookingId: string) {
  return sendPushNotification(
    renterId,
    'Zahtev poslat',
    `Vaš zahtev za "${itemTitle}" je uspešno poslat vlasniku`,
    { type: 'booking_request_sent', bookingId }
  );
}

export async function sendBookingConfirmedNotification(renterId: string, itemTitle: string, ownerName: string, bookingId: string) {
  return sendPushNotification(
    renterId,
    'Rezervacija potvrđena!',
    `${ownerName} je potvrdio vašu rezervaciju za "${itemTitle}"`,
    { type: 'booking_confirmed', bookingId }
  );
}

export async function sendBookingCancelledNotification(userId: string, itemTitle: string, bookingId: string) {
  return sendPushNotification(
    userId,
    'Rezervacija otkazana',
    `Rezervacija za "${itemTitle}" je otkazana`,
    { type: 'booking_cancelled', bookingId }
  );
}
