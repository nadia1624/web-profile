'use client';

import { useState, useTransition } from 'react';
import { 
  getContactMessages, 
  markContactMessageAsRead, 
  deleteContactMessage 
} from '@/actions/contact';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  Clock, 
  User, 
  MessageSquare,
  Search,
  CheckCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface ContactMessagesManagerProps {
  initialMessages: ContactMessageItem[];
}

export default function ContactMessagesManager({ initialMessages }: ContactMessagesManagerProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredMessages = messages.filter((msg) =>
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (msg.subject && msg.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    msg.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMessage = (msg: ContactMessageItem) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      startTransition(async () => {
        await markContactMessageAsRead(msg.id);
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m))
        );
        router.refresh();
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Hapus pesan dari ${name}?`)) {
      startTransition(async () => {
        const res = await deleteContactMessage(id);
        if (res.success) {
          setMessages((prev) => prev.filter((m) => m.id !== id));
          if (selectedMessage?.id === id) {
            setSelectedMessage(null);
          }
          router.refresh();
        }
      });
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-purple-500" />
            Pesan Masuk (Inbox)
          </h1>
          <p className="text-muted-foreground text-xs mt-1">
            Daftar pesan pengunjung dari formulir kontak website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold border border-purple-500/20">
            {unreadCount} Belum Dibaca
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium border border-border">
            Total {messages.length} Pesan
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pesan berdasarkan nama, email, subjek..."
          className="w-full bg-card border border-border rounded-xl pl-11 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-purple-500 transition-all"
        />
      </div>

      {/* Main Grid: Messages List & Reader Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List Column */}
        <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl text-muted-foreground">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-xs">Tidak ada pesan ditemukan.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;

              return (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-purple-600/10 border-purple-500/50 shadow-md'
                      : !msg.isRead
                      ? 'bg-card border-purple-500/30 hover:border-purple-500/50'
                      : 'bg-card/50 border-border hover:border-border/80 opacity-80'
                  }`}
                >
                  {!msg.isRead && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-foreground truncate">{msg.name}</h3>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(msg.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-[11px] text-purple-500 light:text-purple-700 font-semibold truncate mt-0.5">
                    {msg.email}
                  </p>

                  {msg.subject && (
                    <p className="text-xs font-medium text-foreground/90 truncate mt-1">
                      {msg.subject}
                    </p>
                  )}

                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Reader Pane Column */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-border space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-500">
                    Pesan Pengunjung
                  </span>
                  <h2 className="text-lg font-bold font-heading text-foreground">
                    {selectedMessage.subject || 'Tanpa Subjek'}
                  </h2>
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id, selectedMessage.name)}
                  className="self-start sm:self-auto p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>

              {/* Sender Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-secondary/50 p-4 rounded-xl border border-border/60 text-xs">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Nama:</span>
                    <strong className="text-foreground">{selectedMessage.name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-purple-500 shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Email:</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-purple-500 hover:underline font-semibold">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:col-span-2">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Waktu Dikirim:</span>
                    <span className="text-foreground">
                      {new Date(selectedMessage.createdAt).toLocaleString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} WIB
                    </span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                  Isi Pesan:
                </span>
                <div className="p-5 rounded-xl bg-secondary/30 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-border flex justify-end">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Portfolio Inquiry')}`}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Balas via Email ({selectedMessage.email})
                </a>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-border text-center text-muted-foreground">
              <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-base font-bold text-foreground">Pilih Pesan</h3>
              <p className="text-xs mt-1">Klik salah satu pesan di sebelah kiri untuk membaca isi pesan secara lengkap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
