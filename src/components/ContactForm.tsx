'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    setStatus('loading');
    try {
      // 1. Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 2. Direct mailto launch to target email address: nadyadearihanifah@gmail.com
      const mailtoUrl = `mailto:nadyadearihanifah@gmail.com?subject=${encodeURIComponent(
        formData.subject || `Portfolio Message from ${formData.name}`
      )}&body=${encodeURIComponent(
        `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
      )}`;

      window.location.href = mailtoUrl;

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMessage('Failed to send message. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col items-center justify-center py-12 sm:py-16"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/10 border border-emerald-500/35 text-emerald-500 flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground">Message Ready to Send!</h3>
        <p className="text-muted-foreground text-xs sm:text-sm mt-3 max-w-sm leading-relaxed">
          Pesan Anda telah disiapkan dan diarahkan langsung ke email <strong className="text-purple-500">nadyadearihanifah@gmail.com</strong>.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 sm:mt-8 px-6 py-2.5 rounded-full bg-secondary border border-border text-foreground text-xs font-semibold hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-500 transition-all cursor-pointer active:scale-95"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 sm:p-8 rounded-2xl border border-border space-y-5 sm:space-y-6">
      {status === 'error' && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs sm:text-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Nadia Deari"
            className="w-full bg-secondary border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
            disabled={status === 'loading'}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            className="w-full bg-secondary border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
            disabled={status === 'loading'}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Collaboration Inquiry"
          className="w-full bg-secondary border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
          disabled={status === 'loading'}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={formData.message}
          onChange={handleChange}
          placeholder="Hello Nadia, I would like to invite you for..."
          className="w-full bg-secondary border border-border focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all resize-none"
          disabled={status === 'loading'}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md shadow-purple-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Preparing Message...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
