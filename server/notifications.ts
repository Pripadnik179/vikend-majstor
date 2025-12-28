import { storage } from "./storage";
import { db } from "./db";
import { bookings, items, sentRemindersLog } from "../shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

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

export async function sendNewMessageNotification(receiverId: string, senderName: string, messagePreview: string, conversationId: string) {
  const truncatedPreview = messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview;
  return sendPushNotification(
    receiverId,
    'Nova poruka',
    `${senderName}: ${truncatedPreview}`,
    { type: 'new_message', conversationId }
  );
}

export async function sendBookingReminderNotification(userId: string, itemTitle: string, daysUntil: number, bookingId: string, isOwner: boolean) {
  const title = isOwner ? 'Podsetnik za iznajmljivanje' : 'Podsetnik za rezervaciju';
  const body = daysUntil === 0 
    ? `Danas počinje ${isOwner ? 'iznajmljivanje' : 'vaša rezervacija'} za "${itemTitle}"`
    : `Za ${daysUntil} ${daysUntil === 1 ? 'dan' : 'dana'} počinje ${isOwner ? 'iznajmljivanje' : 'vaša rezervacija'} za "${itemTitle}"`;
  
  return sendPushNotification(
    userId,
    title,
    body,
    { type: 'booking_reminder', bookingId }
  );
}

let isReminderRunning = false;

function getReminderKey(bookingId: string, reminderType: string, sentDate: string): string {
  return `${bookingId}:${reminderType}:${sentDate}`;
}

async function markReminderSent(bookingId: string, reminderType: string, sentDate: string): Promise<boolean> {
  const reminderKey = getReminderKey(bookingId, reminderType, sentDate);
  try {
    await db.insert(sentRemindersLog).values({
      bookingId,
      reminderType,
      sentDate,
      reminderKey,
    });
    return true;
  } catch (err: any) {
    if (err?.code === '23505') {
      console.log(`[REMINDERS] Reminder ${reminderKey} already exists (concurrent insert)`);
      return false;
    }
    console.error('[REMINDERS] Failed to mark reminder as sent:', err);
    return false;
  }
}

export async function sendScheduledReminders() {
  if (isReminderRunning) {
    console.log('[REMINDERS] Reminder job already running, skipping...');
    return { success: false, reason: 'already_running' };
  }
  
  isReminderRunning = true;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const todayStr = today.toISOString().split('T')[0];
    
    const upcomingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          gte(bookings.startDate, today),
          lte(bookings.startDate, dayAfterTomorrow)
        )
      );
    
    console.log(`[REMINDERS] Found ${upcomingBookings.length} upcoming bookings to remind`);
    
    let sentCount = 0;
    for (const booking of upcomingBookings) {
      const item = await storage.getItem(booking.itemId);
      if (!item) continue;
      
      const startDate = new Date(booking.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      let daysUntil = 0;
      if (startDate.getTime() === today.getTime()) {
        daysUntil = 0;
      } else if (startDate.getTime() === tomorrow.getTime()) {
        daysUntil = 1;
      } else {
        continue;
      }
      
      const reminderType = `day_${daysUntil}`;
      
      const claimed = await markReminderSent(booking.id, reminderType, todayStr);
      if (!claimed) {
        console.log(`[REMINDERS] Skipping booking ${booking.id} - reminder already claimed by another process`);
        continue;
      }
      
      try {
        await sendBookingReminderNotification(booking.renterId, item.title, daysUntil, booking.id, false);
        await sendBookingReminderNotification(booking.ownerId, item.title, daysUntil, booking.id, true);
        sentCount++;
        console.log(`[REMINDERS] Sent reminder for booking ${booking.id} (${daysUntil} days until start)`);
      } catch (err) {
        console.error(`[REMINDERS] Failed to send reminder for booking ${booking.id}:`, err);
      }
    }
    
    isReminderRunning = false;
    return { success: true, remindersCount: sentCount };
  } catch (error) {
    console.error('[REMINDERS] Error sending scheduled reminders:', error);
    isReminderRunning = false;
    return { success: false, error };
  }
}
