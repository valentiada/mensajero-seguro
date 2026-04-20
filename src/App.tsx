import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send, Phone, Video, Search, Plus, Lock, Shield, Users,
  LogOut, Settings, Paperclip, Smile, Check, CheckCheck,
  Bell, BellOff, Mic, MicOff, VideoOff, PhoneOff, UserPlus, Hash,
  X, ArrowLeft, Info, Edit3, Trash2, MessageCircle, Zap,
  Trophy, Star, ChevronRight, ChevronLeft, RefreshCw,
  Coins, TrendingUp, Award, LifeBuoy, AlertCircle,
  BarChart2, Target, Gift, ChevronDown, ShieldCheck,
} from 'lucide-react';

// ─── Brand ───────────────────────────────────────────────────────────────────

const APP_NAME = 'Колібрі';

function HummingbirdLogo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Body */}
      <ellipse cx="34" cy="36" rx="11" ry="7" transform="rotate(-35 34 36)" fill="url(#hb_body)" />
      {/* Head */}
      <circle cx="24" cy="22" r="7" fill="url(#hb_head)" />
      {/* Beak */}
      <path d="M18 20 L4 17 L18 22 Z" fill="#a8792a" />
      {/* Eye */}
      <circle cx="22" cy="20" r="1.5" fill="#0d1a10" />
      <circle cx="21.5" cy="19.5" r="0.5" fill="white" />
      {/* Wing top */}
      <path d="M30 28 Q44 14 54 18 Q46 24 36 30 Z" fill="url(#hb_wing1)" opacity="0.9" />
      {/* Wing bottom blur */}
      <path d="M32 34 Q48 26 56 32 Q46 36 36 36 Z" fill="url(#hb_wing2)" opacity="0.6" />
      {/* Tail */}
      <path d="M44 42 Q52 50 50 58 Q46 52 42 48 Q46 56 43 62 Q40 55 38 48 Z" fill="url(#hb_tail)" />
      {/* Throat iridescent patch */}
      <ellipse cx="26" cy="26" rx="4" ry="3" transform="rotate(-20 26 26)" fill="url(#hb_throat)" opacity="0.8" />
      <defs>
        <linearGradient id="hb_body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2ecc71" />
          <stop offset="100%" stopColor="#1a5c35" />
        </linearGradient>
        <linearGradient id="hb_head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#27ae60" />
          <stop offset="100%" stopColor="#145a32" />
        </linearGradient>
        <linearGradient id="hb_wing1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#52d68a" />
          <stop offset="100%" stopColor="#1abc9c" />
        </linearGradient>
        <linearGradient id="hb_wing2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#48c774" />
          <stop offset="100%" stopColor="#0e9960" />
        </linearGradient>
        <linearGradient id="hb_tail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a5c35" />
          <stop offset="100%" stopColor="#0d3320" />
        </linearGradient>
        <linearGradient id="hb_throat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e91e8c" />
          <stop offset="50%" stopColor="#f39c12" />
          <stop offset="100%" stopColor="#8e44ad" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── i18n ─────────────────────────────────────────────────────────────────────

const I18N = {
  en: {
    login: 'Sign in', register: 'Sign up', fullName: 'Full name',
    phone: 'Phone', email: 'Email', password: 'Password',
    loginBtn: 'Sign in', registerBtn: 'Create account',
    loading: 'Loading…', errorDefault: 'Error. Please try again.',
    country: 'Country', phonePlaceholder: 'Phone number',
    namePlaceholder: 'John Smith', emailPlaceholder: 'you@example.com',
    tagline: 'Secure messenger · Casino',
    e2e: 'End-to-end encrypted',
  },
  uk: {
    login: 'Вхід', register: 'Реєстрація', fullName: "Повне ім'я",
    phone: 'Телефон', email: 'Email', password: 'Пароль',
    loginBtn: 'Увійти', registerBtn: 'Створити акаунт',
    loading: 'Завантаження…', errorDefault: 'Помилка. Спробуйте ще раз.',
    country: 'Країна', phonePlaceholder: 'Номер телефону',
    namePlaceholder: 'Іваненко Іван', emailPlaceholder: 'you@example.com',
    tagline: 'Захищений месенджер · Казино',
    e2e: 'E2E шифрування',
  },
  ru: {
    login: 'Вход', register: 'Регистрация', fullName: 'Полное имя',
    phone: 'Телефон', email: 'Email', password: 'Пароль',
    loginBtn: 'Войти', registerBtn: 'Создать аккаунт',
    loading: 'Загрузка…', errorDefault: 'Ошибка. Попробуйте ещё раз.',
    country: 'Страна', phonePlaceholder: 'Номер телефона',
    namePlaceholder: 'Иванов Иван', emailPlaceholder: 'you@example.com',
    tagline: 'Защищённый мессенджер · Казино',
    e2e: 'E2E шифрование',
  },
  es: {
    login: 'Iniciar sesión', register: 'Registrarse', fullName: 'Nombre completo',
    phone: 'Teléfono', email: 'Correo', password: 'Contraseña',
    loginBtn: 'Entrar', registerBtn: 'Crear cuenta',
    loading: 'Cargando…', errorDefault: 'Error. Inténtalo de nuevo.',
    country: 'País', phonePlaceholder: 'Número de teléfono',
    namePlaceholder: 'García Juan', emailPlaceholder: 'tú@ejemplo.com',
    tagline: 'Mensajero seguro · Casino',
    e2e: 'Cifrado E2E',
  },
  it: {
    login: 'Accedi', register: 'Registrati', fullName: 'Nome completo',
    phone: 'Telefono', email: 'Email', password: 'Password',
    loginBtn: 'Entra', registerBtn: 'Crea account',
    loading: 'Caricamento…', errorDefault: 'Errore. Riprova.',
    country: 'Paese', phonePlaceholder: 'Numero di telefono',
    namePlaceholder: 'Rossi Mario', emailPlaceholder: 'tu@esempio.it',
    tagline: 'Messenger sicuro · Casino',
    e2e: 'Crittografia E2E',
  },
  de: {
    login: 'Anmelden', register: 'Registrieren', fullName: 'Vollständiger Name',
    phone: 'Telefon', email: 'E-Mail', password: 'Passwort',
    loginBtn: 'Anmelden', registerBtn: 'Konto erstellen',
    loading: 'Lädt…', errorDefault: 'Fehler. Bitte erneut versuchen.',
    country: 'Land', phonePlaceholder: 'Telefonnummer',
    namePlaceholder: 'Müller Hans', emailPlaceholder: 'du@beispiel.de',
    tagline: 'Sicherer Messenger · Casino',
    e2e: 'Ende-zu-Ende-Verschlüsselung',
  },
};
type LangCode = keyof typeof I18N;

function detectLang(): LangCode {
  const bl = (navigator.language || 'en').toLowerCase();
  if (bl.startsWith('uk')) return 'uk';
  if (bl.startsWith('ru')) return 'ru';
  if (bl.startsWith('es')) return 'es';
  if (bl.startsWith('it')) return 'it';
  if (bl.startsWith('de')) return 'de';
  return 'en';
}

// ─── Countries ────────────────────────────────────────────────────────────────

interface Country { flag: string; iso: string; dialCode: string; name: string; }

const COUNTRIES: Country[] = [
  { flag: '🇺🇦', iso: 'UA', dialCode: '+380', name: 'Ukraine / Україна' },
  { flag: '🇷🇺', iso: 'RU', dialCode: '+7',   name: 'Russia / Россия' },
  { flag: '🇬🇧', iso: 'GB', dialCode: '+44',  name: 'United Kingdom' },
  { flag: '🇺🇸', iso: 'US', dialCode: '+1',   name: 'United States' },
  { flag: '🇩🇪', iso: 'DE', dialCode: '+49',  name: 'Germany / Deutschland' },
  { flag: '🇫🇷', iso: 'FR', dialCode: '+33',  name: 'France' },
  { flag: '🇮🇹', iso: 'IT', dialCode: '+39',  name: 'Italy / Italia' },
  { flag: '🇪🇸', iso: 'ES', dialCode: '+34',  name: 'Spain / España' },
  { flag: '🇵🇱', iso: 'PL', dialCode: '+48',  name: 'Poland / Polska' },
  { flag: '🇧🇾', iso: 'BY', dialCode: '+375', name: 'Belarus / Беларусь' },
  { flag: '🇲🇩', iso: 'MD', dialCode: '+373', name: 'Moldova' },
  { flag: '🇬🇪', iso: 'GE', dialCode: '+995', name: 'Georgia / საქართველო' },
  { flag: '🇦🇲', iso: 'AM', dialCode: '+374', name: 'Armenia / Հայաստան' },
  { flag: '🇦🇿', iso: 'AZ', dialCode: '+994', name: 'Azerbaijan' },
  { flag: '🇰🇿', iso: 'KZ', dialCode: '+7',   name: 'Kazakhstan / Қазақстан' },
  { flag: '🇺🇿', iso: 'UZ', dialCode: '+998', name: 'Uzbekistan' },
  { flag: '🇹🇷', iso: 'TR', dialCode: '+90',  name: 'Turkey / Türkiye' },
  { flag: '🇮🇱', iso: 'IL', dialCode: '+972', name: 'Israel / ישראל' },
  { flag: '🇦🇪', iso: 'AE', dialCode: '+971', name: 'UAE / الإمارات' },
  { flag: '🇨🇿', iso: 'CZ', dialCode: '+420', name: 'Czech Republic' },
  { flag: '🇷🇴', iso: 'RO', dialCode: '+40',  name: 'Romania' },
  { flag: '🇭🇺', iso: 'HU', dialCode: '+36',  name: 'Hungary' },
  { flag: '🇸🇰', iso: 'SK', dialCode: '+421', name: 'Slovakia' },
  { flag: '🇧🇬', iso: 'BG', dialCode: '+359', name: 'Bulgaria' },
  { flag: '🇸🇷', iso: 'SR', dialCode: '+597', name: 'Suriname' },
  { flag: '🇨🇦', iso: 'CA', dialCode: '+1',   name: 'Canada' },
  { flag: '🇦🇺', iso: 'AU', dialCode: '+61',  name: 'Australia' },
  { flag: '🇧🇷', iso: 'BR', dialCode: '+55',  name: 'Brazil / Brasil' },
  { flag: '🇲🇽', iso: 'MX', dialCode: '+52',  name: 'Mexico / México' },
  { flag: '🇦🇷', iso: 'AR', dialCode: '+54',  name: 'Argentina' },
];

function guessCountryFromLang(lang: LangCode): Country {
  const map: Record<LangCode, string> = {
    uk: 'UA', ru: 'RU', es: 'ES', it: 'IT', de: 'DE', en: 'GB',
  };
  return COUNTRIES.find(c => c.iso === map[lang]) ?? COUNTRIES[0];
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = 'soldier' | 'operator' | 'admin';
type SidebarTab = 'chats' | 'casino' | 'profile';
type CasinoView = 'lobby' | 'roulette' | 'slots' | 'crash' | 'mines' | 'chicken' | 'dice' | 'deposit' | 'leaderboard' | 'history';

interface User {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  role: Role;
  online?: boolean;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  created_at: string;
  read_by: number[];
  edited?: boolean;
}

interface Chat {
  id: number;
  title: string;
  is_group: boolean;
  members: User[];
  last_message?: Message;
  unread_count: number;
  muted: boolean;
  pinned: boolean;
  is_support?: boolean;
}

interface CallState {
  active: boolean;
  chat_id?: number;
  call_type: 'audio' | 'video';
  status: 'ringing' | 'active' | 'ended';
  muted: boolean;
  video_off: boolean;
}

interface CasinoWallet {
  balance: number;
  total_bet: number;
  total_won: number;
  level: number;
  xp: number;
}

interface RouletteResult {
  number: number;
  color: 'red' | 'black' | 'green';
  total_bet: number;
  total_win: number;
  net: number;
  new_balance: number;
  xp_gained: number;
}

interface SlotsResult {
  reels: string[][];
  line: string[];
  multiplier: number;
  bet: number;
  win: number;
  net: number;
  new_balance: number;
  xp_gained: number;
}

interface SupportTicket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_CHATS: Chat[] = [
  {
    id: 1, title: 'Штаб — оперативний', is_group: true, members: [],
    last_message: { id: 5, chat_id: 1, sender_id: 2, sender_name: 'Олексій Коваль', body: 'Підтверджую. Виконуємо.', created_at: new Date(Date.now() - 120000).toISOString(), read_by: [1, 2] },
    unread_count: 3, muted: false, pinned: true,
  },
  {
    id: 2, title: 'Марина Петренко', is_group: false, members: [],
    last_message: { id: 9, chat_id: 2, sender_id: 1, sender_name: 'Ви', body: 'Все добре, не хвилюйся.', created_at: new Date(Date.now() - 3600000).toISOString(), read_by: [1, 3] },
    unread_count: 0, muted: false, pinned: false,
  },
  {
    id: 3, title: 'Служба підтримки', is_group: false, members: [],
    last_message: { id: 14, chat_id: 3, sender_id: 99, sender_name: 'Підтримка', body: 'Дякуємо за звернення! Ми відповімо найближчим часом.', created_at: new Date(Date.now() - 600000).toISOString(), read_by: [99] },
    unread_count: 1, muted: false, pinned: false, is_support: true,
  },
];

const DEMO_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, chat_id: 1, sender_id: 2, sender_name: 'Олексій Коваль', body: 'Усі на зв\'язку?', created_at: new Date(Date.now() - 600000).toISOString(), read_by: [1, 2, 3] },
    { id: 2, chat_id: 1, sender_id: 3, sender_name: 'Наталя', body: 'На зв\'язку.', created_at: new Date(Date.now() - 540000).toISOString(), read_by: [1, 2, 3] },
    { id: 3, chat_id: 1, sender_id: 1, sender_name: 'Ви', body: 'Готовий.', created_at: new Date(Date.now() - 480000).toISOString(), read_by: [1, 2, 3] },
    { id: 4, chat_id: 1, sender_id: 2, sender_name: 'Олексій Коваль', body: 'Завдання: забезпечити периметр до 18:00.', created_at: new Date(Date.now() - 300000).toISOString(), read_by: [1, 2] },
    { id: 5, chat_id: 1, sender_id: 1, sender_name: 'Ви', body: 'Підтверджую. Виконуємо.', created_at: new Date(Date.now() - 120000).toISOString(), read_by: [1] },
  ],
  2: [
    { id: 8, chat_id: 2, sender_id: 3, sender_name: 'Марина Петренко', body: 'Як ти там? Все добре?', created_at: new Date(Date.now() - 7200000).toISOString(), read_by: [1, 3] },
    { id: 9, chat_id: 2, sender_id: 1, sender_name: 'Ви', body: 'Все добре, не хвилюйся.', created_at: new Date(Date.now() - 3600000).toISOString(), read_by: [1, 3] },
  ],
  3: [
    { id: 13, chat_id: 3, sender_id: 1, sender_name: 'Ви', body: 'Доброго дня! Маю питання щодо роботи месенджера.', created_at: new Date(Date.now() - 900000).toISOString(), read_by: [1, 99] },
    { id: 14, chat_id: 3, sender_id: 99, sender_name: 'Служба підтримки', body: 'Дякуємо за звернення! Ми відповімо найближчим часом. 🛡️', created_at: new Date(Date.now() - 600000).toISOString(), read_by: [99] },
  ],
};

const DEMO_WALLET: CasinoWallet = { balance: 2450, total_bet: 1550, total_won: 2000, level: 3, xp: 1280 };

const ROULETTE_REDS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => i);

const SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣'];
const SLOT_WEIGHTS = [30, 25, 20, 15, 5, 3, 2];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = '/api';

async function api<T = unknown>(path: string, opts: RequestInit = {}, token?: string): Promise<{ ok: boolean; data?: T; error?: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers as Record<string, string> || {}) };
  try {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    return await res.json() as { ok: boolean; data?: T; error?: string };
  } catch {
    return { ok: false, error: 'Мережева помилка.' };
  }
}

