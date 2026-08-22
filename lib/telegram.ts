const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const FUND_TOPIC_ID = process.env.TELEGRAM_FUND_TOPIC_ID;
const BATCH_TOPIC_ID = process.env.TELEGRAM_BATCH_TOPIC_ID;

export function isTelegramConfigured() {
  return Boolean(BOT_TOKEN && CHAT_ID);
}

export function telegramConfigSummary() {
  return {
    bot: Boolean(BOT_TOKEN),
    chat: Boolean(CHAT_ID),
    fundTopic: Boolean(FUND_TOPIC_ID),
    batchTopic: Boolean(BATCH_TOPIC_ID),
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
