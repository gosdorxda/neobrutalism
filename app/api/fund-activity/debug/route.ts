import { NextRequest, NextResponse } from "next/server";
import { getTelegramUpdates } from "@/lib/telegram";

function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return authHeader === `Bearer ${adminPassword}`;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = (await getTelegramUpdates()) as {
    ok?: boolean;
    result?: Array<Record<string, unknown>>;
  } | null;

  if (!data || !data.ok || !Array.isArray(data.result)) {
    return NextResponse.json({
      ok: false,
      error: "no-updates-or-bot-not-configured",
      hint: "Add the bot to a group as admin, send a message in each topic, then retry.",
    });
  }

  const chats = new Map<
    number,
    { id: number; title: string; topics: Map<number, string> }
  >();

  for (const upd of data.result) {
    const msg = (upd.message || upd.edited_message || upd.channel_post) as
      | {
          chat?: { id: number; title?: string };
          message_thread_id?: number;
          forum_topic_created?: { name?: string };
        }
      | undefined;
    if (!msg?.chat) continue;

    const cid = msg.chat.id;
    if (!chats.has(cid)) {
      chats.set(cid, { id: cid, title: msg.chat.title || String(cid), topics: new Map() });
    }
    const chat = chats.get(cid)!;

    if (msg.message_thread_id != null) {
      const tid = msg.message_thread_id;
      if (!chat.topics.has(tid)) {
        chat.topics.set(tid, msg.forum_topic_created?.name || `Topic ${tid}`);
      } else if (msg.forum_topic_created?.name) {
        chat.topics.set(tid, msg.forum_topic_created.name);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    chats: Array.from(chats.values()).map((c) => ({
      id: c.id,
      title: c.title,
      topics: Array.from(c.topics.entries()).map(([threadId, name]) => ({
        threadId,
        name,
      })),
    })),
  });
}
