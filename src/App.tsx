import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Send, Phone, Video, Search, Plus, Lock, Shield, Users,
  LogOut, Settings, Paperclip, Smile, Check, CheckCheck,
  Bell, BellOff, Mic, MicOff, VideoOff, PhoneOff, UserPlus, Hash,
  X, ArrowLeft, Info, Edit3, Trash2, MessageCircle, Zap,
  Trophy, Star, ChevronRight, ChevronLeft, RefreshCw,
  Coins, TrendingUp, Award, LifeBuoy, AlertCircle,
  BarChart2, Target, Gift, ChevronDown,
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
type CasinoView = 'lobby' | 'roulette' | 'slots' | 'crash' | 'mines' | 'chicken' | 'dice' | 'deposit';

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

async function api<T = unknown>(path: string, opts: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers as Record<string, string> || {}) };
  try {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    return await res.json() as { ok: boolean; data?: T; error?: string };
  } catch {
    return { ok: false, error: 'Мережева помилка.' } as { ok: boolean; error: string };
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

function RouletteView({ wallet, onWalletUpdate, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  notify: (m: string) => void;
}) {
  const [bets, setBets] = useState<Record<string, number>>({});
  const [chipSize, setChipSize] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<RouletteResult | null>(null);
  const [history, setHistory] = useState<RouletteResult[]>([]);

  const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);

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
    if (totalBet > wallet.balance) { notify('Недостатньо фішок!'); return; }
    setSpinning(true);
    setResult(null);

    await new Promise(r => setTimeout(r, 2000));

    const num = Math.floor(Math.random() * 37);
    const color = rouletteColor(num);

    let totalWin = 0;
    const betArr = Object.entries(bets).filter(([, v]) => v > 0).map(([k, v]) => {
      let type = k, nums: number[] = [];
      if (k.startsWith('n_')) { type = 'straight'; nums = [parseInt(k.slice(2))]; }
      else if (k.startsWith('dozen_')) { type = 'dozen'; nums = [parseInt(k.slice(6))]; }
      return { type, numbers: nums, amount: v };
    });

    const details = betArr.map(b => {
      const won = calcRouletteWin(b.type, b.numbers, num, color, b.amount);
      totalWin += won;
      return { ...b, won };
    });

    const net = totalWin - totalBet;
    const newBalance = wallet.balance + net;
    const xp = Math.max(1, Math.floor(totalBet / 10));

    const res: RouletteResult = { number: num, color, total_bet: totalBet, total_win: totalWin, net, new_balance: newBalance, xp_gained: xp };
    setResult(res);
    setHistory(h => [res, ...h.slice(0, 9)]);
    onWalletUpdate({ balance: newBalance, xp: wallet.xp + xp });
    setBets({});
    setSpinning(false);

    if (net > 0) notify(`🎉 Виграш ${fmtCoins(totalWin)}! Число: ${num}`);
    else notify(`Число ${num} — програш ${fmtCoins(Math.abs(net))}`);
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

function SlotsView({ wallet, onWalletUpdate, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([['🍒','🍋','🍊'],['💎','⭐','7️⃣'],['🍊','🍒','🍋']]);
  const [lastResult, setLastResult] = useState<SlotsResult | null>(null);
  const [history, setHistory] = useState<SlotsResult[]>([]);
  const [animReels, setAnimReels] = useState([false, false, false]);

  async function spin() {
    if (spinning || bet > wallet.balance) { if (bet > wallet.balance) notify('Недостатньо фішок!'); return; }
    setSpinning(true);
    setLastResult(null);

    // Animate reels sequentially
    for (let i = 0; i < 3; i++) {
      setAnimReels(prev => { const next = [...prev]; next[i] = true; return next; });
      await new Promise(r => setTimeout(r, 300));
    }

    const newReels = spinReels();
    await new Promise(r => setTimeout(r, 800));

    setAnimReels([false, false, false]);
    setReels(newReels);

    const line = [newReels[0][1], newReels[1][1], newReels[2][1]];
    const key  = line.join(',');
    let mult = SLOTS_PAY[key] || 0;
    if (mult === 0 && line[0] === line[1]) mult = 1;

    const win = bet * mult;
    const net = win - bet;
    const newBalance = wallet.balance + net;
    const xp = Math.max(1, Math.floor(bet / 20));

    const res: SlotsResult = { reels: newReels, line, multiplier: mult, bet, win, net, new_balance: newBalance, xp_gained: xp };
    setLastResult(res);
    setHistory(h => [res, ...h.slice(0, 9)]);
    onWalletUpdate({ balance: newBalance, xp: wallet.xp + xp });
    setSpinning(false);

    if (win > 0) notify(`🎰 Виграш ×${mult} = ${fmtCoins(win)}!`);
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

function CrashChart({ points, crashed, cashed }: { points: number[]; crashed: boolean; cashed: boolean }) {
  const W = 340, H = 160;
  const maxM = Math.max(...points, 2);
  const pts = points.map((m, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * (W - 20) + 10;
    const y = H - 10 - ((m - 1) / (maxM - 1 + 0.001)) * (H - 20);
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = crashed ? '#c0392b' : cashed ? '#4caf7d' : '#a8792a';
  const lastX = points.length > 1 ? ((points.length - 1) / Math.max(points.length - 1, 1)) * (W - 20) + 10 : 10;
  const lastY = points.length > 0 ? H - 10 - ((points[points.length - 1] - 1) / (maxM - 1 + 0.001)) * (H - 20) : H - 10;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {/* Grid */}
      {[1, 2, 5, 10].filter(v => v <= maxM + 1).map(v => {
        const y = H - 10 - ((v - 1) / (maxM - 1 + 0.001)) * (H - 20);
        return (
          <g key={v}>
            <line x1="10" y1={y} x2={W - 10} y2={y} stroke="rgba(168,121,42,0.15)" strokeWidth="1" strokeDasharray="4,4" />
            <text x="12" y={y - 2} fill="rgba(168,121,42,0.5)" fontSize="8" fontFamily="monospace">×{v}</text>
          </g>
        );
      })}
      {/* Fill */}
      {points.length > 1 && (
        <polygon
          points={`10,${H - 10} ${pts} ${lastX},${H - 10}`}
          fill={strokeColor} opacity="0.12"
        />
      )}
      {/* Line */}
      {points.length > 1 && (
        <polyline points={pts} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {/* Rocket at tip */}
      {points.length > 0 && !crashed && (
        <text x={lastX - 10} y={lastY + 5} fontSize="18" style={{ filter: 'drop-shadow(0 0 4px #a8792a)' }}>🚀</text>
      )}
      {points.length > 0 && crashed && (
        <text x={lastX - 10} y={lastY + 5} fontSize="18">💥</text>
      )}
      {points.length > 0 && cashed && (
        <text x={lastX - 10} y={lastY + 5} fontSize="18">💸</text>
      )}
    </svg>
  );
}

function CrashView({ wallet, onWalletUpdate, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'running' | 'cashed' | 'crashed'>('idle');
  const [mult, setMult] = useState(1.00);
  const [crashAt, setCrashAt] = useState(1.00);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [history, setHistory] = useState<number[]>([5.2, 1.3, 12.4, 2.1, 1.0, 3.7, 1.8]);
  const [chartPoints, setChartPoints] = useState<number[]>([1]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function genCrash() {
    const r = Math.random();
    if (r < 0.05) return 1.00;
    return Math.max(1.01, parseFloat((1 / (1 - Math.random() * 0.97)).toFixed(2)));
  }

  function start() {
    if (bet > wallet.balance) { notify('Недостатньо коштів!'); return; }
    const crash = genCrash();
    setCrashAt(crash);
    setMult(1.00);
    setChartPoints([1]);
    setPhase('running');
    onWalletUpdate({ balance: wallet.balance - bet });
    let m = 1.00;
    timerRef.current = setInterval(() => {
      m = parseFloat((m * 1.04).toFixed(2));
      setMult(m);
      setChartPoints(prev => [...prev.slice(-80), m]);
      if (m >= autoCashout) { cashout(m, crash); return; }
      if (m >= crash) {
        clearInterval(timerRef.current!);
        setMult(crash);
        setChartPoints(prev => [...prev, crash]);
        setPhase('crashed');
        setHistory(h => [crash, ...h.slice(0, 9)]);
        notify(`💥 Крах на ×${crash}!`);
      }
    }, 100);
  }

  function cashout(currentMult: number, crash: number) {
    clearInterval(timerRef.current!);
    if (currentMult >= crash) {
      setPhase('crashed');
      setHistory(h => [crash, ...h.slice(0, 9)]);
      notify(`💥 Крах на ×${crash}!`);
      return;
    }
    const win = parseFloat((bet * currentMult).toFixed(2));
    onWalletUpdate({ balance: wallet.balance - bet + win, total_won: wallet.total_won + win });
    setPhase('cashed');
    setHistory(h => [crash, ...h.slice(0, 9)]);
    notify(`✅ Виплата ×${currentMult.toFixed(2)} = +${win}₮`);
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
          <div className="absolute inset-0 flex items-end justify-start pb-4 pl-4 z-10 pointer-events-none">
            <span className="text-5xl" style={{ filter: 'drop-shadow(0 0 8px #a8792a)' }}>🚀</span>
          </div>
        )}
        <CrashChart points={chartPoints} crashed={phase === 'crashed'} cashed={phase === 'cashed'} />
        {phase === 'running' && (
          <div className="absolute bottom-2 right-3 font-mono text-[10px] text-[#6b7c6d]">
            Auto cash: ×{autoCashout}
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
          <button className="u24-button flex-1 py-4 text-base" onClick={start} disabled={bet < 1}>
            🚀 Запустити ({fmtCoins(bet)})
          </button>
        ) : (
          <button className="u24-button-gold flex-1 py-4 text-lg animate-gold-pulse" onClick={() => cashout(mult, crashAt)}>
            💸 ВИПЛАТА ×{mult.toFixed(2)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mines ────────────────────────────────────────────────────────────────────

function MinesView({ wallet, onWalletUpdate, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; notify: (m: string) => void }) {
  const GRID = 25;
  const [bet, setBet] = useState(100);
  const [mineCount, setMineCount] = useState(5);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mult, setMult] = useState(1.0);
  const [justRevealed, setJustRevealed] = useState<number | null>(null);

  function calcMult(gems: number, totalMines: number): number {
    const safeTotal = GRID - totalMines;
    let m = 1.0;
    for (let i = 0; i < gems; i++) m *= (safeTotal - i) / (GRID - i);
    return parseFloat((0.97 / m).toFixed(2));
  }

  function startGame() {
    if (bet > wallet.balance) { notify('Недостатньо коштів!'); return; }
    const mineSet = new Set<number>();
    while (mineSet.size < mineCount) mineSet.add(Math.floor(Math.random() * GRID));
    setMines(mineSet);
    setRevealed(new Set());
    setMult(1.0);
    setJustRevealed(null);
    setPhase('playing');
    onWalletUpdate({ balance: wallet.balance - bet });
  }

  function reveal(idx: number) {
    if (phase !== 'playing' || revealed.has(idx)) return;
    setJustRevealed(idx);
    setTimeout(() => setJustRevealed(null), 500);
    if (mines.has(idx)) {
      setRevealed(new Set([...revealed, idx]));
      setPhase('lost');
      notify(`💣 Міна! Втрачено ${bet}₮`);
      return;
    }
    const newRevealed = new Set([...revealed, idx]);
    setRevealed(newRevealed);
    setMult(calcMult(newRevealed.size, mineCount));
  }

  function cashout() {
    if (phase !== 'playing' || revealed.size === 0) return;
    const win = parseFloat((bet * mult).toFixed(2));
    onWalletUpdate({ balance: wallet.balance - bet + win, total_won: wallet.total_won + win });
    setPhase('won');
    notify(`💎 Виплата ×${mult} = +${win}₮`);
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
          <button className="u24-button-gold px-3 py-2 text-xs animate-gold-pulse" onClick={cashout}>
            💸 Забрати
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

      {/* Grid */}
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {Array.from({ length: GRID }, (_, i) => {
          const isRevealed = revealed.has(i);
          const isMine = mines.has(i);
          const showMine = isRevealed && isMine;
          const showGem = isRevealed && !isMine;
          const showAllMines = (phase === 'lost' || phase === 'won') && isMine && !isRevealed;
          const isJust = justRevealed === i;
          return (
            <button key={i} onClick={() => reveal(i)}
              disabled={phase !== 'playing' || isRevealed}
              className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-200 cursor-pointer select-none
                ${showMine ? 'bg-[#c0392b] border-2 border-[#e74c3c] shake' :
                  showGem ? `border-2 border-[#4caf7d] ${isJust ? 'win-flash' : ''}` :
                  showAllMines ? 'bg-[#c0392b]/20 border border-[#c0392b]/40' :
                  phase === 'playing' ? 'border-2 border-[#2f4a37] hover:border-[#a8792a] hover:scale-105 active:scale-95' :
                  'border border-[#2f4a37]/40 opacity-50'}`}
              style={{
                background: showMine ? undefined
                  : showGem ? 'linear-gradient(135deg, rgba(76,175,125,0.2), rgba(76,175,125,0.05))'
                  : showAllMines ? undefined
                  : phase === 'playing' ? 'linear-gradient(135deg, #1d2e20, #162219)'
                  : 'rgba(29,46,32,0.3)',
                boxShadow: showGem ? '0 0 12px rgba(76,175,125,0.4)' : showMine ? '0 0 12px rgba(192,57,43,0.5)' : undefined,
              }}>
              {showMine ? '💣' : showGem ? '💎' : showAllMines ? '💣' : phase === 'playing' ? (
                <span className="text-[#2f4a37] text-lg font-bold">◆</span>
              ) : ''}
            </button>
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
          <button className="u24-button py-4 text-base" onClick={startGame} disabled={bet < 1}>
            💣 Нова гра ({fmtCoins(bet)})
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

function ChickenRoadView({ wallet, onWalletUpdate, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'hit'>('idle');
  const [lane, setLane] = useState(0);
  const [mult, setMult] = useState(1.0);
  const [hitLane, setHitLane] = useState<number | null>(null);
  const [cars, setCars] = useState<boolean[]>([]);
  const [jumping, setJumping] = useState(false);

  function start() {
    if (bet > wallet.balance) { notify('Недостатньо коштів!'); return; }
    setCars(CHICKEN_BASE_RISK.map(risk => Math.random() < risk));
    setLane(0);
    setMult(1.0);
    setHitLane(null);
    setPhase('playing');
    onWalletUpdate({ balance: wallet.balance - bet });
  }

  async function jump() {
    if (phase !== 'playing' || jumping) return;
    setJumping(true);
    await new Promise(r => setTimeout(r, 200));
    setJumping(false);
    if (cars[lane]) {
      setHitLane(lane);
      setPhase('hit');
      notify(`🚗 Збила машина на смузі ${lane + 1}! Втрата ${fmtCoins(bet)}`);
      return;
    }
    const nextLane = lane + 1;
    setLane(nextLane);
    const newMult = CHICKEN_MULTS[lane] ?? CHICKEN_MULTS[CHICKEN_MULTS.length - 1];
    setMult(newMult);
    if (nextLane >= CHICKEN_LANES) {
      const win = parseFloat((bet * CHICKEN_MULTS[CHICKEN_LANES - 1]).toFixed(2));
      onWalletUpdate({ balance: wallet.balance - bet + win, total_won: wallet.total_won + win });
      setPhase('won');
      notify(`🎉 Пройшла всю дорогу! ×${CHICKEN_MULTS[CHICKEN_LANES - 1]} = +${win}₮`);
    }
  }

  function cashout() {
    if (phase !== 'playing' || lane === 0) return;
    const win = parseFloat((bet * mult).toFixed(2));
    onWalletUpdate({ balance: wallet.balance - bet + win, total_won: wallet.total_won + win });
    setPhase('won');
    notify(`💸 Курка втекла! ×${mult} = +${fmtCoins(win)}`);
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

      {/* Road — horizontal scrollable */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: '#0d1a0a', border: '1.5px solid rgba(76,175,125,0.2)', minHeight: 220 }}>
        {/* Road surface stripes */}
        <div className="absolute inset-0 flex flex-col justify-around py-4 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-px opacity-20" style={{ background: 'repeating-linear-gradient(90deg, #4caf7d 0, #4caf7d 20px, transparent 20px, transparent 40px)' }} />
          ))}
        </div>

        {/* Lanes (columns) */}
        <div className="relative flex h-full" style={{ minHeight: 220 }}>
          {/* Start zone */}
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 border-r border-[#4caf7d]/20">
            <span className="text-[10px] font-mono text-[#6b7c6d] mb-1">Start</span>
            <span className={`text-3xl transition-all duration-200 ${jumping ? '-translate-y-3' : ''} ${phase === 'idle' || (phase === 'playing' && lane === 0) ? '' : 'opacity-0'}`}>
              🐔
            </span>
          </div>

          {/* Road lanes */}
          {Array.from({ length: CHICKEN_LANES }, (_, i) => {
            const isPassed = lane > i + 1 || (phase !== 'playing' && lane > i);
            const isChickenHere = phase === 'playing' && lane === i + 1;
            const isHit = hitLane === i;
            const hasCar = (phase === 'hit' || phase === 'won') && cars[i];
            const isCurrent = phase === 'playing' && lane === i;
            const isFinished = phase !== 'idle' && phase !== 'playing';

            return (
              <div key={i} className={`flex-1 flex flex-col items-center justify-between py-3 border-r transition-all duration-300 relative
                ${isHit ? 'bg-[#c0392b]/20' : isPassed ? 'bg-[#4caf7d]/8' : isCurrent ? 'bg-[#a8792a]/10' : ''}`}
                style={{ borderColor: isHit ? 'rgba(192,57,43,0.4)' : isPassed ? 'rgba(76,175,125,0.2)' : 'rgba(29,74,54,0.3)' }}>
                {/* Multiplier */}
                <div className={`font-mono text-[10px] font-bold ${isPassed ? 'text-[#4caf7d]' : 'text-[#a8792a]'}`}>
                  ×{CHICKEN_MULTS[i]}
                </div>

                {/* Center — car or chicken */}
                <div className="flex items-center justify-center h-10 relative">
                  {hasCar && <span className="text-xl">🚗</span>}
                  {isHit && <span className="text-xl absolute">💥</span>}
                  {isChickenHere && (
                    <span className={`text-3xl transition-all duration-200 ${jumping ? '-translate-y-3' : ''}`}>🐔</span>
                  )}
                  {isPassed && !hasCar && <span className="text-base">✅</span>}
                </div>

                {/* Lane number */}
                <div className="font-mono text-[9px] text-[#6b7c6d]">{i + 1}</div>
              </div>
            );
          })}

          {/* Finish zone */}
          <div className="flex flex-col items-center justify-center w-14 flex-shrink-0 border-l border-[#4caf7d]/20">
            <span className="text-[10px] font-mono text-[#4caf7d] mb-1">×30</span>
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
          <button className="u24-button py-4 text-base" onClick={start}>
            🐔 Запустити курку ({fmtCoins(bet)})
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button className="u24-button flex-1 py-4 text-base" onClick={jump} disabled={jumping}>
            {jumping ? '✨ Стрибає...' : '⬆️ Стрибнути'}
          </button>
          {lane > 0 && (
            <button className="u24-button-gold flex-1 py-4 animate-gold-pulse" onClick={cashout}>
              💸 ×{mult.toFixed(1)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dice ─────────────────────────────────────────────────────────────────────

function DiceView({ wallet, onWalletUpdate, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; notify: (m: string) => void }) {
  const [bet, setBet] = useState(100);
  const [target, setTarget] = useState(50);
  const [dir, setDir] = useState<'over' | 'under'>('over');
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ val: number; won: boolean }[]>([]);

  const winChance = dir === 'over' ? (100 - target) : target;
  const payout = parseFloat((98 / winChance).toFixed(4));
  const isWin = result !== null && (dir === 'over' ? result > target : result < target);

  async function roll() {
    if (bet > wallet.balance) { notify('Недостатньо коштів!'); return; }
    setRolling(true);
    setResult(null);
    onWalletUpdate({ balance: wallet.balance - bet });
    await new Promise(r => setTimeout(r, 700));
    const val = Math.floor(Math.random() * 100) + 1;
    const won = dir === 'over' ? val > target : val < target;
    setResult(val);
    setRolling(false);
    setHistory(h => [{ val, won }, ...h.slice(0, 14)]);
    if (won) {
      const win = parseFloat((bet * payout).toFixed(2));
      onWalletUpdate({ balance: wallet.balance - bet + win, total_won: wallet.total_won + win });
      notify(`🎲 ${val} — Виграш! +${fmtCoins(win)}`);
    } else {
      notify(`🎲 ${val} — Програш!`);
    }
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

const CRYPTO_WALLETS = [
  { coin: 'USDT', network: 'TRC20', icon: '💵', addr: 'TQn9Y2khEA95LHDuCz7Nm7qjmBfHKxGJBp', color: '#26a17b' },
  { coin: 'TON',  network: 'TON',   icon: '💎', addr: 'UQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6reqaqURGhlkXiWUf', color: '#0098ea' },
  { coin: 'BTC',  network: 'BTC',   icon: '₿',  addr: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', color: '#f7931a' },
  { coin: 'ETH',  network: 'ERC20', icon: 'Ξ',  addr: '0x742d35Cc6634C0532925a3b8D4C9C2b08f0f5e3A', color: '#627eea' },
  { coin: 'SOL',  network: 'SOL',   icon: '◎',  addr: '8ZUczUAUSsDmCnCqFLhSbxJ9XoJ7RaGc2eNbBHjUcorZ', color: '#9945ff' },
];

interface PendingDeposit { id: string; coin: string; amount: number; usdEquiv: number; confirmAt: number; credited: boolean; }

function DepositView({ wallet, onWalletUpdate, notify }: { wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void; notify: (m: string) => void }) {
  const [selected, setSelected] = useState(CRYPTO_WALLETS[0]);
  const [amount, setAmount] = useState('');
  const [pending, setPending] = useState<PendingDeposit[]>([]);
  const [copied, setCopied] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      setPending(prev => prev.map(p => {
        if (!p.credited && Date.now() >= p.confirmAt) {
          onWalletUpdate({ balance: wallet.balance + p.usdEquiv });
          notify(`✅ Зараховано ${p.usdEquiv}₮ (${p.amount} ${p.coin})`);
          return { ...p, credited: true };
        }
        return p;
      }));
    }, 1000);
    return () => clearInterval(t);
  });

  function copyAddr() {
    navigator.clipboard.writeText(selected.addr).catch(() => {});
    setCopied(selected.coin);
    setTimeout(() => setCopied(''), 2000);
    notify(`📋 Адресу скопійовано!`);
  }

  const RATES: Record<string, number> = { USDT: 1, TON: 6.5, BTC: 97000, ETH: 3400, SOL: 170 };

  function submitDeposit() {
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    const usdEquiv = parseFloat((a * (RATES[selected.coin] ?? 1)).toFixed(2));
    const dep: PendingDeposit = {
      id: Math.random().toString(36).slice(2),
      coin: selected.coin,
      amount: a,
      usdEquiv,
      confirmAt: Date.now() + 30_000,
      credited: false,
    };
    setPending(p => [dep, ...p]);
    setAmount('');
    notify(`⏳ Депозит ${a} ${selected.coin} на підтвердженні (30с)`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <div className="border-2 border-[#a8792a] bg-[#1d2e20] text-white p-4 flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] text-[#6b7c6d] uppercase mb-0.5">Баланс</div>
          <div className="font-black text-2xl text-[#a8792a]">{wallet.balance.toFixed(2)}₮</div>
        </div>
        <div className="text-3xl">💰</div>
      </div>

      {/* Coin selector */}
      <div>
        <div className="font-black text-[10px] uppercase tracking-widest mb-2">Оберіть валюту</div>
        <div className="flex gap-2 flex-wrap">
          {CRYPTO_WALLETS.map(w => (
            <button key={w.coin} onClick={() => setSelected(w)}
              className={`flex items-center gap-1.5 px-3 py-2 border-2 font-black text-xs cursor-pointer transition-all ${selected.coin === w.coin ? 'border-[#a8792a] bg-[#a8792a10]' : 'border-[#1d2e20] hover:border-[#a8792a40]'}`}>
              <span style={{ color: w.color }}>{w.icon}</span>
              <span>{w.coin}</span>
              <span className="font-mono text-[9px] text-[#6b7c6d]">{w.network}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Address */}
      <div>
        <div className="font-black text-[10px] uppercase tracking-widest mb-1.5">
          Адреса {selected.coin} ({selected.network})
        </div>
        <div className="border-2 border-[#1d2e20] bg-[#f8f9f5] p-3 flex items-center gap-2">
          <div className="flex-1 font-mono text-xs break-all text-[#1d2e20] select-all">{selected.addr}</div>
          <button onClick={copyAddr} className="shrink-0 border-2 border-[#1d2e20] px-3 py-1.5 font-black text-[10px] uppercase hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer">
            {copied === selected.coin ? '✓' : '📋'}
          </button>
        </div>
        <div className="font-mono text-[10px] text-[#6b7c6d] mt-1.5 flex items-center gap-1">
          <span className="text-[#c0392b]">⚠</span>
          Відправляйте тільки {selected.coin} мережею {selected.network}
        </div>
      </div>

      {/* Simulate deposit */}
      <div className="border-2 border-dashed border-[#2f4a37] p-4 bg-[#1d2e2008]">
        <div className="font-black text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="text-[#a8792a]">⚡</span> Тестовий депозит (авто-зарахування 30с)
        </div>
        <div className="flex gap-2">
          <input type="number" className="u24-input flex-1" placeholder={`Сума ${selected.coin}`}
            value={amount} onChange={e => setAmount(e.target.value)} min="0.001" step="0.001" />
          <button onClick={submitDeposit} disabled={!amount || +amount <= 0} className="u24-button-gold shrink-0">
            Надіслати
          </button>
        </div>
        <div className="font-mono text-[10px] text-[#6b7c6d] mt-1.5">
          ≈ {amount ? (parseFloat(amount) * (RATES[selected.coin] ?? 1)).toFixed(2) : '0'}₮ за курсом
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <div className="font-black text-[10px] uppercase tracking-widest mb-2">Транзакції</div>
          <div className="flex flex-col gap-2">
            {pending.map(p => {
              const left = Math.max(0, Math.ceil((p.confirmAt - now) / 1000));
              return (
                <div key={p.id} className={`border-2 p-3 flex items-center gap-3 ${p.credited ? 'border-[#4caf7d] bg-[#4caf7d08]' : 'border-[#a8792a] bg-[#a8792a08]'}`}>
                  <div className="text-xl">{p.credited ? '✅' : '⏳'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs">{p.amount} {p.coin} → +{p.usdEquiv}₮</div>
                    <div className="font-mono text-[10px] text-[#6b7c6d]">
                      {p.credited ? 'Зараховано' : `Підтвердження через ${left}с…`}
                    </div>
                  </div>
                  {!p.credited && (
                    <div className="w-8 h-8 border-2 border-[#a8792a] flex items-center justify-center font-mono text-xs text-[#a8792a]">
                      {left}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Casino Lobby ─────────────────────────────────────────────────────────────

function CasinoLobby({ wallet, onSelectGame, notify }: {
  wallet: CasinoWallet;
  onSelectGame: (g: CasinoView) => void;
  notify: (m: string) => void;
}) {
  const xpToNext = (wallet.level * 500);
  const xpPct = Math.min(100, Math.round((wallet.xp % xpToNext) / xpToNext * 100));

  const GAMES = [
    { key: 'chicken' as CasinoView, icon: '🐔', label: 'Chicken Road', desc: 'Перейди дорогу · До ×30', hot: true, new: true },
    { key: 'crash'   as CasinoView, icon: '🚀', label: 'Crash',        desc: 'Забери до краху · Без ліміту', hot: true, new: false },
    { key: 'mines'   as CasinoView, icon: '💣', label: 'Mines',        desc: '5×5 мінне поле · До ×1000', hot: false, new: true },
    { key: 'dice'    as CasinoView, icon: '🎲', label: 'Dice',         desc: 'Більше / менше · До ×49', hot: false, new: false },
    { key: 'roulette' as CasinoView, icon: '🎡', label: 'Рулетка', desc: 'Європейська · До ×35', hot: false, new: false },
    { key: 'slots'    as CasinoView, icon: '🎰', label: 'Слоти',    desc: 'Джекпот ×50', hot: false, new: false },
  ];

  const ACHIEVEMENTS = [
    { key: 'roulette_zero', icon: '0️⃣', label: 'Зеро!', desc: 'Випало нуль на рулетці' },
    { key: 'slots_jackpot', icon: '7️⃣', label: 'Джекпот!', desc: 'Три сімки на слотах' },
    { key: 'big_winner', icon: '💰', label: 'Великий виграш', desc: 'Виграш від 5 000₮' },
    { key: 'roulette_straight_win', icon: '🎯', label: 'Ставка на число', desc: 'Перемога у Straight bet' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Deposit button */}
      <button onClick={() => onSelectGame('deposit')}
        className="u24-button-gold w-full flex items-center gap-2 justify-center">
        <Coins size={14} /> Поповнити через крипто
      </button>

      {/* Wallet card */}
      <div className="border-2 border-black bg-[#1d2e20] text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-[#a8792a]" />
            <span className="font-black text-xs uppercase tracking-widest">Мій гаманець</span>
          </div>
          <div className="font-black text-xl text-[#a8792a]">{fmtCoins(wallet.balance)}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Рівень', val: wallet.level },
            { label: 'Всього ставок', val: fmtCoins(wallet.total_bet) },
            { label: 'Всього виграно', val: fmtCoins(wallet.total_won) },
          ].map(s => (
            <div key={s.label} className="border border-[#2f4a37] px-2 py-1.5 text-center">
              <div className="font-mono text-[10px] text-[#6b7c6d] uppercase">{s.label}</div>
              <div className="font-black text-sm mt-0.5">{s.val}</div>
            </div>
          ))}
        </div>
        {/* XP bar */}
        <div>
          <div className="flex justify-between font-mono text-[10px] text-[#6b7c6d] mb-1">
            <span>Рівень {wallet.level}</span>
            <span>{wallet.xp % xpToNext} / {xpToNext} XP</span>
          </div>
          <div className="h-2 bg-[#2f4a37] border border-[#2f4a37]">
            <div className="h-full bg-[#a8792a] transition-all duration-500" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {/* Games */}
      <div>
        <div className="font-black text-xs uppercase tracking-widest text-[#6b7c6d] mb-2">Ігри</div>
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map(g => (
            <button key={g.key} onClick={() => onSelectGame(g.key)}
              className="u24-card p-4 text-left group relative cursor-pointer">
              {g.hot && !g.new && (
                <span className="absolute top-2 right-2 bg-[#c0392b] text-white font-black text-[9px] px-1.5 py-0.5 uppercase tracking-widest">HOT</span>
              )}
              {g.new && (
                <span className="absolute top-2 right-2 bg-[#4caf7d] text-white font-black text-[9px] px-1.5 py-0.5 uppercase tracking-widest">NEW</span>
              )}
              <div className="text-4xl mb-2">{g.icon}</div>
              <div className="font-black text-sm uppercase tracking-tight">{g.label}</div>
              <div className="font-mono text-[10px] text-[#6b7c6d] mt-0.5">{g.desc}</div>
              <div className="mt-3 font-black text-[10px] uppercase tracking-widest text-[#a8792a] flex items-center gap-1">
                Грати <ChevronRight size={10} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="font-black text-xs uppercase tracking-widest text-[#6b7c6d] mb-2">Досягнення</div>
        <div className="grid grid-cols-2 gap-2">
          {ACHIEVEMENTS.map(a => (
            <div key={a.key} className="border-2 border-black p-3 flex gap-2 items-start opacity-40">
              <span className="text-xl">{a.icon}</span>
              <div>
                <div className="font-black text-xs">{a.label}</div>
                <div className="font-mono text-[10px] text-[#6b7c6d]">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Player Profile ───────────────────────────────────────────────────────────

function ProfileView({ user, wallet, tickets, notify }: {
  user: User;
  wallet: CasinoWallet;
  tickets: SupportTicket[];
  notify: (m: string) => void;
}) {
  const winRate = wallet.total_bet > 0 ? Math.round((wallet.total_won / wallet.total_bet) * 100) : 0;

  const STATUS_COLOR: Record<string, string> = {
    open: '#a8792a', in_progress: '#1a73e8', resolved: '#4caf7d', closed: '#6b7c6d',
  };
  const STATUS_LABEL: Record<string, string> = {
    open: 'Відкрито', in_progress: 'В обробці', resolved: 'Вирішено', closed: 'Закрито',
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Avatar card */}
      <div className="border-2 border-black p-5 flex items-center gap-4">
        <Avatar name={user.full_name} size={64} online />
        <div className="flex-1 min-w-0">
          <div className="font-black text-lg uppercase tracking-tight truncate">{user.full_name}</div>
          <div className="font-mono text-xs text-[#6b7c6d] uppercase tracking-widest">{user.role} · Рівень {wallet.level}</div>
          <div className="font-mono text-xs text-[#a8792a] mt-1">{user.phone}</div>
        </div>
        <button onClick={() => notify('Редагування профілю — в розробці')} className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer">
          <Edit3 size={15} />
        </button>
      </div>

      {/* Stats */}
      <div>
        <div className="font-black text-xs uppercase tracking-widest text-[#6b7c6d] mb-2">Статистика казино</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Coins size={14} />, label: 'Баланс', val: fmtCoins(wallet.balance), color: '#a8792a' },
            { icon: <Trophy size={14} />, label: 'Рівень', val: `${wallet.level} lvl`, color: '#1d4636' },
            { icon: <TrendingUp size={14} />, label: 'Відсоток виграшу', val: `${winRate}%`, color: '#1a73e8' },
            { icon: <BarChart2 size={14} />, label: 'Всього виграно', val: fmtCoins(wallet.total_won), color: '#4caf7d' },
          ].map(s => (
            <div key={s.label} className="border-2 border-black p-3">
              <div className="flex items-center gap-1.5 mb-1" style={{ color: s.color }}>
                {s.icon}
                <span className="font-mono text-[10px] uppercase tracking-widest">{s.label}</span>
              </div>
              <div className="font-black text-lg">{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Support tickets */}
      <div>
        <div className="font-black text-xs uppercase tracking-widest text-[#6b7c6d] mb-2 flex items-center gap-2">
          <LifeBuoy size={12} /> Мої звернення ({tickets.length})
        </div>
        {tickets.length === 0 ? (
          <div className="border-2 border-dashed border-[#6b7c6d] p-4 text-center font-mono text-xs text-[#6b7c6d]">
            Звернень немає
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tickets.map(t => (
              <div key={t.id} className="border-2 border-black p-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: STATUS_COLOR[t.status] || '#6b7c6d' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{t.subject}</div>
                  <div className="font-mono text-[10px] text-[#6b7c6d] mt-0.5">{STATUS_LABEL[t.status] || t.status} · {fmtTime(t.created_at)}</div>
                </div>
                <span className={`font-black text-[10px] px-1.5 py-0.5 uppercase border`} style={{ color: STATUS_COLOR[t.status], borderColor: STATUS_COLOR[t.status] }}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => notify('Перейдіть до чату підтримки (кнопка 🛡 знизу)')} className="u24-button-outline w-full mt-2 text-xs py-2">
          <Plus size={12} /> Нове звернення
        </button>
      </div>

      {/* Account */}
      <div>
        <div className="font-black text-xs uppercase tracking-widest text-[#6b7c6d] mb-2">Обліковий запис</div>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Email', val: user.email },
            { label: 'Телефон', val: user.phone },
            { label: 'Роль', val: user.role },
          ].map(r => (
            <div key={r.label} className="border-2 border-black px-3 py-2 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#6b7c6d] uppercase tracking-widest">{r.label}</span>
              <span className="font-bold text-sm">{r.val}</span>
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
  const [country, setCountry] = useState<Country>(() => guessCountryFromLang(detectLang()));
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // For registration: always prepend dial code
  const fullPhone = phone ? `${country.dialCode}${phone.replace(/^\+/, '').replace(/^0/, '')}` : '';
  // For login: send as-is if email or already has +, else prepend dial code
  const loginIdentity = phone.includes('@') ? phone
    : phone.startsWith('+') ? phone
    : phone ? `${country.dialCode}${phone.replace(/^0/, '')}` : '';

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
    const body = tab === 'login'
      ? { identity: loginIdentity, password: form.password }
      : { full_name: form.full_name, phone: fullPhone, email: form.email, password: form.password };
    const res = await api<{ token: string; user: User }>(endpoint, { method: 'POST', body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok && res.data) onAuth(res.data.user, res.data.token, tab === 'register');
    else setError(res.error || t.errorDefault);
  }

  const LANG_FLAGS: Record<LangCode, string> = { en: '🇬🇧', uk: '🇺🇦', ru: '🇷🇺', es: '🇪🇸', it: '🇮🇹', de: '🇩🇪' };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #071a0c 0%, #0f2415 35%, #1a3320 65%, #0a1a0e 100%)' }}>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full opacity-[0.07]"
            style={{
              width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
              background: 'radial-gradient(circle, #a8792a, transparent)',
              left: `${10 + i * 15}%`, top: `${5 + i * 12}%`,
              animation: `float-coin ${3 + i * 0.7}s ease-in-out ${i * 0.5}s infinite alternate`,
              animationName: 'hb-hover',
            }} />
        ))}
      </div>

      <div className="w-full max-w-[380px] relative z-10">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center hb-hover"
              style={{
                background: 'linear-gradient(135deg, #1a4a2e 0%, #0f2415 100%)',
                boxShadow: '0 8px 32px rgba(168,121,42,0.4), 0 0 0 1px rgba(168,121,42,0.3)',
              }}>
              <HummingbirdLogo size={52} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4caf7d] border-2 border-[#071a0c]"
              style={{ boxShadow: '0 0 8px #4caf7d' }} />
          </div>
          <div className="text-center">
            <h1 className="font-black text-4xl tracking-tight text-white"
              style={{ textShadow: '0 0 30px rgba(168,121,42,0.5)' }}>
              {APP_NAME}
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: '#a8792a' }}>
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Lang flags */}
        <div className="flex justify-center gap-2.5 mb-6">
          {(Object.keys(I18N) as LangCode[]).map(l => (
            <button key={l} type="button" onClick={() => setLang(l)}
              className="transition-all duration-200 cursor-pointer"
              style={{ transform: lang === l ? 'scale(1.25)' : 'scale(1)', opacity: lang === l ? 1 : 0.4, filter: lang === l ? 'drop-shadow(0 2px 4px rgba(168,121,42,0.6))' : 'none' }}>
              <span className="text-2xl">{LANG_FLAGS[l]}</span>
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.96)',
            borderRadius: '24px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          }}>

          {/* Tabs */}
          <div className="flex p-1.5 gap-1.5" style={{ background: 'rgba(0,0,0,0.04)' }}>
            {(['login', 'register'] as const).map(tab_ => (
              <button key={tab_} type="button"
                onClick={() => { setTab(tab_); setError(''); }}
                className="flex-1 py-3 font-bold text-sm cursor-pointer transition-all duration-200 rounded-xl"
                style={{
                  background: tab === tab_ ? 'white' : 'transparent',
                  color: tab === tab_ ? '#1d2e20' : '#6b7c6d',
                  boxShadow: tab === tab_ ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                  fontWeight: tab === tab_ ? 800 : 600,
                }}>
                {tab_ === 'login' ? t.login : t.register}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="p-6 flex flex-col gap-4">

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7c6d' }}>{t.fullName}</label>
                <input className="u24-input" placeholder={t.namePlaceholder}
                  value={form.full_name} onChange={set('full_name')} required autoFocus />
              </div>
            )}

            {/* Country */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7c6d' }}>{t.country}</label>
              <CountryPicker value={country} onChange={c => setCountry(c)} t={t} />
            </div>

            {/* Phone/Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7c6d' }}>
                {tab === 'login' ? `${t.phone} / ${t.email}` : t.phone}
              </label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.12)' }}>
                <div className="flex items-center gap-1.5 px-3 shrink-0 select-none text-sm font-bold"
                  style={{ background: '#1d2e20', color: '#f1f5ee', minWidth: 80 }}>
                  <span>{country.flag}</span>
                  <span style={{ color: '#a8792a' }}>{country.dialCode}</span>
                </div>
                <input style={{ border: 'none', borderRadius: 0, background: 'white' }}
                  className="u24-input rounded-none flex-1 focus:ring-0"
                  placeholder={tab === 'login' ? `${t.phonePlaceholder} / ${t.emailPlaceholder}` : t.phonePlaceholder}
                  value={phone} onChange={e => setPhone(e.target.value)}
                  required={tab === 'register'} inputMode={phone.includes('@') ? 'email' : 'tel'} />
              </div>
              {tab === 'login' && (
                <p className="text-[10px] mt-1" style={{ color: '#9b9b9b' }}>
                  Введіть email повністю або цифри телефону
                </p>
              )}
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7c6d' }}>{t.email}</label>
                <input className="u24-input" type="email" placeholder={t.emailPlaceholder}
                  value={form.email} onChange={set('email')} required autoComplete="email" />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6b7c6d' }}>{t.password}</label>
              <input className="u24-input" type="password" placeholder="••••••••"
                value={form.password} onChange={set('password')} required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
            </div>

            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium rounded-xl"
                style={{ background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: '1px solid rgba(192,57,43,0.2)' }}>
                <span className="text-base">⚠️</span> {error}
              </div>
            )}

            {tab === 'register' && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(168,121,42,0.08)', border: '1px solid rgba(168,121,42,0.2)' }}>
                <span className="text-xl">🎁</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#a8792a' }}>Бонус при реєстрації</div>
                  <div className="text-xs" style={{ color: '#6b7c6d' }}>+200₮ на баланс одразу після входу</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="u24-button-gold w-full justify-center py-4 text-base font-black rounded-2xl mt-1">
              {loading
                ? <span className="animate-blink">{t.loading}</span>
                : <>{tab === 'login' ? '🔐' : '🚀'} {tab === 'login' ? t.loginBtn : t.registerBtn}</>}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 py-3 mx-6 mb-4 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.04)' }}>
            <span className="text-xs">🔒</span>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#9b9b9b' }}>
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

  const NAV_TABS: { key: SidebarTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { key: 'chats', icon: <MessageCircle size={16} />, label: 'Чати', badge: totalUnread || undefined },
    { key: 'casino', icon: <Zap size={16} />, label: 'Казино' },
    { key: 'profile', icon: <Award size={16} />, label: 'Профіль' },
  ];

  // On mobile: sidebarOpen = sidebar overlay; on desktop sidebar is always visible
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="h-screen flex overflow-hidden bg-surface">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside className={`sidebar z-50 transition-transform duration-300
        md:relative md:translate-x-0 md:flex
        ${sidebarOpen ? 'fixed inset-0 flex' : 'hidden md:flex'}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b-2 border-[#2f4a37] flex items-center gap-2">
          <HummingbirdLogo size={22} />
          <span className="font-black text-sm uppercase tracking-tight flex-1">Колібрі</span>
          <button onClick={() => setShowSupport(v => !v)} className="text-[#6b7c6d] hover:text-[#a8792a] transition-colors cursor-pointer" title="Підтримка">
            <LifeBuoy size={15} />
          </button>
          <button onClick={handleLogout} className="text-[#6b7c6d] hover:text-[#c0392b] transition-colors cursor-pointer" title="Вийти">
            <LogOut size={15} />
          </button>
        </div>

        {/* User */}
        <div className="px-4 py-2.5 border-b-2 border-[#2f4a37] flex items-center gap-2.5">
          <Avatar name={user?.full_name || 'User'} size={34} online />
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{user?.full_name}</div>
            <div className="font-mono text-[10px] text-[#a8792a]">Lvl {wallet.level} · {fmtCoins(wallet.balance)}</div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="grid grid-cols-3 border-b-2 border-[#2f4a37]">
          {NAV_TABS.map(t => (
            <button key={t.key} onClick={() => setSidebarTab(t.key)}
              className={`py-2.5 flex flex-col items-center gap-0.5 relative transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest ${sidebarTab === t.key ? 'bg-[#2f4a37] text-[#a8792a]' : 'text-[#6b7c6d] hover:text-white'}`}>
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="absolute top-1 right-2 bg-[#c0392b] text-white font-black text-[9px] px-1 min-w-[14px] text-center">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {sidebarTab === 'chats' && (
          <>
            <div className="px-3 py-2 border-b-2 border-[#2f4a37]">
              <div className="flex items-center gap-2 border border-[#2f4a37] bg-[#162219] px-3 py-1.5">
                <Search size={13} className="text-[#6b7c6d] shrink-0" />
                <input className="flex-1 bg-transparent text-white font-mono text-xs placeholder:text-[#6b7c6d] outline-none" placeholder="Пошук…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {filteredChats.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map(chat => (
                <button key={chat.id} onClick={() => selectChat(chat)}
                  className={`w-full px-4 py-3 flex items-center gap-3 border-b border-[#2f4a37] transition-all cursor-pointer text-left ${activeChat?.id === chat.id ? 'bg-[#2f4a37] border-l-4 border-l-[#a8792a]' : 'hover:bg-[#243628]'}`}>
                  <div className="shrink-0">
                    {chat.is_support ? (
                      <div className="w-10 h-10 border-2 border-[#a8792a] bg-[#1d4636] flex items-center justify-center">
                        <LifeBuoy size={16} className="text-[#a8792a]" />
                      </div>
                    ) : chat.is_group ? (
                      <div className="w-10 h-10 border-2 border-[#2f4a37] bg-[#1d4636] flex items-center justify-center">
                        <Users size={16} className="text-[#a8792a]" />
                      </div>
                    ) : (
                      <Avatar name={chat.title} size={40} online={chat.id % 2 === 0} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-sm truncate">
                        {chat.pinned && <span className="text-[#a8792a] mr-1">📌</span>}
                        {chat.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#6b7c6d] shrink-0">{chat.last_message ? fmtTime(chat.last_message.created_at) : ''}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="font-mono text-xs text-[#6b7c6d] truncate">{chat.last_message?.body || '—'}</span>
                      {chat.unread_count > 0 && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center font-black text-[10px] px-1 bg-[#a8792a] text-white">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {sidebarTab === 'casino' && (
          <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
            <div className="p-3 border-b-2 border-[#2f4a37]">
              <div className="font-black text-[10px] uppercase tracking-widest text-[#a8792a] mb-2">Ігри</div>
              {([
                { v: 'lobby',    icon: <Coins size={14} />, label: 'Лобі' },
                { v: 'chicken',  icon: '🐔', label: 'Chicken Road' },
                { v: 'crash',    icon: '🚀', label: 'Crash' },
                { v: 'mines',    icon: '💣', label: 'Mines' },
                { v: 'dice',     icon: '🎲', label: 'Dice' },
                { v: 'roulette', icon: '🎡', label: 'Рулетка' },
                { v: 'slots',    icon: '🎰', label: 'Слоти' },
                { v: 'deposit',  icon: <Coins size={14} className="text-[#a8792a]" />, label: '+ Поповнити' },
              ] as { v: CasinoView; icon: React.ReactNode; label: string }[]).map(({ v, icon, label }) => (
                <button key={v} onClick={() => { setCasinoView(v); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 mb-0.5 font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${casinoView === v ? 'bg-[#a8792a] text-white' : v === 'deposit' ? 'text-[#a8792a] hover:bg-[#a8792a20]' : 'text-[#6b7c6d] hover:text-white hover:bg-[#243628]'}`}>
                  <span className="text-base leading-none w-4 flex items-center">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
            <div className="p-3">
              <div className="font-black text-[10px] uppercase tracking-widest text-[#6b7c6d] mb-2">Мій баланс</div>
              <div className="border-2 border-[#2f4a37] p-3 text-center">
                <div className="font-black text-xl text-[#a8792a]">{fmtCoins(wallet.balance)}</div>
                <div className="font-mono text-[10px] text-[#6b7c6d] mt-1">Рівень {wallet.level} · {wallet.xp} XP</div>
              </div>
            </div>
          </div>
        )}

        {sidebarTab === 'profile' && (
          <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide p-3 gap-2">
            <div className="font-black text-[10px] uppercase tracking-widest text-[#a8792a] mb-1">Профіль</div>
            {user && (
              <div className="flex items-center gap-2 border-2 border-[#2f4a37] p-2">
                <Avatar name={user.full_name} size={36} online />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs truncate">{user.full_name}</div>
                  <div className="font-mono text-[10px] text-[#6b7c6d]">{user.role}</div>
                </div>
              </div>
            )}
            <button onClick={() => { setSidebarOpen(false); setSidebarTab('profile'); }} className="u24-button-outline w-full text-xs py-2">
              <ChevronRight size={12} /> Відкрити профіль
            </button>
            <button onClick={() => setShowSupport(v => !v)} className="w-full flex items-center gap-2 px-3 py-2.5 font-black text-xs uppercase tracking-widest text-[#6b7c6d] hover:text-white hover:bg-[#243628] cursor-pointer transition-all">
              <LifeBuoy size={14} /> Підтримка
            </button>
          </div>
        )}
      </aside>

      {/* ── Main ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden pb-14 md:pb-0">
        {/* Mobile top header — visible only when sidebar is closed on mobile */}
        {!sidebarOpen && (
          <div className="md:hidden flex items-center gap-3 px-4 py-3 shrink-0" style={{ background: '#111d13', borderBottom: '2px solid #1d2e20' }}>
            <HummingbirdLogo size={20} />
            <span className="font-black text-sm uppercase tracking-tight flex-1 text-white">{APP_NAME}</span>
            <div className="font-mono text-xs text-[#a8792a]">{fmtCoins(wallet.balance)}</div>
            <button onClick={handleLogout} className="text-[#6b7c6d]" title="Вийти"><LogOut size={16} /></button>
          </div>
        )}

        {/* Casino views */}
        {sidebarTab === 'casino' && casinoView === 'lobby' && (
          <CasinoLobby wallet={wallet} onSelectGame={v => { setCasinoView(v); setSidebarOpen(false); }} notify={notify} />
        )}
        {sidebarTab === 'casino' && casinoView === 'roulette' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">🎡</span>
              <div><div className="font-black text-sm uppercase">Рулетка</div><div className="font-mono text-[10px] text-[#6b7c6d]">Європейська · До ×35</div></div>
            </div>
            <RouletteView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'slots' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">🎰</span>
              <div><div className="font-black text-sm uppercase">Слоти</div><div className="font-mono text-[10px] text-[#6b7c6d]">3 барабани · Джекпот ×50</div></div>
            </div>
            <SlotsView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'crash' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">🚀</span>
              <div><div className="font-black text-sm uppercase">Crash</div><div className="font-mono text-[10px] text-[#6b7c6d]">Забери до краху</div></div>
            </div>
            <CrashView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'mines' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">💣</span>
              <div><div className="font-black text-sm uppercase">Mines</div><div className="font-mono text-[10px] text-[#6b7c6d]">5×5 мінне поле</div></div>
            </div>
            <MinesView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'chicken' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">🐔</span>
              <div><div className="font-black text-sm uppercase">Chicken Road</div><div className="font-mono text-[10px] text-[#6b7c6d]">Перейди дорогу · До ×30</div></div>
            </div>
            <ChickenRoadView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'dice' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <span className="text-2xl">🎲</span>
              <div><div className="font-black text-sm uppercase">Dice</div><div className="font-mono text-[10px] text-[#6b7c6d]">Більше / менше</div></div>
            </div>
            <DiceView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}
        {sidebarTab === 'casino' && casinoView === 'deposit' && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button onClick={() => setCasinoView('lobby')} className="cursor-pointer hover:text-[#a8792a] transition-colors"><ChevronLeft size={20} /></button>
              <Coins size={20} className="text-[#a8792a]" />
              <div><div className="font-black text-sm uppercase">Поповнення</div><div className="font-mono text-[10px] text-[#6b7c6d]">BTC · ETH · USDT · TON · SOL</div></div>
            </div>
            <DepositView wallet={wallet} onWalletUpdate={updateWallet} notify={notify} />
          </>
        )}

        {/* Profile view */}
        {sidebarTab === 'profile' && user && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <Award size={18} className="text-[#a8792a]" />
              <div className="font-black text-sm uppercase tracking-tight">Мій профіль</div>
            </div>
            <ProfileView user={user} wallet={wallet} tickets={tickets} notify={notify} />
          </>
        )}

        {/* Chat view */}
        {sidebarTab === 'chats' && activeChat && (
          <>
            <div className="border-b-2 border-black px-4 py-3 flex items-center gap-3 bg-surface shrink-0">
              <button className="md:hidden cursor-pointer hover:text-[#a8792a]" onClick={() => { setSidebarOpen(true); setActiveChat(null); }}>
                <ArrowLeft size={20} />
              </button>
              <div className="cursor-pointer" onClick={() => setShowChatInfo(v => !v)}>
                {activeChat.is_support ? (
                  <div className="w-10 h-10 border-2 border-[#a8792a] bg-[#1d4636] flex items-center justify-center">
                    <LifeBuoy size={18} className="text-[#a8792a]" />
                  </div>
                ) : activeChat.is_group ? (
                  <div className="w-10 h-10 border-2 border-black bg-[#1d4636] flex items-center justify-center">
                    <Users size={18} className="text-[#a8792a]" />
                  </div>
                ) : (
                  <Avatar name={activeChat.title} size={40} online />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm uppercase tracking-tight truncate">{activeChat.title}</div>
                <div className="font-mono text-[10px] text-[#6b7c6d]">
                  {activeChat.is_support ? <span className="text-[#a8792a]">🛡 Служба підтримки</span>
                    : activeChat.is_group ? 'Груповий чат'
                    : <span className="text-[#4caf7d]">● Онлайн</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!activeChat.is_support && <>
                  <button onClick={() => startCall('audio')} className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer"><Phone size={15} /></button>
                  <button onClick={() => startCall('video')} className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer"><Video size={15} /></button>
                </>}
                <button onClick={() => setShowChatInfo(v => !v)} className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-[#1d2e20] hover:text-white transition-all cursor-pointer"><Info size={15} /></button>
              </div>
            </div>

            <div className="bg-[#1d4636] border-b-2 border-black px-4 py-1 flex items-center gap-2">
              <Lock size={10} className="text-[#a8792a]" />
              <span className="font-mono text-[10px] text-[#a8792a] uppercase tracking-widest">E2E Encrypted · Nexus</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {chatMessages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center border-2 border-dashed border-[#6b7c6d] px-8 py-6">
                    <Lock size={24} className="text-[#6b7c6d] mx-auto mb-2" />
                    <div className="font-black text-sm uppercase">Повідомлень немає</div>
                  </div>
                </div>
              )}
              {chatMessages.map(msg => {
                const isOwn = msg.sender_id === (user?.id || 1) || msg.sender_name === 'Ви';
                return (
                  <div key={msg.id} className={`flex gap-2 animate-slide-up ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isOwn && <Avatar name={msg.sender_name} size={32} />}
                    <div className={`max-w-[65%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                      {!isOwn && activeChat.is_group && (
                        <span className="font-black text-[10px] uppercase text-[#a8792a] px-1">{msg.sender_name}</span>
                      )}
                      <div className={`px-4 py-2.5 text-sm font-mono leading-relaxed ${isOwn ? 'bubble-out' : 'bubble-in'}`}>{msg.body}</div>
                      <div className="flex items-center gap-1 px-1">
                        <span className="font-mono text-[10px] text-[#6b7c6d]">{fmtTime(msg.created_at)}</span>
                        {isOwn && (msg.read_by.length > 1 ? <CheckCheck size={12} className="text-[#4caf7d]" /> : <Check size={12} className="text-[#6b7c6d]" />)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t-2 border-black px-3 py-3 flex items-end gap-2 bg-surface shrink-0">
              <button className="w-9 h-9 border-2 border-black flex items-center justify-center hover:bg-[#1d2e20] hover:text-white cursor-pointer shrink-0"><Paperclip size={15} /></button>
              <div className="flex-1 border-2 border-black flex items-end">
                <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  rows={1} placeholder="Повідомлення… (Enter — надіслати)"
                  className="flex-1 resize-none bg-transparent px-3 py-2.5 font-mono text-sm outline-none placeholder:text-[#6b7c6d] max-h-32" />
                <button className="px-2 py-2.5 text-[#6b7c6d] hover:text-[#a8792a] cursor-pointer"><Smile size={15} /></button>
              </div>
              <button onClick={sendMessage} disabled={!input.trim()}
                className="w-9 h-9 border-2 border-black bg-[#1d2e20] text-white flex items-center justify-center hover:bg-[#a8792a] transition-colors cursor-pointer shrink-0 disabled:opacity-40">
                <Send size={15} />
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {sidebarTab === 'chats' && !activeChat && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
            <div className="border-2 border-black p-8 bg-surface shadow-[8px_8px_0px_0px_#1d2e20] text-center max-w-sm">
              <div className="text-5xl mb-4">🎰</div>
              <h2 className="font-black text-xl uppercase tracking-tight mb-2">Nexus</h2>
              <p className="font-mono text-sm text-[#6b7c6d] mb-6">Месенджер · Казино · Підтримка</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Lock size={12} />, t: 'E2E шифрування' },
                  { icon: <span className="text-sm">🎡</span>, t: 'Рулетка' },
                  { icon: <span className="text-sm">🎰</span>, t: 'Слоти' },
                  { icon: <LifeBuoy size={12} />, t: 'Підтримка' },
                ].map(f => (
                  <div key={f.t} className="border-2 border-black px-3 py-2 flex items-center gap-2">
                    <span className="text-[#a8792a]">{f.icon}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest">{f.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Chat info panel ───────────────────────────────────── */}
      {showChatInfo && activeChat && (
        <aside className="w-64 border-l-2 border-black flex flex-col bg-surface shrink-0 animate-slide-up overflow-y-auto">
          <div className="px-4 py-3 border-b-2 border-black flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-widest">Інформація</span>
            <button onClick={() => setShowChatInfo(false)} className="cursor-pointer hover:text-[#c0392b]"><X size={14} /></button>
          </div>
          <div className="p-4 flex flex-col items-center gap-2 border-b-2 border-black">
            {activeChat.is_support
              ? <div className="w-16 h-16 border-2 border-[#a8792a] bg-[#1d4636] flex items-center justify-center"><LifeBuoy size={28} className="text-[#a8792a]" /></div>
              : <Avatar name={activeChat.title} size={64} online />}
            <div className="font-black text-base uppercase tracking-tight text-center">{activeChat.title}</div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {[
              { l: 'Тип', v: activeChat.is_support ? 'Підтримка' : activeChat.is_group ? 'Група' : 'Особистий' },
              { l: 'Шифрування', v: 'E2E · Fernet' },
            ].map(r => (
              <div key={r.l} className="border-2 border-black px-3 py-2">
                <div className="font-mono text-[10px] text-[#6b7c6d] uppercase">{r.l}</div>
                <div className="font-bold text-sm mt-0.5">{r.v}</div>
              </div>
            ))}
            <button onClick={() => notify('Видалити чат — в розробці')} className="u24-button-danger w-full text-xs mt-2">
              <Trash2 size={12} /> Видалити чат
            </button>
          </div>
        </aside>
      )}

      {/* ── Mobile bottom nav ─────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex" style={{ background: '#111d13', borderTop: '2px solid #1d2e20' }}>
        {([
          { key: 'chats'   as SidebarTab, icon: <MessageCircle size={20} />, label: 'Чати',    badge: totalUnread },
          { key: 'casino'  as SidebarTab, icon: <Zap size={20} />,           label: 'Казино',  badge: 0 },
          { key: 'profile' as SidebarTab, icon: <Award size={20} />,         label: 'Профіль', badge: 0 },
        ]).map(item => (
          <button key={item.key}
            onClick={() => { setSidebarTab(item.key); setSidebarOpen(false); }}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 relative cursor-pointer transition-all"
            style={{ color: sidebarTab === item.key ? '#a8792a' : '#6b7c6d' }}>
            {item.badge > 0 && (
              <span className="absolute top-1.5 right-1/4 bg-[#c0392b] text-white font-black text-[9px] px-1 min-w-[16px] text-center rounded-none">
                {item.badge}
              </span>
            )}
            {item.icon}
            <span className="font-black text-[9px] uppercase tracking-widest">{item.label}</span>
            {sidebarTab === item.key && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-[#a8792a]" />
            )}
          </button>
        ))}
        {/* Hamburger for sidebar details */}
        <button onClick={() => setSidebarOpen(true)}
          className="w-12 flex flex-col items-center justify-center py-2.5 gap-0.5 cursor-pointer transition-all"
          style={{ color: '#6b7c6d', borderLeft: '1px solid #1d2e20' }}>
          <div className="flex flex-col gap-1">
            <div className="w-4 h-0.5 bg-current" />
            <div className="w-4 h-0.5 bg-current" />
            <div className="w-4 h-0.5 bg-current" />
          </div>
        </button>
      </nav>

      {/* ── Call overlay ──────────────────────────────────────── */}
      {call && <CallOverlay call={call} onEnd={endCall} onMute={() => setCall(p => p ? { ...p, muted: !p.muted } : null)} onVideo={() => setCall(p => p ? { ...p, video_off: !p.video_off } : null)} />}

      {/* ── Support widget ────────────────────────────────────── */}
      {showSupport && <SupportWidget onOpenChat={openSupportChat} onClose={() => setShowSupport(false)} />}

      {/* ── Toast ─────────────────────────────────────────────── */}
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
