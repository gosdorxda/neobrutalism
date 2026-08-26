const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FUND_TOPIC_ID = process.env.TELEGRAM_FUND_TOPIC_ID;
const BATCH_TOPIC_ID = process.env.TELEGRAM_BATCH_TOPIC_ID;
const FEEDING_PROOF_TOPIC_ID = process.env.TELEGRAM_FEEDING_PROOF_TOPIC_ID;

export function isTelegramConfigured() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

export function telegramConfigSummary() {
  return {
    bot: Boolean(BOT_TOKEN),
    chat: Boolean(CHAT_ID),
    fundTopic: Boolean(FUND_TOPIC_ID),
    batchTopic: Boolean(BATCH_TOPIC_ID),
    feedingProofTopic: Boolean(FEEDING_PROOF_TOPIC_ID),
  };
}

type SendResult = { ok: boolean; messageId: number | null; error?: string };

async function sendTo(
  threadId: string | undefined,
  text: string
): Promise<SendResult> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, messageId: null, error: "telegram-not-configured" };
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          message_thread_id: threadId,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data?.ok) {
      return { ok: true, messageId: data.result.message_id };
    }
    return { ok: false, messageId: null, error: data?.description || "send-failed" };
  } catch (e) {
    return { ok: false, messageId: null, error: String(e) };
  }
}

export function sendFundMessage(text: string) {
  return sendTo(FUND_TOPIC_ID, text);
}

export function sendBatchMessage(text: string) {
  return sendTo(BATCH_TOPIC_ID, text);
}

export function sendFeedingProofMessage(text: string) {
  return sendTo(FEEDING_PROOF_TOPIC_ID, text);
}

export async function sendMediaGroupTo(
  threadId: string | undefined,
  photoPaths: string[],
  caption: string
): Promise<SendResult> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, messageId: null, error: "telegram-not-configured" };
  }
  if (photoPaths.length === 0) {
    return { ok: false, messageId: null, error: "no-photos" };
  }

  try {
    const limited = photoPaths.slice(0, 10);
    const { readPhotoFile } = await import("./photo-helper");

    type Readable = { url: string; blob: Blob | null; fieldName: string };
    const readable: Readable[] = [];

    for (let i = 0; i < limited.length; i++) {
      const photoPath = limited[i];
      if (photoPath.startsWith("http")) {
        readable.push({ url: photoPath, blob: null, fieldName: `photo${i}` });
      } else {
        const blob = readPhotoFile(photoPath);
        if (blob) {
          readable.push({ url: photoPath, blob, fieldName: `photo${i}` });
        }
      }
    }

    if (readable.length === 0) {
      return { ok: false, messageId: null, error: "no-readable-photos" };
    }

    // Single readable photo — use sendPhoto instead (sendMediaGroup needs 2+)
    if (readable.length === 1) {
      return sendSinglePhoto(threadId, readable[0], caption);
    }

    // Multiple readable photos — use sendMediaGroup
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    if (threadId) formData.append("message_thread_id", threadId);

    const media: Array<{
      type: string;
      media: string;
      caption?: string;
      parse_mode?: string;
    }> = [];

    for (let i = 0; i < readable.length; i++) {
      const item = readable[i];
      if (item.blob) {
        formData.append(item.fieldName, item.blob, item.fieldName);
        media.push({
          type: "photo",
          media: `attach://${item.fieldName}`,
          ...(i === 0 ? { caption, parse_mode: "HTML" } : {}),
        });
      } else {
        media.push({
          type: "photo",
          media: item.url,
          ...(i === 0 ? { caption, parse_mode: "HTML" } : {}),
        });
      }
    }

    formData.append("media", JSON.stringify(media));

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMediaGroup`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data?.ok) {
      return {
        ok: true,
        messageId: data.result?.[0]?.message_id ?? null,
      };
    }
    return {
      ok: false,
      messageId: null,
      error: data?.description || "send-failed",
    };
  } catch (e) {
    return { ok: false, messageId: null, error: String(e) };
  }
}

async function sendSinglePhoto(
  threadId: string | undefined,
  item: { url: string; blob: Blob | null; fieldName: string },
  caption: string
): Promise<SendResult> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, messageId: null, error: "telegram-not-configured" };
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    if (threadId) formData.append("message_thread_id", threadId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");

    if (item.blob) {
      formData.append("photo", item.blob, item.fieldName);
    } else {
      formData.append("photo", item.url);
    }

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data?.ok) {
      return { ok: true, messageId: data.result?.message_id ?? null };
    }
    return {
      ok: false,
      messageId: null,
      error: data?.description || "send-failed",
    };
  } catch (e) {
    return { ok: false, messageId: null, error: String(e) };
  }
}

export async function sendPhotoTo(
  threadId: string | undefined,
  photoPath: string,
  caption: string
): Promise<SendResult> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, messageId: null, error: "telegram-not-configured" };
  }

  try {
    const formData = new FormData();
    formData.append("chat_id", CHAT_ID);
    if (threadId) formData.append("message_thread_id", threadId);
    formData.append("caption", caption);
    formData.append("parse_mode", "HTML");

    if (photoPath.startsWith("http")) {
      formData.append("photo", photoPath);
    } else {
      const { readPhotoFile } = await import("./photo-helper");
      const blob = readPhotoFile(photoPath);
      if (!blob) {
        return { ok: false, messageId: null, error: "photo-not-found" };
      }
      formData.append("photo", blob, "receipt");
    }

    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data?.ok) {
      return { ok: true, messageId: data.result?.message_id ?? null };
    }
    return {
      ok: false,
      messageId: null,
      error: data?.description || "send-failed",
    };
  } catch (e) {
    return { ok: false, messageId: null, error: String(e) };
  }
}

export async function editMessage(
  messageId: number,
  text: string
): Promise<SendResult> {
  if (!BOT_TOKEN || !CHAT_ID) {
    return { ok: false, messageId: null, error: "telegram-not-configured" };
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          message_id: messageId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (data?.ok) {
      return { ok: true, messageId };
    }
    return { ok: false, messageId: null, error: data?.description || "edit-failed" };
  } catch (e) {
    return { ok: false, messageId: null, error: String(e) };
  }
}

export async function getTelegramUpdates(): Promise<unknown> {
  if (!BOT_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`,
      { cache: "no-store" }
    );
    return await res.json();
  } catch {
    return null;
  }
}