const COLORS = ['#1d4636','#2f4a37','#a8792a','#5c4033','#37474f','#4a148c','#1a237e','#004d40'];
function avatarColor(id: number) { return COLORS[id % COLORS.length]; }
function initials(name: string) { return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function fmtTime(iso: string) {
  const d = new Date(iso), now = new Date();
  if (d.getDate() === now.getDate() && now.getTime() - d.getTime() < 86400000)
    return d.toLocaleTimeString('uk', { hour: '2-digit', minute: '2-digit' });
  if (now.getTime() - d.getTime() < 604800000) return d.toLocaleDateString('uk', { weekday: 'short' });
  return d.toLocaleDateString('uk', { day: '2-digit', month: '2-digit' });
}
function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return i; }
  return weights.length - 1;
}
function spinReels(): string[][] {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => SLOT_SYMBOLS[weightedRandom(SLOT_WEIGHTS)])
  );
}
function rouletteColor(n: number): 'red' | 'black' | 'green' {
  return n === 0 ? 'green' : ROULETTE_REDS.has(n) ? 'red' : 'black';
}
function fmtCoins(n: number) { return n.toLocaleString('uk') + ' ₮'; }

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = 40, online }: { name: string; size?: number; online?: boolean }) {
  const id = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return (
    <div className="relative inline-flex shrink-0">
      <div className="flex items-center justify-center border-2 border-black font-black text-white uppercase"
        style={{ width: size, height: size, background: avatarColor(id), fontSize: size * 0.35 }}>
        {initials(name)}
      </div>
      {online !== undefined && (
        <span className="absolute bottom-0 right-0 rounded-full border-2"
          style={{ width: size * 0.28, height: size * 0.28, background: online ? '#4caf7d' : '#6b7c6d', borderColor: '#1d2e20' }} />
      )}
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[9998] animate-slide-up">
      <div className="bg-[#1d2e20] text-white border-2 border-black px-5 py-3 font-mono text-sm shadow-[4px_4px_0px_0px_#a8792a]">{msg}</div>
    </div>
  );
}

// ─── Support widget ───────────────────────────────────────────────────────────

