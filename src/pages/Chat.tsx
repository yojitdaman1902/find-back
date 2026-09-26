import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Inbox, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell, Eyebrow, GlassCard, PrimaryButton } from "@/components/findback-ui";
import { useSessionContext } from "@/components/SessionContextProvider";
import { loadChatConversations, loadChatMessages, sendChatMessage, type ChatConversation, type ChatMessage } from "@/lib/findback-data";

function formatDate(value?: string) {
  if (!value) return "No messages yet";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

function ConversationList({ conversations, selectedId, onSelect }: { conversations: ChatConversation[]; selectedId?: string; onSelect: (id: string) => void }) {
  return <div className="space-y-2">
    {conversations.map((conversation) => <button key={conversation.id} onClick={() => onSelect(conversation.id)} className={`w-full rounded-2xl border p-4 text-left transition ${conversation.id === selectedId ? "border-blue-300/35 bg-blue-300/[0.12]" : "border-white/[0.08] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"}`}>
      <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300"><MessageCircle className="size-4" /></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-3"><span className="truncate font-semibold text-white">{conversation.itemName}</span><span className="shrink-0 text-[10px] text-slate-600">{formatDate(conversation.lastMessageAt)}</span></span><span className="mt-1 block text-xs text-slate-500">{conversation.finderFirstName ? `Chat with ${conversation.finderFirstName}` : "Verified handoff chat"}</span><span className="mt-2 block truncate text-sm text-slate-400">{conversation.lastMessage ?? "Start the handoff conversation"}</span></span></div>
    </button>)}
  </div>;
}

function ConversationPanel({ conversation }: { conversation: ChatConversation }) {
  const { session } = useSessionContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const senderId = session?.user.id ?? "demo-owner";

  useEffect(() => {
    setLoading(true);
    loadChatMessages(conversation.id).then(setMessages).finally(() => setLoading(false));
  }, [conversation.id]);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const created = await sendChatMessage(conversation.id, message, senderId);
    if (created) {
      setMessages((current) => [...current, created]);
      setMessage("");
    }
    setSending(false);
  };

  return <GlassCard className="flex min-h-[32rem] flex-col overflow-hidden border-emerald-300/15">
    <div className="border-b border-white/[0.08] bg-emerald-300/[0.05] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300"><MessageCircle className="size-5" /></span><div><div className="flex items-center gap-2"><h2 className="font-semibold text-white">{conversation.itemName}</h2><span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200"><CheckCircle2 className="size-3" /> Verified</span></div><p className="mt-1 text-xs text-slate-500">{conversation.finderFirstName ? `Secure chat with ${conversation.finderFirstName}` : "Secure handoff conversation"}</p></div></div></div>
    <div className="flex-1 space-y-3 overflow-y-auto p-5 sm:p-6">{loading ? <p className="text-sm text-slate-500">Loading secure messages…</p> : messages.length === 0 ? <div className="grid min-h-52 place-items-center rounded-2xl border border-dashed border-white/10 p-8 text-center"><div><MessageCircle className="mx-auto size-7 text-slate-600" /><p className="mt-3 text-sm text-slate-400">Start the handoff conversation.</p><p className="mt-1 text-xs text-slate-600">Only verified participants can read this chat.</p></div></div> : messages.map((item) => <div key={item.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${item.senderUserId === senderId ? "ml-auto bg-blue-400/15 text-blue-50" : "bg-white/[0.06] text-slate-300"}`}><p>{item.body}</p><p className="mt-1 text-[10px] text-slate-500">{formatDate(item.createdAt)}</p></div>)}</div>
    <div className="border-t border-white/[0.08] p-4"><div className="flex items-end gap-2"><textarea aria-label="Message" value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Write a handoff message…" className="field-input min-h-12 resize-none" rows={2} /><PrimaryButton aria-label="Send message" disabled={!message.trim() || sending} onClick={send} className="size-12 shrink-0 rounded-2xl p-0"><Send className="size-4" /></PrimaryButton></div><p className="mt-2 text-[10px] text-slate-600">Press Enter to send · Shift + Enter for a new line</p></div>
  </GlassCard>;
}

export default function Chat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const selectedConversation = useMemo(() => conversations.find((conversation) => conversation.id === selectedId), [conversations, selectedId]);

  useEffect(() => {
    loadChatConversations().then((items) => {
      setConversations(items);
      setSelectedId(items[0]?.id);
    }).finally(() => setLoading(false));
  }, []);

  return <AppShell><div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16"><Link to="/dashboard" className="mb-9 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"><ArrowLeft className="size-4" /> Back to My Activity</Link><div className="mb-10"><Eyebrow icon={MessageCircle}>Your conversations</Eyebrow><h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.055em] text-white sm:text-5xl">Chat, without giving away your contact details.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Keep every verified handoff conversation in one place. Messages are only available to the people verified for that item.</p></div>{loading ? <GlassCard className="p-10 text-center"><p className="text-sm text-slate-500">Loading your conversations…</p></GlassCard> : conversations.length === 0 ? <GlassCard className="grid min-h-80 place-items-center p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-300/10 text-blue-200"><Inbox className="size-6" /></span><h2 className="mt-5 text-xl font-semibold text-white">No conversations yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Once ownership is verified for a found item, your secure handoff chats will appear here.</p><Link to="/found-items" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300/30 hover:bg-white/[0.06]">Browse found items</Link></div></GlassCard> : <div className="grid gap-5 lg:grid-cols-[minmax(18rem,.75fr)_minmax(0,1.25fr)]"><GlassCard className="p-3 sm:p-4"><div className="mb-3 flex items-center justify-between px-2"><div><p className="text-sm font-semibold text-white">Previous chats</p><p className="mt-1 text-xs text-slate-600">{conversations.length} verified {conversations.length === 1 ? "conversation" : "conversations"}</p></div><ShieldCheck className="size-4 text-emerald-300" /></div><ConversationList conversations={conversations} selectedId={selectedId} onSelect={setSelectedId} /></GlassCard>{selectedConversation && <ConversationPanel conversation={selectedConversation} />}</div>}</div></AppShell>;
}