function SupportWidget({ onOpenChat, onClose }: { onOpenChat: () => void; onClose: () => void }) {
  const [step, setStep] = useState<'menu' | 'form' | 'sent'>('menu');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStep('sent');
    setTimeout(() => { setStep('menu'); setSubject(''); setMessage(''); }, 3000);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9990] w-80 border-2 border-black bg-[#f1f5ee] shadow-[8px_8px_0px_0px_#1d2e20] animate-slide-up">
      <div className="bg-[#1d2e20] text-white px-4 py-3 flex items-center gap-2 border-b-2 border-black">
        <LifeBuoy size={16} className="text-[#a8792a]" />
        <span className="font-black text-xs uppercase tracking-widest flex-1">Служба підтримки</span>
        <button onClick={onClose} className="cursor-pointer hover:text-[#c0392b] transition-colors"><X size={14} /></button>
      </div>

      {step === 'menu' && (
        <div className="p-4 flex flex-col gap-2">
          <button onClick={() => setStep('form')} className="u24-button w-full text-xs">
            <Edit3 size={12} /> Нове звернення
          </button>
          <button onClick={onOpenChat} className="u24-button-outline w-full text-xs">
            <MessageCircle size={12} /> Чат підтримки
          </button>
          <div className="border-t-2 border-black pt-2 mt-1">
            {[
              { label: 'FAQ', href: '#' },
              { label: 'Статус сервісу', href: '#' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 py-1.5 font-mono text-xs text-[#6b7c6d] cursor-pointer hover:text-black">
                <ChevronRight size={10} /> {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'form' && (
        <form onSubmit={submit} className="p-4 flex flex-col gap-3">
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1">Тема</label>
            <input className="u24-input text-xs" placeholder="Опишіть коротко…" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1">Пріоритет</label>
            <select className="u24-input text-xs" value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="low">Низький</option>
              <option value="normal">Звичайний</option>
              <option value="high">Високий</option>
              <option value="urgent">Терміново</option>
            </select>
          </div>
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1">Повідомлення</label>
            <textarea className="u24-input text-xs resize-none" rows={3} placeholder="Детально опишіть проблему…" value={message} onChange={e => setMessage(e.target.value)} required />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('menu')} className="u24-button-outline flex-1 text-xs py-2">← Назад</button>
            <button type="submit" className="u24-button flex-1 text-xs py-2"><Send size={11} /> Надіслати</button>
          </div>
        </form>
      )}

      {step === 'sent' && (
        <div className="p-6 flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 border-2 border-black bg-[#1d4636] flex items-center justify-center">
            <Check size={22} className="text-[#a8792a]" />
          </div>
          <div className="font-black text-sm uppercase tracking-tight">Звернення надіслано!</div>
          <div className="font-mono text-xs text-[#6b7c6d]">Ми відповімо найближчим часом</div>
        </div>
      )}
    </div>
  );
}

// ─── Roulette ─────────────────────────────────────────────────────────────────

const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];

function RouletteWheel({ spinning, result }: { spinning: boolean; result: number | null }) {
  const size = 260;
  const cx = size / 2, cy = size / 2, R = size / 2 - 8;
  const n = WHEEL_ORDER.length;
  const sliceAngle = (2 * Math.PI) / n;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size} height={size}
        className={spinning ? 'animate-spin' : ''}
        style={spinning ? { animationDuration: '0.8s' } : {}}
      >
        {WHEEL_ORDER.map((num, i) => {
          const startAngle = i * sliceAngle - Math.PI / 2;
          const endAngle   = startAngle + sliceAngle;
          const x1 = cx + R * Math.cos(startAngle), y1 = cy + R * Math.sin(startAngle);
          const x2 = cx + R * Math.cos(endAngle),   y2 = cy + R * Math.sin(endAngle);
          const fill = num === 0 ? '#1d4636' : ROULETTE_REDS.has(num) ? '#c0392b' : '#1d2e20';
          const midAngle = startAngle + sliceAngle / 2;
          const tr = R * 0.72;
          const tx = cx + tr * Math.cos(midAngle), ty = cy + tr * Math.sin(midAngle);
          const isResult = result === num && !spinning;
          return (
            <g key={num}>
              <path
                d={`M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2} Z`}
                fill={isResult ? '#a8792a' : fill}
                stroke="#f1f5ee"
                strokeWidth={0.8}
              />
              <text
                x={tx} y={ty}
                textAnchor="middle" dominantBaseline="middle"
                fill="#f1f5ee"
                fontSize={9}
                fontWeight="bold"
                transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${tx}, ${ty})`}
              >
                {num}
              </text>
            </g>
          );
        })}
        <circle cx={cx} cy={cy} r={28} fill="#1d2e20" stroke="#a8792a" strokeWidth={3} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#a8792a" fontSize={13} fontWeight="bold">
          {result !== null && !spinning ? result : '●'}
        </text>
      </svg>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-0 h-0"
        style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '14px solid #a8792a' }} />
    </div>
  );
}

function RouletteBetBoard({
  bets, onToggle,
}: { bets: Record<string, number>; onToggle: (type: string, nums?: number[]) => void }) {
  const chip = 50;
  const active = (key: string) => bets[key] > 0;

  return (
    <div className="select-none">
      {/* Outside bets */}
      <div className="grid grid-cols-6 gap-1 mb-1">
        {[
          { key: 'red',   label: '🔴 Червоне' },
          { key: 'black', label: '⚫ Чорне' },
          { key: 'even',  label: 'Парне' },
          { key: 'odd',   label: 'Непарне' },
          { key: 'low',   label: '1–18' },
          { key: 'high',  label: '19–36' },
        ].map(b => (
          <button key={b.key} onClick={() => onToggle(b.key)}
            className={`py-2 border-2 font-black text-[10px] uppercase tracking-wide transition-all cursor-pointer ${active(b.key) ? 'bg-[#a8792a] text-white border-[#a8792a]' : 'bg-surface border-black hover:bg-[#1d2e20] hover:text-white'}`}>
            {b.key === 'red' ? '🔴' : b.key === 'black' ? '⚫' : b.label}
          </button>
        ))}
      </div>
      {/* Dozens */}
      <div className="grid grid-cols-3 gap-1 mb-1">
        {[1,2,3].map(d => (
          <button key={d} onClick={() => onToggle('dozen', [d])}
            className={`py-2 border-2 font-black text-[10px] uppercase tracking-wide cursor-pointer transition-all ${(bets[`dozen_${d}`] || 0) > 0 ? 'bg-[#a8792a] text-white border-[#a8792a]' : 'bg-surface border-black hover:bg-[#1d2e20] hover:text-white'}`}>
            {d === 1 ? '1–12' : d === 2 ? '13–24' : '25–36'}
          </button>
        ))}
      </div>
      {/* Number grid */}
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
        <button onClick={() => onToggle('straight', [0])}
          className={`col-span-1 row-span-3 py-1 border-2 font-black text-[10px] cursor-pointer ${bets['n_0'] > 0 ? 'bg-[#a8792a] text-white border-[#a8792a]' : 'bg-[#1d4636] text-white border-black hover:border-[#a8792a]'}`}>
          0
        </button>
        {Array.from({ length: 36 }, (_, i) => i + 1).map(num => {
          const col = rouletteColor(num);
          const key = `n_${num}`;
          return (
            <button key={num} onClick={() => onToggle('straight', [num])}
              className={`py-1 border font-black text-[10px] cursor-pointer transition-all ${bets[key] > 0 ? 'border-[#a8792a] ring-2 ring-[#a8792a]' : 'border-[#1d2e2040] hover:opacity-80'}`}
              style={{ background: col === 'red' ? '#c0392b' : '#1d2e20', color: '#f1f5ee' }}>
              {num}
            </button>
          );
        })}
      </div>
      {bets && Object.keys(bets).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(bets).filter(([, v]) => v > 0).map(([k, v]) => (
            <span key={k} className="bg-[#a8792a] text-white font-mono text-[10px] px-2 py-0.5">
              {k}: {v}₮
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RouletteView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const [bets, setBets] = useState<Record<string, number>>({});
  const [chipSize, setChipSize] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [history, setHistory] = useState<RouletteResult[]>([]);

  const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  function toggleBet(type: string, nums?: number[]) {
    if (spinning) return;
    const key = type === 'straight' ? `n_${nums![0]}` : type === 'dozen' ? `dozen_${nums![0]}` : type;
    setBets(prev => {
      const cur = prev[key] || 0;
      if (cur > 0) {
        const next = { ...prev }; delete next[key]; return next;
      }
      return { ...prev, [key]: chipSize };
    });
  }

  async function spin() {
    if (spinning || totalBet === 0) return;
    setSpinning(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 2000));

    const betArr = (Object.entries(bets) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => {
      let type = k, nums: number[] = [];
      if (k.startsWith('n_')) { type = 'straight'; nums = [parseInt(k.slice(2))]; }
      else if (k.startsWith('dozen_')) { type = 'dozen'; nums = [parseInt(k.slice(6))]; }
      return { type, numbers: nums, amount: v };
    });

    const apiRes = await api<RouletteResult>('/casino/roulette/spin', {
      method: 'POST', body: JSON.stringify({ bets: betArr }),
    }, token);
    setSpinning(false);

    if (!apiRes.ok) { notify(apiRes.error || 'Помилка крутіння.'); return; }
    const res = apiRes.data!;
    setResult(res);
    setHistory(h => [res, ...h.slice(0, 9)]);
    onWalletUpdate({ balance: res.new_balance, xp: wallet.xp + (res.xp_gained || 0) });
    setBets({});
    if (res.net > 0) notify(`🎉 Виграш ${fmtCoins(res.total_win)}! Число: ${res.number}`);
    else notify(`Число ${res.number} — програш ${fmtCoins(Math.abs(res.net))}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h2 className="font-black text-xl uppercase tracking-tight">Рулетка</h2>
          <div className="font-mono text-xs text-[#6b7c6d]">Європейська · 37 чисел · 0–36</div>
        </div>
        <div className="border-2 border-black px-4 py-2 bg-[#1d2e20] text-[#a8792a] font-black font-mono">
          {fmtCoins(wallet.balance)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Wheel */}
        <div className="border-2 border-black p-4 bg-[#1d2e20] flex flex-col items-center gap-4">
          <RouletteWheel spinning={spinning} result={result?.number ?? null} />
          {result && !spinning && (
            <div className={`border-2 px-6 py-2 font-black text-sm uppercase tracking-tight animate-slide-up ${result.net > 0 ? 'border-[#4caf7d] text-[#4caf7d]' : 'border-[#c0392b] text-[#c0392b]'}`}>
              {result.net > 0 ? `+${fmtCoins(result.total_win)}` : fmtCoins(result.net)} · #{result.number}
            </div>
          )}
          {/* History dots */}
          <div className="flex gap-1 flex-wrap justify-center">
            {history.map((r, i) => (
              <div key={i} className="w-6 h-6 border border-[#2f4a37] flex items-center justify-center font-mono text-[9px] font-bold text-white"
                style={{ background: r.color === 'green' ? '#1d4636' : r.color === 'red' ? '#c0392b' : '#1d2e20' }}>
                {r.number}
              </div>
            ))}
          </div>
        </div>

        {/* Betting board */}
        <div className="border-2 border-black p-3 flex flex-col gap-3">
          {/* Chip selector */}
          <div>
            <div className="font-black text-[10px] uppercase tracking-widest mb-1">Розмір фішки</div>
            <div className="flex gap-1 flex-wrap">
              {[10, 25, 50, 100, 250, 500].map(v => (
                <button key={v} onClick={() => setChipSize(v)}
                  className={`px-2 py-1 border-2 font-mono text-xs cursor-pointer transition-all ${chipSize === v ? 'bg-[#a8792a] text-white border-[#a8792a]' : 'border-black hover:border-[#a8792a]'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <RouletteBetBoard bets={bets} onToggle={toggleBet} />

          <div className="flex gap-2 mt-auto pt-2 border-t-2 border-black">
            <button onClick={() => setBets({})} disabled={spinning} className="u24-button-outline flex-1 py-2 text-xs">
              <Trash2 size={12} /> Скинути
            </button>
            <button
              onClick={spin}
              disabled={spinning || totalBet === 0 || totalBet > wallet.balance}
              className={`flex-1 py-2 border-2 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${spinning ? 'border-[#6b7c6d] text-[#6b7c6d]' : 'border-black bg-[#1d2e20] text-white hover:bg-[#a8792a] hover:border-[#a8792a]'}`}>
              {spinning ? <><RefreshCw size={12} className="animate-spin" /> Крутимо…</> : <><Target size={12} /> Крутити ({fmtCoins(totalBet)})</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function calcRouletteWin(type: string, nums: number[], result: number, color: string, amount: number): number {
  const payouts: Record<string, number> = { straight:35,split:17,street:11,corner:8,line:5,dozen:2,column:2,red:1,black:1,even:1,odd:1,low:1,high:1 };
  let won = false;
  if (type === 'straight')    won = nums.includes(result);
  else if (type === 'dozen') { const d = nums[0]; won = d===1 ? result<=12 : d===2 ? result<=24 : result<=36; }
  else if (type === 'red')   won = color === 'red';
  else if (type === 'black') won = color === 'black';
  else if (type === 'even')  won = result > 0 && result % 2 === 0;
  else if (type === 'odd')   won = result > 0 && result % 2 === 1;
  else if (type === 'low')   won = result >= 1 && result <= 18;
  else if (type === 'high')  won = result >= 19 && result <= 36;
  return won ? (payouts[type] + 1) * amount : 0;
}

// ─── Slots ────────────────────────────────────────────────────────────────────

const SLOTS_PAY: Record<string, number> = {
  '7️⃣,7️⃣,7️⃣': 50,'💎,💎,💎': 25,'⭐,⭐,⭐': 15,'🍇,🍇,🍇': 10,'🍊,🍊,🍊': 8,'🍋,🍋,🍋': 5,'🍒,🍒,🍒': 3,
};

function SlotsView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([['🍒','🍋','🍊'],['💎','⭐','7️⃣'],['🍊','🍒','🍋']]);
  const [lastResult, setLastResult] = useState<SlotsResult | null>(null);
  const [history, setHistory] = useState<SlotsResult[]>([]);
  const [animReels, setAnimReels] = useState([false, false, false]);

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setLastResult(null);

    for (let i = 0; i < 3; i++) {
      setAnimReels(prev => { const next = [...prev]; next[i] = true; return next; });
      await new Promise(r => setTimeout(r, 300));
    }
    await new Promise(r => setTimeout(r, 500));

    const apiRes = await api<SlotsResult>('/casino/slots/spin', {
      method: 'POST', body: JSON.stringify({ bet }),
    }, token);

    setAnimReels([false, false, false]);
    setSpinning(false);
    if (!apiRes.ok) { notify(apiRes.error || 'Помилка.'); return; }
    const res = apiRes.data!;
    setReels(res.reels);
    setLastResult(res);
    setHistory(h => [res, ...h.slice(0, 9)]);
    onWalletUpdate({ balance: res.new_balance, xp: wallet.xp + (res.xp_gained || 0) });
    if (res.win > 0) notify(`🎰 Виграш ×${res.multiplier} = ${fmtCoins(res.win)}!`);
    else notify('Без виграшу. Спробуйте ще!');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

      {/* Slot machine */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(160deg, #1d2e20 0%, #0d1f11 100%)', border: '2px solid rgba(168,121,42,0.4)', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        {/* Machine top */}
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(168,121,42,0.12)', borderBottom: '1px solid rgba(168,121,42,0.25)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎰</span>
            <span className="font-black text-[#a8792a] text-sm uppercase tracking-widest">Колібрі Slots</span>
          </div>
          <div className="font-mono text-sm font-bold text-[#4caf7d]">{fmtCoins(wallet.balance)}</div>
        </div>

        {/* Reel window */}
        <div className="px-5 py-5">
          <div className="relative rounded-2xl overflow-hidden" style={{ background: '#070f09', border: '2px solid rgba(168,121,42,0.5)', boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.6)' }}>
            {/* Win line indicator */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 pointer-events-none z-10"
              style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(168,121,42,0.08) 50%, transparent 100%)', borderTop: '1px solid rgba(168,121,42,0.3)', borderBottom: '1px solid rgba(168,121,42,0.3)' }} />

            <div className="flex gap-0">
              {reels.map((reel, ri) => (
                <div key={ri} className={`flex-1 flex flex-col items-center justify-center py-2 ${ri < 2 ? 'border-r border-[#a8792a]/20' : ''}`}>
                  {reel.map((sym, si) => (
                    <div key={si} className={`flex items-center justify-center w-full transition-all duration-150
                      ${si === 1 ? 'text-5xl py-3' : 'text-2xl py-1 opacity-40'}
                      ${animReels[ri] ? 'animate-blink' : ''}
                      ${si === 1 && lastResult && lastResult.multiplier > 0 && !spinning ? 'win-flash' : ''}`}
                      style={{ filter: si === 1 ? 'drop-shadow(0 0 8px rgba(168,121,42,0.5))' : undefined }}>
                      {sym}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Win result */}
          {lastResult && !spinning && (
            <div className={`mt-3 py-2 px-4 rounded-xl text-center font-black text-sm animate-slide-up ${lastResult.net >= 0 ? 'text-[#4caf7d]' : 'text-[#c0392b]'}`}
              style={{ background: lastResult.net >= 0 ? 'rgba(76,175,125,0.15)' : 'rgba(192,57,43,0.1)' }}>
              {lastResult.multiplier > 0 ? `🎉 ×${lastResult.multiplier} = ${fmtCoins(lastResult.win)}` : '😞 Без виграшу'}
            </div>
          )}
        </div>

        {/* Bet selector inside machine */}
        <div className="px-5 pb-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#6b7c6d] uppercase flex-shrink-0">Ставка:</span>
            <div className="flex gap-1 flex-1 flex-wrap">
              {[5, 10, 25, 50, 100, 250].map(v => (
                <button key={v} onClick={() => setBet(v)} disabled={spinning}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-xs cursor-pointer transition-all ${bet === v ? 'text-white font-bold' : 'text-[#6b7c6d] hover:text-white'}`}
                  style={{ background: bet === v ? 'linear-gradient(135deg, #c9962e, #a8792a)' : 'rgba(29,46,32,0.8)', border: `1px solid ${bet === v ? '#a8792a' : 'rgba(168,121,42,0.2)'}` }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button onClick={spin} disabled={spinning || bet > wallet.balance}
            className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-40"
            style={{
              background: spinning ? 'rgba(29,46,32,0.8)' : 'linear-gradient(135deg, #c9962e 0%, #a8792a 100%)',
              boxShadow: spinning ? 'none' : '0 4px 20px rgba(168,121,42,0.5)',
              color: 'white'
            }}>
            {spinning
              ? <><RefreshCw size={18} className="animate-spin" /> Крутимо…</>
              : <>🎰 SPIN <span className="font-mono text-sm opacity-80">({fmtCoins(bet)})</span></>}
          </button>
        </div>
      </div>

      {/* Paytable */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(168,121,42,0.2)' }}>
        <div className="px-4 py-2 font-black text-[10px] uppercase tracking-widest text-[#a8792a]" style={{ background: 'rgba(168,121,42,0.08)' }}>
          Таблиця виплат
        </div>
        <div className="grid grid-cols-2 gap-0">
          {Object.entries(SLOTS_PAY).map(([combo, m], idx) => (
            <div key={combo} className="px-3 py-2 flex items-center justify-between" style={{ background: idx % 2 === 0 ? 'rgba(29,46,32,0.3)' : 'transparent', borderBottom: '1px solid rgba(168,121,42,0.08)' }}>
              <div className="flex gap-0.5 text-base">{combo.split(',').map((s, i) => <span key={i}>{s}</span>)}</div>
              <div className="font-black text-sm text-[#a8792a]">×{m}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {history.map((r, i) => (
            <div key={i} className={`rounded-lg w-9 h-9 flex items-center justify-center font-mono text-[10px] font-bold border ${r.net >= 0 ? 'border-[#4caf7d] text-[#4caf7d] bg-[#4caf7d10]' : 'border-[#c0392b] text-[#c0392b] bg-[#c0392b10]'}`}>
              {r.multiplier > 0 ? `×${r.multiplier}` : '—'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Crash ────────────────────────────────────────────────────────────────────

function CrashCanvas({ points, phase }: { points: number[]; phase: 'idle' | 'running' | 'cashed' | 'crashed' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const color = phase === 'crashed' ? '#c0392b' : phase === 'cashed' ? '#4caf7d' : '#a8792a';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const PAD_L = 28, PAD_B = 18, PAD_T = 12, PAD_R = 10;

    ctx.clearRect(0, 0, W, H);

    if (points.length < 1) return;

    const maxM = Math.max(...points, 2);
    const px = (i: number) => PAD_L + (i / Math.max(points.length - 1, 1)) * (W - PAD_L - PAD_R);
    const py = (m: number) => H - PAD_B - ((m - 1) / (maxM - 1 + 0.001)) * (H - PAD_T - PAD_B);

    // Grid lines
    const gridVals = [1, 2, 5, 10, 20, 50, 100].filter(v => v <= maxM * 1.15 && v >= 1);
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(168,121,42,0.13)';
    ctx.fillStyle = 'rgba(168,121,42,0.45)';
    ctx.font = `bold 9px "JetBrains Mono", monospace`;
    gridVals.forEach(v => {
      const y = py(v);
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
      ctx.fillText(`×${v}`, 2, y + 3.5);
    });
    ctx.setLineDash([]);

    if (points.length < 2) return;

    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, PAD_T, 0, H - PAD_B);
    grad.addColorStop(0, color + '38');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(px(0), H - PAD_B);
    points.forEach((m, i) => ctx.lineTo(px(i), py(m)));
    ctx.lineTo(px(points.length - 1), H - PAD_B);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Glow line (wide blur pass)
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color + '60';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((m, i) => { const x = px(i), y = py(m); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();

    // Sharp line
    ctx.shadowBlur = 4;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((m, i) => { const x = px(i), y = py(m); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rocket/explosion at curve tip
    const li = points.length - 1;
    const tipX = px(li), tipY = py(points[li]);
    let angle = -Math.PI / 8;
    if (points.length >= 2) {
      const prevX = px(li - 1), prevY = py(points[li - 1]);
      angle = Math.atan2(tipY - prevY, tipX - prevX);
    }
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(angle);
    ctx.font = '20px serif';
    ctx.shadowColor = phase === 'crashed' ? '#c0392b' : '#a8792a';
    ctx.shadowBlur = 10;
    ctx.fillText(phase === 'crashed' ? '💥' : '🚀', -10, 7);
    ctx.restore();
  }, [points, phase, color]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />;
}

function CrashView({ wallet, onWalletUpdate, token, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; token: string; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'running' | 'cashed' | 'crashed'>('idle');
  const [mult, setMult] = useState(1.00);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [history, setHistory] = useState<number[]>([5.2, 1.3, 12.4, 2.1, 1.0, 3.7, 1.8]);
  const [chartPoints, setChartPoints] = useState<number[]>([1]);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const multRef = useRef(1.00);
  const autoCashoutRef = useRef(autoCashout);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  async function start() {
    if (loading || phase === 'running') return;
    setLoading(true);
    const res = await api<{ session_id: string; new_balance: number }>('/casino/crash/start', {
      method: 'POST', body: JSON.stringify({ bet }),
    }, token);
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка старту.'); return; }
    sessionRef.current = res.data!.session_id;
    onWalletUpdate({ balance: res.data!.new_balance });
    multRef.current = 1.00;
    setMult(1.00);
    setChartPoints([1]);
    setPhase('running');
    timerRef.current = setInterval(() => {
      multRef.current = parseFloat((multRef.current * 1.04).toFixed(2));
      const m = multRef.current;
      setMult(m);
      setChartPoints(prev => [...prev.slice(-80), m]);
      if (m >= autoCashoutRef.current) { cashout(m); }
    }, 100);
  }

  async function cashout(currentMult?: number) {
    if (phase !== 'running') return;
    clearInterval(timerRef.current!);
    timerRef.current = null;
    const m = currentMult ?? multRef.current;
    const res = await api<{ crashed: boolean; crash_at: number; cashed_at: number; win: number; new_balance: number }>(
      '/casino/crash/cashout', { method: 'POST', body: JSON.stringify({ session_id: sessionRef.current, mult: m }) }, token,
    );
    if (!res.ok) { setPhase('idle'); notify(res.error || 'Помилка виплати.'); return; }
    const { crashed, crash_at, cashed_at, win, new_balance } = res.data!;
    setHistory(h => [crash_at, ...h.slice(0, 9)]);
    if (crashed) {
      setMult(crash_at);
      setChartPoints(prev => [...prev, crash_at]);
      setPhase('crashed');
      notify(`💥 Крах на ×${crash_at}!`);
    } else {
      setMult(cashed_at);
      onWalletUpdate({ balance: new_balance, total_won: wallet.total_won + win });
      setPhase('cashed');
      notify(`✅ Виплата ×${cashed_at.toFixed(2)} = +${win}₮`);
    }
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const multColor = phase === 'crashed' ? '#c0392b' : phase === 'cashed' ? '#4caf7d' : '#a8792a';

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {/* History pills */}
      <div className="flex gap-1.5 flex-wrap">
        {history.map((v, i) => (
          <span key={i} className={`font-mono text-xs px-2 py-0.5 rounded-full border font-bold ${v < 1.5 ? 'border-[#c0392b] text-[#c0392b] bg-[#c0392b10]' : v > 5 ? 'border-[#4caf7d] text-[#4caf7d] bg-[#4caf7d10]' : 'border-[#a8792a] text-[#a8792a] bg-[#a8792a10]'}`}>
            ×{v.toFixed(2)}
          </span>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #0d1f11 0%, #111d13 100%)', border: '1.5px solid rgba(168,121,42,0.3)' }}>
        {/* Multiplier overlay */}
        <div className="absolute top-3 left-0 right-0 flex justify-center z-10">
          <div className={`font-black text-5xl tracking-tighter transition-all px-6 py-1 rounded-xl`}
            style={{ color: multColor, textShadow: `0 0 20px ${multColor}80` }}>
            ×{mult.toFixed(2)}
          </div>
        </div>
        {phase === 'crashed' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="font-black text-lg text-[#c0392b] uppercase tracking-widest animate-fade-in bg-[#0d1f11]/80 px-4 py-2 rounded-xl">
              💥 КРАХ!
            </div>
          </div>
        )}
        {phase === 'cashed' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="font-black text-lg text-[#4caf7d] uppercase tracking-widest animate-fade-in bg-[#0d1f11]/80 px-4 py-2 rounded-xl">
              💸 ВИПЛАЧЕНО!
            </div>
          </div>
        )}
        {phase === 'idle' && (
          <div className="absolute inset-0 flex items-end justify-start pb-5 pl-5 z-10 pointer-events-none">
            <span className="text-5xl hb-hover" style={{ filter: 'drop-shadow(0 0 10px #a8792a)' }}>🚀</span>
          </div>
        )}
        <div style={{ height: 180, position: 'relative' }}>
          <CrashCanvas points={chartPoints} phase={phase} />
        </div>
        {phase === 'running' && (
          <div className="absolute bottom-2 right-3 font-mono text-[10px] text-[#6b7c6d]">
            Auto ×{autoCashout}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Ставка ₮</label>
          <input type="number" className="u24-input" value={bet} onChange={e => setBet(+e.target.value)} disabled={phase === 'running'} min={1} />
        </div>
        <div>
          <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Auto Cash ×</label>
          <input type="number" className="u24-input" value={autoCashout} onChange={e => setAutoCashout(+e.target.value)} disabled={phase === 'running'} min={1.01} step={0.1} />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[10, 50, 100, 500, 1000].map(v => (
          <button key={v} onClick={() => setBet(v)} disabled={phase === 'running'}
            className="font-mono text-xs border border-[#1d2e20]/40 rounded-lg px-3 py-1.5 hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer disabled:opacity-40 flex-1">
            {v}₮
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        {['idle', 'crashed', 'cashed'].includes(phase) ? (
          <button className="u24-button flex-1 py-4 text-base" onClick={start} disabled={bet < 1 || loading}>
            {loading ? '⏳ Старт…' : `🚀 Запустити (${fmtCoins(bet)})`}
          </button>
        ) : (
          <button className="u24-button-gold flex-1 py-4 text-lg animate-gold-pulse" onClick={() => cashout()}>
            💸 ВИПЛАТА ×{mult.toFixed(2)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mines ────────────────────────────────────────────────────────────────────

function MinesView({ wallet, onWalletUpdate, token, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; token: string; notify: (m: string) => void }) {
  const GRID = 25;
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mult, setMult] = useState(1.0);
  const [justRevealed, setJustRevealed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef('');

  async function startGame() {
    setLoading(true);
    const res = await api<{ session_id: string; new_balance: number; mine_count: number }>(
      '/casino/mines/start', { method: 'POST', body: JSON.stringify({ bet, mine_count: mineCount }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка старту.'); return; }
    sessionRef.current = res.data!.session_id;
    onWalletUpdate({ balance: res.data!.new_balance });
    setMines(new Set());
    setRevealed(new Set());
    setMult(1.0);
    setJustRevealed(null);
    setPhase('playing');
  }

  async function reveal(idx: number) {
    if (phase !== 'playing' || revealed.has(idx) || loading) return;
    setLoading(true);
    const res = await api<{ is_mine: boolean; tile: number; gems?: number; mult?: number; mines?: number[]; new_balance?: number }>(
      '/casino/mines/reveal', { method: 'POST', body: JSON.stringify({ session_id: sessionRef.current, tile: idx }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка.'); return; }
    setJustRevealed(idx);
    setTimeout(() => setJustRevealed(null), 500);
    if (res.data!.is_mine) {
      setMines(new Set(res.data!.mines ?? []));
      setRevealed(prev => new Set([...prev, idx]));
      setPhase('lost');
      notify(`💣 Міна! Втрачено ${fmtCoins(bet)}`);
    } else {
      setRevealed(prev => new Set([...prev, idx]));
      setMult(res.data!.mult ?? mult);
    }
  }

  async function cashout() {
    if (phase !== 'playing' || revealed.size === 0 || loading) return;
    setLoading(true);
    const res = await api<{ mult: number; win: number; new_balance: number }>(
      '/casino/mines/cashout', { method: 'POST', body: JSON.stringify({ session_id: sessionRef.current }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка виплати.'); return; }
    onWalletUpdate({ balance: res.data!.new_balance, total_won: wallet.total_won + res.data!.win });
    setMult(res.data!.mult);
    setPhase('won');
    notify(`💎 Виплата ×${res.data!.mult} = +${fmtCoins(res.data!.win)}`);
  }

  const gemCount = GRID - mineCount;
  const dangerPct = mineCount / GRID * 100;
  const progressPct = revealed.size / gemCount * 100;

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {/* Stats bar */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #0d1f11, #1d2e20)', border: '1.5px solid rgba(168,121,42,0.25)' }}>
        <div className="flex-1 text-center">
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-0.5">Міни</div>
          <div className="font-black text-xl text-[#c0392b]">💣 {mineCount}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-0.5">Знайдено</div>
          <div className="font-black text-xl text-[#4caf7d]">💎 {revealed.size}</div>
        </div>
        <div className="flex-1 text-center">
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-0.5">Множник</div>
          <div className="font-black text-xl text-[#a8792a]">×{mult.toFixed(2)}</div>
        </div>
        {phase === 'playing' && revealed.size > 0 && (
          <button className="u24-button-gold px-3 py-2 text-xs animate-gold-pulse" onClick={cashout} disabled={loading}>
            {loading ? '⏳' : '💸 Забрати'}
          </button>
        )}
      </div>

      {/* Danger meter */}
      {phase === 'playing' && (
        <div>
          <div className="flex justify-between font-mono text-[9px] text-[#6b7c6d] mb-1">
            <span>Безпечно</span>
            <span>{revealed.size}/{gemCount} відкрито</span>
            <span>Небезпечно</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, #4caf7d, ${dangerPct > 40 ? '#c0392b' : '#a8792a'})`
              }} />
          </div>
        </div>
      )}

      {/* Grid with 3-D flip */}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {Array.from({ length: GRID }, (_, i) => {
          const isRevealed = revealed.has(i);
          const isMine = mines.has(i);
          const showMine = isRevealed && isMine;
          const showGem = isRevealed && !isMine;
          const showAllMines = (phase === 'lost' || phase === 'won') && isMine && !isRevealed;
          const flipped = isRevealed || showAllMines;
          const isJust = justRevealed === i;
          return (
            <div key={i} className="tile-wrap" onClick={() => reveal(i)}
              style={{ cursor: phase === 'playing' && !isRevealed ? 'pointer' : 'default' }}>
              <div className={`tile-inner ${flipped ? 'tile-flipped' : ''} ${isJust && showMine ? 'shake' : ''} ${isJust && showGem ? 'win-flash' : ''}`}>
                {/* Front face — unrevealed */}
                <div className={`tile-face tile-front ${phase === 'playing' && !isRevealed ? '' : 'opacity-50'}`}
                  style={phase === 'playing' && !isRevealed ? { borderColor: '#2f4a37' } : {}}>
                  <span style={{ color: '#2f4a37', fontSize: '1.1rem' }}>◆</span>
                </div>
                {/* Back face — gem or mine */}
                <div className={`tile-face tile-back ${showAllMines ? 'tile-back-hidden-mine' : isMine ? 'tile-back-mine' : 'tile-back-gem'}`}>
                  {isMine ? '💣' : '💎'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase result */}
      {phase === 'lost' && (
        <div className="rounded-xl p-3 text-center animate-slide-up" style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)' }}>
          <div className="font-black text-[#c0392b]">💣 Ви підірвалися! Втрата {fmtCoins(bet)}</div>
        </div>
      )}
      {phase === 'won' && (
        <div className="rounded-xl p-3 text-center animate-slide-up" style={{ background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.4)' }}>
          <div className="font-black text-[#4caf7d]">💎 Виплата ×{mult.toFixed(2)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}</div>
        </div>
      )}

      {['idle', 'won', 'lost'].includes(phase) && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Ставка ₮</label>
              <input type="number" className="u24-input" value={bet} onChange={e => setBet(+e.target.value)} min={1} />
            </div>
            <div>
              <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Кількість мін</label>
              <select className="u24-input" value={mineCount} onChange={e => setMineCount(+e.target.value)}>
                {[1,2,3,5,8,10,15,20,24].map(v => <option key={v} value={v}>{v} 💣</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map(v => (
              <button key={v} onClick={() => setBet(v)} className="flex-1 font-mono text-xs border border-[#1d2e20]/40 rounded-lg px-2 py-1.5 hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer">
                {v}₮
              </button>
            ))}
          </div>
          <button className="u24-button py-4 text-base" onClick={startGame} disabled={bet < 1 || loading}>
            {loading ? '⏳ Старт…' : `💣 Нова гра (${fmtCoins(bet)})`}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Chicken Road ─────────────────────────────────────────────────────────────

const CHICKEN_LANES = 10;
const CHICKEN_BASE_RISK = [0.05, 0.08, 0.10, 0.13, 0.16, 0.20, 0.24, 0.28, 0.33, 0.40];
const CHICKEN_MULTS = [1.5, 2.2, 3.0, 4.2, 5.8, 8.0, 11, 16, 22, 30];

function ChickenRoadView({ wallet, onWalletUpdate, token, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; token: string; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'hit'>('idle');
  const [lane, setLane] = useState(0);
  const [mult, setMult] = useState(1.0);
  const [hitLane, setHitLane] = useState<number | null>(null);
  const [cars, setCars] = useState<boolean[]>([]);
  const [jumping, setJumping] = useState(false);
  const [loading, setLoading] = useState(false);
  const sessionRef = useRef('');

  async function start() {
    setLoading(true);
    const res = await api<{ session_id: string; new_balance: number }>(
      '/casino/chicken/start', { method: 'POST', body: JSON.stringify({ bet }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка старту.'); return; }
    sessionRef.current = res.data!.session_id;
    onWalletUpdate({ balance: res.data!.new_balance });
    setCars([]);
    setLane(0);
    setMult(1.0);
    setHitLane(null);
    setPhase('playing');
  }

  async function jump() {
    if (phase !== 'playing' || jumping || loading) return;
    setJumping(true);
    await new Promise(r => setTimeout(r, 200));
    setJumping(false);
    setLoading(true);
    const res = await api<{ hit: boolean; lane?: number; mult?: number; cars?: boolean[]; cashed?: boolean; win?: number; new_balance?: number }>(
      '/casino/chicken/step', { method: 'POST', body: JSON.stringify({ session_id: sessionRef.current }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка.'); return; }
    const d = res.data!;
    if (d.hit) {
      setCars(d.cars ?? []);
      setHitLane(lane);
      setPhase('hit');
      notify(`🚗 Збила машина на смузі ${lane + 1}! Втрата ${fmtCoins(bet)}`);
      return;
    }
    setLane(d.lane ?? lane + 1);
    setMult(d.mult ?? mult);
    if (d.cashed) {
      onWalletUpdate({ balance: d.new_balance!, total_won: wallet.total_won + (d.win ?? 0) });
      setPhase('won');
      notify(`🎉 Пройшла всю дорогу! ×${d.mult} = +${fmtCoins(d.win ?? 0)}`);
    }
  }

  async function cashout() {
    if (phase !== 'playing' || lane === 0 || loading) return;
    setLoading(true);
    const res = await api<{ mult: number; win: number; new_balance: number }>(
      '/casino/chicken/cashout', { method: 'POST', body: JSON.stringify({ session_id: sessionRef.current }) }, token,
    );
    setLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка виплати.'); return; }
    onWalletUpdate({ balance: res.data!.new_balance, total_won: wallet.total_won + res.data!.win });
    setMult(res.data!.mult);
    setPhase('won');
    notify(`💸 Курка втекла! ×${res.data!.mult} = +${fmtCoins(res.data!.win)}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {/* Multiplier bar */}
      <div className="rounded-2xl px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0d1f11, #1d2e20)', border: '1.5px solid rgba(168,121,42,0.3)' }}>
        <div>
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Ставка</div>
          <div className="font-black text-lg text-white">{fmtCoins(bet)}</div>
        </div>
        <div className="text-center">
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Смуга</div>
          <div className="font-black text-2xl text-white">{lane}/{CHICKEN_LANES}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Множник</div>
          <div className="font-black text-2xl text-[#a8792a]" style={{ textShadow: '0 0 12px rgba(168,121,42,0.6)' }}>×{mult.toFixed(1)}</div>
        </div>
      </div>

      {/* Road */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg,#0a1a0d 0%,#0d1f11 100%)', border: '1.5px solid rgba(76,175,125,0.25)', minHeight: 220 }}>
        {/* Asphalt lane dividers */}
        <div className="absolute inset-0 pointer-events-none" style={{ left: 56, right: 56 }}>
          {Array.from({ length: CHICKEN_LANES - 1 }).map((_, i) => (
            <div key={i} className="absolute top-0 bottom-0 w-px opacity-15" style={{ left: `${((i + 1) / CHICKEN_LANES) * 100}%`, background: '#4caf7d' }} />
          ))}
          {/* Road center stripe */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
            <div className="w-full h-px opacity-10" style={{ background: 'repeating-linear-gradient(90deg,#fff 0,#fff 14px,transparent 14px,transparent 28px)' }} />
          </div>
        </div>

        <div className="relative flex h-full" style={{ minHeight: 220 }}>
          {/* Start */}
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 border-r border-[#4caf7d]/15 gap-1">
            <span className="text-[9px] font-mono text-[#6b7c6d] uppercase">Go</span>
            <span className={`text-3xl ${jumping ? 'chicken-bounce' : ''} ${phase === 'idle' || (phase === 'playing' && lane === 0) ? '' : 'opacity-0'}`}>🐔</span>
          </div>

          {/* Lanes */}
          {Array.from({ length: CHICKEN_LANES }, (_, i) => {
            const isPassed = (phase === 'playing' && lane > i + 1) || (phase !== 'playing' && phase !== 'idle' && lane > i);
            const isChickenHere = phase === 'playing' && lane === i + 1;
            const isHit = hitLane === i;
            const hasCar = (phase === 'hit' || phase === 'won') && cars.length > 0 && cars[i];
            const isNext = phase === 'playing' && lane === i;
            // During play show danger shadow on upcoming lane
            const isDanger = phase === 'playing' && i >= lane && !isPassed;

            return (
              <div key={i} className={`flex-1 flex flex-col items-center justify-between py-2 relative overflow-hidden transition-all duration-300
                ${isHit ? 'bg-[#c0392b]/25' : isPassed ? 'bg-[#4caf7d]/6' : isNext ? 'bg-[#a8792a]/12' : ''}`}
                style={{ borderRight: '1px solid rgba(76,175,125,0.08)' }}>

                {/* Mult label */}
                <div className={`font-mono text-[9px] font-bold z-10 ${isPassed ? 'text-[#4caf7d]' : 'text-[#a8792a]/80'}`}>
                  ×{CHICKEN_MULTS[i]}
                </div>

                {/* Animated car (danger lanes during play) */}
                {isDanger && !isChickenHere && (
                  <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
                    <span className="car-drive text-base z-0"
                      style={{ animationDuration: `${1.4 + i * 0.18}s`, animationDelay: `${i * 0.22}s` }}>🚗</span>
                  </div>
                )}

                {/* Center content */}
                <div className="flex items-center justify-center h-10 relative z-10">
                  {hasCar && !isHit && <span className="text-xl">🚗</span>}
                  {isHit && <span className="text-2xl">💥</span>}
                  {isChickenHere && (
                    <span className={`text-3xl ${jumping ? 'chicken-bounce' : ''}`}>🐔</span>
                  )}
                  {isPassed && !hasCar && !isHit && <span className="text-sm">✅</span>}
                </div>

                {/* Danger indicator */}
                {isDanger && !isChickenHere && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 danger-pulse" style={{ background: '#c0392b' }} />
                )}

                <div className="font-mono text-[8px] text-[#6b7c6d] z-10">{i + 1}</div>
              </div>
            );
          })}

          {/* Finish */}
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 border-l border-[#4caf7d]/15 gap-1">
            <span className="text-[9px] font-mono text-[#4caf7d] uppercase">×30</span>
            <span className="text-2xl">🏆</span>
          </div>
        </div>
      </div>

      {/* Result banner */}
      {phase === 'hit' && (
        <div className="rounded-xl p-3 text-center animate-slide-up" style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)' }}>
          <div className="font-black text-[#c0392b]">🚗 Курка збита! Смуга {(hitLane ?? 0) + 1} — Втрата {fmtCoins(bet)}</div>
        </div>
      )}
      {phase === 'won' && (
        <div className="rounded-xl p-3 text-center animate-slide-up" style={{ background: 'rgba(76,175,125,0.15)', border: '1px solid rgba(76,175,125,0.4)' }}>
          <div className="font-black text-[#4caf7d]">🎉 Виплата ×{mult.toFixed(1)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}</div>
        </div>
      )}

      {/* Controls */}
      {['idle', 'hit', 'won'].includes(phase) ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Ставка ₮</label>
              <input type="number" className="u24-input" value={bet} onChange={e => setBet(+e.target.value)} min={1} />
            </div>
            <div className="flex flex-col justify-end">
              <div className="flex gap-1.5">
                {[10, 50, 100, 500].map(v => (
                  <button key={v} onClick={() => setBet(v)} className="flex-1 font-mono text-xs border border-[#1d2e20]/40 rounded-lg py-2 hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button className="u24-button py-4 text-base" onClick={start} disabled={loading}>
            {loading ? '⏳ Старт…' : `🐔 Запустити курку (${fmtCoins(bet)})`}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button className="u24-button flex-1 py-4 text-base" onClick={jump} disabled={jumping || loading}>
            {jumping || loading ? '✨ Стрибає...' : '⬆️ Стрибнути'}
          </button>
          {lane > 0 && (
            <button className="u24-button-gold flex-1 py-4 animate-gold-pulse" onClick={cashout} disabled={loading}>
              💸 ×{mult.toFixed(1)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dice ─────────────────────────────────────────────────────────────────────

function DiceView({ wallet, onWalletUpdate, token, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; token: string; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(50);
  const [dir, setDir] = useState<'over' | 'under'>('over');
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ val: number; won: boolean }[]>([]);
  // Provably fair state
  const [pfSessionId, setPfSessionId] = useState('');
  const [pfHash, setPfHash] = useState('');
  const [clientSeed, setClientSeed] = useState(() => Math.random().toString(36).slice(2, 10));
  const [pfRevealed, setPfRevealed] = useState<{ server_seed: string; client_seed: string; result: number } | null>(null);
  const [showPf, setShowPf] = useState(false);

  useEffect(() => { fetchSeed(); }, []);

  async function fetchSeed() {
    const r = await api<{ session_id: string; server_seed_hash: string }>('/casino/dice/seed', {}, token);
    if (r.ok && r.data) { setPfSessionId(r.data.session_id); setPfHash(r.data.server_seed_hash); }
  }

  const winChance = dir === 'over' ? (100 - target) : target;
  const payout = parseFloat((98 / winChance).toFixed(4));
  const isWin = result !== null && (dir === 'over' ? result > target : result < target);

  async function roll() {
    setRolling(true);
    setResult(null);
    setPfRevealed(null);
    const res = await api<{ result: number; won: boolean; win: number; payout: number; new_balance: number; server_seed?: string; client_seed?: string }>(
      '/casino/dice/roll', { method: 'POST', body: JSON.stringify({ bet, target, direction: dir, pf_session_id: pfSessionId, client_seed: clientSeed }) }, token,
    );
    setRolling(false);
    if (!res.ok) { notify(res.error || 'Помилка.'); return; }
    const { result: val, won, win, new_balance, server_seed, client_seed: cs } = res.data!;
    setResult(val);
    setHistory(h => [{ val, won }, ...h.slice(0, 14)]);
    onWalletUpdate({ balance: new_balance, ...(won ? { total_won: wallet.total_won + win } : {}) });
    if (server_seed) setPfRevealed({ server_seed, client_seed: cs || clientSeed, result: val });
    if (won) notify(`🎲 ${val} — Виграш! +${fmtCoins(win)}`);
    else notify(`🎲 ${val} — Програш!`);
    // Fetch new seed for next round
    fetchSeed();
    setClientSeed(Math.random().toString(36).slice(2, 10));
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Result display */}
      <div className="rounded-2xl flex items-center justify-center py-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0d1f11, #1d2e20)', border: '1.5px solid rgba(168,121,42,0.3)', minHeight: 140 }}>
        {rolling ? (
          <div className="flex flex-col items-center gap-2">
            <div className="text-5xl animate-blink">🎲</div>
            <div className="font-mono text-xs text-[#6b7c6d] uppercase tracking-widest">Кидаємо...</div>
          </div>
        ) : result !== null ? (
          <div className="flex flex-col items-center gap-1 animate-count-up">
            <div className={`font-black tracking-tighter`}
              style={{ fontSize: 72, color: isWin ? '#4caf7d' : '#c0392b', textShadow: `0 0 24px ${isWin ? '#4caf7d' : '#c0392b'}80` }}>
              {result}
            </div>
            <div className={`font-black text-sm uppercase tracking-widest ${isWin ? 'text-[#4caf7d]' : 'text-[#c0392b]'}`}>
              {isWin ? `✅ ВИГРАШ ×${payout}` : '❌ ПРОГРАШ'}
            </div>
          </div>
        ) : (
          <div className="text-6xl opacity-20">🎲</div>
        )}
      </div>

      {/* Probability track */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(29,46,32,0.6)', border: '1px solid rgba(168,121,42,0.2)' }}>
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div>
            <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Шанс</div>
            <div className="font-black text-base text-white">{winChance}%</div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Виплата</div>
            <div className="font-black text-base text-[#a8792a]">×{payout}</div>
          </div>
          <div>
            <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Виграш</div>
            <div className="font-black text-base text-[#4caf7d]">{fmtCoins(parseFloat((bet * payout).toFixed(2)))}</div>
          </div>
        </div>

        {/* Visual track */}
        <div className="relative mb-2">
          <div className="h-8 rounded-xl overflow-hidden flex">
            <div className="h-full transition-all duration-300" style={{
              width: `${dir === 'under' ? target : target}%`,
              background: dir === 'under' ? 'linear-gradient(90deg, #4caf7d, #2ecc71)' : 'rgba(192,57,43,0.3)'
            }} />
            <div className="h-full flex-1" style={{
              background: dir === 'over' ? 'linear-gradient(90deg, #2ecc71, #4caf7d)' : 'rgba(192,57,43,0.3)'
            }} />
          </div>
          {/* Target line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none" style={{ left: `${target}%` }} />
          {/* Result marker */}
          {result !== null && (
            <div className="absolute top-0 bottom-0 w-1 rounded transition-all duration-500 pointer-events-none"
              style={{ left: `${result}%`, background: isWin ? '#4caf7d' : '#c0392b', boxShadow: `0 0 8px ${isWin ? '#4caf7d' : '#c0392b'}` }} />
          )}
          {/* Labels */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2 font-mono text-[10px] font-bold text-white/60">1</div>
          <div className="absolute top-1/2 -translate-y-1/2 right-2 font-mono text-[10px] font-bold text-white/60">100</div>
          <div className="absolute top-1/2 -translate-y-1/2 font-mono text-[10px] font-black text-white" style={{ left: `calc(${target}% - 12px)` }}>{target}</div>
        </div>

        {/* Slider */}
        <input type="range" min={2} max={97} value={target} onChange={e => setTarget(+e.target.value)}
          className="w-full" style={{ accentColor: '#a8792a' }} />

        {/* Direction buttons */}
        <div className="flex gap-2 mt-2">
          {(['under', 'over'] as const).map(d => (
            <button key={d} onClick={() => setDir(d)}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border transition-all cursor-pointer ${dir === d ? 'bg-[#1d4636] text-white border-[#4caf7d]' : 'border-[#2f4a37] text-[#6b7c6d] hover:border-[#4caf7d]/50'}`}>
              {d === 'over' ? `⬆ Більше ${target}` : `⬇ Менше ${target}`}
            </button>
          ))}
        </div>
      </div>

      {/* Bet */}
      <div>
        <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Ставка ₮</label>
        <input type="number" className="u24-input" value={bet} onChange={e => setBet(+e.target.value)} disabled={rolling} min={1} />
        <div className="flex gap-1.5 mt-1.5">
          {[10, 50, 100, 500, 1000].map(v => (
            <button key={v} onClick={() => setBet(v)} disabled={rolling}
              className="font-mono text-xs border border-[#1d2e20]/40 rounded-lg px-2 py-1.5 hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer disabled:opacity-40 flex-1">
              {v}
            </button>
          ))}
        </div>
      </div>

      <button className="u24-button py-4 text-base" onClick={roll} disabled={rolling || bet < 1}>
        {rolling ? <><span className="animate-blink">🎲</span> Кидок…</> : `🎲 Кинути (${fmtCoins(bet)})`}
      </button>

      {/* Provably Fair */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(168,121,42,0.2)' }}>
        <button onClick={() => setShowPf(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 cursor-pointer transition-all hover:bg-[#a8792a0a]"
          style={{ background: 'rgba(168,121,42,0.04)' }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={13} style={{ color: '#a8792a' }} />
            <span className="font-black text-[10px] uppercase tracking-widest text-[#a8792a]">Provably Fair</span>
          </div>
          <ChevronRight size={13} style={{ color: '#a8792a', transform: showPf ? 'rotate(90deg)' : undefined, transition: 'transform .2s' }} />
        </button>
        {showPf && (
          <div className="px-3 pb-3 flex flex-col gap-2.5 pt-1" style={{ background: 'rgba(168,121,42,0.03)' }}>
            <div>
              <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-1">Хеш серверного сіду (до кидка)</div>
              <div className="font-mono text-[10px] text-[#a8792a] break-all select-all leading-relaxed">{pfHash || '—'}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-1">Ваш client seed</div>
              <input className="u24-input font-mono text-xs" value={clientSeed} onChange={e => setClientSeed(e.target.value)} placeholder="будь-який рядок" />
            </div>
            {pfRevealed && (
              <div className="rounded-lg p-3 flex flex-col gap-1.5" style={{ background: 'rgba(76,175,125,0.06)', border: '1px solid rgba(76,175,125,0.2)' }}>
                <div className="font-black text-[10px] uppercase tracking-widest text-[#4caf7d] mb-0.5">✅ Розкритий серверний сід</div>
                <div className="font-mono text-[10px] break-all select-all text-[#E8F2EA]">{pfRevealed.server_seed}</div>
                <div className="font-mono text-[9px] text-[#6b7c6d] mt-1">
                  Перевірка: <code>HMAC-SHA256("{pfRevealed.server_seed}", "{pfRevealed.client_seed}") % 100 + 1 = {pfRevealed.result}</code>
                </div>
              </div>
            )}
            <div className="font-mono text-[9px] text-[#6b7c6d] leading-relaxed">
              Результат = HMAC-SHA256(server_seed, client_seed) → перші 8 hex → % 100 + 1. Серверний сід розкривається після кидка — перевір самостійно.
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {history.map((h, i) => (
            <span key={i} className={`font-mono text-xs px-2 py-0.5 rounded-full border font-bold ${h.won ? 'border-[#4caf7d] text-[#4caf7d] bg-[#4caf7d10]' : 'border-[#c0392b] text-[#c0392b] bg-[#c0392b10]'}`}>
              {h.val}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Crypto Deposit ────────────────────────────────────────────────────────────

interface CryptoDeposit {
  id: number;
  tx_hash: string;
  token: string;
  amount_usdt: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  block_number: number;
  credited_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

function DepositView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [address, setAddress] = useState<string>('');
  const [addrLoading, setAddrLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [copied, setCopied] = useState(false);
  // Withdrawal state
  const [wdAmount, setWdAmount] = useState('');
  const [wdAddr, setWdAddr] = useState('');
  const [wdLoading, setWdLoading] = useState(false);
  const [wdHistory, setWdHistory] = useState<{id:number;amount_usdt:number;address:string;status:string;created_at:string}[]>([]);

  useEffect(() => {
    if (tab === 'withdraw') {
      api<typeof wdHistory>('/casino/withdrawals', {}, token).then(r => {
        if (r.ok && r.data) setWdHistory(r.data);
      });
    }
  }, [tab]);

  // Load deposit address + history on mount
  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    fetch('/api/crypto/deposit-address', { headers })
      .then(r => r.json())
      .then(j => {
        if (j.ok) {
          setAddress(j.data.address);
          setIsDemo(!!j.data.demo);
        }
      })
      .catch(() => {})
      .finally(() => setAddrLoading(false));

    fetch('/api/crypto/deposits', { headers })
      .then(r => r.json())
      .then(j => { if (j.ok) setDeposits(j.data); })
      .catch(() => {});
  }, [token]);

  // SSE: listen for real-time deposit credits
  useEffect(() => {
    const url = `/api/crypto/events?t=${encodeURIComponent(token)}`;
    const src = new EventSource(url);

    src.addEventListener('deposit_credited', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onWalletUpdate({ balance: data.new_balance });
        notify(`✅ Зараховано ${data.amount_usdt.toFixed(2)} USDT`);
        // Reload deposit history
        fetch('/api/crypto/deposits', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(j => { if (j.ok) setDeposits(j.data); })
          .catch(() => {});
      } catch {}
    });

    return () => src.close();
  }, [token]);

  function copyAddr() {
    if (!address) return;
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify('📋 Адресу скопійовано!');
  }

  const shortTx = (hash: string) => `${hash.slice(0, 8)}…${hash.slice(-6)}`;

  async function submitWithdraw() {
    const amt = parseFloat(wdAmount);
    if (!amt || amt <= 0) { notify('Вкажіть суму.'); return; }
    if (!wdAddr) { notify('Вкажіть BSC-адресу.'); return; }
    setWdLoading(true);
    const res = await api<{ amount: number; fee: number; new_balance: number; message: string }>(
      '/casino/withdraw', { method: 'POST', body: JSON.stringify({ amount: amt, address: wdAddr }) }, token,
    );
    setWdLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка.'); return; }
    onWalletUpdate({ balance: res.data!.new_balance });
    setWdAmount('');
    notify(`✅ Заявка прийнята: ${res.data!.amount} USDT → ${wdAddr.slice(0,8)}…`);
    api<typeof wdHistory>('/casino/withdrawals', {}, token).then(r => { if (r.ok && r.data) setWdHistory(r.data); });
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-[#2f4a37]">
        {(['deposit', 'withdraw'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${tab === t ? 'bg-[#a8792a] text-white' : 'text-[#6b7c6d] hover:text-white'}`}>
            {t === 'deposit' ? '⬆ Поповнити' : '⬇ Вивести'}
          </button>
        ))}
      </div>

      {tab === 'withdraw' && (
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#0d1f11,#1d2e20)', border: '1.5px solid rgba(168,121,42,0.3)' }}>
            <div>
              <div className="font-mono text-[9px] text-[#6b7c6d] uppercase">Баланс</div>
              <div className="font-black text-2xl text-[#a8792a]">{fmtCoins(wallet.balance)}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] text-[#6b7c6d] uppercase text-right">Комісія</div>
              <div className="font-mono text-sm text-[#6b7c6d]">1 USDT</div>
            </div>
          </div>
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Сума USDT</label>
            <input type="number" className="u24-input" placeholder="Мін. 5 USDT" value={wdAmount}
              onChange={e => setWdAmount(e.target.value)} min={5} step={1} />
            <div className="flex gap-1.5 mt-1.5">
              {[10, 50, 100, 500].map(v => (
                <button key={v} onClick={() => setWdAmount(String(v))}
                  className="flex-1 font-mono text-xs border border-[#1d2e20]/40 rounded-lg py-1.5 hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer">
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">BSC-адреса (BEP-20)</label>
            <input type="text" className="u24-input font-mono text-xs" placeholder="0x…"
              value={wdAddr} onChange={e => setWdAddr(e.target.value)} />
          </div>
          {wdAmount && parseFloat(wdAmount) >= 5 && (
            <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(168,121,42,0.08)', border: '1px solid rgba(168,121,42,0.25)' }}>
              <div className="flex justify-between font-mono text-xs text-[#6b7c6d]">
                <span>Сума виводу</span><span className="text-white">{parseFloat(wdAmount).toFixed(2)} USDT</span>
              </div>
              <div className="flex justify-between font-mono text-xs text-[#6b7c6d] mt-1">
                <span>Комісія мережі</span><span className="text-white">1.00 USDT</span>
              </div>
              <div className="flex justify-between font-mono text-xs font-bold mt-2 pt-2 border-t border-[#2f4a37]">
                <span className="text-[#6b7c6d]">Отримаєте</span>
                <span className="text-[#a8792a]">{parseFloat(wdAmount).toFixed(2)} USDT</span>
              </div>
            </div>
          )}
          <button className="u24-button-gold py-3 text-sm" onClick={submitWithdraw} disabled={wdLoading || !wdAmount || !wdAddr}>
            {wdLoading ? '⏳ Обробка…' : '⬇ Відправити заявку'}
          </button>
          {wdHistory.length > 0 && (
            <div>
              <div className="font-black text-[10px] uppercase tracking-widest text-[#6b7c6d] mb-2">Історія виводів</div>
              {wdHistory.map(w => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-[#1d2e20] text-xs">
                  <div>
                    <div className="font-mono text-[#E8F2EA]">{w.amount_usdt} USDT</div>
                    <div className="font-mono text-[#6b7c6d] text-[10px]">{w.address.slice(0,10)}…</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${w.status === 'pending' ? 'bg-[#a8792a]/20 text-[#a8792a]' : w.status === 'done' ? 'bg-[#4caf7d]/20 text-[#4caf7d]' : 'bg-[#c0392b]/20 text-[#c0392b]'}`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'deposit' && <>
      {/* Balance */}
      <div className="border-2 border-[#a8792a] bg-[#1d2e20] text-white p-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-[#6b7c6d] uppercase mb-0.5">Баланс</div>
          <div className="font-black text-2xl text-[#a8792a]">{wallet.balance.toFixed(2)} USDT</div>
        </div>
        <div className="text-3xl">💵</div>
      </div>

      {/* Network badge */}
      <div className="flex items-center gap-2 px-3 py-2 border border-[#26a17b40] bg-[#26a17b0a] rounded">
        <span className="w-2 h-2 rounded-full bg-[#26a17b] shrink-0" />
        <span className="font-mono text-[11px] text-[#26a17b] font-bold">USDT · BEP-20 · Binance Smart Chain</span>
        <span className="ml-auto font-mono text-[10px] text-[#6b7c6d]">~3 сек/блок</span>
      </div>

      {/* Deposit address */}
      <div>
        <div className="font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#e8f2ea]">
          Ваша адреса для поповнення
        </div>
        <div className="border-2 border-[#2f4a37] bg-[#0d1f14] p-3 flex items-center gap-2 rounded">
          {addrLoading ? (
            <div className="flex-1 font-mono text-xs text-[#6b7c6d] animate-pulse">Генерую адресу…</div>
          ) : (
            <div className="flex-1 font-mono text-xs break-all text-[#e8f2ea] select-all">{address || '—'}</div>
          )}
          <button
            onClick={copyAddr}
            disabled={!address}
            className="shrink-0 border-2 border-[#2f4a37] px-3 py-1.5 font-black text-[10px] uppercase hover:border-[#a8792a] hover:text-[#a8792a] transition-all cursor-pointer disabled:opacity-40"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
        <div className="font-mono text-[10px] text-[#6b7c6d] mt-1.5 flex items-center gap-1.5">
          <span className="text-[#e4a24b]">⚡</span>
          Зарахування після <span className="text-[#e8f2ea] font-bold">1 підтвердження</span> (≈5 сек) · Виведення після 15 конф.
        </div>
        {isDemo && (
          <div className="mt-2 font-mono text-[10px] text-[#e4a24b] border border-[#e4a24b40] bg-[#e4a24b0a] px-3 py-2 rounded">
            ⚠ Demo-режим: BSC_MASTER_MNEMONIC не задано. Реальні депозити не зараховуються.
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="border border-[#2f4a37] rounded p-3 flex flex-col gap-1.5">
        <div className="font-black text-[10px] uppercase tracking-widest text-[#e8f2ea] mb-0.5">Як поповнити</div>
        {[
          'Скопіюйте адресу вище',
          'Відкрийте гаманець (Trust Wallet, MetaMask, Binance)',
          'Надішліть USDT BEP-20 на цю адресу',
          'Кошти зʼявляться автоматично через ~5 сек',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-2 font-mono text-[11px] text-[#6b7c6d]">
            <span className="shrink-0 w-4 h-4 border border-[#a8792a] flex items-center justify-center text-[#a8792a] font-black text-[9px]">{i + 1}</span>
            {step}
          </div>
        ))}
        <div className="mt-1 font-mono text-[10px] text-[#c0392b] flex items-center gap-1">
          <span>⚠</span> Відправляйте тільки USDT мережею BEP-20 (BSC). Інші токени/мережі — втрата коштів.
        </div>
      </div>

      {/* Deposit history */}
      {deposits.length > 0 && (
        <div>
          <div className="font-black text-[10px] uppercase tracking-widest mb-2 text-[#e8f2ea]">Транзакції</div>
          <div className="flex flex-col gap-2">
            {deposits.map(d => (
              <div
                key={d.id}
                className={`border p-3 flex items-center gap-3 rounded ${
                  d.status === 'confirmed'
                    ? 'border-[#4caf7d40] bg-[#4caf7d06]'
                    : d.status === 'failed'
                    ? 'border-[#c0392b40] bg-[#c0392b06]'
                    : 'border-[#a8792a40] bg-[#a8792a06]'
                }`}
              >
                <div className="text-lg">
                  {d.status === 'confirmed' ? '✅' : d.status === 'failed' ? '❌' : '⏳'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-[#e8f2ea]">+{d.amount_usdt.toFixed(2)} USDT</div>
                  <div className="font-mono text-[10px] text-[#6b7c6d] flex gap-2">
                    <span>{shortTx(d.tx_hash)}</span>
                    <span>·</span>
                    <span>{d.confirmations} конф.</span>
                    <span>·</span>
                    <span className={
                      d.status === 'confirmed' ? 'text-[#4caf7d]' :
                      d.status === 'failed' ? 'text-[#c0392b]' : 'text-[#e4a24b]'
                    }>
                      {d.status === 'confirmed' ? 'Підтверджено' : d.status === 'failed' ? 'Помилка' : 'В обробці'}
                    </span>
                  </div>
                </div>
                {d.status === 'pending' && (
                  <a
                    href={`https://bscscan.com/tx/${d.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 font-mono text-[10px] text-[#6b7c6d] hover:text-[#a8792a] transition-colors"
                  >
                    BSCScan ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      </>}
    </div>
  );
}

// ─── Casino Lobby ─────────────────────────────────────────────────────────────

function CasinoLobby({ wallet, onSelectGame, token, notify }: {
  wallet: CasinoWallet;
  onSelectGame: (g: CasinoView) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const xpToNext = wallet.level * 500;
  const xpPct = Math.min(100, Math.round((wallet.xp % xpToNext) / xpToNext * 100));

  const GAMES: { key: CasinoView; label: string; tag: string; hint: string; accent: string; live?: boolean }[] = [
    { key: 'crash',    label: 'Crash',        tag: 'Arcade',  hint: 'LIVE',  accent: '#E06E4A', live: true },
    { key: 'chicken',  label: 'Chicken Road', tag: 'Arcade',  hint: '×30',   accent: '#E4A24B' },
    { key: 'mines',    label: 'Mines',        tag: 'Instant', hint: '×1000', accent: '#E4A24B' },
    { key: 'dice',     label: 'Dice',         tag: 'Classic', hint: '×49',   accent: '#6DB5D4' },
    { key: 'roulette', label: 'Roulette',     tag: 'Table',   hint: 'LIVE',  accent: '#E54B5E', live: true },
    { key: 'slots',    label: 'Slots',        tag: 'Jackpot', hint: '×50',   accent: '#5BBE8A' },
  ];

  const FALLBACK_WINS = [
    { user_name: 'Sofía',  game_type: 'crash',    win_amount: 8450 },
    { user_name: 'Kwame',  game_type: 'mines',    win_amount: 2100 },
    { user_name: 'Lucía',  game_type: 'roulette', win_amount: 14200 },
    { user_name: 'Diego',  game_type: 'slots',    win_amount: 1200 },
    { user_name: 'Amara',  game_type: 'chicken',  win_amount: 560 },
    { user_name: 'Paolo',  game_type: 'crash',    win_amount: 920 },
    { user_name: 'Zainab', game_type: 'mines',    win_amount: 4400 },
    { user_name: 'Túndé',  game_type: 'dice',     win_amount: 3870 },
  ];
  const [wins, setWins] = useState(FALLBACK_WINS);
  useEffect(() => {
    api<{ user_name: string; game_type: string; win_amount: number }[]>('/casino/recent-wins').then(r => {
      if (r.ok && r.data && r.data.length >= 4) setWins(r.data.slice(0, 20));
    });
  }, []);

  const BONUSES = [
    { day: 1, amount: 50,  claimed: true },
    { day: 2, amount: 100, claimed: false },
    { day: 3, amount: 200, claimed: false },
    { day: 4, amount: 300, claimed: false },
    { day: 5, amount: 500, claimed: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4 bg-[#0B1A12]">
      {/* Hero balance */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 p-4"
        style={{ background: 'linear-gradient(180deg,#163524 0%,#112A1C 100%)' }}>
        <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(228,162,75,0.18) 0%, transparent 70%)' }} />
        <div className="relative flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[#E8F2EA]/60">Баланс</div>
            <button onClick={() => onSelectGame('deposit')}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all hover:brightness-110 active:scale-95"
              style={{ background: '#E4A24B', color: '#1a1006' }}>
              <Plus size={13} strokeWidth={2.5} /> Поповнити
            </button>
          </div>
          <div className="text-[#E8F2EA]" style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 32, letterSpacing: -1, lineHeight: 1 }}>
            {fmtCoins(wallet.balance)}
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0B1A12] border border-white/5 flex items-center justify-center font-black text-sm text-[#E4A24B]">
            {wallet.level}
          </div>
          <div className="flex-1">
            <div className="flex justify-between font-mono text-[10px] text-[#E8F2EA]/60 mb-1 uppercase tracking-widest">
              <span>Рівень {wallet.level}</span>
              <span>{wallet.xp % xpToNext} / {xpToNext} XP</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg,#5BBE8A,#E4A24B)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily bonuses */}
      <div>
        <div className="font-black text-[10px] uppercase tracking-widest text-[#E8F2EA]/50 mb-2 px-1">Щоденні бонуси</div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
          {BONUSES.map(b => (
            <button key={b.day} disabled={b.claimed}
              onClick={() => !b.claimed && notify(`+${b.amount} ₮ отримано`)}
              className="shrink-0 w-[142px] rounded-xl p-3 text-left cursor-pointer disabled:cursor-default transition-all"
              style={{
                background: b.claimed ? '#112A1C' : '#163524',
                border: `1px solid ${b.claimed ? 'rgba(255,255,255,0.06)' : 'rgba(228,162,75,0.3)'}`,
                opacity: b.claimed ? 0.5 : 1,
              }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: b.claimed ? '#163524' : 'rgba(228,162,75,0.2)' }}>
                  <Gift size={14} style={{ color: b.claimed ? '#6b7c6d' : '#E4A24B' }} />
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-[#E8F2EA]/60">День {b.day}</div>
              </div>
              <div className="mt-2 font-black text-base" style={{ color: b.claimed ? '#6b7c6d' : '#E4A24B' }}>
                +{b.amount} ₮
              </div>
              <div className="font-mono text-[10px] text-[#E8F2EA]/40 mt-0.5">{b.claimed ? 'Отримано' : 'Забрати'}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live wins ticker */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl overflow-hidden"
        style={{ background: 'rgba(91,190,138,0.06)', border: '1px solid rgba(91,190,138,0.16)' }}>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#5BBE8A', boxShadow: '0 0 0 3px rgba(91,190,138,0.16)' }} />
          <span className="font-black text-[10px] uppercase tracking-widest" style={{ color: '#5BBE8A' }}>LIVE</span>
        </div>
        <div className="flex-1 flex overflow-hidden"
          style={{
            maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
          }}>
          <div className="flex gap-5 animate-ticker shrink-0">
            {[...wins, ...wins].map((w, i) => (
              <div key={i} className="flex items-center gap-1.5 shrink-0 font-mono text-xs text-[#E8F2EA]/60 whitespace-nowrap">
                <span className="font-bold text-[#E8F2EA]">{w.user_name.split(' ')[0]}</span>
                <span className="text-[#E8F2EA]/30">·</span>
                <span className="capitalize">{w.game_type}</span>
                <span className="font-black" style={{ color: '#5BBE8A' }}>+{fmtCoins(w.win_amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Crash */}
      <button onClick={() => onSelectGame('crash')}
        className="relative overflow-hidden rounded-2xl border border-white/5 text-left cursor-pointer group">
        <div className="h-32 relative flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, rgba(228,162,75,0.15), rgba(224,110,74,0.1)), repeating-linear-gradient(45deg, transparent 0 8px, rgba(255,255,255,0.02) 8px 16px), #112A1C`,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
          <TrendingUp size={64} strokeWidth={1} style={{ color: 'rgba(228,162,75,0.5)' }} />
          <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full font-black text-[9px] uppercase tracking-widest backdrop-blur"
            style={{ background: 'rgba(11,26,18,0.7)', color: '#E4A24B', border: '1px solid rgba(228,162,75,0.3)' }}>
            🔥 HOT
          </span>
          <span className="absolute top-3 right-3 font-black text-xl" style={{ color: '#5BBE8A', letterSpacing: -0.5 }}>
            ×12.45
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ background: '#112A1C' }}>
          <div>
            <div className="font-black text-sm text-[#E8F2EA] uppercase tracking-tight">Crash</div>
            <div className="font-mono text-[11px] text-[#E8F2EA]/60 mt-0.5">1 247 грає зараз</div>
          </div>
          <span className="px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest"
            style={{ background: '#E8F2EA', color: '#0B1A12' }}>
            Грати
          </span>
        </div>
      </button>

      {/* Games grid */}
      <div>
        <div className="font-black text-[10px] uppercase tracking-widest text-[#E8F2EA]/50 mb-2 px-1">Ігри</div>
        <div className="grid grid-cols-2 gap-2.5">
          {GAMES.map(g => (
            <button key={g.key} onClick={() => onSelectGame(g.key)}
              className="rounded-xl overflow-hidden text-left cursor-pointer transition-all hover:-translate-y-0.5"
              style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-20 relative flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 70% 30%, ${g.accent}22 0%, transparent 60%), #163524`,
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                {g.key === 'crash' && <TrendingUp size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.key === 'chicken' && <Zap size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.key === 'mines' && <Target size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.key === 'dice' && <Hash size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.key === 'roulette' && <RefreshCw size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.key === 'slots' && <Star size={30} strokeWidth={1.6} style={{ color: g.accent }} />}
                {g.live && (
                  <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full"
                    style={{ background: '#5BBE8A', boxShadow: '0 0 0 2px rgba(91,190,138,0.25)' }} />
                )}
              </div>
              <div className="px-3 py-2.5">
                <div className="font-black text-xs text-[#E8F2EA] uppercase tracking-tight">{g.label}</div>
                <div className="flex items-center justify-between mt-1 font-mono text-[10px]">
                  <span className="text-[#E8F2EA]/50">{g.tag}</span>
                  <span className="font-black" style={{ color: g.accent }}>{g.hint}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-col gap-2">
        <button onClick={() => onSelectGame('leaderboard')}
          className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(228,162,75,0.12)' }}>
            <Trophy size={18} style={{ color: '#E4A24B' }} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-black text-sm text-[#E8F2EA] uppercase tracking-tight">Таблиця лідерів</div>
            <div className="font-mono text-[10px] text-[#E8F2EA]/50 mt-0.5">Топ-10 гравців за виграшами</div>
          </div>
          <ChevronRight size={16} style={{ color: '#E8F2EA40' }} />
        </button>
        <button onClick={() => onSelectGame('history')}
          className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(91,190,138,0.1)' }}>
            <BarChart2 size={18} style={{ color: '#5BBE8A' }} />
          </div>
          <div className="flex-1 text-left">
            <div className="font-black text-sm text-[#E8F2EA] uppercase tracking-tight">Історія ігор</div>
            <div className="font-mono text-[10px] text-[#E8F2EA]/50 mt-0.5">Всі ваші ставки та результати</div>
          </div>
          <ChevronRight size={16} style={{ color: '#E8F2EA40' }} />
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

function LeaderboardView({ token }: { token: string }) {
  type LbRow = { user_id: number; full_name: string; total_won: number; games_count: number };
  const [rows, setRows] = useState<LbRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<LbRow[]>('/casino/leaderboard', {}, token).then(r => {
      if (r.ok && r.data) setRows(r.data);
      setLoading(false);
    });
  }, [token]);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const RANK_COLORS = ['#E4A24B', '#B0BEC5', '#CD7F32'];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-[#E8F2EA]/40 animate-pulse">Завантаження…</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <Trophy size={40} style={{ color: 'rgba(228,162,75,0.3)' }} />
          <div className="font-black text-sm text-[#E8F2EA]/40">Ще немає даних</div>
          <div className="font-mono text-xs text-[#E8F2EA]/25">Зіграй першим і потрап у топ!</div>
        </div>
      ) : (
        <>
          {/* Top-3 podium */}
          {rows.length >= 3 && (
            <div className="flex items-end justify-center gap-3 pt-2 pb-4">
              {[rows[1], rows[0], rows[2]].map((r, podiumIdx) => {
                const rank = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
                const heights = ['h-20', 'h-28', 'h-16'];
                const color = RANK_COLORS[rank];
                return (
                  <div key={r.user_id} className="flex flex-col items-center gap-1.5" style={{ flex: podiumIdx === 1 ? '1.3' : '1' }}>
                    <div className="text-xl">{MEDALS[rank]}</div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-base border-2"
                      style={{ background: `${color}18`, borderColor: `${color}50`, color }}>
                      {(r.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="font-black text-[11px] text-[#E8F2EA] text-center max-w-[70px] truncate">
                      {r.full_name.split(' ')[0]}
                    </div>
                    <div className={`w-full rounded-t-lg flex items-end justify-center pb-2 ${heights[podiumIdx]}`}
                      style={{ background: `linear-gradient(180deg, ${color}22 0%, ${color}08 100%)`, border: `1px solid ${color}30`, borderBottom: 'none' }}>
                      <span className="font-black text-xs" style={{ color }}>{fmtCoins(r.total_won)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="flex flex-col gap-1.5">
            {rows.map((r, i) => (
              <div key={r.user_id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: i < 3 ? `${RANK_COLORS[i]}0a` : '#112A1C',
                  border: `1px solid ${i < 3 ? RANK_COLORS[i] + '25' : 'rgba(255,255,255,0.05)'}`,
                }}>
                <div className="w-6 text-center font-black text-sm shrink-0">
                  {i < 3 ? MEDALS[i] : <span className="font-mono text-xs text-[#E8F2EA]/30">{i + 1}</span>}
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)', color: i < 3 ? RANK_COLORS[i] : '#E8F2EA' }}>
                  {(r.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-[#E8F2EA] truncate">{r.full_name}</div>
                  <div className="font-mono text-[10px] text-[#E8F2EA]/40">{r.games_count} ігор</div>
                </div>
                <div className="font-black text-sm shrink-0" style={{ color: i < 3 ? RANK_COLORS[i] : '#5BBE8A' }}>
                  {fmtCoins(r.total_won)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Game History ─────────────────────────────────────────────────────────────

function HistoryView({ token }: { token: string }) {
  type GameRow = { id: number; game_type: string; bet_amount: number; win_amount: number; created_at: string; result_data: Record<string, unknown> };
  const [rows, setRows] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<GameRow[]>('/casino/history?limit=50', {}, token).then(r => {
      if (r.ok && r.data) setRows(r.data);
      setLoading(false);
    });
  }, [token]);

  const GAME_EMOJI: Record<string, string> = {
    roulette: '🎡', slots: '🎰', crash: '🚀', mines: '💣', dice: '🎲', chicken: '🐔',
  };

  const totalBet = rows.reduce((s, r) => s + r.bet_amount, 0);
  const totalWon = rows.reduce((s, r) => s + r.win_amount, 0);
  const winRate = rows.length > 0 ? Math.round(rows.filter(r => r.win_amount > 0).length / rows.length * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Ставки', value: fmtCoins(totalBet), color: '#E8F2EA' },
            { label: 'Виграші', value: fmtCoins(totalWon), color: totalWon >= totalBet ? '#5BBE8A' : '#E54B5E' },
            { label: 'Win Rate', value: `${winRate}%`, color: '#E4A24B' },
          ].map(s => (
            <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
              style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="font-mono text-[9px] text-[#E8F2EA]/40 uppercase mb-0.5">{s.label}</div>
              <div className="font-black text-sm" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-sm text-[#E8F2EA]/40 animate-pulse">Завантаження…</div>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <BarChart2 size={40} style={{ color: 'rgba(91,190,138,0.3)' }} />
          <div className="font-black text-sm text-[#E8F2EA]/40">Ще немає ігор</div>
          <div className="font-mono text-xs text-[#E8F2EA]/25">Зіграй першу партію!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map(r => {
            const won = r.win_amount > 0;
            const net = r.win_amount - r.bet_amount;
            const date = new Date(r.created_at).toLocaleDateString('uk', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            return (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: '#112A1C',
                  border: `1px solid ${won ? 'rgba(91,190,138,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                <div className="text-xl shrink-0">{GAME_EMOJI[r.game_type] || '🎮'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-[#E8F2EA] capitalize">{r.game_type}</div>
                  <div className="font-mono text-[10px] text-[#E8F2EA]/40">{date}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-xs" style={{ color: won ? '#5BBE8A' : '#E54B5E' }}>
                    {net >= 0 ? '+' : ''}{fmtCoins(net)}
                  </div>
                  <div className="font-mono text-[10px] text-[#E8F2EA]/40">bet {fmtCoins(r.bet_amount)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Player Profile ───────────────────────────────────────────────────────────

function ProfileView({ user, wallet, notify, onLogout }: {
  user: User;
  wallet: CasinoWallet;
  tickets?: SupportTicket[];
  notify: (m: string) => void;
  onLogout?: () => void;
}) {
  const winRate = wallet.total_bet > 0 ? Math.round((wallet.total_won / wallet.total_bet) * 100) : 0;
  const initial = (user.full_name || 'U')[0].toUpperCase();
  const handle = user.phone || user.email || 'user';

  const T = {
    bg0: '#0B1A12', bg1: '#112A1C', bg2: '#163524',
    hairline: 'rgba(255,255,255,0.09)',
    text: '#E8F2EA', textDim: 'rgba(232,242,234,0.62)', textMute: 'rgba(232,242,234,0.38)',
    amber: '#E4A24B', coral: '#E06E4A', mint: '#5BBE8A', ruby: '#E54B5E',
  };

  const settingsItems = [
    { icon: <Coins size={15} />, label: 'Поповнення', detail: '', onClick: () => notify('Перейдіть до Казино → Поповнення') },
    { icon: <BarChart2 size={15} />, label: 'Транзакції', detail: '', onClick: () => notify('Транзакції — в розробці') },
    { icon: <Trophy size={15} />, label: 'Досягнення', detail: '7/24', onClick: () => notify('Досягнення — в розробці') },
    { icon: <LifeBuoy size={15} />, label: 'Підтримка', detail: '', onClick: () => notify('Перейдіть до чату підтримки') },
    { icon: <LogOut size={15} />, label: 'Вийти', detail: '', onClick: onLogout || (() => notify('Виходимо…')), danger: true },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ background: T.bg0 }}>
      <div className="p-4 flex flex-col gap-4 max-w-lg mx-auto">

        {/* Avatar card */}
        <div style={{ background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 20 }} className="p-5 flex flex-col items-center gap-2">
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `linear-gradient(135deg, ${T.amber} 0%, ${T.coral} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-grotesk)',
          }}>
            {initial}
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: T.text, textAlign: 'center' }}>{user.full_name}</div>
          <div style={{ fontSize: 13, color: T.textDim, textAlign: 'center' }}>{handle} · Level {wallet.level}</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Ігор зіграно', val: wallet.total_bet > 0 ? String(Math.round(wallet.total_bet / 100)) : '0' },
            { label: 'Найбільший виграш', val: fmtCoins(wallet.total_won) },
            { label: 'Рейтинг перемог', val: `${winRate}%` },
          ].map(s => (
            <div key={s.label} style={{ background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 12 }} className="p-3 flex flex-col gap-1">
              <div className="font-grotesk" style={{ fontSize: 17, fontWeight: 600, color: T.text }}>{s.val}</div>
              <div style={{ fontSize: 10, color: T.textDim, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Settings list */}
        <div style={{ background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 14, overflow: 'hidden' }}>
          {settingsItems.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <div style={{ height: 1, background: T.hairline }} />}
              <button onClick={item.onClick} className="w-full flex items-center gap-3 cursor-pointer transition-all"
                style={{ padding: '13px 16px', background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.background = T.bg2)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: 30, height: 30, background: T.bg2, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.danger ? T.ruby : T.amber, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 15, color: item.danger ? T.ruby : T.text }}>{item.label}</span>
                {item.detail && <span style={{ fontSize: 13, color: T.textDim }}>{item.detail}</span>}
                {!item.danger && (
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                    <path d="M2 2 L7 7 L2 12" stroke="rgba(232,242,234,0.38)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function CountryPicker({ value, onChange, t }: { value: Country; onChange: (c: Country) => void; t: typeof I18N['en'] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full u24-input flex items-center gap-2 text-left cursor-pointer">
        <span className="text-xl leading-none">{value.flag}</span>
        <span className="font-mono text-sm flex-1">{value.dialCode}</span>
        <span className="text-[#6b7c6d] text-xs truncate hidden sm:block">{value.name}</span>
        <ChevronDown size={14} className={`text-[#6b7c6d] shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#f1f5ee] border-2 border-[#1d2e20] shadow-[4px_4px_0_0_#1d2e20] max-h-56 overflow-hidden flex flex-col">
          <div className="p-2 border-b-2 border-[#1d2e20]">
            <input autoFocus className="u24-input text-xs py-1.5" placeholder={`${t.country}…`}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-y-auto">
            {filtered.map(c => (
              <button key={c.iso + c.dialCode} type="button"
                onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1d2e20] hover:text-white transition-colors text-left cursor-pointer text-sm ${c.iso === value.iso ? 'bg-[#1d2e2010] font-bold' : ''}`}>
                <span className="text-lg leading-none w-6">{c.flag}</span>
                <span className="font-mono text-xs w-10 shrink-0">{c.dialCode}</span>
                <span className="truncate text-xs">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AuthScreen({ onAuth }: { onAuth: (user: User, token: string, isNew?: boolean) => void }) {
  const [lang, setLang] = useState<LangCode>(detectLang);
  const t = I18N[lang];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [country, setCountry] = useState<Country>(() => guessCountryFromLang(detectLang()));
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', login_email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fullPhone = phone ? `${country.dialCode}${phone.replace(/^\+/, '').replace(/^0/, '')}` : '';
  const loginIdentity = loginMethod === 'email'
    ? form.login_email.trim().toLowerCase()
    : phone.startsWith('+') ? phone.trim() : phone ? `${country.dialCode}${phone.replace(/^0/, '')}` : '';

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
    const body = tab === 'login'
      ? { identity: loginIdentity, password: form.password }
      : { full_name: form.full_name, phone: fullPhone, email: form.email, password: form.password };
    const res = await api<{ token: string; user: User }>(endpoint, { method: 'POST', body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok && (res as any).data) onAuth((res as any).data.user, (res as any).data.token, tab === 'register');
    else setError((res as any).error || t.errorDefault);
  }

  const LANG_FLAGS: Record<LangCode, string> = { en: '🇬🇧', uk: '🇺🇦', ru: '🇷🇺', es: '🇪🇸', it: '🇮🇹', de: '🇩🇪' };

  // Design tokens (dark theme)
  const bg0 = '#0B1A12', bg1 = '#112A1C', bg2 = '#163524';
  const hairline = 'rgba(255,255,255,0.09)';
  const textDim = 'rgba(232,242,234,0.62)';
  const amber = '#E4A24B';
  const mint = '#5BBE8A';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: bg0, border: `1px solid ${hairline}`,
    borderRadius: 12, color: '#E8F2EA',
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: `radial-gradient(ellipse 80% 60% at 20% 10%, rgba(91,190,138,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(228,162,75,0.06) 0%, transparent 60%), ${bg0}` }}>

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,#5BBE8A 0,#5BBE8A 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#5BBE8A 0,#5BBE8A 1px,transparent 1px,transparent 48px)' }} />

      <div className="w-full max-w-[400px] relative z-10 flex flex-col gap-6">

        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center hb-hover"
              style={{ background: bg2, border: `1px solid rgba(228,162,75,0.3)`, boxShadow: `0 8px 32px rgba(228,162,75,0.2)` }}>
              <HummingbirdLogo size={42} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
              style={{ background: mint, borderColor: bg0, boxShadow: `0 0 8px ${mint}` }} />
          </div>
          <div className="text-center">
            <div style={{ fontFamily: '"Space Grotesk", system-ui', fontWeight: 700, fontSize: 22, letterSpacing: 3, color: '#E8F2EA' }}>
              {APP_NAME.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, color: textDim, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>
              {t.tagline}
            </div>
          </div>
        </div>

        {/* Lang flags */}
        <div className="flex justify-center gap-3">
          {(Object.keys(I18N) as LangCode[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)} className="cursor-pointer transition-all duration-200"
              style={{ transform: lang === l ? 'scale(1.2)' : 'scale(1)', opacity: lang === l ? 1 : 0.35, filter: lang === l ? `drop-shadow(0 0 6px ${amber})` : 'none' }}>
              <span className="text-2xl">{LANG_FLAGS[l]}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: bg1, border: `1px solid ${hairline}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

          {/* Main tabs */}
          <div className="flex p-1.5 gap-1.5" style={{ background: bg0 }}>
            {(['login', 'register'] as const).map(tab_ => (
              <button key={tab_} type="button"
                onClick={() => { setTab(tab_); setError(''); }}
                className="flex-1 py-3 font-bold text-sm cursor-pointer transition-all duration-200 rounded-xl"
                style={{
                  background: tab === tab_ ? bg2 : 'transparent',
                  color: tab === tab_ ? '#E8F2EA' : textDim,
                  border: `1px solid ${tab === tab_ ? hairline : 'transparent'}`,
                }}>
                {tab_ === 'login' ? t.login : t.register}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ padding: '20px 20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* ── REGISTER fields ── */}
            {tab === 'register' && (<>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.fullName}</label>
                <input style={inputStyle} placeholder={t.namePlaceholder} value={form.full_name} onChange={set('full_name')} required autoFocus
                  onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = hairline} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.country}</label>
                <CountryPicker value={country} onChange={c => setCountry(c)} t={t} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.phone}</label>
                <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1px solid ${hairline}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: bg2, flexShrink: 0 }}>
                    <span style={{ fontSize: 18 }}>{country.flag}</span>
                    <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 13, fontWeight: 600, color: amber }}>{country.dialCode}</span>
                  </div>
                  <input style={{ ...inputStyle, borderRadius: 0, border: 'none', borderLeft: `1px solid ${hairline}`, flex: 1 }}
                    placeholder={t.phonePlaceholder} value={phone} onChange={e => setPhone(e.target.value)} required inputMode="tel" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.email}</label>
                <input style={inputStyle} type="email" placeholder={t.emailPlaceholder} value={form.email} onChange={set('email')} required autoComplete="email"
                  onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = hairline} />
              </div>
            </>)}

            {/* ── LOGIN fields ── */}
            {tab === 'login' && (<>
              {/* Method switcher */}
              <div style={{ display: 'flex', gap: 6, background: bg0, borderRadius: 10, padding: 4 }}>
                {(['email', 'phone'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setLoginMethod(m); setError(''); }}
                    className="flex-1 cursor-pointer transition-all duration-200"
                    style={{ padding: '7px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none',
                      background: loginMethod === m ? bg2 : 'transparent',
                      color: loginMethod === m ? '#E8F2EA' : textDim }}>
                    {m === 'email' ? '✉️ Email' : '📱 ' + t.phone}
                  </button>
                ))}
              </div>

              {loginMethod === 'email' ? (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.email}</label>
                  <input style={inputStyle} type="email" placeholder={t.emailPlaceholder}
                    value={form.login_email} onChange={set('login_email')} required autoFocus autoComplete="email"
                    onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = hairline} />
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.country}</label>
                    <CountryPicker value={country} onChange={c => setCountry(c)} t={t} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.phone}</label>
                    <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: `1px solid ${hairline}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: bg2, flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>{country.flag}</span>
                        <span style={{ fontFamily: '"Space Grotesk",system-ui', fontSize: 13, fontWeight: 600, color: amber }}>{country.dialCode}</span>
                      </div>
                      <input style={{ ...inputStyle, borderRadius: 0, border: 'none', borderLeft: `1px solid ${hairline}`, flex: 1 }}
                        placeholder={t.phonePlaceholder} value={phone} onChange={e => setPhone(e.target.value)} required inputMode="tel" autoFocus />
                    </div>
                  </div>
                </>
              )}
            </>)}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.password}</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                onFocus={e => e.target.style.borderColor = amber} onBlur={e => e.target.style.borderColor = hairline} />
            </div>

            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(229,75,94,0.1)', border: '1px solid rgba(229,75,94,0.3)', fontSize: 13, color: '#E54B5E' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Register bonus banner */}
            {tab === 'register' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(228,162,75,0.1)', border: `1px solid rgba(228,162,75,0.25)` }}>
                <span style={{ fontSize: 20 }}>🎁</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: amber }}>Бонус при реєстрації</div>
                  <div style={{ fontSize: 11, color: textDim, marginTop: 1 }}>+200₮ на баланс одразу після входу</div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', borderRadius: 14, border: 'none', cursor: loading ? 'default' : 'pointer',
                background: loading ? bg2 : `linear-gradient(135deg, #c9962e 0%, ${amber} 100%)`,
                color: loading ? textDim : '#1a1006',
                fontSize: 15, fontWeight: 700, letterSpacing: 0.3,
                boxShadow: loading ? 'none' : '0 4px 20px rgba(228,162,75,0.35)',
                transition: 'all 0.2s', marginTop: 2 }}>
              {loading
                ? t.loading
                : tab === 'login' ? `${t.loginBtn} →` : `${t.registerBtn} →`}
            </button>
          </form>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '0 20px 16px' }}>
            <span style={{ fontSize: 11 }}>🔒</span>
            <span style={{ fontSize: 10, color: textDim, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              {t.e2e} · {APP_NAME}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Call Overlay ─────────────────────────────────────────────────────────────

function CallOverlay({ call, onEnd, onMute, onVideo }: { call: CallState; onEnd: () => void; onMute: () => void; onVideo: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (call.status !== 'active') return;
    const i = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [call.status]);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/70">
      <div className="w-80 border-2 border-black bg-[#1d2e20] text-white shadow-[8px_8px_0px_0px_#a8792a] animate-slide-up">
        <div className="px-6 pt-6 pb-4 border-b-2 border-[#2f4a37] flex items-center gap-3">
          {call.call_type === 'video' ? <Video size={20} className="text-[#a8792a]" /> : <Phone size={20} className="text-[#a8792a]" />}
          <div>
            <div className="font-black text-sm uppercase">{call.call_type === 'video' ? 'Відеодзвінок' : 'Аудіодзвінок'}</div>
            <div className="font-mono text-xs text-[#6b7c6d] mt-0.5">
              {call.status === 'ringing' && <span className="animate-blink">Виклик…</span>}
              {call.status === 'active' && fmt(elapsed)}
            </div>
          </div>
        </div>
        <div className="p-6 flex justify-center gap-4">
          {[
            { icon: call.muted ? <MicOff size={18} /> : <Mic size={18} />, action: onMute, danger: call.muted },
            ...(call.call_type === 'video' ? [{ icon: call.video_off ? <VideoOff size={18} /> : <Video size={18} />, action: onVideo, danger: call.video_off }] : []),
            { icon: <PhoneOff size={18} />, action: onEnd, danger: true },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action}
              className={`w-12 h-12 border-2 flex items-center justify-center cursor-pointer transition-all ${btn.danger ? 'border-[#c0392b] bg-[#c0392b] text-white' : 'border-[#2f4a37] text-white hover:border-[#a8792a]'}`}>
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'app'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState('');

  // Chats
  const [chats, setChats] = useState<Chat[]>(DEMO_CHATS);
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  // Nav
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('profile');
  const [casinoView, setCasinoView] = useState<CasinoView>('lobby');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChatInfo, setShowChatInfo] = useState(false);

  // Casino
  const [wallet, setWallet] = useState<CasinoWallet>(DEMO_WALLET);

  // Call
  const [call, setCall] = useState<CallState | null>(null);

  // Support
  const [showSupport, setShowSupport] = useState(false);
  const [tickets] = useState<SupportTicket[]>([
    { id: 1, subject: 'Питання щодо шифрування', status: 'resolved', priority: 'normal', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]);

  // Toast
  const [toast, setToast] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeChat]);

  const notify = useCallback((msg: string) => setToast(msg), []);

  function updateWallet(delta: Partial<CasinoWallet>) { setWallet(prev => ({ ...prev, ...delta })); }

  function handleAuth(u: User, t: string, isNew = false) {
    setUser(u); setToken(t); setScreen('app');
    setSidebarTab('profile');
    if (isNew) {
      // Welcome bonus: animate +200
      setTimeout(() => {
        setWallet(prev => ({ ...prev, balance: prev.balance + 200 }));
        notify('🎁 Вітаємо! +200₮ бонус нараховано!');
      }, 800);
    }
  }
  function handleLogout() { setUser(null); setToken(''); setScreen('auth'); setSidebarTab('profile'); }

  function selectChat(chat: Chat) {
    setActiveChat(chat);
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread_count: 0 } : c));
    setSidebarOpen(false);
    setShowChatInfo(false);
    setSidebarTab('chats');
  }

  function sendMessage() {
    const body = input.trim();
    if (!body || !activeChat || !user) return;
    const msg: Message = { id: Date.now(), chat_id: activeChat.id, sender_id: user.id || 1, sender_name: 'Ви', body, created_at: new Date().toISOString(), read_by: [user.id || 1] };
    setMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), msg] }));
    setChats(prev => prev.map(c => c.id === activeChat.id ? { ...c, last_message: msg } : c));
    setInput('');
    inputRef.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

  function startCall(type: 'audio' | 'video') {
    if (!activeChat) return;
    setCall({ active: true, chat_id: activeChat.id, call_type: type, status: 'ringing', muted: false, video_off: false });
    setTimeout(() => setCall(prev => prev ? { ...prev, status: 'active' } : null), 2000);
  }
  function endCall() { setCall(prev => prev ? { ...prev, status: 'ended' } : null); setTimeout(() => setCall(null), 1000); }

  function openSupportChat() {
    const sc = chats.find(c => c.is_support);
    if (sc) { selectChat(sc); setShowSupport(false); }
  }

  const filteredChats = useMemo(() =>
    chats.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase())),
    [chats, search]
  );
  const chatMessages = activeChat ? (messages[activeChat.id] || []) : [];
  const totalUnread = chats.reduce((a, c) => a + c.unread_count, 0);

  if (screen === 'auth') return <AuthScreen onAuth={handleAuth} />;

  // ── Design tokens ─────────────────────────────────────────
  const T = {
    bg0: '#0B1A12', bg1: '#112A1C', bg2: '#163524',
    hairline: 'rgba(255,255,255,0.09)',
    text: '#E8F2EA', textDim: 'rgba(232,242,234,0.62)', textMute: 'rgba(232,242,234,0.38)',
    amber: '#E4A24B', coral: '#E06E4A', mint: '#5BBE8A', ruby: '#E54B5E', sky: '#6DB5D4',
  };

  // ── AppHeader ─────────────────────────────────────────────
  const AppHeader = () => (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 18px 14px',
      borderBottom: `1px solid ${T.hairline}`,
      background: T.bg0,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <HummingbirdLogo size={20} />
        <span style={{
          fontFamily: 'var(--font-grotesk)', fontWeight: 700,
          letterSpacing: '2.2px', fontSize: 17, color: T.text,
        }}>КОЛІБРІ</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { icon: <LifeBuoy size={17} />, onClick: () => setShowSupport(v => !v), title: 'Підтримка' },
          { icon: <LogOut size={17} />, onClick: handleLogout, title: 'Вийти' },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} title={btn.title} style={{
            width: 36, height: 36,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${T.hairline}`,
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.textDim, cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = T.amber)}
          onMouseLeave={e => (e.currentTarget.style.color = T.textDim)}>
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );

  // ── AppTabBar ─────────────────────────────────────────────
  const AppTabBar = () => {
    const tabs = [
      { key: 'chats' as SidebarTab, icon: <MessageCircle size={17} />, label: 'Чати', badge: totalUnread },
      { key: 'casino' as SidebarTab, icon: <Zap size={17} />, label: 'Казино', badge: 0 },
      { key: 'profile' as SidebarTab, icon: <Award size={17} />, label: 'Профіль', badge: 0 },
    ];
    return (
      <div style={{
        display: 'flex', gap: 6, padding: '10px 18px 4px',
        background: T.bg0, borderBottom: `1px solid ${T.hairline}`,
        flexShrink: 0,
      }}>
        {tabs.map(tab => {
          const active = sidebarTab === tab.key;
          return (
            <button key={tab.key} onClick={() => setSidebarTab(tab.key)}
              style={{
                flex: 1, height: 42, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontSize: 13, fontWeight: 500,
                background: active ? T.bg2 : 'transparent',
                border: `1px solid ${active ? T.hairline : 'transparent'}`,
                color: active ? T.amber : T.textDim,
                cursor: 'pointer', position: 'relative',
                transition: 'all 0.15s',
              }}>
              {tab.badge > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 10,
                  minWidth: 18, height: 18,
                  background: T.coral, color: '#1a0c06',
                  fontFamily: 'var(--font-grotesk)', fontSize: 11, fontWeight: 700,
                  borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {tab.badge}
                </span>
              )}
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Chat list (no active chat) ────────────────────────────
  const ChatListPanel = () => (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: T.bg0 }}>
      {/* Search */}
      <div style={{ padding: '12px 18px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: T.bg1, border: `1px solid ${T.hairline}`,
          borderRadius: 12, padding: '10px 12px',
        }}>
          <Search size={15} style={{ color: T.textMute, flexShrink: 0 }} />
          <input
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: T.text, fontSize: 14 }}
            placeholder="Пошук…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Chat rows */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ padding: '4px 18px' }}>
        {filteredChats.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((chat, idx, arr) => {
          const isOnline = chat.id % 2 === 0;
          return (
            <div key={chat.id}>
              <button onClick={() => selectChat(chat)} className="w-full text-left cursor-pointer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', background: 'transparent',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  {chat.is_support ? (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg2, border: `1px solid ${T.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LifeBuoy size={20} style={{ color: T.amber }} />
                    </div>
                  ) : chat.is_group ? (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg2, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} style={{ color: T.amber }} />
                    </div>
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: T.amber }}>
                      {(chat.title || '?')[0].toUpperCase()}
                    </div>
                  )}
                  {isOnline && !chat.is_support && !chat.is_group && (
                    <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: T.mint, border: `2.5px solid ${T.bg0}` }} />
                  )}
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.pinned ? '📌 ' : ''}{chat.title}
                    </span>
                    <span style={{ fontSize: 11, color: T.textMute, flexShrink: 0 }}>
                      {chat.last_message ? fmtTime(chat.last_message.created_at) : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, marginTop: 2 }}>
                    <span style={{ fontSize: 12, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.last_message?.body || '—'}
                    </span>
                    {chat.unread_count > 0 && (
                      <span style={{
                        minWidth: 18, height: 18, flexShrink: 0,
                        background: T.amber, color: '#1a1006',
                        fontFamily: 'var(--font-grotesk)', fontSize: 11, fontWeight: 700,
                        borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0 5px',
                      }}>
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              {idx < arr.length - 1 && <div style={{ height: 1, background: T.hairline }} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Game sub-view header ──────────────────────────────────
  const GameHeader = ({ emoji, title, sub }: { emoji: string; title: string; sub: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 18px', borderBottom: `1px solid ${T.hairline}`,
      background: T.bg0, flexShrink: 0,
    }}>
      <button onClick={() => setCasinoView('lobby')}
        style={{ color: T.amber, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <ChevronLeft size={22} />
      </button>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</div>
        <div style={{ fontSize: 11, color: T.textDim }}>{sub}</div>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: T.bg0, color: T.text, overflow: 'hidden' }}>

      {/* ── AppHeader ────────────────────────────────────── */}
      <AppHeader />

      {/* ── AppTabBar ────────────────────────────────────── */}
      <AppTabBar />

      {/* ── Content ──────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* CHATS TAB */}
        {sidebarTab === 'chats' && !activeChat && <ChatListPanel />}

        {sidebarTab === 'chats' && activeChat && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${T.hairline}`, background: T.bg0, flexShrink: 0 }}>
              <button onClick={() => setActiveChat(null)} style={{ color: T.amber, cursor: 'pointer', display: 'flex' }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ cursor: 'pointer' }} onClick={() => setShowChatInfo(v => !v)}>
                {activeChat.is_support ? (
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.bg2, border: `1px solid ${T.amber}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LifeBuoy size={18} style={{ color: T.amber }} />
                  </div>
                ) : activeChat.is_group ? (
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} style={{ color: T.amber }} />
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: T.amber }}>
                    {(activeChat.title || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeChat.title}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>
                  {activeChat.is_support ? <span style={{ color: T.amber }}>Служба підтримки</span>
                    : activeChat.is_group ? 'Груповий чат'
                    : <span style={{ color: T.mint }}>● Онлайн</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!activeChat.is_support && <>
                  <button onClick={() => startCall('audio')} style={{ width: 36, height: 36, borderRadius: 10, background: T.bg2, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, cursor: 'pointer' }}><Phone size={15} /></button>
                  <button onClick={() => startCall('video')} style={{ width: 36, height: 36, borderRadius: 10, background: T.bg2, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, cursor: 'pointer' }}><Video size={15} /></button>
                </>}
                <button onClick={() => setShowChatInfo(v => !v)} style={{ width: 36, height: 36, borderRadius: 10, background: T.bg2, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, cursor: 'pointer' }}><Info size={15} /></button>
              </div>
            </div>

            {/* E2E bar */}
            <div style={{ background: T.bg2, borderBottom: `1px solid ${T.hairline}`, padding: '5px 18px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Lock size={10} style={{ color: T.amber }} />
              <span style={{ fontSize: 10, color: T.amber, letterSpacing: '0.8px', textTransform: 'uppercase' }}>E2E Encrypted · Nexus</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, background: T.bg0 }}>
              {chatMessages.length === 0 && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', border: `1px dashed ${T.hairline}`, borderRadius: 16, padding: '32px 40px' }}>
                    <Lock size={24} style={{ color: T.textMute, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.textDim }}>Повідомлень немає</div>
                  </div>
                </div>
              )}
              {chatMessages.map(msg => {
                const isOwn = msg.sender_id === (user?.id || 1) || msg.sender_name === 'Ви';
                return (
                  <div key={msg.id} className={`flex gap-2 animate-slide-up ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && (
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: T.amber, flexShrink: 0 }}>
                        {(msg.sender_name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className={`max-w-[65%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && activeChat.is_group && (
                        <span style={{ fontSize: 10, color: T.amber, paddingLeft: 4 }}>{msg.sender_name}</span>
                      )}
                      <div className={`px-4 py-2.5 text-sm leading-relaxed ${isOwn ? 'bubble-out' : 'bubble-in'}`}>{msg.body}</div>
                      <div className="flex items-center gap-1 px-1">
                        <span style={{ fontSize: 10, color: T.textMute }}>{fmtTime(msg.created_at)}</span>
                        {isOwn && (msg.read_by.length > 1 ? <CheckCheck size={12} style={{ color: T.mint }} /> : <Check size={12} style={{ color: T.textMute }} />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 18px', borderTop: `1px solid ${T.hairline}`, background: T.bg0, flexShrink: 0 }}>
              <button style={{ width: 36, height: 36, borderRadius: 10, background: T.bg2, border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.textDim, cursor: 'pointer', flexShrink: 0 }}><Paperclip size={15} /></button>
              <div style={{ flex: 1, background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 12, display: 'flex', alignItems: 'flex-end' }}>
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  rows={1} placeholder="Повідомлення…"
                  style={{ flex: 1, resize: 'none', background: 'transparent', padding: '10px 12px', fontSize: 14, color: T.text, outline: 'none', maxHeight: 120 }}
                  className="placeholder:text-[rgba(232,242,234,0.38)]" />
                <button style={{ padding: '10px 10px', color: T.textDim, cursor: 'pointer' }}><Smile size={15} /></button>
              </div>
              <button onClick={sendMessage} disabled={!input.trim()}
                style={{ width: 36, height: 36, borderRadius: 10, background: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1006', cursor: 'pointer', flexShrink: 0, opacity: input.trim() ? 1 : 0.4 }}>
                <Send size={15} />
              </button>
            </div>
          </div>
        )}

        {/* CASINO TAB */}
        {sidebarTab === 'casino' && casinoView === 'lobby' && (
          <CasinoLobby wallet={wallet} onSelectGame={v => setCasinoView(v)} token={token} notify={notify} />
        )}
        {sidebarTab === 'casino' && casinoView === 'roulette' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎡" title="Рулетка" sub="Європейська · До ×35" />
            <RouletteView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'slots' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎰" title="Слоти" sub="3 барабани · Джекпот ×50" />
            <SlotsView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'crash' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🚀" title="Crash" sub="Забери до краху" />
            <CrashView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'mines' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="💣" title="Mines" sub="5×5 мінне поле" />
            <MinesView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'chicken' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🐔" title="Chicken Road" sub="Перейди дорогу · До ×30" />
            <ChickenRoadView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'dice' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎲" title="Dice" sub="Більше / менше" />
            <DiceView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'deposit' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="💰" title="Поповнення" sub="BTC · ETH · USDT · TON · SOL" />
            <DepositView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'leaderboard' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🏆" title="Таблиця лідерів" sub="Топ-10 за всіма виграшами" />
            <LeaderboardView token={token} />
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'history' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="📊" title="Історія ігор" sub="Останні 50 ставок" />
            <HistoryView token={token} />
          </div>
        )}

        {/* PROFILE TAB */}
        {sidebarTab === 'profile' && user && (
          <ProfileView user={user} wallet={wallet} tickets={tickets} notify={notify} onLogout={handleLogout} />
        )}

      </div>

      {/* ── Chat info panel ───────────────────────────────── */}
      {showChatInfo && activeChat && (
        <div style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 280, zIndex: 50,
          background: T.bg1, borderLeft: `1px solid ${T.hairline}`,
          display: 'flex', flexDirection: 'column',
        }} className="animate-slide-up">
          <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Інформація</span>
            <button onClick={() => setShowChatInfo(false)} style={{ color: T.textDim, cursor: 'pointer' }}><X size={16} /></button>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderBottom: `1px solid ${T.hairline}` }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: T.bg2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: T.amber }}>
              {activeChat.is_support ? <LifeBuoy size={28} style={{ color: T.amber }} /> : (activeChat.title || '?')[0].toUpperCase()}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, textAlign: 'center' }}>{activeChat.title}</div>
          </div>
          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Тип', v: activeChat.is_support ? 'Підтримка' : activeChat.is_group ? 'Група' : 'Особистий' },
              { l: 'Шифрування', v: 'E2E · Fernet' },
            ].map(r => (
              <div key={r.l} style={{ background: T.bg2, borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: T.textMute, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{r.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginTop: 2 }}>{r.v}</div>
              </div>
            ))}
            <button onClick={() => notify('Видалити чат — в розробці')} style={{
              padding: '10px 0', borderRadius: 10, background: 'transparent',
              border: `1px solid rgba(229,75,94,0.4)`, color: '#E54B5E',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4,
            }}>
              <Trash2 size={14} /> Видалити чат
            </button>
          </div>
        </div>
      )}

      {/* ── Call overlay ──────────────────────────────────── */}
      {call && <CallOverlay call={call} onEnd={endCall} onMute={() => setCall(p => p ? { ...p, muted: !p.muted } : null)} onVideo={() => setCall(p => p ? { ...p, video_off: !p.video_off } : null)} />}

      {/* ── Support widget ────────────────────────────────── */}
      {showSupport && <SupportWidget onOpenChat={openSupportChat} onClose={() => setShowSupport(false)} />}

      {/* ── Toast ─────────────────────────────────────────── */}
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
