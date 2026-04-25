import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import confetti from 'canvas-confetti';

// ─── Sound engine (Web Audio API, no deps) ────────────────────────────────────
const _audioCtx = (() => {
  try { return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); }
  catch { return null; }
})();

let _soundEnabled = (() => { try { return localStorage.getItem('sound_on') !== '0'; } catch { return true; } })();
function setSoundEnabled(v: boolean) {
  _soundEnabled = v;
  try { localStorage.setItem('sound_on', v ? '1' : '0'); } catch {}
}
function isSoundEnabled() { return _soundEnabled; }

function _playTone(freq: number, type: OscillatorType, gainVal: number, decay: number, delay = 0) {
  if (!_audioCtx || !_soundEnabled) return;
  try {
    const osc = _audioCtx.createOscillator();
    const gain = _audioCtx.createGain();
    osc.connect(gain); gain.connect(_audioCtx.destination);
    osc.type = type; osc.frequency.value = freq;
    const t = _audioCtx.currentTime + delay;
    gain.gain.setValueAtTime(gainVal, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + decay);
    osc.start(t); osc.stop(t + decay);
  } catch {}
}

const sfx = {
  click:  () => _playTone(660, 'sine', 0.15, 0.06),
  tick:   () => _playTone(880, 'square', 0.06, 0.04),
  win:    () => { _playTone(523, 'sine', 0.25, 0.15); _playTone(659, 'sine', 0.2, 0.15, 0.1); _playTone(784, 'sine', 0.2, 0.2, 0.2); },
  bigwin: () => { [523,659,784,1047].forEach((f,i)=>_playTone(f,'sine',0.3,0.3,i*0.08)); },
  lose:   () => { _playTone(200, 'sawtooth', 0.2, 0.25); _playTone(150, 'sawtooth', 0.15, 0.3, 0.1); },
  flip:   () => _playTone(440, 'triangle', 0.12, 0.08),
  cashout:() => { _playTone(880, 'sine', 0.3, 0.1); _playTone(1100, 'sine', 0.25, 0.15, 0.1); },
  spin:   () => { for (let i = 0; i < 6; i++) _playTone(200 + i * 80, 'sawtooth', 0.05, 0.06, i * 0.05); },
};

function celebrate(intensity: 'small' | 'big' | 'huge' = 'big') {
  const count = intensity === 'huge' ? 300 : intensity === 'big' ? 150 : 60;
  const defaults = { origin: { y: 0.7 }, colors: ['#E4A24B', '#5BBE8A', '#E54B5E', '#C678DD', '#6DB5D4'] };
  confetti({ ...defaults, particleCount: count * 0.6, spread: 60, startVelocity: 55, scalar: 1.1 });
  confetti({ ...defaults, particleCount: count * 0.4, spread: 120, startVelocity: 35, scalar: 0.8, decay: 0.9 });
  if (intensity === 'huge') {
    setTimeout(() => confetti({ ...defaults, particleCount: 120, spread: 100, startVelocity: 45 }), 250);
    setTimeout(() => confetti({ ...defaults, particleCount: 120, spread: 100, startVelocity: 45 }), 500);
    sfx.bigwin();
  } else if (intensity === 'big') {
    sfx.win();
  } else {
    sfx.cashout();
  }
}
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
  try {
    const saved = localStorage.getItem('app_lang') as LangCode;
    if (saved && saved in I18N) return saved;
  } catch {}
  const bl = ((navigator.languages?.[0] || navigator.language) || 'en').toLowerCase();
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
type SidebarTab = 'chats' | 'casino' | 'profile' | 'admin';
type CasinoView = 'lobby' | 'roulette' | 'slots' | 'crash' | 'mines' | 'chicken' | 'dice' | 'blackjack' | 'baccarat' | 'plinko' | 'limbo' | 'wheel' | 'hilo' | 'tower' | 'keno' | 'videopoker' | 'dragontiger' | 'scratch' | 'deposit' | 'leaderboard' | 'history';

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
  games_count?: number;
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
    id: 1, title: 'Nexus Команда', is_group: true, members: [],
    last_message: { id: 5, chat_id: 1, sender_id: 2, sender_name: 'Олексій', body: 'Хтось уже пробував новий Crash?', created_at: new Date(Date.now() - 120000).toISOString(), read_by: [1, 2] },
    unread_count: 2, muted: false, pinned: true,
  },
  {
    id: 2, title: 'Дмитро В.', is_group: false, members: [],
    last_message: { id: 9, chat_id: 2, sender_id: 1, sender_name: 'Ви', body: 'Побачимось у лобі 👍', created_at: new Date(Date.now() - 3600000).toISOString(), read_by: [1, 3] },
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
    { id: 1, chat_id: 1, sender_id: 2, sender_name: 'Олексій', body: 'Всім привіт! 👋', created_at: new Date(Date.now() - 600000).toISOString(), read_by: [1, 2, 3] },
    { id: 2, chat_id: 1, sender_id: 3, sender_name: 'Катерина', body: 'Привіт! Що нового?', created_at: new Date(Date.now() - 540000).toISOString(), read_by: [1, 2, 3] },
    { id: 3, chat_id: 1, sender_id: 1, sender_name: 'Ви', body: 'Є новий Plinko — дуже затягує 🎰', created_at: new Date(Date.now() - 480000).toISOString(), read_by: [1, 2, 3] },
    { id: 4, chat_id: 1, sender_id: 2, sender_name: 'Олексій', body: 'Хтось уже пробував новий Crash?', created_at: new Date(Date.now() - 120000).toISOString(), read_by: [1, 2] },
  ],
  2: [
    { id: 8, chat_id: 2, sender_id: 3, sender_name: 'Дмитро В.', body: 'Йо! Сьогодні грати будеш?', created_at: new Date(Date.now() - 7200000).toISOString(), read_by: [1, 3] },
    { id: 9, chat_id: 2, sender_id: 1, sender_name: 'Ви', body: 'Побачимось у лобі 👍', created_at: new Date(Date.now() - 3600000).toISOString(), read_by: [1, 3] },
  ],
  3: [
    { id: 13, chat_id: 3, sender_id: 1, sender_name: 'Ви', body: 'Доброго дня! Маю питання щодо поповнення балансу.', created_at: new Date(Date.now() - 900000).toISOString(), read_by: [1, 99] },
    { id: 14, chat_id: 3, sender_id: 99, sender_name: 'Служба підтримки', body: 'Дякуємо за звернення! Ми відповімо найближчим часом.', created_at: new Date(Date.now() - 600000).toISOString(), read_by: [99] },
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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BASE}${path}`, { ...opts, headers, signal: controller.signal });
    clearTimeout(timeout);
    const json = await res.json() as { ok: boolean; data?: T; error?: string };
    if (!json.ok && !json.error) json.error = `Помилка ${res.status}`;
    return json;
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === 'AbortError') return { ok: false, error: 'Час очікування вийшов.' };
    return { ok: false, error: 'Мережева помилка. Перевір підключення.' };
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

// ─── Toast (queue, progress bar, win/loss/info/error) ────────────────────────

type ToastItem = { id: number; msg: string };
const _toastListeners: Set<(item: ToastItem) => void> = new Set();
let _toastId = 0;
function pushToast(msg: string) {
  const item: ToastItem = { id: ++_toastId, msg };
  _toastListeners.forEach(fn => fn(item));
}

function useToastQueue() {
  const [queue, setQueue] = useState<ToastItem[]>([]);
  useEffect(() => {
    const handler = (item: ToastItem) => setQueue(q => [...q.slice(-2), item]);
    _toastListeners.add(handler);
    return () => { _toastListeners.delete(handler); };
  }, []);
  const remove = (id: number) => setQueue(q => q.filter(t => t.id !== id));
  return { queue, remove };
}

function ToastItem({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [pct, setPct] = useState(100);
  const DURATION = 3500;
  useEffect(() => {
    const start = performance.now();
    const raf = (now: number) => {
      const elapsed = now - start;
      setPct(Math.max(0, 100 - (elapsed / DURATION) * 100));
      if (elapsed < DURATION) requestAnimationFrame(raf);
      else onDone();
    };
    requestAnimationFrame(raf);
  }, [onDone]);

  const msg = item.msg;
  const isWin  = /^[🎉🏆💰✅🎰🚀🂡🎯🎡🎴🐉🃏💎⭐]|Виграш|Win|\+\d/.test(msg);
  const isError = /^[⚠️❌💥🚫]|Помилка|Error|error/.test(msg);
  const isLoss  = !isWin && !isError && /^[😞💸]|Програш|Без виграшу|Міна|Збила|💣/.test(msg);

  const accent = isWin ? '#5BBE8A' : isError ? '#E54B5E' : isLoss ? '#888' : '#E4A24B';
  const bg     = isWin ? '#0d2a1a' : isError ? '#2a0d0d' : isLoss ? '#1a1a1a' : '#1a1608';
  const icon   = isWin ? '💰' : isError ? '⚠️' : isLoss ? '💸' : 'ℹ️';

  return (
    <div style={{
      background: bg, border: `1.5px solid ${accent}50`,
      borderRadius: 14, overflow: 'hidden', minWidth: 260, maxWidth: 320,
      boxShadow: `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${accent}20`,
      animation: 'slideInRight 0.25s cubic-bezier(0.22,1,0.36,1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.4, flex: 1 }}>{msg}</span>
        <button onClick={onDone} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, lineHeight: 1, cursor: 'pointer', background: 'none', border: 'none', padding: 0, flexShrink: 0 }}>✕</button>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, transition: 'width 0.1s linear', borderRadius: 2 }} />
      </div>
    </div>
  );
}

function ToastStack({ queue, remove }: { queue: ToastItem[]; remove: (id: number) => void }) {
  if (!queue.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 16, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end',
    }}>
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}`}</style>
      {queue.map(item => (
        <ToastItem key={item.id} item={item} onDone={() => remove(item.id)} />
      ))}
    </div>
  );
}

// Legacy shim — kept for compatibility
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { pushToast(msg); onDone(); }, [msg]);
  return null;
}

// ─── Animated balance counter ─────────────────────────────────────────────────

function AnimatedBalance({ value, currency = ' ₮' }: { value: number; currency?: string }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to) return;
    const duration = Math.min(600, Math.abs(to - from) / Math.max(1, Math.abs(to)) * 400 + 200);
    const start = performance.now();
    const raf = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) requestAnimationFrame(raf);
      else setDisplay(to);
    };
    requestAnimationFrame(raf);
  }, [value]);

  return <>{Math.round(display).toLocaleString('uk')}{currency}</>;
}

// ─── Error boundary ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(e: Error) { return { error: e }; }
  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ color: '#E54B5E', fontWeight: 700, marginTop: 8 }}>Помилка компонента</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{this.state.error.message}</div>
          <button onClick={() => this.setState({ error: null })}
            style={{ marginTop: 16, padding: '8px 20px', borderRadius: 10, background: '#E4A24B', color: '#1a0d00', fontWeight: 700, cursor: 'pointer', border: 'none' }}>
            Спробувати знову
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── BetInput — shared bet control with ½, ×2, presets ───────────────────────

function BetInput({
  value, onChange, min = 1, max = 10000, balance = 10000,
  presets = [10, 50, 100, 500], disabled = false,
  accentColor = '#E4A24B',
}: {
  value: number; onChange: (v: number) => void;
  min?: number; max?: number; balance?: number;
  presets?: number[]; disabled?: boolean; accentColor?: string;
}) {
  const clamp = (v: number) => Math.max(min, Math.min(max, Math.min(balance, v)));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', width: 44, flexShrink: 0 }}>Ставка</span>
        <input
          type="number" value={value}
          onChange={e => onChange(clamp(+e.target.value || min))}
          min={min} max={Math.min(max, balance)} disabled={disabled}
          style={{
            flex: 1, background: '#163524', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '8px 10px', color: '#fff', fontFamily: 'monospace',
            fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={() => onChange(clamp(value / 2))} disabled={disabled}
          style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: 12, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}>
          ½
        </button>
        <button onClick={() => onChange(clamp(value * 2))} disabled={disabled}
          style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', fontWeight: 800, fontSize: 12, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)' }}>
          ×2
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {presets.map(v => (
          <button key={v} onClick={() => { sfx.click(); onChange(clamp(v)); }} disabled={disabled}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 8, fontWeight: 800, fontSize: 11,
              background: value === v ? accentColor : 'rgba(255,255,255,0.04)',
              color: value === v ? '#1a0d00' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${value === v ? accentColor : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer',
            }}>
            {v >= 1000 ? `${v/1000}k` : v}
          </button>
        ))}
        <button onClick={() => { sfx.click(); onChange(clamp(balance)); }} disabled={disabled}
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, fontWeight: 800, fontSize: 10,
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          }}>
          MAX
        </button>
      </div>
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
    sfx.spin();
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
    if (res.net > 0) { celebrate(res.net > totalBet * 5 ? 'huge' : 'big'); notify(`🎉 Виграш ${fmtCoins(res.total_win)}! Число: ${res.number}`); }
    else { sfx.lose(); notify(`Число ${res.number} — програш ${fmtCoins(Math.abs(res.net))}`); }
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

// ─── Slot symbols: each maps emoji → rich SVG ────────────────────────────────

const SLOT_SVG: Record<string, (size: number) => React.ReactElement> = {
  '🍒': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 6px rgba(220,50,50,0.5))' }}>
      <circle cx="22" cy="38" r="12" fill="#e53935" stroke="#b71c1c" strokeWidth="2"/>
      <circle cx="38" cy="42" r="12" fill="#c62828" stroke="#b71c1c" strokeWidth="2"/>
      <circle cx="22" cy="38" r="5" fill="#ef9a9a" opacity="0.4"/>
      <path d="M24 26 Q32 12 44 10" stroke="#2e7d32" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M37 30 Q36 18 44 10" stroke="#388e3c" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <ellipse cx="46" cy="9" rx="4" ry="3" fill="#4caf50"/>
    </svg>
  ),
  '🍋': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 6px rgba(255,220,0,0.5))' }}>
      <ellipse cx="32" cy="34" rx="20" ry="16" fill="#fdd835" stroke="#f9a825" strokeWidth="2"/>
      <ellipse cx="24" cy="28" rx="8" ry="6" fill="#fff176" opacity="0.5"/>
      <ellipse cx="44" cy="18" rx="5" ry="4" fill="#fdd835" stroke="#f9a825" strokeWidth="1.5" transform="rotate(-30 44 18)"/>
      <path d="M32 18 Q34 12 38 10" stroke="#a5d6a7" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="38" cy="9" rx="3" ry="2" fill="#66bb6a"/>
    </svg>
  ),
  '🍊': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 6px rgba(255,140,0,0.5))' }}>
      <circle cx="32" cy="36" r="20" fill="#fb8c00" stroke="#e65100" strokeWidth="2"/>
      <circle cx="24" cy="28" r="8" fill="#ffcc80" opacity="0.4"/>
      <path d="M32 16 Q33 8 36 6" stroke="#2e7d32" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="36" cy="5" rx="4" ry="2.5" fill="#4caf50"/>
      <path d="M20 36 L44 36M32 24 L32 48M25 27 L39 45M39 27 L25 45" stroke="#e65100" strokeWidth="1" opacity="0.3"/>
    </svg>
  ),
  '🍇': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 8px rgba(130,50,200,0.5))' }}>
      {[[24,46],[38,46],[31,36],[18,36],[44,36],[25,26],[39,26]].map(([cx,cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="9" fill="#8e24aa" stroke="#6a1b9a" strokeWidth="1.5"/>
          <circle cx={cx-3} cy={cy-3} r="3" fill="#ce93d8" opacity="0.5"/>
        </g>
      ))}
      <path d="M32 17 Q36 10 42 8" stroke="#43a047" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <ellipse cx="43" cy="7" rx="4" ry="2.5" fill="#66bb6a"/>
    </svg>
  ),
  '💎': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 12px rgba(100,180,255,0.7))' }}>
      <polygon points="32,8 58,26 32,58 6,26" fill="#42a5f5" stroke="#1565c0" strokeWidth="2"/>
      <polygon points="32,8 58,26 32,28 6,26" fill="#90caf9" stroke="#1565c0" strokeWidth="1.5"/>
      <polygon points="32,8 44,26 32,28 20,26" fill="#e3f2fd"/>
      <polygon points="32,28 6,26 32,58" fill="#1976d2"/>
      <polygon points="32,28 58,26 32,58" fill="#2196f3"/>
      <line x1="32" y1="8" x2="32" y2="58" stroke="#bbdefb" strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  '⭐': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 10px rgba(255,200,0,0.7))' }}>
      <polygon points="32,6 38,24 58,24 43,36 49,54 32,42 15,54 21,36 6,24 26,24" fill="#ffd600" stroke="#f57f17" strokeWidth="2"/>
      <polygon points="32,6 38,24 58,24 43,36 49,54 32,42 15,54 21,36 6,24 26,24" fill="url(#starGrad)"/>
      <defs>
        <radialGradient id="starGrad" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#fff59d"/>
          <stop offset="100%" stopColor="#ffd600"/>
        </radialGradient>
      </defs>
      <circle cx="26" cy="20" r="4" fill="#fff" opacity="0.5"/>
    </svg>
  ),
  '7️⃣': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 14px rgba(255,50,50,0.8))' }}>
      <rect x="6" y="6" width="52" height="52" rx="10" fill="#d32f2f" stroke="#b71c1c" strokeWidth="2.5"/>
      <rect x="6" y="6" width="52" height="26" rx="10" fill="#ef5350" opacity="0.5"/>
      <text x="32" y="46" textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize="36" fontWeight="900" fill="#fff" stroke="#ffcdd2" strokeWidth="1">7</text>
    </svg>
  ),
  '🔔': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,193,7,0.6))' }}>
      <path d="M32 8 Q48 8 50 28 L54 48 L10 48 L14 28 Q16 8 32 8Z" fill="#ffc107" stroke="#f57f17" strokeWidth="2"/>
      <path d="M32 8 Q40 8 42 24" fill="none" stroke="#fff9c4" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
      <ellipse cx="32" cy="49" rx="10" ry="4" fill="#f9a825"/>
      <circle cx="32" cy="55" r="5" fill="#ff8f00" stroke="#e65100" strokeWidth="1.5"/>
      <circle cx="32" cy="14" r="4" fill="#fff" opacity="0.3"/>
    </svg>
  ),
  '🃏': (s) => (
    <svg width={s} height={s} viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 2px 10px rgba(255,255,255,0.4))' }}>
      <rect x="6" y="4" width="52" height="56" rx="6" fill="#fff" stroke="#e0e0e0" strokeWidth="2"/>
      <text x="32" y="40" textAnchor="middle" fontFamily="Georgia,serif" fontSize="32" fontWeight="900" fill="#c62828">♥</text>
      <text x="12" y="18" fontFamily="Georgia,serif" fontSize="12" fontWeight="900" fill="#c62828">A</text>
      <text x="50" y="54" fontFamily="Georgia,serif" fontSize="12" fontWeight="900" fill="#c62828" transform="rotate(180 50 54)">A</text>
    </svg>
  ),
};
const SYM_FALLBACK = (sym: string, size: number) => (
  <div style={{ width: size, height: size, fontSize: size * 0.7, display:'flex', alignItems:'center', justifyContent:'center' }}>{sym}</div>
);
function SlotSymbol({ sym, size }: { sym: string; size: number }) {
  const fn = SLOT_SVG[sym];
  return fn ? fn(size) : SYM_FALLBACK(sym, size);
}

// ─── SlotsView ─────────────────────────────────────────────────────────────────

function SlotsView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const ALL_SYMS = ['🍒','🍋','🍊','🍇','💎','⭐','7️⃣','🔔'];
  const REEL_COUNT = 3;
  const VISIBLE = 3;
  const CELL_H = 90; // px per symbol cell

  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoCount, setAutoCount] = useState(0);
  const autoRef = useRef(false);
  const [reels, setReels] = useState<string[][]>([['🍒','🍋','🍊'],['💎','⭐','7️⃣'],['🍊','🍒','🍋']]);
  const [lastResult, setLastResult] = useState<SlotsResult | null>(null);
  const [history, setHistory] = useState<SlotsResult[]>([]);
  const stripRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  // Build a random-looking strip of symbols with finalSyms at positions (end-2, end-1, end)
  function buildStrip(finalSyms: string[], extraRows = 20): string[] {
    const strip: string[] = [];
    for (let i = 0; i < extraRows; i++) {
      strip.push(ALL_SYMS[Math.floor(Math.random() * ALL_SYMS.length)]);
    }
    // last 3 are the final visible result
    strip.push(...finalSyms);
    return strip;
  }

  async function spinReel(reelIdx: number, finalSyms: string[], durationMs: number): Promise<void> {
    const strip = buildStrip(finalSyms, 22 + reelIdx * 6);
    const el = stripRefs.current[reelIdx];
    if (!el) return;

    // Clear and rebuild strip DOM
    el.innerHTML = '';
    strip.forEach(sym => {
      const cell = document.createElement('div');
      cell.style.cssText = `height:${CELL_H}px;display:flex;align-items:center;justify-content:center;`;
      const inner = document.createElement('div');
      inner.style.cssText = `font-size:52px;line-height:1;display:flex;align-items:center;justify-content:center;width:100%;`;
      inner.textContent = sym;
      cell.appendChild(inner);
      el.appendChild(cell);
    });

    const totalH = strip.length * CELL_H;
    // We want to land so the last 3 symbols (finalSyms) are centered in the visible 3-row window
    // End position: top = -(totalH - VISIBLE * CELL_H)
    const endY = -(totalH - VISIBLE * CELL_H);

    // Web Animations API — same technique as html5-slot-machine (johakr/html5-slot-machine ★605)
    const anim = el.animate(
      [
        { top: '0px', filter: 'blur(0px)' },
        { filter: `blur(4px)`, offset: 0.4 },
        { top: `${endY}px`, filter: 'blur(0px)' },
      ],
      {
        duration: durationMs,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    );

    return new Promise(resolve => { anim.onfinish = () => resolve(); });
  }

  async function spin() {
    if (spinning) return;
    sfx.spin();
    setSpinning(true);
    setLastResult(null);

    const apiRes = await api<SlotsResult>('/casino/slots/spin', {
      method: 'POST', body: JSON.stringify({ bet }),
    }, token);

    if (!apiRes.ok) {
      setSpinning(false);
      notify(apiRes.error || 'Помилка.');
      return;
    }
    const res = apiRes.data!;

    // Animate reels in cascade — same staggered timing as original project
    await Promise.all(
      Array.from({ length: REEL_COUNT }, (_, i) =>
        spinReel(i, res.reels[i], 1400 + i * 500)
      )
    );

    setReels(res.reels);
    setLastResult(res);
    setSpinning(false);
    setHistory(h => [res, ...h.slice(0, 9)]);
    onWalletUpdate({ balance: res.new_balance, xp: wallet.xp + (res.xp_gained || 0) });
    if (res.win > 0) {
      notify(`🎰 ×${res.multiplier} = +${fmtCoins(res.win)}`);
      celebrate(res.multiplier >= 50 ? 'huge' : res.multiplier >= 10 ? 'big' : 'small');
    } else {
      sfx.lose();
    }
    // auto-spin
    if (autoRef.current) {
      setAutoCount(c => c - 1);
      if (autoCount > 1 && res.new_balance >= bet) {
        setTimeout(spin, 500);
      } else {
        autoRef.current = false;
        setAutoSpin(false);
      }
    }
  }

  function toggleAuto(n: number) {
    if (autoSpin) {
      autoRef.current = false;
      setAutoSpin(false);
    } else {
      autoRef.current = true;
      setAutoSpin(true);
      setAutoCount(n);
      spin();
    }
  }

  const winSyms = lastResult && lastResult.multiplier > 0
    ? reels.map(r => r[1])
    : [];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-4" style={{ background: '#0B1A12' }}>

      {/* MACHINE BODY */}
      <div className="rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(170deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        border: '3px solid rgba(228,162,75,0.5)',
        boxShadow: '0 0 60px rgba(228,162,75,0.15), 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Header banner */}
        <div className="px-4 py-3 flex items-center justify-between" style={{
          background: 'linear-gradient(90deg, #1a1a1a 0%, #2d1a00 50%, #1a1a1a 100%)',
          borderBottom: '2px solid rgba(228,162,75,0.4)',
        }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 24, filter: 'drop-shadow(0 0 8px #E4A24B)' }}>🎰</span>
            <div>
              <div className="font-black text-[#E4A24B] text-sm uppercase tracking-widest" style={{ letterSpacing: '0.2em' }}>
                NEXUS SLOTS
              </div>
              <div className="text-[#E4A24B]/50 text-[9px] uppercase tracking-wider">Provably Fair · RTP 97%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#E4A24B]/50 text-[9px] uppercase">Баланс</div>
            <div className="font-mono font-black text-[#5BBE8A] text-sm">{fmtCoins(wallet.balance)}</div>
          </div>
        </div>

        {/* REEL WINDOW */}
        <div className="px-4 pt-5 pb-3">
          <div className="relative rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(180deg, #000 0%, #050d15 100%)',
            border: '2px solid rgba(228,162,75,0.4)',
            height: VISIBLE * CELL_H,
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
          }}>
            {/* Top/bottom shadow vignette */}
            <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:10,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)' }} />
            {/* Win-line stripe */}
            <div style={{
              position:'absolute',left:0,right:0,
              top: CELL_H, height: CELL_H, pointerEvents:'none', zIndex:5,
              background: lastResult && lastResult.multiplier > 0
                ? 'rgba(228,162,75,0.08)' : 'rgba(255,255,255,0.02)',
              borderTop: '1px solid rgba(228,162,75,0.3)',
              borderBottom: '1px solid rgba(228,162,75,0.3)',
            }} />

            {/* Reel separators */}
            <div style={{ position:'absolute',inset:0,display:'flex',zIndex:6,pointerEvents:'none' }}>
              <div style={{ flex:1 }} />
              <div style={{ width:2,background:'rgba(228,162,75,0.2)',margin:'8px 0' }} />
              <div style={{ flex:1 }} />
              <div style={{ width:2,background:'rgba(228,162,75,0.2)',margin:'8px 0' }} />
              <div style={{ flex:1 }} />
            </div>

            {/* Reels */}
            <div style={{ display:'flex',height:'100%' }}>
              {Array.from({ length: REEL_COUNT }, (_, ri) => (
                <div key={ri} style={{ flex:1,overflow:'hidden',position:'relative' }}>
                  <div
                    ref={el => { stripRefs.current[ri] = el; }}
                    style={{ position:'absolute',top:0,left:0,right:0 }}>
                    {/* Default display when not spinning */}
                    {reels[ri].map((sym, si) => (
                      <div key={si} style={{
                        height: CELL_H,
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        <div style={{
                          fontSize: si === 1 ? 56 : 36,
                          opacity: si === 1 ? 1 : 0.35,
                          filter: si === 1 && winSyms.includes(sym) && winSyms[0] === winSyms[1] && winSyms[1] === winSyms[2]
                            ? 'drop-shadow(0 0 18px rgba(228,162,75,1)) drop-shadow(0 0 36px rgba(228,162,75,0.6))' : undefined,
                          transform: si === 1 ? 'scale(1)' : 'scale(0.8)',
                          transition: 'all 0.3s ease',
                        }}>
                          {sym}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result banner */}
          <div style={{ height: 40, marginTop: 8, display:'flex',alignItems:'center',justifyContent:'center' }}>
            {lastResult && !spinning && (
              <div className="font-black text-center text-sm rounded-xl px-6 py-2"
                style={{
                  background: lastResult.multiplier > 0 ? 'rgba(228,162,75,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${lastResult.multiplier > 0 ? 'rgba(228,162,75,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: lastResult.multiplier > 0 ? '#E4A24B' : 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.05em',
                }}>
                {lastResult.multiplier > 0 ? `🎉 ×${lastResult.multiplier} · +${fmtCoins(lastResult.win)}` : 'Без виграшу'}
              </div>
            )}
          </div>
        </div>

        {/* BET + SPIN controls */}
        <div className="px-4 pb-5 flex flex-col gap-3">
          <BetInput value={bet} onChange={setBet} balance={wallet.balance} presets={[5,25,50,100]} disabled={spinning||autoSpin} />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={spin} disabled={spinning || bet > wallet.balance || autoSpin}
              style={{
                flex: 1, padding:'16px', borderRadius: 16, fontWeight: 900, fontSize: 16,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: spinning || autoSpin ? 'not-allowed' : 'pointer',
                background: spinning ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #E4A24B 0%, #c97d1a 50%, #E4A24B 100%)',
                color: spinning ? 'rgba(255,255,255,0.3)' : '#1a0a00',
                border: spinning ? '2px solid rgba(255,255,255,0.08)' : '2px solid #E4A24B',
                boxShadow: spinning ? 'none' : '0 0 28px rgba(228,162,75,0.4)',
                display:'flex', alignItems:'center', justifyContent:'center', gap: 10,
                opacity: autoSpin ? 0.4 : 1,
              }}>
              {spinning
                ? <><RefreshCw size={18} style={{ animation:'spin 0.6s linear infinite' }} /> {autoSpin ? `Авто ${autoCount}` : 'Крутимо…'}</>
                : `🎰 SPIN`}
            </button>
            {/* Auto-spin toggle */}
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {autoSpin ? (
                <button onClick={() => { autoRef.current=false; setAutoSpin(false); }}
                  style={{ padding:'16px 14px', borderRadius:14, background:'rgba(229,75,94,0.15)', color:'#E54B5E', fontWeight:800, fontSize:11, border:'1px solid #E54B5E60', cursor:'pointer', whiteSpace:'nowrap', height:'100%' }}>
                  ⏹ {autoCount}
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {[10,25,50].map(n => (
                    <button key={n} onClick={() => toggleAuto(n)} disabled={spinning || bet > wallet.balance}
                      style={{ padding:'4px 10px', borderRadius:8, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.5)', fontWeight:700, fontSize:10, border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer' }}>
                      A×{n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYTABLE */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(228,162,75,0.2)', background:'rgba(255,255,255,0.02)' }}>
        <div className="px-4 py-2 font-black text-[10px] uppercase tracking-widest text-[#E4A24B]"
          style={{ background:'rgba(228,162,75,0.06)', borderBottom:'1px solid rgba(228,162,75,0.15)' }}>
          Таблиця виплат
        </div>
        <div className="grid grid-cols-2">
          {Object.entries(SLOTS_PAY).map(([combo, m], idx) => (
            <div key={combo} className="px-3 py-2 flex items-center justify-between gap-2"
              style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex gap-0.5">{combo.split(',').map((s, i) => (
                <span key={i} style={{ fontSize: 18 }}>{s}</span>
              ))}</div>
              <div className="font-black text-sm text-[#E4A24B]">×{m}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History chips */}
      {history.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {history.map((r, i) => (
            <div key={i} className="rounded-lg w-10 h-10 flex items-center justify-center font-mono text-[10px] font-black"
              style={{
                background: r.net >= 0 ? 'rgba(91,190,138,0.12)' : 'rgba(229,75,94,0.1)',
                border: `1px solid ${r.net >= 0 ? '#5BBE8A60' : '#E54B5E40'}`,
                color: r.net >= 0 ? '#5BBE8A' : '#E54B5E',
              }}>
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
  // ── Socket state ────────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);
  const [serverPhase, setServerPhase] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [mult, setMult] = useState(1.00);
  const [waitingUntil, setWaitingUntil] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const [chartPoints, setChartPoints] = useState<number[]>([1]);
  const [players, setPlayers] = useState<{ name: string; amount: number }[]>([]);
  const [cashouts, setCashouts] = useState<{ name: string; mult: number; win: number }[]>([]);

  // ── Local bet state ──────────────────────────────────────────────────────────
  const [bet, setBet] = useState(100);
  const [autoCashout, setAutoCashout] = useState(2.0);
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [myWin, setMyWin] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const autoCashoutRef = useRef(autoCashout);
  useEffect(() => { autoCashoutRef.current = autoCashout; }, [autoCashout]);

  // ── Connect to /crash namespace ──────────────────────────────────────────────
  useEffect(() => {
    const url = window.location.origin;
    const socket = io(`${url}/crash`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('state', (s: { phase: 'waiting' | 'flying' | 'crashed'; mult: number; waiting_until: number; bets: { name: string; amount: number }[]; cashouts: { name: string; mult: number; win: number }[] }) => {
      setServerPhase(s.phase);
      setMult(s.mult ?? 1);
      setWaitingUntil(s.waiting_until * 1000);
      setPlayers(s.bets ?? []);
      setCashouts(s.cashouts ?? []);
      if (s.phase === 'flying') setChartPoints([1, s.mult]);
    });

    socket.on('phase', (d: { phase: 'waiting' | 'flying' | 'crashed'; waiting_until?: number; round_id?: number }) => {
      setServerPhase(d.phase);
      if (d.phase === 'waiting') {
        setMult(1.0);
        setChartPoints([1]);
        setPlayers([]);
        setCashouts([]);
        setBetPlaced(false);
        setCashedOut(false);
        setMyWin(0);
        setWaitingUntil((d.waiting_until ?? 0) * 1000);
      }
      if (d.phase === 'flying') setChartPoints([1]);
    });

    socket.on('tick', (d: { mult: number }) => {
      setMult(d.mult);
      setChartPoints(prev => [...prev.slice(-120), d.mult]);
      if (autoCashoutRef.current > 1 && d.mult >= autoCashoutRef.current) {
        socket.emit('cashout', { token });
      }
    });

    socket.on('crashed', (d: { crash_at: number; cashouts: typeof cashouts; round_id: number }) => {
      setMult(d.crash_at);
      setHistory(h => [d.crash_at, ...h.slice(0, 9)]);
      setCashouts(d.cashouts ?? []);
    });

    socket.on('bet_placed', (d: { name: string; amount: number }) => {
      setPlayers(prev => [...prev, d]);
    });

    socket.on('player_cashed_out', (d: { name: string; mult: number; win: number }) => {
      setCashouts(prev => [...prev, d]);
    });

    socket.on('cashed_out', (d: { mult: number; win: number; new_balance: number }) => {
      setCashedOut(true);
      setMyWin(d.win);
      onWalletUpdate({ balance: d.new_balance, total_won: wallet.total_won + d.win });
      notify(`✅ Виплата ×${d.mult.toFixed(2)} = +${fmtCoins(d.win)}`);
    });

    socket.on('error', (d: { msg: string }) => notify(d.msg));

    return () => { socket.disconnect(); };
  }, [token]);

  // ── Countdown timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (serverPhase !== 'waiting') { setCountdown(0); return; }
    const id = setInterval(() => {
      setCountdown(Math.max(0, Math.ceil((waitingUntil - Date.now()) / 1000)));
    }, 200);
    return () => clearInterval(id);
  }, [serverPhase, waitingUntil]);

  function placeBet() {
    if (bet < 1 || bet > wallet.balance) { notify('Невірна ставка або недостатньо коштів.'); return; }
    socketRef.current?.emit('place_bet', { token, amount: bet });
    setBetPlaced(true);
  }

  function doCashout() {
    if (!betPlaced || cashedOut) return;
    socketRef.current?.emit('cashout', { token });
  }

  const multColor = serverPhase === 'crashed' ? '#c0392b' : cashedOut ? '#4caf7d' : '#E4A24B';
  const canvasPhase = serverPhase === 'crashed' ? 'crashed' : cashedOut ? 'cashed' : serverPhase === 'flying' ? 'running' : 'idle';

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      {/* Connection indicator + history */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#5BBE8A] animate-pulse' : 'bg-[#E54B5E]'}`} />
        <span className="font-mono text-[10px] text-[#E8F2EA]/40">{connected ? 'LIVE' : 'З\'єднання…'}</span>
        <div className="flex gap-1 ml-auto flex-wrap justify-end">
          {history.map((v, i) => (
            <span key={i} className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ${v < 1.5 ? 'text-[#E54B5E] bg-[#E54B5E10]' : v > 5 ? 'text-[#5BBE8A] bg-[#5BBE8A10]' : 'text-[#E4A24B] bg-[#E4A24B10]'}`}>
              ×{v.toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl overflow-hidden relative" style={{ background: 'linear-gradient(180deg, #0d1f11 0%, #111d13 100%)', border: '1.5px solid rgba(228,162,75,0.25)' }}>
        <div className="absolute top-3 left-0 right-0 flex flex-col items-center z-10">
          {serverPhase === 'waiting' ? (
            <>
              <div className="font-black text-2xl text-[#E8F2EA]/40 uppercase tracking-widest">Приймаємо ставки</div>
              <div className="font-black text-5xl text-[#E4A24B] mt-1">{countdown}с</div>
            </>
          ) : (
            <div className="font-black text-5xl tracking-tighter"
              style={{ color: multColor, textShadow: `0 0 24px ${multColor}60` }}>
              ×{mult.toFixed(2)}
            </div>
          )}
        </div>
        {serverPhase === 'crashed' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="font-black text-xl text-[#E54B5E] uppercase tracking-widest animate-fade-in bg-[#0d1f11]/80 px-5 py-2 rounded-xl mt-16">
              💥 КРАХ!
            </div>
          </div>
        )}
        {cashedOut && serverPhase === 'flying' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="font-black text-xl text-[#5BBE8A] uppercase tracking-widest animate-fade-in bg-[#0d1f11]/80 px-5 py-2 rounded-xl mt-16">
              💸 +{fmtCoins(myWin)}
            </div>
          </div>
        )}
        <div style={{ height: 180 }}>
          <CrashCanvas points={chartPoints} phase={canvasPhase} />
        </div>
      </div>

      {/* Players list */}
      {players.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[#E8F2EA]/30 px-3 py-2 bg-[#0B1A12]">
            {players.length} гравців · {cashouts.length} виплат
          </div>
          <div className="max-h-28 overflow-y-auto">
            {players.map((p, i) => {
              const co = cashouts.find(c => c.name === p.name);
              return (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 border-t border-white/5">
                  <div className="font-mono text-xs text-[#E8F2EA]/60 truncate max-w-[120px]">{p.name}</div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-[#E8F2EA]/40">{fmtCoins(p.amount)}</span>
                    {co && <span className="font-black text-[10px] text-[#5BBE8A]">×{co.mult.toFixed(2)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bet controls */}
      {serverPhase === 'waiting' && !betPlaced && (
        <>
          <BetInput value={bet} onChange={setBet} balance={wallet.balance} presets={[10,50,100,500,1000]} />
          <div className="flex items-center gap-2">
            <label className="font-mono text-[10px] text-[#E8F2EA]/40 uppercase whitespace-nowrap">Auto ×</label>
            <input type="number" className="u24-input flex-1" value={autoCashout} onChange={e => setAutoCashout(+e.target.value)} min={1.01} step={0.1} />
          </div>
          <button className="u24-button py-4 text-base" onClick={placeBet} disabled={!connected || bet < 1}>
            🚀 Поставити {fmtCoins(bet)}₮
          </button>
        </>
      )}

      {serverPhase === 'waiting' && betPlaced && (
        <div className="rounded-xl px-4 py-3 text-center font-black text-sm text-[#5BBE8A]"
          style={{ background: 'rgba(91,190,138,0.08)', border: '1px solid rgba(91,190,138,0.2)' }}>
          ✅ Ставка {fmtCoins(bet)}₮ прийнята — чекаємо старту!
        </div>
      )}

      {serverPhase === 'flying' && betPlaced && !cashedOut && (
        <button className="u24-button-gold py-4 text-lg animate-gold-pulse" onClick={doCashout}>
          💸 ВИПЛАТА ×{mult.toFixed(2)} = {fmtCoins(parseFloat((bet * mult).toFixed(2)))}
        </button>
      )}

      {serverPhase === 'flying' && !betPlaced && (
        <div className="rounded-xl px-4 py-3 text-center font-mono text-xs text-[#E8F2EA]/40"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
          Ставки приймаються тільки під час відліку
        </div>
      )}
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
      sfx.lose(); notify(`💣 Міна! Втрачено ${fmtCoins(bet)}`);
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
          <BetInput value={bet} onChange={setBet} balance={wallet.balance} presets={[10,50,100,500]} disabled={loading} />
          <div>
            <label className="block font-black text-[10px] uppercase tracking-widest mb-1.5 text-[#6b7c6d]">Кількість мін</label>
            <select className="u24-input" value={mineCount} onChange={e => setMineCount(+e.target.value)}>
              {[1,2,3,5,8,10,15,20,24].map(v => <option key={v} value={v}>{v} 💣</option>)}
            </select>
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
    else { sfx.lose(); notify(`🎲 ${val} — Програш!`); }
    // Fetch new seed for next round
    fetchSeed();
    setClientSeed(Math.random().toString(36).slice(2, 10));
  }

  // Enter key → roll
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter' && !rolling && bet >= 1) roll(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rolling, bet, dir, target]);

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
      <BetInput value={bet} onChange={setBet} balance={wallet.balance} presets={[10,50,100,500,1000]} disabled={rolling} />

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

// ─── Playing Card ────────────────────────────────────────────────────────────

function BJCard({ card, hidden = false }: { card?: { suit: string; value: string }; hidden?: boolean }) {
  if (hidden || !card) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-white/20 text-white/50 text-xl font-bold select-none"
        style={{ width: 44, height: 64, background: 'linear-gradient(135deg,#163524,#0d2518)', flexShrink: 0 }}>
        ?
      </div>
    );
  }
  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div className="flex flex-col rounded-lg border border-white/10 select-none"
      style={{ width: 44, height: 64, background: '#f8f4ee', flexShrink: 0, padding: '4px 5px' }}>
      <span className="font-black leading-none text-sm" style={{ color: isRed ? '#c0392b' : '#1a1a1a' }}>{card.value}</span>
      <span className="font-bold leading-none text-base" style={{ color: isRed ? '#c0392b' : '#1a1a1a' }}>{card.suit}</span>
    </div>
  );
}

// ─── Blackjack ───────────────────────────────────────────────────────────────

function BlackjackView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [sessionId, setSessionId] = useState('');
  const [playerCards, setPlayerCards] = useState<{ suit: string; value: string }[]>([]);
  const [dealerCards, setDealerCards] = useState<{ suit: string; value: string }[]>([]);
  const [dealerHidden, setDealerHidden] = useState(true);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const phase = sessionId ? 'playing' : 'idle';

  async function startGame() {
    setLoading(true); setOutcome(null);
    const r = await api<any>('/casino/blackjack/start', { method: 'POST', body: JSON.stringify({ bet }) }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    const d = r.data!;
    if (d.status === 'done') { applyResult(d); return; }
    setSessionId(d.session_id);
    setPlayerCards(d.player);
    setDealerCards(d.dealer);
    setDealerHidden(true);
    setPlayerValue(d.player_value);
    setDealerValue(null);
    onWalletUpdate({ balance: d.new_balance });
  }

  async function doAction(action: string) {
    if (!sessionId || loading) return;
    setLoading(true);
    const r = await api<any>('/casino/blackjack/action', { method: 'POST', body: JSON.stringify({ session_id: sessionId, action }) }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    const d = r.data!;
    setPlayerCards(d.player);
    setPlayerValue(d.player_value);
    if (d.status === 'done') { applyResult(d); } else { setDealerCards(d.dealer); }
  }

  function applyResult(d: any) {
    setSessionId('');
    setPlayerCards(d.player || playerCards);
    setDealerCards(d.dealer || dealerCards);
    setDealerHidden(false);
    setPlayerValue(d.player_value);
    setDealerValue(d.dealer_value);
    setOutcome(d.outcome);
    onWalletUpdate({ balance: d.new_balance });
    const msgs: Record<string, string> = {
      blackjack: `🃏 Блекджек! +${fmtCoins(d.win)}`,
      win: `✅ Перемога! +${fmtCoins(d.win)}`,
      push: '🤝 Нічия — ставку повернено',
      loss: '❌ Поразка',
    };
    notify(msgs[d.outcome] || '');
  }

  const outcomeColor: Record<string, string> = {
    blackjack: '#E4A24B', win: '#5BBE8A', push: '#6DB5D4', loss: '#E54B5E',
  };
  const outcomeLabel: Record<string, string> = {
    blackjack: 'Блекджек!', win: 'Перемога!', push: 'Нічия', loss: 'Поразка',
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4" style={{ background: '#0B1A12' }}>
      {/* Dealer zone */}
      <div className="rounded-2xl border border-white/5 p-4" style={{ background: '#112A1C' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
          Дилер {!dealerHidden && dealerValue !== null ? `· ${dealerValue}` : ''}
        </div>
        <div className="flex gap-2 flex-wrap">
          {dealerCards.map((c, i) => <React.Fragment key={i}><BJCard card={c} hidden={dealerHidden && i > 0} /></React.Fragment>)}
          {dealerCards.length === 0 && <div className="text-white/20 text-sm">Карти ще не роздані</div>}
        </div>
      </div>

      {/* Player zone */}
      <div className="rounded-2xl border border-white/5 p-4" style={{ background: '#112A1C' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-3">
          Гравець · {playerValue || '—'}
        </div>
        <div className="flex gap-2 flex-wrap">
          {playerCards.map((c, i) => <React.Fragment key={i}><BJCard card={c} /></React.Fragment>)}
          {playerCards.length === 0 && <div className="text-white/20 text-sm">Карти ще не роздані</div>}
        </div>
      </div>

      {/* Outcome */}
      {outcome && (
        <div className="rounded-2xl border p-4 text-center font-black text-lg transition-all animate-slide-up"
          style={{ borderColor: outcomeColor[outcome] + '60', background: outcomeColor[outcome] + '15', color: outcomeColor[outcome] }}>
          {outcomeLabel[outcome] || outcome}
        </div>
      )}

      {/* Controls */}
      {phase === 'idle' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs w-12">Ставка</span>
            <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1} max={wallet.balance}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
              style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map(v => (
              <button key={v} onClick={() => setBet(v)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
                style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={startGame} disabled={loading || bet > wallet.balance || bet < 1}
            className="u24-button py-4 text-base font-black transition-all disabled:opacity-40">
            {loading ? '…' : 'Роздати карти'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => doAction('hit')} disabled={loading}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: '#5BBE8A', color: '#0B1A12' }}>Ще</button>
          <button onClick={() => doAction('stand')} disabled={loading}
            className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 disabled:opacity-40"
            style={{ background: '#E54B5E', color: '#fff' }}>Стоп</button>
          {playerCards.length === 2 && (
            <button onClick={() => doAction('double')} disabled={loading || wallet.balance < bet}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 disabled:opacity-40"
              style={{ background: '#E4A24B', color: '#1a1006' }}>×2</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Baccarat ─────────────────────────────────────────────────────────────────

function BaccaratView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [betType, setBetType] = useState<'player' | 'banker' | 'tie'>('player');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function deal() {
    setLoading(true); setResult(null);
    const r = await api<any>('/casino/baccarat/play', {
      method: 'POST', body: JSON.stringify({ bet_type: betType, amount: bet }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setResult(r.data);
    onWalletUpdate({ balance: r.data.new_balance });
    if (r.data.win > 0) notify(`✅ +${fmtCoins(r.data.win)}`);
    else if (r.data.winner === 'tie' && betType !== 'tie') notify('🤝 Нічия — ставку повернено');
    else notify('❌ Поразка');
  }

  const BET_OPTS = [
    { key: 'player' as const, label: 'Гравець', odds: '1:1', color: '#5BBE8A' },
    { key: 'banker' as const, label: 'Банкір', odds: '0.95:1', color: '#E4A24B' },
    { key: 'tie' as const, label: 'Нічия', odds: '8:1', color: '#6DB5D4' },
  ];

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4" style={{ background: '#0B1A12' }}>
      {/* Cards result */}
      {result && (
        <div className="flex gap-3 animate-slide-up">
          {(['player', 'banker'] as const).map(side => (
            <div key={side} className="flex-1 rounded-2xl border border-white/5 p-3"
              style={{ background: '#112A1C', outline: result.winner === side ? `2px solid ${side === 'player' ? '#5BBE8A' : '#E4A24B'}` : undefined }}>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-2 flex justify-between"
                style={{ color: side === 'player' ? '#5BBE8A' : '#E4A24B' }}>
                <span>{side === 'player' ? 'Гравець' : 'Банкір'}</span>
                <span className="text-white/60">{side === 'player' ? result.player_value : result.banker_value}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(side === 'player' ? result.player_cards : result.banker_cards).map((c: { suit: string; value: string }, i: number) => (
                  <React.Fragment key={i}><BJCard card={c} /></React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className="rounded-2xl border p-3 text-center font-black text-base animate-slide-up"
          style={{
            borderColor: result.win > 0 ? '#5BBE8A60' : result.winner === 'tie' && betType !== 'tie' ? '#6DB5D440' : '#E54B5E40',
            background: result.win > 0 ? '#5BBE8A15' : '#E54B5E10',
            color: result.win > 0 ? '#5BBE8A' : result.winner === 'tie' && betType !== 'tie' ? '#6DB5D4' : '#E54B5E',
          }}>
          Переміг: {result.winner === 'player' ? 'Гравець' : result.winner === 'banker' ? 'Банкір' : 'Нічия'}
          {result.win > 0 && <span> · +{fmtCoins(result.win)}</span>}
        </div>
      )}

      {/* Bet type */}
      <div className="flex gap-2">
        {BET_OPTS.map(o => (
          <button key={o.key} onClick={() => setBetType(o.key)}
            className="flex-1 py-3 rounded-xl flex flex-col items-center gap-0.5 transition-all border"
            style={{
              background: betType === o.key ? o.color + '25' : '#112A1C',
              borderColor: betType === o.key ? o.color + '80' : 'rgba(255,255,255,0.06)',
              boxShadow: betType === o.key ? `0 0 12px ${o.color}20` : undefined,
            }}>
            <span className="font-black text-sm" style={{ color: betType === o.key ? o.color : 'rgba(255,255,255,0.7)' }}>{o.label}</span>
            <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{o.odds}</span>
          </button>
        ))}
      </div>

      {/* Bet amount */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white/50 text-xs w-12">Ставка</span>
          <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
            style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
        <div className="flex gap-2">
          {[10, 50, 100, 500].map(v => (
            <button key={v} onClick={() => setBet(v)}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <button onClick={deal} disabled={loading || bet > wallet.balance || bet < 1}
        className="u24-button py-4 text-base font-black disabled:opacity-40">
        {loading ? '…' : 'Роздати'}
      </button>
    </div>
  );
}

// ─── Plinko ───────────────────────────────────────────────────────────────────

function PlinkoCanvas({ rows, path, multipliers, bucket, animating, onDone }: {
  rows: number; path: number[] | null; multipliers: number[]; bucket: number | null;
  animating: boolean; onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const W = canvas.width, H = canvas.height;
    const bucketH = 28;
    const boardH = H - bucketH;
    const PAD = 16;
    const colW = (W - PAD * 2) / rows;
    const rowH = boardH / (rows + 2);

    function drawBoard() {
      ctx.fillStyle = '#0B1A12';
      ctx.fillRect(0, 0, W, H);
      for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 2;
        for (let p = 0; p < pegsInRow; p++) {
          const x = W / 2 - (pegsInRow - 1) * colW / 2 + p * colW;
          const y = PAD + (r + 1) * rowH;
          ctx.beginPath();
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fill();
        }
      }
    }

    function drawBuckets(activeBucket: number | null) {
      const bucketCount = rows + 1;
      const bucketW = (W - PAD * 2) / bucketCount;
      const mults = multipliers;
      for (let i = 0; i < bucketCount; i++) {
        const x = PAD + i * bucketW;
        const y = boardH;
        const m = mults[i] ?? 0;
        const isActive = i === activeBucket;
        const intensity = Math.min(1, m / 5);
        const r = Math.round(91 + (229 - 91) * intensity);
        const g = Math.round(190 + (75 - 190) * intensity);
        const b = Math.round(138 + (94 - 138) * intensity);
        ctx.fillStyle = isActive ? `rgba(${r},${g},${b},0.9)` : `rgba(${r},${g},${b},0.35)`;
        ctx.fillRect(x + 1, y, bucketW - 2, bucketH);
        ctx.fillStyle = isActive ? '#fff' : 'rgba(255,255,255,0.7)';
        ctx.font = `bold ${m >= 10 ? 9 : 10}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`${m}×`, x + bucketW / 2, y + 18);
      }
    }

    if (!path || !animating) {
      drawBoard();
      drawBuckets(bucket);
      return;
    }

    const ballPositions: { x: number; y: number }[] = [];
    let cx = W / 2;
    ballPositions.push({ x: cx, y: PAD });
    for (let r = 0; r < rows; r++) {
      cx += (path[r] === 0 ? -1 : 1) * colW / 2;
      ballPositions.push({ x: cx, y: PAD + (r + 1) * rowH });
    }
    ballPositions.push({ x: cx, y: boardH - 6 });

    let step = 0, progress = 0;
    const SPEED = 0.12;

    function animate() {
      drawBoard();
      drawBuckets(null);
      if (step >= ballPositions.length - 1) {
        ctx.beginPath();
        ctx.arc(ballPositions[ballPositions.length - 1].x, ballPositions[ballPositions.length - 1].y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#E4A24B';
        ctx.fill();
        onDone();
        return;
      }
      const from = ballPositions[step], to = ballPositions[step + 1];
      const bx = from.x + (to.x - from.x) * progress;
      const by = from.y + (to.y - from.y) * progress;
      const easedP = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const drawY = from.y + (to.y - from.y) * easedP;
      ctx.beginPath();
      ctx.arc(bx, drawY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#E4A24B';
      ctx.shadowColor = '#E4A24B';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      progress += SPEED;
      if (progress >= 1) { progress = 0; step++; }
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [rows, path, multipliers, bucket, animating]);

  return <canvas ref={canvasRef} width={320} height={320} className="rounded-2xl w-full" style={{ maxWidth: 360 }} />;
}

function PlinkoView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [rows, setRows] = useState<8 | 12 | 16>(8);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [pendingResult, setPendingResult] = useState<any>(null);

  const defaultMults: Record<number, Record<string, number[]>> = {
    8: { low: [5.6,2.1,1.1,1.0,0.5,1.0,1.1,2.1,5.6], medium: [13,3,1.3,0.7,0.4,0.7,1.3,3,13], high: [29,4,1.5,0.3,0.2,0.3,1.5,4,29] },
    12: { low: [10,3,1.6,1.4,1.1,1.0,0.5,1.0,1.1,1.4,1.6,3,10], medium: [33,11,4,2,1.1,0.6,0.3,0.6,1.1,2,4,11,33], high: [130,26,9,4,2,0.2,0.2,0.2,2,4,9,26,130] },
    16: { low: [16,9,2,1.4,1.4,1.2,1.1,1,0.5,1,1.1,1.2,1.4,1.4,2,9,16], medium: [110,41,10,5,3,1.5,1,0.5,0.3,0.5,1,1.5,3,5,10,41,110], high: [999,130,26,9,4,2,0.2,0.2,0.2,0.2,2,4,9,26,130,999] },
  };

  const currentMults = (result?.multipliers ?? defaultMults[rows][risk]) as number[];

  async function drop() {
    setLoading(true); setResult(null); setPendingResult(null);
    const r = await api<any>('/casino/plinko/drop', {
      method: 'POST', body: JSON.stringify({ bet, rows, risk }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setPendingResult(r.data);
    setAnimating(true);
  }

  function onAnimDone() {
    setAnimating(false);
    if (pendingResult) {
      setResult(pendingResult);
      onWalletUpdate({ balance: pendingResult.new_balance });
      if (pendingResult.win > 0) notify(`🎯 ×${pendingResult.mult} · +${fmtCoins(pendingResult.win)}`);
      else notify(`❌ ×${pendingResult.mult}`);
    }
  }

  const displayResult = animating ? null : result;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      <div className="flex justify-center">
        <PlinkoCanvas
          rows={animating ? (pendingResult?.rows ?? rows) : rows}
          path={animating ? pendingResult?.path ?? null : null}
          multipliers={currentMults}
          bucket={displayResult?.bucket ?? null}
          animating={animating}
          onDone={onAnimDone}
        />
      </div>

      {displayResult && (
        <div className="rounded-2xl border p-3 text-center font-black text-base animate-slide-up"
          style={{
            borderColor: displayResult.win > 0 ? '#5BBE8A60' : '#E54B5E40',
            background: displayResult.win > 0 ? '#5BBE8A15' : '#E54B5E10',
            color: displayResult.win > 0 ? '#5BBE8A' : '#E54B5E',
          }}>
          ×{displayResult.mult} {displayResult.win > 0 ? `· +${fmtCoins(displayResult.win)}` : ''}
        </div>
      )}

      {/* Settings */}
      <div className="flex gap-2">
        {([8, 12, 16] as const).map(r => (
          <button key={r} onClick={() => { setRows(r); setResult(null); }}
            disabled={animating}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all border"
            style={{ background: rows === r ? '#E4A24B' : '#112A1C', color: rows === r ? '#1a1006' : 'rgba(255,255,255,0.6)', borderColor: rows === r ? '#E4A24B' : 'rgba(255,255,255,0.06)' }}>
            {r} рядків
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(['low', 'medium', 'high'] as const).map(rv => {
          const col = rv === 'low' ? '#5BBE8A' : rv === 'medium' ? '#E4A24B' : '#E54B5E';
          return (
            <button key={rv} onClick={() => { setRisk(rv); setResult(null); }}
              disabled={animating}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all border"
              style={{ background: risk === rv ? col + '25' : '#112A1C', color: risk === rv ? col : 'rgba(255,255,255,0.6)', borderColor: risk === rv ? col + '80' : 'rgba(255,255,255,0.06)' }}>
              {rv === 'low' ? 'Низький' : rv === 'medium' ? 'Середній' : 'Високий'}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs w-12">Ставка</span>
        <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
          style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex gap-2">
        {[10, 50, 100, 500].map(v => (
          <button key={v} onClick={() => setBet(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {v}
          </button>
        ))}
      </div>

      <button onClick={drop} disabled={loading || animating || bet > wallet.balance || bet < 1}
        className="u24-button py-4 text-base font-black disabled:opacity-40">
        {loading || animating ? '…' : 'Кинути кулю'}
      </button>
    </div>
  );
}

// ─── Limbo ─────────────────────────────────────────────────────────────────────

function LimboView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [target, setTarget] = useState(2.0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [animMult, setAnimMult] = useState(1.0);

  const [launching, setLaunching] = useState(false);

  async function play() {
    if (bet < 1 || bet > wallet.balance) return;
    setLoading(true); setResult(null); setAnimMult(1.0); setLaunching(true);
    const r = await api<any>('/casino/limbo/play', {
      method: 'POST', body: JSON.stringify({ bet, target }),
    }, token);
    if (!r.ok) { setLoading(false); setLaunching(false); notify(r.error || 'Помилка.'); return; }
    const final = r.data.result;
    const duration = 1400;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic for exciting climb
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimMult(1.0 + (final - 1.0) * eased);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setAnimMult(final);
        setResult(r.data);
        setLoading(false);
        setLaunching(false);
        onWalletUpdate({ balance: r.data.new_balance });
        if (r.data.won) {
          notify(`🚀 ×${final} · +${fmtCoins(r.data.win)}`);
          celebrate(final >= 10 ? 'huge' : final >= 3 ? 'big' : 'small');
        } else {
          notify(`💥 ×${final}`);
        }
      }
    };
    requestAnimationFrame(tick);
  }

  const winChance = Math.min(99, (99 / target)).toFixed(2);
  const payout = (bet * target).toFixed(2);
  // Rocket height scaled logarithmically so large mults still visible
  const heightPct = Math.min(85, Math.log(animMult) / Math.log(100) * 85);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      <div className="rounded-3xl border p-4 flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: result
            ? (result.won ? 'linear-gradient(180deg, #0d3324 0%, #0B1A12 100%)' : 'linear-gradient(180deg, #33151a 0%, #0B1A12 100%)')
            : 'linear-gradient(180deg, #1a0d2e 0%, #0B1A12 60%)',
          borderColor: result ? (result.won ? '#5BBE8A60' : '#E54B5E60') : '#C678DD40',
          minHeight: 280,
        }}>
        {/* Starfield */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          {Array.from({ length: 40 }, (_, i) => {
            const x = (i * 137.5) % 100;
            const y = (i * 89.3) % 100;
            const s = (i % 3) + 1;
            return <div key={i} style={{
              position: 'absolute', left: `${x}%`, top: `${y}%`,
              width: s, height: s, borderRadius: '50%', background: '#fff',
              boxShadow: '0 0 4px #fff', opacity: 0.3 + (i % 5) * 0.15,
            }} />;
          })}
        </div>
        {/* Rising rocket */}
        <div style={{
          position: 'absolute', left: '50%', bottom: `${10 + heightPct}%`,
          transform: 'translateX(-50%)', fontSize: 42,
          filter: launching ? 'drop-shadow(0 0 12px #E4A24B)' : 'none',
          transition: 'filter 0.2s ease',
        }}>
          🚀
        </div>
        {launching && (
          <div style={{
            position: 'absolute', left: '50%', bottom: `${Math.max(2, 6 + heightPct - 8)}%`,
            transform: 'translateX(-50%)',
            width: 6, height: 40, borderRadius: '50%',
            background: 'radial-gradient(ellipse at top, #E4A24B 0%, #E54B5E 50%, transparent 100%)',
            opacity: 0.8,
          }} />
        )}
        {/* Counter */}
        <div className="relative z-10 text-center">
          <div className="text-[56px] font-black tabular-nums tracking-tight leading-none"
            style={{
              color: result ? (result.won ? '#5BBE8A' : '#E54B5E') : '#fff',
              textShadow: launching ? '0 0 24px rgba(228,162,75,0.6)' : '0 2px 8px rgba(0,0,0,0.4)',
            }}>
            ×{animMult.toFixed(2)}
          </div>
          <div className="text-white/60 text-xs mt-1 font-semibold">
            Ціль: ×{target.toFixed(2)} · Шанс {winChance}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs w-16">Ціль ×</span>
        <input type="number" step="0.01" min={1.01} max={1000} value={target}
          onChange={e => setTarget(Math.max(1.01, Math.min(1000, +e.target.value || 1.01)))}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
          style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex gap-2">
        {[1.5, 2, 5, 10, 100].map(v => (
          <button key={v} onClick={() => setTarget(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: target === v ? '#C678DD' : '#163524', color: target === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            ×{v}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs w-16">Ставка</span>
        <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
          style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex gap-2">
        {[10, 50, 100, 500].map(v => (
          <button key={v} onClick={() => setBet(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {v}
          </button>
        ))}
      </div>

      <div className="text-center text-white/50 text-xs">
        Виграш: {payout} USDT
      </div>

      <button onClick={play} disabled={loading || bet > wallet.balance || bet < 1}
        className="u24-button py-4 text-base font-black disabled:opacity-40">
        {loading ? '…' : 'Грати'}
      </button>
    </div>
  );
}

// ─── Wheel ─────────────────────────────────────────────────────────────────────

function WheelView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [segments, setSegments] = useState<10 | 20 | 30 | 40 | 50>(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [rotation, setRotation] = useState(0);

  async function spin() {
    if (bet < 1 || bet > wallet.balance) return;
    setLoading(true); setResult(null);
    const r = await api<any>('/casino/wheel/spin', {
      method: 'POST', body: JSON.stringify({ bet, risk, segments }),
    }, token);
    if (!r.ok) { setLoading(false); notify(r.error || 'Помилка.'); return; }
    const segAngle = 360 / segments;
    // Stop pointer at top pointing at the winning segment's center
    const target = 360 * 6 + (360 - (r.data.idx + 0.5) * segAngle);
    setRotation(target);
    setTimeout(() => {
      setLoading(false);
      setResult(r.data);
      onWalletUpdate({ balance: r.data.new_balance });
      if (r.data.win > 0) {
        notify(`🎡 ×${r.data.mult} · +${fmtCoins(r.data.win)}`);
        celebrate(r.data.mult >= 10 ? 'huge' : r.data.mult >= 3 ? 'big' : 'small');
      } else {
        notify('❌ Мимо');
      }
    }, 4000);
  }

  // Build display wheel (matches backend distribution approx)
  const displayWheel: number[] = useMemo(() => {
    if (result?.wheel) return result.wheel;
    const n = segments;
    let arr: number[];
    if (risk === 'low') {
      const ones = Math.floor(n * 0.35);
      arr = [1.5, 1.5, ...Array(ones).fill(1.2), ...Array(n - 2 - ones).fill(0)];
    } else if (risk === 'medium') {
      const mids = Math.floor(n * 0.25), lows = Math.floor(n * 0.15);
      arr = [3.0, ...Array(mids).fill(1.5), ...Array(lows).fill(1.2), ...Array(n - 1 - mids - lows).fill(0)];
    } else {
      const big = n <= 10 ? 9.9 : n <= 20 ? 19.8 : n <= 30 ? 29.7 : n <= 40 ? 39.6 : 49.5;
      arr = [big, ...Array(n - 1).fill(0)];
    }
    // Distribute to avoid clumping
    const shuffled: number[] = [];
    const winners = arr.filter(m => m > 0);
    const zeros = arr.filter(m => m === 0);
    const step = zeros.length ? Math.ceil(zeros.length / winners.length) : 0;
    let zi = 0;
    for (const w of winners) {
      for (let k = 0; k < step && zi < zeros.length; k++) shuffled.push(zeros[zi++]);
      shuffled.push(w);
    }
    while (zi < zeros.length) shuffled.push(zeros[zi++]);
    return shuffled.slice(0, n);
  }, [risk, segments, result]);

  const colorOf = (m: number) =>
    m >= 10 ? '#E54B5E' : m >= 3 ? '#C678DD' : m >= 1.5 ? '#E4A24B' : m > 0 ? '#5BBE8A' : '#1d3a2a';
  const gradOf = (m: number) => {
    const c = colorOf(m);
    return m > 0 ? `linear-gradient(135deg, ${c}, ${c}cc)` : c;
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      <div className="relative flex justify-center items-center" style={{ height: 300 }}>
        {/* Outer ring glow */}
        <div style={{
          position: 'absolute', width: 290, height: 290, borderRadius: '50%',
          background: 'radial-gradient(circle, transparent 58%, #E4A24B30 62%, transparent 68%)',
          filter: 'blur(2px)',
        }} />
        <svg viewBox="-110 -110 220 220" style={{
          width: 280, height: 280,
          transform: `rotate(${rotation}deg)`,
          transition: loading ? 'transform 4s cubic-bezier(0.15, 0.85, 0.25, 1)' : 'none',
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
        }}>
          <defs>
            {displayWheel.map((m, i) => (
              <radialGradient key={i} id={`seg-${i}`} cx="50%" cy="50%" r="100%">
                <stop offset="20%" stopColor={colorOf(m)} stopOpacity={m > 0 ? '1' : '0.6'} />
                <stop offset="100%" stopColor={colorOf(m)} stopOpacity={m > 0 ? '0.7' : '0.3'} />
              </radialGradient>
            ))}
          </defs>
          {displayWheel.map((m, i) => {
            const a1 = (i / segments) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / segments) * Math.PI * 2 - Math.PI / 2;
            const x1 = 100 * Math.cos(a1), y1 = 100 * Math.sin(a1);
            const x2 = 100 * Math.cos(a2), y2 = 100 * Math.sin(a2);
            // Label at mid-radius
            const am = (a1 + a2) / 2;
            const lx = 72 * Math.cos(am), ly = 72 * Math.sin(am);
            const labelRot = (am * 180 / Math.PI) + 90;
            const showLabel = segments <= 20 && m > 0;
            return (
              <g key={i}>
                <path
                  d={`M 0 0 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                  fill={`url(#seg-${i})`} stroke="#0B1A12" strokeWidth="0.5" />
                {showLabel && (
                  <text x={lx} y={ly} fontSize="8" fontWeight="900"
                    fill="#fff" textAnchor="middle" dominantBaseline="middle"
                    transform={`rotate(${labelRot} ${lx} ${ly})`}>
                    {m}x
                  </text>
                )}
              </g>
            );
          })}
          {/* Inner hub */}
          <circle r="22" fill="#0B1A12" stroke="#E4A24B" strokeWidth="2" />
          <circle r="8" fill="#E4A24B" />
        </svg>
        {/* Pointer */}
        <div style={{
          position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
          borderTop: '22px solid #E4A24B',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          zIndex: 2,
        }} />
      </div>

      {result && (
        <div className="rounded-2xl border p-3 text-center font-black text-base"
          style={{
            borderColor: result.win > 0 ? '#5BBE8A60' : '#E54B5E40',
            background: result.win > 0 ? '#5BBE8A15' : '#E54B5E10',
            color: result.win > 0 ? '#5BBE8A' : '#E54B5E',
          }}>
          ×{result.mult} {result.win > 0 ? `· +${fmtCoins(result.win)}` : ''}
        </div>
      )}

      <div className="flex gap-2">
        {(['low', 'medium', 'high'] as const).map(rv => {
          const col = rv === 'low' ? '#5BBE8A' : rv === 'medium' ? '#E4A24B' : '#E54B5E';
          return (
            <button key={rv} onClick={() => setRisk(rv)} disabled={loading}
              className="flex-1 py-2 rounded-xl text-xs font-bold transition-all border"
              style={{ background: risk === rv ? col + '25' : '#112A1C', color: risk === rv ? col : 'rgba(255,255,255,0.6)', borderColor: risk === rv ? col + '80' : 'rgba(255,255,255,0.06)' }}>
              {rv === 'low' ? 'Низький' : rv === 'medium' ? 'Середній' : 'Високий'}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {([10, 20, 30, 40, 50] as const).map(s => (
          <button key={s} onClick={() => setSegments(s)} disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: segments === s ? '#E4A24B' : '#163524', color: segments === s ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs w-12">Ставка</span>
        <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
          style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex gap-2">
        {[10, 50, 100, 500].map(v => (
          <button key={v} onClick={() => setBet(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {v}
          </button>
        ))}
      </div>

      <button onClick={spin} disabled={loading || bet > wallet.balance || bet < 1}
        className="u24-button py-4 text-base font-black disabled:opacity-40">
        {loading ? '…' : 'Крутити'}
      </button>
    </div>
  );
}

// ─── Hi-Lo ─────────────────────────────────────────────────────────────────────

function HiloView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [current, setCurrent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [bust, setBust] = useState(false);

  async function start() {
    if (bet < 1 || bet > wallet.balance) return;
    setLoading(true);
    const r = await api<any>('/casino/hilo/start', {
      method: 'POST', body: JSON.stringify({ bet }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setSessionId(r.data.session_id);
    setCurrent(r.data.card);
    setHistory([r.data.card]);
    setMultiplier(1.0);
    setBust(false);
    onWalletUpdate({ balance: r.data.balance });
  }

  async function guess(g: 'higher' | 'lower' | 'equal') {
    if (!sessionId) return;
    setLoading(true);
    const r = await api<any>('/casino/hilo/guess', {
      method: 'POST', body: JSON.stringify({ session_id: sessionId, guess: g }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setCurrent(r.data.card);
    setHistory(h => [...h, r.data.card]);
    if (r.data.bust) {
      setBust(true);
      setMultiplier(0);
      setSessionId(null);
      onWalletUpdate({ balance: r.data.new_balance });
      notify('💥 Програш');
    } else {
      setMultiplier(r.data.multiplier);
      notify(`✓ ×${r.data.multiplier}`);
    }
  }

  async function cashout() {
    if (!sessionId) return;
    setLoading(true);
    const r = await api<any>('/casino/hilo/cashout', {
      method: 'POST', body: JSON.stringify({ session_id: sessionId }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    onWalletUpdate({ balance: r.data.new_balance });
    const m = r.data.multiplier ?? multiplier;
    notify(`💰 ×${m.toFixed(2)} · +${fmtCoins(r.data.win)}`);
    celebrate(m >= 10 ? 'huge' : m >= 3 ? 'big' : 'small');
    setSessionId(null);
    setCurrent(null);
    setHistory([]);
    setMultiplier(1.0);
  }

  const inGame = !!sessionId;
  const curV = current?.rank_value ?? 8;
  const probH = ((14 - curV) / 13 * 100).toFixed(0);
  const probL = ((curV - 1) / 13 * 100).toFixed(0);

  function CardVis({ card, big }: { card: any; big?: boolean }) {
    if (!card) return null;
    const red = card.suit === '♥' || card.suit === '♦';
    return (
      <div className="rounded-2xl flex flex-col items-center justify-center font-black"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          color: red ? '#E54B5E' : '#1a1a1a',
          width: big ? 120 : 56, height: big ? 170 : 80,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          fontSize: big ? 40 : 20,
        }}>
        <div>{card.rank}</div>
        <div style={{ fontSize: big ? 48 : 24 }}>{card.suit}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      <div className="rounded-3xl border p-6 flex flex-col items-center gap-3"
        style={{
          background: bust ? '#E54B5E15' : '#112A1C',
          borderColor: bust ? '#E54B5E60' : 'rgba(255,255,255,0.08)',
        }}>
        <div className="text-white/50 text-xs">Множник</div>
        <div className="text-3xl font-black tabular-nums"
          style={{ color: bust ? '#E54B5E' : multiplier > 1 ? '#5BBE8A' : '#E4A24B' }}>
          ×{multiplier.toFixed(2)}
        </div>
        <CardVis card={current} big />
      </div>

      {history.length > 1 && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {history.slice(0, -1).map((c, i) => <CardVis key={i} card={c} />)}
        </div>
      )}

      {inGame ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => guess('higher')} disabled={loading}
              className="py-3 rounded-xl text-sm font-black transition-all"
              style={{ background: '#5BBE8A', color: '#0a1a12' }}>
              ▲ Вище ({probH}%)
            </button>
            <button onClick={() => guess('equal')} disabled={loading}
              className="py-3 rounded-xl text-sm font-black transition-all"
              style={{ background: '#C678DD', color: '#1a1006' }}>
              = (7%)
            </button>
            <button onClick={() => guess('lower')} disabled={loading}
              className="py-3 rounded-xl text-sm font-black transition-all"
              style={{ background: '#E54B5E', color: '#1a1006' }}>
              ▼ Нижче ({probL}%)
            </button>
          </div>
          <button onClick={cashout} disabled={loading || multiplier <= 1}
            className="u24-button py-4 text-base font-black disabled:opacity-40">
            💰 Забрати {(bet * multiplier).toFixed(2)}
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs w-12">Ставка</span>
            <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
              style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map(v => (
              <button key={v} onClick={() => setBet(v)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={start} disabled={loading || bet > wallet.balance || bet < 1}
            className="u24-button py-4 text-base font-black disabled:opacity-40">
            {loading ? '…' : 'Роздати карту'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Tower (Stake-style) ──────────────────────────────────────────────────────

function TowerView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  type Diff = 'easy' | 'medium' | 'hard' | 'expert';
  const DIFF: Record<Diff, { cols: number; label: string; col: string; safe: number }> = {
    easy:   { cols: 4, label: 'Легко',     col: '#5BBE8A', safe: 3 },
    medium: { cols: 3, label: 'Середньо',  col: '#E4A24B', safe: 2 },
    hard:   { cols: 2, label: 'Важко',     col: '#E54B5E', safe: 1 },
    expert: { cols: 3, label: 'Експерт',   col: '#C678DD', safe: 1 },
  };
  const LEVELS = 9;

  const [bet, setBet] = useState(10);
  const [diff, setDiff] = useState<Diff>('medium');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [nextMult, setNextMult] = useState<number | null>(1.5);
  const [revealed, setRevealed] = useState<{ level: number; col: number; safe: boolean }[]>([]);
  const [bustInfo, setBustInfo] = useState<{ col: number; safeCols: number[]; level: number; pattern: number[][] } | null>(null);

  const cfg = DIFF[diff];

  async function start() {
    if (bet < 1 || bet > wallet.balance) return;
    setLoading(true); setBustInfo(null); setRevealed([]);
    const r = await api<any>('/casino/tower/start', {
      method: 'POST', body: JSON.stringify({ bet, difficulty: diff }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setSessionId(r.data.session_id);
    setCurrentLevel(0);
    setMultiplier(1.0);
    setNextMult(r.data.next_multiplier);
    onWalletUpdate({ balance: r.data.new_balance });
  }

  async function pick(col: number) {
    if (!sessionId || loading) return;
    setLoading(true);
    const r = await api<any>('/casino/tower/pick', {
      method: 'POST', body: JSON.stringify({ session_id: sessionId, col }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }

    if (r.data.bust) {
      setBustInfo({ col, safeCols: r.data.safe_cols, level: currentLevel, pattern: r.data.pattern });
      setRevealed(rr => [...rr, { level: currentLevel, col, safe: false }]);
      setSessionId(null);
      setMultiplier(0);
      notify('💥 Пастка!');
      return;
    }
    setRevealed(rr => [...rr, { level: currentLevel, col, safe: true }]);
    if (r.data.top) {
      // Auto-cashout at top
      setMultiplier(r.data.multiplier);
      setCurrentLevel(LEVELS);
      onWalletUpdate({ balance: r.data.new_balance });
      notify(`🏆 ВЕРШИНА · +${fmtCoins(r.data.win)}`);
      celebrate('huge');
      setTimeout(() => setSessionId(null), 800);
    } else {
      setCurrentLevel(r.data.level);
      setMultiplier(r.data.multiplier);
      setNextMult(r.data.next_multiplier);
    }
  }

  async function cashout() {
    if (!sessionId || currentLevel === 0) return;
    setLoading(true);
    const r = await api<any>('/casino/tower/cashout', {
      method: 'POST', body: JSON.stringify({ session_id: sessionId }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    onWalletUpdate({ balance: r.data.new_balance });
    notify(`💰 +${fmtCoins(r.data.win)}`);
    if (r.data.win > bet * 3) celebrate('big');
    setSessionId(null);
  }

  const inGame = !!sessionId;
  // Render levels from top (LEVELS-1) down to 0
  const rows = Array.from({ length: LEVELS }, (_, i) => LEVELS - 1 - i);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      <div className="flex items-center justify-between rounded-2xl border p-3"
        style={{ background: '#112A1C', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div>
          <div className="text-white/50 text-[10px] uppercase tracking-wider">Множник</div>
          <div className="text-2xl font-black tabular-nums"
            style={{ color: multiplier > 1 ? '#5BBE8A' : '#E4A24B' }}>
            ×{multiplier.toFixed(4)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/50 text-[10px] uppercase tracking-wider">Далі</div>
          <div className="text-lg font-black tabular-nums" style={{ color: '#C678DD' }}>
            {nextMult ? `×${nextMult.toFixed(4)}` : '—'}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border p-3 flex flex-col gap-1.5"
        style={{ background: '#0d2218', borderColor: 'rgba(255,255,255,0.06)' }}>
        {rows.map((lvl) => {
          const isCurrent = inGame && lvl === currentLevel;
          const isPast = lvl < currentLevel;
          const isFuture = lvl > currentLevel;
          const rev = revealed.find(r => r.level === lvl);
          const bustAtLvl = bustInfo && bustInfo.level === lvl;
          const levelMult = Math.pow(cfg.cols / cfg.safe, lvl + 1) * 0.97;
          return (
            <div key={lvl} className="flex items-center gap-2">
              <div className="text-white/30 text-[10px] font-bold w-8 text-right tabular-nums">
                {(levelMult).toFixed(2)}×
              </div>
              <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }}>
                {Array.from({ length: cfg.cols }, (_, c) => {
                  const clicked = rev && rev.col === c;
                  const bustedHere = bustAtLvl && bustInfo!.col === c;
                  const revealedSafe = (bustInfo && bustInfo.pattern[lvl]?.includes(c)) || (rev && rev.safe && rev.col === c);
                  const revealedBust = bustInfo && !bustInfo.pattern[lvl]?.includes(c);
                  let bg = '#163524';
                  let content: string | React.ReactElement = '';
                  if (isPast && clicked) { bg = '#5BBE8A'; content = '✓'; }
                  else if (bustedHere) { bg = '#E54B5E'; content = '💣'; }
                  else if (bustInfo && revealedSafe) { bg = '#2a4a35'; content = '○'; }
                  else if (bustInfo && revealedBust) { bg = '#3a1a1f'; content = '·'; }
                  else if (isCurrent) { bg = cfg.col + '25'; }

                  return (
                    <button key={c}
                      onClick={isCurrent && !loading ? () => pick(c) : undefined}
                      disabled={!isCurrent || loading}
                      className="h-10 rounded-lg flex items-center justify-center text-sm font-black transition-all"
                      style={{
                        background: bg,
                        color: isPast && clicked ? '#0a1a12' : bustedHere ? '#fff' : 'rgba(255,255,255,0.4)',
                        border: isCurrent ? `2px solid ${cfg.col}` : '1px solid rgba(255,255,255,0.05)',
                        boxShadow: isCurrent ? `0 0 20px ${cfg.col}60` : 'none',
                        cursor: isCurrent && !loading ? 'pointer' : 'default',
                        opacity: isFuture && !bustInfo ? 0.5 : 1,
                      }}>
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {inGame ? (
        <button onClick={cashout} disabled={loading || currentLevel === 0}
          className="u24-button py-4 text-base font-black disabled:opacity-40">
          💰 Забрати {(bet * multiplier).toFixed(2)}
        </button>
      ) : (
        <>
          <div className="flex gap-2">
            {(Object.keys(DIFF) as Diff[]).map(d => (
              <button key={d} onClick={() => setDiff(d)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all border"
                style={{
                  background: diff === d ? DIFF[d].col + '25' : '#112A1C',
                  color: diff === d ? DIFF[d].col : 'rgba(255,255,255,0.6)',
                  borderColor: diff === d ? DIFF[d].col + '80' : 'rgba(255,255,255,0.06)',
                }}>
                {DIFF[d].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs w-12">Ставка</span>
            <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
              className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
              style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="flex gap-2">
            {[10, 50, 100, 500].map(v => (
              <button key={v} onClick={() => setBet(v)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={start} disabled={loading || bet > wallet.balance || bet < 1}
            className="u24-button py-4 text-base font-black disabled:opacity-40">
            {loading ? '…' : 'Почати підйом'}
          </button>
        </>
      )}
    </div>
  );
}

// ─── Keno ─────────────────────────────────────────────────────────────────────

function KenoView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const POOL = 40;
  const [bet, setBet] = useState(10);
  const [picks, setPicks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawn, setDrawn] = useState<number[]>([]);
  const [drawnStaged, setDrawnStaged] = useState<number[]>([]);  // animates reveal
  const [result, setResult] = useState<any>(null);

  // Payout table (must mirror backend)
  const PAYOUTS: Record<number, number[]> = {
    1:  [0.00, 3.96],
    2:  [0.00, 1.90, 4.50],
    3:  [0.00, 1.00, 3.10, 10.40],
    4:  [0.00, 0.80, 1.80, 5.00, 22.50],
    5:  [0.00, 0.25, 1.40, 4.10, 16.50, 36.00],
    6:  [0.00, 0.00, 1.00, 3.00, 8.00, 16.00, 40.00],
    7:  [0.00, 0.00, 1.00, 1.55, 3.00, 15.00, 40.00, 90.00],
    8:  [0.00, 0.00, 0.00, 2.00, 4.00, 11.00, 28.00, 90.00, 185.00],
    9:  [0.00, 0.00, 0.00, 2.00, 2.50, 5.00, 15.00, 40.00, 90.00, 400.00],
    10: [0.00, 0.00, 0.00, 1.60, 2.00, 4.00, 7.00, 17.00, 50.00, 200.00, 800.00],
  };

  function togglePick(n: number) {
    if (drawnStaged.length > 0 || loading) return;
    setResult(null); setDrawn([]);
    setPicks(prev => {
      if (prev.includes(n)) return prev.filter(p => p !== n);
      if (prev.length >= 10) return prev;
      return [...prev, n].sort((a, b) => a - b);
    });
  }

  function autoPick(count: number) {
    if (drawnStaged.length > 0 || loading) return;
    const pool = Array.from({ length: POOL }, (_, i) => i + 1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setPicks(pool.slice(0, count).sort((a, b) => a - b));
    setResult(null); setDrawn([]);
  }

  async function play() {
    if (!picks.length || bet < 1 || bet > wallet.balance) return;
    setLoading(true); setResult(null); setDrawn([]); setDrawnStaged([]);
    const r = await api<any>('/casino/keno/play', {
      method: 'POST', body: JSON.stringify({ bet, picks }),
    }, token);
    if (!r.ok) { setLoading(false); notify(r.error || 'Помилка.'); return; }
    // Animate draw
    const balls = r.data.drawn as number[];
    for (let i = 0; i < balls.length; i++) {
      await new Promise(res => setTimeout(res, 180));
      setDrawnStaged(s => [...s, balls[i]]);
    }
    await new Promise(res => setTimeout(res, 300));
    setDrawn(balls);
    setDrawnStaged([]);
    setResult(r.data);
    setLoading(false);
    onWalletUpdate({ balance: r.data.new_balance });
    if (r.data.win > 0) {
      notify(`🎯 ${r.data.matches}/${picks.length} · +${fmtCoins(r.data.win)}`);
      if (r.data.win > bet * 5) celebrate(r.data.win > bet * 50 ? 'huge' : 'big');
    } else {
      notify(`❌ ${r.data.matches}/${picks.length}`);
    }
  }

  function reset() {
    setDrawn([]); setDrawnStaged([]); setResult(null);
  }

  const payoutsFor = picks.length ? PAYOUTS[picks.length] : null;
  const activeDrawn = drawnStaged.length ? drawnStaged : drawn;

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4" style={{ background: '#0B1A12' }}>
      {/* Grid 5x8 = 40 */}
      <div className="grid grid-cols-8 gap-1.5">
        {Array.from({ length: POOL }, (_, i) => i + 1).map(n => {
          const picked = picks.includes(n);
          const isDrawn = activeDrawn.includes(n);
          const hit = picked && isDrawn;
          const missedDraw = !picked && isDrawn;
          let bg = '#163524', color = 'rgba(255,255,255,0.7)';
          if (hit) { bg = 'linear-gradient(135deg, #5BBE8A 0%, #3a8f65 100%)'; color = '#0a1a12'; }
          else if (picked) { bg = 'linear-gradient(135deg, #E4A24B 0%, #b87d2e 100%)'; color = '#1a1006'; }
          else if (missedDraw) { bg = 'linear-gradient(135deg, #6DB5D4 0%, #4a8aa8 100%)'; color = '#0a1624'; }
          return (
            <button key={n} onClick={() => togglePick(n)}
              disabled={drawnStaged.length > 0 || loading}
              className="aspect-square rounded-lg font-black text-sm transition-all"
              style={{
                background: bg, color,
                border: picked ? '2px solid #E4A24B' : '1px solid rgba(255,255,255,0.05)',
                boxShadow: hit ? '0 0 16px #5BBE8A80' : missedDraw ? '0 0 12px #6DB5D460' : 'none',
                transform: (drawnStaged.includes(n) && drawnStaged[drawnStaged.length - 1] === n) ? 'scale(1.15)' : 'scale(1)',
              }}>
              {n}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-2xl border p-3"
        style={{ background: '#112A1C', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div>
          <div className="text-white/50 text-[10px] uppercase">Вибрано</div>
          <div className="text-lg font-black text-white">{picks.length}/10</div>
        </div>
        {result && (
          <div className="text-center">
            <div className="text-white/50 text-[10px] uppercase">Співпало</div>
            <div className="text-lg font-black" style={{ color: result.win > 0 ? '#5BBE8A' : '#E54B5E' }}>
              {result.matches} · ×{result.mult}
            </div>
          </div>
        )}
        <div className="text-right">
          <div className="text-white/50 text-[10px] uppercase">Макс</div>
          <div className="text-lg font-black" style={{ color: '#E4A24B' }}>
            {payoutsFor ? `×${payoutsFor[payoutsFor.length - 1]}` : '—'}
          </div>
        </div>
      </div>

      {/* Payout table preview */}
      {payoutsFor && (
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${payoutsFor.length}, 1fr)` }}>
          {payoutsFor.map((m, i) => (
            <div key={i} className="rounded-lg px-1 py-1.5 text-center"
              style={{
                background: result && result.matches === i ? '#5BBE8A20' : '#112A1C',
                border: result && result.matches === i ? '1px solid #5BBE8A80' : '1px solid rgba(255,255,255,0.05)',
              }}>
              <div className="text-white/40 text-[9px]">{i}</div>
              <div className="text-[10px] font-black" style={{ color: m > 1 ? '#E4A24B' : m > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                {m > 0 ? `×${m}` : '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {[3, 5, 8, 10].map(n => (
          <button key={n} onClick={() => autoPick(n)}
            disabled={drawnStaged.length > 0 || loading}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#163524', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
            Авто {n}
          </button>
        ))}
        <button onClick={() => { setPicks([]); reset(); }}
          disabled={drawnStaged.length > 0 || loading}
          className="flex-1 py-2 rounded-xl text-xs font-bold"
          style={{ background: '#3a1a1f', color: '#E54B5E', border: '1px solid #E54B5E30' }}>
          Очистити
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-white/50 text-xs w-12">Ставка</span>
        <input type="number" value={bet} onChange={e => setBet(Math.max(1, +e.target.value))} min={1}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none"
          style={{ background: '#163524', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>
      <div className="flex gap-2">
        {[10, 50, 100, 500].map(v => (
          <button key={v} onClick={() => setBet(v)}
            className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: bet === v ? '#E4A24B' : '#163524', color: bet === v ? '#1a1006' : 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {v}
          </button>
        ))}
      </div>

      <button onClick={play} disabled={loading || picks.length < 1 || bet > wallet.balance || bet < 1}
        className="u24-button py-4 text-base font-black disabled:opacity-40">
        {loading ? '…' : drawn.length ? 'Нова гра' : `Грати (${picks.length})`}
      </button>
    </div>
  );
}

// ─── Shared card renderer ─────────────────────────────────────────────────────

function PlayingCard({ card, faceDown = false, highlight = false, size = 'md' }: {
  card?: { rank: string; suit: string; value?: number };
  faceDown?: boolean;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const w = size === 'lg' ? 100 : size === 'md' ? 76 : 52;
  const h = Math.round(w * 1.42);
  const red = card && (card.suit === '♥' || card.suit === '♦');
  const fs = size === 'lg' ? 28 : size === 'md' ? 22 : 15;
  const corner = size === 'lg' ? 9 : size === 'md' ? 7 : 5;

  if (faceDown) return (
    <div style={{
      width: w, height: h, borderRadius: corner,
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #1a237e 100%)',
      border: '2px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: w - 12, height: h - 12, borderRadius: corner - 2,
        border: '1px solid rgba(255,255,255,0.15)',
        backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px)',
      }} />
    </div>
  );

  return (
    <div style={{
      width: w, height: h, borderRadius: corner,
      background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
      border: highlight ? '2px solid #E4A24B' : '2px solid rgba(0,0,0,0.12)',
      boxShadow: highlight
        ? '0 0 20px rgba(228,162,75,0.7), 0 4px 16px rgba(0,0,0,0.3)'
        : '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: size === 'sm' ? 3 : 5,
      transition: 'all 0.3s ease',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Top left */}
      <div style={{ lineHeight: 1.1 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: corner, color: red ? '#c62828' : '#1a1a1a', lineHeight: 1 }}>{card?.rank}</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: corner - 1, color: red ? '#c62828' : '#1a1a1a', lineHeight: 1 }}>{card?.suit}</div>
      </div>
      {/* Center */}
      <div style={{ textAlign: 'center', fontSize: fs, lineHeight: 1, color: red ? '#c62828' : '#1a1a1a', fontFamily: 'Georgia,serif' }}>
        {card?.suit}
      </div>
      {/* Bottom right (rotated) */}
      <div style={{ lineHeight: 1.1, transform: 'rotate(180deg)', alignSelf: 'flex-end' }}>
        <div style={{ fontFamily: 'Georgia,serif', fontWeight: 900, fontSize: corner, color: red ? '#c62828' : '#1a1a1a', lineHeight: 1 }}>{card?.rank}</div>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: corner - 1, color: red ? '#c62828' : '#1a1a1a', lineHeight: 1 }}>{card?.suit}</div>
      </div>
    </div>
  );
}

// ─── Video Poker (Jacks or Better) ────────────────────────────────────────────

const VP_HAND_NAMES: Record<string, string> = {
  royal_flush: '🏆 Роял Флеш', straight_flush: '🌟 Стрейт Флеш',
  four_of_a_kind: '4️⃣ Каре', full_house: '🏠 Фул Хаус',
  flush: '♠ Флеш', straight: '➡️ Стрейт',
  three_of_a_kind: '3️⃣ Трійка', two_pair: '2️⃣ Дві пари',
  jacks_or_better: '👑 Пара J+', nothing: '— Без виграшу',
};
const VP_PAYS: [string, number][] = [
  ['royal_flush',800],['straight_flush',50],['four_of_a_kind',25],
  ['full_house',9],['flush',6],['straight',4],
  ['three_of_a_kind',3],['two_pair',2],['jacks_or_better',1],
];

function VideoPokerView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'hold' | 'result'>('idle');
  const [hand, setHand] = useState<any[]>([]);
  const [held, setHeld] = useState<boolean[]>([false,false,false,false,false]);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [dealAnim, setDealAnim] = useState(false);

  async function deal() {
    if (loading || bet > wallet.balance) return;
    setLoading(true); setResult(null); setHeld([false,false,false,false,false]);
    setDealAnim(true);
    const r = await api<any>('/casino/videopoker/deal', { method:'POST', body: JSON.stringify({ bet }) }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error||'Помилка'); setDealAnim(false); return; }
    setHand(r.data.hand);
    setSessionId(r.data.session_id);
    onWalletUpdate({ balance: r.data.new_balance });
    setPhase('hold');
    setTimeout(() => setDealAnim(false), 400);
  }

  function toggleHold(i: number) {
    if (phase !== 'hold') return;
    setHeld(h => { const n=[...h]; n[i]=!n[i]; return n; });
  }

  async function draw() {
    if (loading || phase !== 'hold') return;
    setLoading(true);
    const holdIdx = held.map((h,i)=>h?i:-1).filter(i=>i>=0);
    const r = await api<any>('/casino/videopoker/draw', {
      method:'POST', body: JSON.stringify({ session_id: sessionId, hold: holdIdx })
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error||'Помилка'); return; }
    setHand(r.data.hand);
    setResult(r.data);
    setPhase('result');
    onWalletUpdate({ balance: r.data.new_balance });
    if (r.data.win > 0) {
      notify(`${VP_HAND_NAMES[r.data.result]} · +${fmtCoins(r.data.win)}`);
      celebrate(r.data.mult >= 25 ? 'huge' : r.data.mult >= 6 ? 'big' : 'small');
    } else {
      notify('Без виграшу');
    }
  }

  const BG = 'linear-gradient(160deg, #0d1f0e 0%, #06100a 100%)';

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-4" style={{ background: '#0B1A12' }}>
      {/* Machine frame */}
      <div className="rounded-3xl overflow-hidden" style={{
        background: BG,
        border: '2px solid rgba(91,190,138,0.3)',
        boxShadow: '0 0 40px rgba(91,190,138,0.1), 0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{
          background: 'rgba(91,190,138,0.08)', borderBottom: '1px solid rgba(91,190,138,0.2)',
        }}>
          <div>
            <div className="font-black text-[#5BBE8A] text-sm uppercase tracking-widest">VIDEO POKER</div>
            <div className="text-[#5BBE8A]/40 text-[9px] uppercase">Jacks or Better · Max ×800</div>
          </div>
          <div className="font-mono font-black text-[#5BBE8A]">{fmtCoins(wallet.balance)}</div>
        </div>

        {/* Hand */}
        <div className="px-4 py-6 flex justify-center gap-2">
          {(hand.length ? hand : Array(5).fill(null)).map((card, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                onClick={() => toggleHold(i)}
                style={{
                  cursor: phase === 'hold' ? 'pointer' : 'default',
                  transform: held[i] ? 'translateY(-10px)' : 'translateY(0)',
                  transition: 'transform 0.2s ease',
                  opacity: dealAnim ? 0 : 1,
                  animation: dealAnim ? `none` : undefined,
                }}>
                {card ? (
                  <PlayingCard card={card} highlight={held[i] || (phase==='result' && result?.mult>0)} size="md" />
                ) : (
                  <PlayingCard faceDown size="md" />
                )}
              </div>
              {phase === 'hold' && (
                <div className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: held[i] ? '#5BBE8A' : 'rgba(255,255,255,0.2)' }}>
                  {held[i] ? 'HOLD' : ''}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result */}
        <div style={{ height: 44, display:'flex',alignItems:'center',justifyContent:'center' }}>
          {result && phase==='result' && (
            <div className="font-black text-center text-sm px-6 py-2 rounded-xl"
              style={{
                background: result.win>0?'rgba(91,190,138,0.15)':'rgba(255,255,255,0.03)',
                border:`1px solid ${result.win>0?'rgba(91,190,138,0.4)':'rgba(255,255,255,0.07)'}`,
                color: result.win>0?'#5BBE8A':'rgba(255,255,255,0.3)',
              }}>
              {VP_HAND_NAMES[result.result]} {result.win>0?`· +${fmtCoins(result.win)}`:''}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 pb-5 flex flex-col gap-3">
          <div className="flex gap-1">
            {[5,10,25,50,100,250].map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={phase==='hold'||loading}
                className="flex-1 py-2 rounded-lg text-xs font-black"
                style={{
                  background: bet===v?'linear-gradient(135deg,#5BBE8A,#3a8f65)':'rgba(255,255,255,0.04)',
                  color: bet===v?'#0a1a12':'rgba(255,255,255,0.4)',
                  border:`1px solid ${bet===v?'#5BBE8A':'rgba(255,255,255,0.06)'}`,
                }}>
                {v}
              </button>
            ))}
          </div>
          {phase === 'hold' ? (
            <button onClick={draw} disabled={loading}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest"
              style={{
                background: 'linear-gradient(135deg,#5BBE8A,#2e7d55)',
                color:'#0a1a12', boxShadow:'0 0 24px rgba(91,190,138,0.5)',
                border:'none', cursor:'pointer',
              }}>
              {loading?'…':'🃏 DRAW'}
            </button>
          ) : (
            <button onClick={deal} disabled={loading||bet>wallet.balance}
              className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg,#5BBE8A,#2e7d55)',
                color:'#0a1a12', boxShadow:'0 0 24px rgba(91,190,138,0.4)',
                border:'none', cursor:'pointer',
              }}>
              {loading?'…':'🂡 DEAL'}
            </button>
          )}
        </div>
      </div>

      {/* Paytable */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(91,190,138,0.15)' }}>
        <div className="px-4 py-2 text-[#5BBE8A] text-[10px] font-black uppercase tracking-widest"
          style={{ background:'rgba(91,190,138,0.05)', borderBottom:'1px solid rgba(91,190,138,0.12)' }}>
          Таблиця виплат (5 монет)
        </div>
        <div className="grid grid-cols-2">
          {VP_PAYS.map(([key, m], idx) => (
            <div key={key} className="px-3 py-2 flex justify-between items-center"
              style={{
                background: result?.result===key ? 'rgba(91,190,138,0.12)' : idx%2===0?'rgba(255,255,255,0.02)':'transparent',
                border: result?.result===key ? '1px solid rgba(91,190,138,0.4)' : 'none',
                borderBottom:'1px solid rgba(255,255,255,0.04)',
              }}>
              <span className="text-white/60 text-[11px]">{VP_HAND_NAMES[key].replace(/^[^\s]+ /,'')}</span>
              <span className="font-black text-sm text-[#5BBE8A]">×{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Dragon Tiger ──────────────────────────────────────────────────────────────

function DragonTigerView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [loading, setLoading] = useState(false);
  const [side, setSide] = useState<'dragon'|'tiger'|'tie'>('dragon');
  const [result, setResult] = useState<any>(null);
  const [reveal, setReveal] = useState(false);

  async function play() {
    if (loading || bet > wallet.balance) return;
    setLoading(true); setResult(null); setReveal(false);
    const r = await api<any>('/casino/dragontiger/play', {
      method:'POST', body: JSON.stringify({ bet, side })
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error||'Помилка'); return; }
    // Dramatic reveal delay
    setTimeout(() => {
      setReveal(true);
      setResult(r.data);
      onWalletUpdate({ balance: r.data.new_balance });
      if (r.data.win > 0) {
        const label = r.data.outcome === 'tie' ? '🤝 Нічия' : r.data.outcome === 'dragon' ? '🐉 Дракон' : '🐯 Тигр';
        notify(`${label} · +${fmtCoins(r.data.win)}`);
        celebrate(r.data.mult >= 8 ? 'huge' : 'big');
      } else {
        notify(r.data.outcome === 'tie' ? '🤝 Нічия (×0.5)' : `Програш`);
      }
    }, 800);
  }

  const SIDES = [
    { key: 'dragon' as const, label: '🐉 Дракон', col: '#E54B5E', sub: '×2' },
    { key: 'tie'    as const, label: '🤝 Нічия',  col: '#C678DD', sub: '×8' },
    { key: 'tiger'  as const, label: '🐯 Тигр',   col: '#E4A24B', sub: '×2' },
  ];

  const won = result && result.win > 0;
  const outcomeCol = result?.outcome === 'dragon' ? '#E54B5E' : result?.outcome === 'tiger' ? '#E4A24B' : '#C678DD';

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-4" style={{ background: '#0B1A12' }}>
      {/* Arena */}
      <div className="rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(160deg, #1a0a0a 0%, #0d0606 100%)',
        border: '2px solid rgba(229,75,94,0.3)',
        boxShadow: '0 0 50px rgba(229,75,94,0.1)',
      }}>
        <div className="px-4 py-3 flex items-center justify-between" style={{
          background:'rgba(229,75,94,0.07)', borderBottom:'1px solid rgba(229,75,94,0.2)',
        }}>
          <div>
            <div className="font-black text-[#E54B5E] text-sm uppercase tracking-widest">DRAGON TIGER</div>
            <div className="text-[#E54B5E]/40 text-[9px]">Дракон проти Тигра · Нічия ×8</div>
          </div>
          <div className="font-mono font-black text-[#5BBE8A]">{fmtCoins(wallet.balance)}</div>
        </div>

        {/* Table */}
        <div className="px-4 py-6">
          <div className="relative flex items-end justify-between gap-3" style={{ minHeight: 180 }}>
            {/* Dragon side */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="text-4xl" style={{ filter: result?.outcome==='dragon'?'drop-shadow(0 0 20px #E54B5E)':undefined }}>🐉</div>
              <div className={`transition-all duration-500 ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {result ? <PlayingCard card={result.dragon} highlight={result.outcome==='dragon'} size="lg" /> : <PlayingCard faceDown size="lg" />}
              </div>
              <div className="font-black text-sm" style={{ color: '#E54B5E' }}>ДРАКОН</div>
            </div>

            {/* VS */}
            <div className="flex flex-col items-center gap-2 pb-8">
              <div className="font-black text-white/20 text-2xl">VS</div>
              {result && reveal && (
                <div className="font-black text-sm px-3 py-1 rounded-lg animate-slide-up"
                  style={{ background: outcomeCol+'20', color: outcomeCol, border:`1px solid ${outcomeCol}40` }}>
                  {result.outcome === 'dragon' ? '🐉 WIN' : result.outcome === 'tiger' ? '🐯 WIN' : '🤝 TIE'}
                </div>
              )}
            </div>

            {/* Tiger side */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="text-4xl" style={{ filter: result?.outcome==='tiger'?'drop-shadow(0 0 20px #E4A24B)':undefined }}>🐯</div>
              <div className={`transition-all duration-500 ${reveal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: '0.15s' }}>
                {result ? <PlayingCard card={result.tiger} highlight={result.outcome==='tiger'} size="lg" /> : <PlayingCard faceDown size="lg" />}
              </div>
              <div className="font-black text-sm" style={{ color: '#E4A24B' }}>ТИГР</div>
            </div>
          </div>

          {/* Win banner */}
          <div style={{ height: 48, display:'flex',alignItems:'center',justifyContent:'center',marginTop:8 }}>
            {result && reveal && (
              <div className="font-black text-base px-6 py-2 rounded-xl"
                style={{
                  background: won?'rgba(228,162,75,0.15)':'rgba(255,255,255,0.03)',
                  border:`1px solid ${won?'rgba(228,162,75,0.5)':'rgba(255,255,255,0.07)'}`,
                  color: won?'#E4A24B':'rgba(255,255,255,0.3)',
                }}>
                {won ? `+${fmtCoins(result.win)} · ×${result.mult}` : 'Програш'}
              </div>
            )}
          </div>
        </div>

        {/* Side selector */}
        <div className="px-4 flex gap-2">
          {SIDES.map(s => (
            <button key={s.key} onClick={() => setSide(s.key)} disabled={loading}
              className="flex-1 py-3 rounded-xl font-black text-sm transition-all"
              style={{
                background: side===s.key?s.col+'25':'rgba(255,255,255,0.03)',
                color: side===s.key?s.col:'rgba(255,255,255,0.4)',
                border:`2px solid ${side===s.key?s.col:'rgba(255,255,255,0.06)'}`,
                boxShadow: side===s.key?`0 0 16px ${s.col}50`:'none',
              }}>
              {s.label}<br/>
              <span style={{ fontSize:11,opacity:0.7 }}>{s.sub}</span>
            </button>
          ))}
        </div>

        {/* Bet + Play */}
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="flex gap-1">
            {[10,25,50,100,250,500].map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={loading}
                className="flex-1 py-2 rounded-lg text-xs font-black"
                style={{
                  background: bet===v?'linear-gradient(135deg,#E54B5E,#b02035)':'rgba(255,255,255,0.04)',
                  color: bet===v?'#fff':'rgba(255,255,255,0.4)',
                  border:`1px solid ${bet===v?'#E54B5E':'rgba(255,255,255,0.06)'}`,
                }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={play} disabled={loading||bet>wallet.balance}
            className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${SIDES.find(s=>s.key===side)?.col||'#E54B5E'}, ${side==='dragon'?'#b02035':side==='tiger'?'#b87d2e':'#9c4fb5'})`,
              color:'#fff', boxShadow:`0 0 28px ${SIDES.find(s=>s.key===side)?.col||'#E54B5E'}50`,
              border:'none', cursor: loading?'not-allowed':'pointer',
            }}>
            {loading?'…':`🎴 СТАВКА · ${fmtCoins(bet)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Scratch Card ─────────────────────────────────────────────────────────────

function ScratchView({ wallet, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet; onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string; notify: (m: string) => void;
}) {
  const [bet, setBet] = useState(10);
  const [loading, setLoading] = useState(false);
  const [grid, setGrid] = useState<string[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));
  const [result, setResult] = useState<any>(null);
  const [revealAll, setRevealAll] = useState(false);
  const [scratchOrder, setScratchOrder] = useState<number[]>([]);

  const SCRATCH_PAYS: Record<string,number> = {
    '💎':50,'7️⃣':20,'💰':10,'🍒':5,'🎴':4,'⭐':3,'🔔':2,
  };

  async function buyCard() {
    if (loading || bet > wallet.balance) return;
    setLoading(true); setGrid(null); setRevealed(Array(9).fill(false));
    setResult(null); setRevealAll(false); setScratchOrder([]);
    const r = await api<any>('/casino/scratch/play', { method:'POST', body: JSON.stringify({ bet }) }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error||'Помилка'); return; }
    setGrid(r.data.grid);
    setResult(r.data);
    onWalletUpdate({ balance: r.data.new_balance });
  }

  function scratchCell(i: number) {
    if (!grid || revealed[i] || revealAll) return;
    setRevealed(prev => { const n=[...prev]; n[i]=true; return n; });
    setScratchOrder(o => [...o, i]);
    // After all 9 revealed → show win
    const count = revealed.filter(Boolean).length + 1;
    if (count >= 9) {
      setRevealAll(true);
      if (result?.win > 0) {
        setTimeout(() => {
          notify(`💎 ×${result.mult} · +${fmtCoins(result.win)}`);
          celebrate(result.mult >= 20 ? 'huge' : result.mult >= 5 ? 'big' : 'small');
        }, 200);
      } else {
        setTimeout(() => notify('Без виграшу'), 200);
      }
    }
  }

  function scratchAll() {
    if (!grid) return;
    setRevealAll(true);
    setRevealed(Array(9).fill(true));
    if (result?.win > 0) {
      setTimeout(() => {
        notify(`💎 ×${result.mult} · +${fmtCoins(result.win)}`);
        celebrate(result.mult >= 20 ? 'huge' : result.mult >= 5 ? 'big' : 'small');
      }, 300);
    } else {
      setTimeout(() => notify('Без виграшу'), 300);
    }
  }

  // Detect winning row
  const winningRow = (() => {
    if (!grid || !result?.has_win) return -1;
    for (let row = 0; row < 3; row++) {
      const s = grid[row*3];
      if (s === grid[row*3+1] && s === grid[row*3+2]) return row;
    }
    return -1;
  })();

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-3 py-4" style={{ background: '#0B1A12' }}>
      {/* Scratch ticket */}
      <div className="rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(145deg, #1a0a2e 0%, #0d0620 100%)',
        border: '2px solid rgba(198,120,221,0.4)',
        boxShadow: '0 0 50px rgba(198,120,221,0.1), 0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Ticket header */}
        <div className="px-4 py-3" style={{
          background: 'linear-gradient(90deg, #C678DD30, #8B5CF620, #C678DD30)',
          borderBottom: '1px solid rgba(198,120,221,0.3)',
        }}>
          <div className="text-center">
            <div className="font-black text-[#C678DD] text-base uppercase tracking-widest">🎴 SCRATCH & WIN</div>
            <div className="text-[#C678DD]/40 text-[9px] mt-0.5">Відкрий 3 однакових → ВИГРАШ</div>
          </div>
        </div>

        {/* Grid area */}
        <div className="px-4 py-6">
          {!grid ? (
            <div className="flex items-center justify-center" style={{ height: 240 }}>
              <div className="text-center text-white/20">
                <div className="text-6xl mb-3">🎴</div>
                <div className="text-sm font-bold">Купи білет щоб грати</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {grid.map((sym, i) => {
                const row = Math.floor(i / 3);
                const isWinRow = winningRow === row && revealAll;
                const isRev = revealed[i] || revealAll;
                return (
                  <button key={i} onClick={() => scratchCell(i)}
                    disabled={isRev || !grid}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 14,
                      border: `2px solid ${isWinRow ? '#E4A24B' : 'rgba(198,120,221,0.3)'}`,
                      background: isRev
                        ? isWinRow
                          ? 'linear-gradient(145deg, #2d1f00, #1a1200)'
                          : 'linear-gradient(145deg, #1a1030, #0d0820)'
                        : 'linear-gradient(145deg, #C678DD, #8B5CF6)',
                      boxShadow: isWinRow
                        ? '0 0 20px rgba(228,162,75,0.6)'
                        : isRev ? 'none' : '0 4px 12px rgba(198,120,221,0.4)',
                      display: 'flex', alignItems:'center', justifyContent:'center',
                      fontSize: 36, cursor: isRev?'default':'pointer',
                      transition: 'all 0.2s ease',
                      transform: isRev?'scale(1)':'scale(1)',
                      position: 'relative', overflow:'hidden',
                    }}>
                    {isRev ? (
                      <span style={{ filter: isWinRow?'drop-shadow(0 0 8px #E4A24B)':undefined }}>
                        {sym}
                      </span>
                    ) : (
                      <span style={{ fontSize: 28, opacity: 0.7 }}>✦</span>
                    )}
                    {isWinRow && isRev && (
                      <div style={{
                        position:'absolute',inset:0,borderRadius:12,
                        background:'linear-gradient(135deg, rgba(228,162,75,0.15), transparent)',
                        pointerEvents:'none',
                      }}/>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Win / lose result */}
          <div style={{ height: 44, marginTop: 12, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {result && revealAll && (
              <div className="font-black text-sm px-6 py-2 rounded-xl"
                style={{
                  background: result.win>0?'rgba(228,162,75,0.15)':'rgba(255,255,255,0.03)',
                  border:`1px solid ${result.win>0?'rgba(228,162,75,0.5)':'rgba(255,255,255,0.07)'}`,
                  color: result.win>0?'#E4A24B':'rgba(255,255,255,0.3)',
                }}>
                {result.win>0 ? `💎 ×${result.mult} · +${fmtCoins(result.win)}` : '— Без виграшу'}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="px-4 pb-5 flex flex-col gap-3">
          {grid && !revealAll && (
            <button onClick={scratchAll}
              className="w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider"
              style={{
                background:'rgba(198,120,221,0.1)',color:'#C678DD',
                border:'1px solid rgba(198,120,221,0.3)',cursor:'pointer',
              }}>
              ✦ Відкрити все
            </button>
          )}
          <div className="flex gap-1">
            {[5,10,25,50,100].map(v => (
              <button key={v} onClick={() => setBet(v)} disabled={loading}
                className="flex-1 py-2 rounded-lg text-xs font-black"
                style={{
                  background: bet===v?'linear-gradient(135deg,#C678DD,#8B5CF6)':'rgba(255,255,255,0.04)',
                  color: bet===v?'#fff':'rgba(255,255,255,0.4)',
                  border:`1px solid ${bet===v?'#C678DD':'rgba(255,255,255,0.06)'}`,
                }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={buyCard} disabled={loading||bet>wallet.balance}
            className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #C678DD, #8B5CF6)',
              color:'#fff', border:'none', cursor:'pointer',
              boxShadow:'0 0 28px rgba(198,120,221,0.5)',
            }}>
            {loading?'…':grid?'🎴 НОВИЙ БІЛЕТ':'🎴 КУПИТИ БІЛЕТ · '+fmtCoins(bet)}
          </button>
        </div>
      </div>

      {/* Paytable */}
      <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(198,120,221,0.15)' }}>
        <div className="px-4 py-2 text-[#C678DD] text-[10px] font-black uppercase tracking-widest"
          style={{ background:'rgba(198,120,221,0.05)', borderBottom:'1px solid rgba(198,120,221,0.12)' }}>
          Виграші за 3 однакових
        </div>
        <div className="grid grid-cols-4 gap-0">
          {Object.entries(SCRATCH_PAYS).map(([sym, m], idx) => (
            <div key={sym} className="flex flex-col items-center py-2"
              style={{ background: idx%2===0?'rgba(255,255,255,0.02)':'transparent', borderRight:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize:28 }}>{sym}</div>
              <div className="font-black text-xs text-[#C678DD]">×{m}</div>
            </div>
          ))}
        </div>
      </div>
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
  const [payMethod, setPayMethod] = useState<'card' | 'crypto'>('card');
  const [tab, setTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [address, setAddress] = useState<string>('');
  const [addrLoading, setAddrLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [deposits, setDeposits] = useState<CryptoDeposit[]>([]);
  const [copied, setCopied] = useState(false);
  // Fiat card state
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [fiatAmt, setFiatAmt] = useState('');
  const [fiatLoading, setFiatLoading] = useState(false);
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

  function fmtCard(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function fmtExp(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
  }

  async function submitFiatDeposit() {
    const amt = parseFloat(fiatAmt);
    if (!amt || amt < 10) { notify('Мінімальна сума: 10 USDT.'); return; }
    const rawCard = cardNum.replace(/\s/g, '');
    if (rawCard.length < 13) { notify('Введіть номер картки.'); return; }
    if (!cardExp || cardExp.length < 5) { notify('Введіть термін дії картки.'); return; }
    if (!cardCvv || cardCvv.length < 3) { notify('Введіть CVV.'); return; }
    setFiatLoading(true);
    const res = await api<{ amount: number; new_balance: number; card_last4: string }>(
      '/casino/fiat-deposit', { method: 'POST', body: JSON.stringify({ amount: amt, card: rawCard }) }, token,
    );
    setFiatLoading(false);
    if (!res.ok) { notify(res.error || 'Помилка оплати.'); return; }
    onWalletUpdate({ balance: res.data!.new_balance });
    setFiatAmt(''); setCardNum(''); setCardExp(''); setCardCvv(''); setCardName('');
    notify(`✅ Поповнено на ${res.data!.amount.toFixed(2)} USDT`);
  }

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
      {/* Balance strip */}
      <div className="rounded-xl p-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#0d1f11,#1d2e20)', border: '1.5px solid rgba(168,121,42,0.35)' }}>
        <div>
          <div className="font-mono text-[9px] text-[#6b7c6d] uppercase mb-0.5">Ваш баланс</div>
          <div className="font-black text-xl text-[#a8792a]">{wallet.balance.toFixed(2)} USDT</div>
        </div>
        <div className="text-2xl">💎</div>
      </div>

      {/* Payment method selector */}
      <div className="flex gap-2">
        {([
          { key: 'card', label: '💳 Картка', sub: 'Visa / MC' },
          { key: 'crypto', label: '₿ Крипто', sub: 'USDT BEP-20' },
        ] as const).map(m => (
          <button key={m.key} onClick={() => setPayMethod(m.key)}
            className="flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-0.5 transition-all cursor-pointer"
            style={{
              background: payMethod === m.key ? 'rgba(168,121,42,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${payMethod === m.key ? 'rgba(168,121,42,0.7)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <span className="text-base">{m.label}</span>
            <span className="font-mono text-[9px]" style={{ color: payMethod === m.key ? '#a8792a' : '#6b7c6d' }}>{m.sub}</span>
          </button>
        ))}
      </div>

      {/* ─── Fiat card form ─── */}
      {payMethod === 'card' && (
        <div className="flex flex-col gap-3">
          <div className="font-black text-[10px] uppercase tracking-widest text-[#e8f2ea] flex items-center gap-2">
            <span>Поповнення карткою</span>
            <span className="font-mono text-[9px] text-[#4caf7d] border border-[#4caf7d40] px-1.5 py-0.5 rounded">DEMO</span>
          </div>
          {/* Card visual */}
          <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 140 }}>
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-6 h-6 rounded-full opacity-80" style={{ background: '#eb001b' }} />
              <div className="w-6 h-6 rounded-full opacity-80 -ml-3" style={{ background: '#f79e1b' }} />
            </div>
            <div className="font-mono text-[10px] text-white/40 uppercase mb-4">Debit / Credit</div>
            <div className="font-mono text-base text-white tracking-widest mb-4">
              {cardNum || '•••• •••• •••• ••••'}
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="font-mono text-[8px] text-white/40 uppercase mb-0.5">Власник</div>
                <div className="font-mono text-xs text-white uppercase">{cardName || 'CARDHOLDER NAME'}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[8px] text-white/40 uppercase mb-0.5">Термін</div>
                <div className="font-mono text-xs text-white">{cardExp || 'MM/YY'}</div>
              </div>
            </div>
          </div>
          {/* Fields */}
          <div>
            <label className="block font-mono text-[10px] text-[#6b7c6d] uppercase mb-1">Номер картки</label>
            <input className="u24-input font-mono tracking-widest" placeholder="0000 0000 0000 0000"
              value={cardNum} onChange={e => setCardNum(fmtCard(e.target.value))} maxLength={19} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[10px] text-[#6b7c6d] uppercase mb-1">Термін дії</label>
              <input className="u24-input font-mono" placeholder="MM/YY"
                value={cardExp} onChange={e => setCardExp(fmtExp(e.target.value))} maxLength={5} />
            </div>
            <div>
              <label className="block font-mono text-[10px] text-[#6b7c6d] uppercase mb-1">CVV</label>
              <input className="u24-input font-mono" placeholder="•••" type="password"
                value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4} />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[#6b7c6d] uppercase mb-1">Ім'я власника</label>
            <input className="u24-input uppercase" placeholder="IVAN PETRENKO"
              value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="block font-mono text-[10px] text-[#6b7c6d] uppercase mb-1">Сума поповнення (USDT)</label>
            <input className="u24-input" type="number" placeholder="Від 10 USDT" min={10} step={10}
              value={fiatAmt} onChange={e => setFiatAmt(e.target.value)} />
            <div className="flex gap-1.5 mt-1.5">
              {[50, 100, 250, 500].map(v => (
                <button key={v} onClick={() => setFiatAmt(String(v))}
                  className="flex-1 font-mono text-xs rounded-lg py-1.5 transition-all cursor-pointer"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7c6d' }}
                  onMouseEnter={e => { e.currentTarget.style.background='#1d2e20'; e.currentTarget.style.color='#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7c6d'; }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <button className="u24-button-gold py-3 text-sm flex items-center justify-center gap-2"
            onClick={submitFiatDeposit} disabled={fiatLoading}>
            {fiatLoading ? '⏳ Обробка…' : `💳 Поповнити ${fiatAmt ? `${fiatAmt} USDT` : ''}`}
          </button>
          <div className="font-mono text-[9px] text-[#6b7c6d] text-center leading-relaxed">
            🔒 Demo-режим · Реальні кошти не списуються · Баланс зараховується одразу
          </div>
        </div>
      )}

      {/* ─── Crypto section ─── */}
      {payMethod === 'crypto' && <>
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
      </>}
    </div>
  );
}

// ─── Casino Lobby ─────────────────────────────────────────────────────────────

function CasinoLobby({ wallet, onSelectGame, onWalletUpdate, token, notify }: {
  wallet: CasinoWallet;
  onSelectGame: (g: CasinoView) => void;
  onWalletUpdate: (w: Partial<CasinoWallet>) => void;
  token: string;
  notify: (m: string) => void;
}) {
  const xpToNext = wallet.level * 500;
  const xpPct = Math.min(100, Math.round((wallet.xp % xpToNext) / xpToNext * 100));

  type GameMeta = { key: CasinoView; label: string; tag: string; hint: string; accent: string; emoji: string; live?: boolean };
  const GAMES: GameMeta[] = [
    { key: 'crash',     label: 'Crash',        tag: 'Arcade',  hint: 'LIVE',  accent: '#E06E4A', emoji: '🚀', live: true },
    { key: 'plinko',    label: 'Plinko',       tag: 'Instant', hint: '×999',  accent: '#E4A24B', emoji: '🔮' },
    { key: 'blackjack', label: 'Blackjack',    tag: 'Table',   hint: '3:2',   accent: '#5BBE8A', emoji: '🃏' },
    { key: 'baccarat',  label: 'Baccarat',     tag: 'Table',   hint: '8:1',   accent: '#6DB5D4', emoji: '🎴' },
    { key: 'roulette',  label: 'Roulette',     tag: 'Table',   hint: 'LIVE',  accent: '#E54B5E', emoji: '🎡', live: true },
    { key: 'mines',     label: 'Mines',        tag: 'Instant', hint: '×1000', accent: '#E4A24B', emoji: '💣' },
    { key: 'dice',      label: 'Dice',         tag: 'Classic', hint: '×49',   accent: '#6DB5D4', emoji: '🎲' },
    { key: 'slots',     label: 'Slots',        tag: 'Jackpot', hint: '×50',   accent: '#5BBE8A', emoji: '🎰' },
    { key: 'chicken',   label: 'Chicken Road', tag: 'Arcade',  hint: '×30',   accent: '#E4A24B', emoji: '🐔' },
    { key: 'limbo',     label: 'Limbo',        tag: 'Instant', hint: '×1000', accent: '#C678DD', emoji: '🚀' },
    { key: 'wheel',     label: 'Wheel',        tag: 'Arcade',  hint: '×49',   accent: '#E54B5E', emoji: '🎡' },
    { key: 'hilo',      label: 'Hi-Lo',        tag: 'Classic', hint: 'Cards', accent: '#5BBE8A', emoji: '🎴' },
    { key: 'tower',     label: 'Tower',        tag: 'Arcade',  hint: '×9',    accent: '#E54B5E', emoji: '🗼' },
    { key: 'keno',      label: 'Keno',         tag: 'Jackpot', hint: '×800',  accent: '#6DB5D4', emoji: '🎯' },
    { key: 'videopoker',label: 'Video Poker',  tag: 'Classic', hint: '×800',  accent: '#5BBE8A', emoji: '🂡' },
    { key: 'dragontiger',label:'Dragon Tiger', tag: 'Table',   hint: '×8',    accent: '#E54B5E', emoji: '🐉' },
    { key: 'scratch',   label: 'Scratch',      tag: 'Instant', hint: '×50',   accent: '#C678DD', emoji: '🎴' },
  ];

  const CATS = ['Всі', 'Table', 'Arcade', 'Instant', 'Classic', 'Jackpot'] as const;
  type Cat = typeof CATS[number];
  const [cat, setCat] = useState<Cat>('Всі');
  const visibleGames = cat === 'Всі' ? GAMES : GAMES.filter(g => g.tag === cat);

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

  type BonusDay = { day: number; amount: number; claimed: boolean; today: boolean };
  type BonusStatus = { claimed_today: boolean; streak: number; next_amount: number; days: BonusDay[] };
  const [bonus, setBonus] = useState<BonusStatus | null>(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    api<BonusStatus>('/casino/daily-bonus', {}, token).then(r => {
      if (r.ok && r.data) setBonus(r.data);
    });
  }, [token]);

  async function claimBonus() {
    sfx.click();
    setClaiming(true);
    const r = await api<BonusStatus & { amount: number; new_balance: number }>(
      '/casino/daily-bonus/claim', { method: 'POST' }, token,
    );
    setClaiming(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    onWalletUpdate({ balance: r.data!.new_balance });
    notify(`🎁 +${fmtCoins(r.data!.amount)} — День ${r.data!.streak}!`);
    setBonus(r.data!);
  }

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
            <AnimatedBalance value={wallet.balance} />
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
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="font-black text-[10px] uppercase tracking-widest text-[#E8F2EA]/50">Щоденні бонуси</div>
          {bonus && <div className="font-mono text-[10px] text-[#E4A24B]">🔥 Стрік {bonus.streak} дн.</div>}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-1 px-1">
          {(bonus?.days ?? []).map(b => {
            const isToday = b.today && !bonus?.claimed_today;
            const isCurrent = b.today;
            return (
              <button key={b.day}
                disabled={b.claimed || (isCurrent && (bonus?.claimed_today ?? true)) || (!isCurrent && !b.today)}
                onClick={isToday ? claimBonus : undefined}
                className="shrink-0 w-[130px] rounded-xl p-3 text-left transition-all"
                style={{
                  background: b.claimed ? '#0d1a10' : isCurrent ? '#163524' : '#0f1e14',
                  border: `1px solid ${b.claimed ? 'rgba(255,255,255,0.04)' : isCurrent ? 'rgba(228,162,75,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  opacity: (!b.claimed && !isCurrent) ? 0.45 : 1,
                  cursor: isToday ? 'pointer' : 'default',
                  boxShadow: isCurrent && !bonus?.claimed_today ? '0 0 12px rgba(228,162,75,0.15)' : undefined,
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: b.claimed ? '#163524' : 'rgba(228,162,75,0.15)' }}>
                    {b.claimed ? <span className="text-sm">✅</span> : <Gift size={14} style={{ color: '#E4A24B' }} />}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[#E8F2EA]/60">День {b.day}</div>
                </div>
                <div className="mt-2 font-black text-base" style={{ color: b.claimed ? '#4caf7d' : '#E4A24B' }}>
                  +{b.amount} ₮
                </div>
                <div className="font-mono text-[10px] text-[#E8F2EA]/40 mt-0.5">
                  {b.claimed ? 'Отримано' : isToday ? (claiming ? '⏳…' : 'Забрати!') : isCurrent && bonus?.claimed_today ? 'Завтра' : '—'}
                </div>
              </button>
            );
          })}
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

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-0.5">
        {CATS.map(c => {
          const labels: Record<Cat, string> = { 'Всі': 'Всі', Table: 'Стіл', Arcade: 'Аркада', Instant: 'Миттєві', Classic: 'Класика', Jackpot: 'Джекпот' };
          return (
            <button key={c} onClick={() => setCat(c)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              style={{
                background: cat === c ? '#E4A24B' : 'rgba(255,255,255,0.05)',
                color: cat === c ? '#1a1006' : 'rgba(232,242,234,0.5)',
                border: `1px solid ${cat === c ? '#E4A24B' : 'rgba(255,255,255,0.06)'}`,
              }}>
              {labels[c]}
            </button>
          );
        })}
      </div>

      {/* Games grid */}
      <div className="grid grid-cols-2 gap-3">
        {visibleGames.map(g => {
          const patternMap: Record<string, string> = {
            crash:      'repeating-linear-gradient(45deg, transparent 0 6px, rgba(255,255,255,0.025) 6px 12px)',
            slots:      'repeating-linear-gradient(90deg, transparent 0 10px, rgba(255,255,255,0.02) 10px 11px)',
            roulette:   'repeating-conic-gradient(rgba(255,255,255,0.02) 0deg 10deg, transparent 10deg 20deg)',
            blackjack:  'repeating-linear-gradient(-45deg, transparent 0 8px, rgba(255,255,255,0.025) 8px 16px)',
            baccarat:   'repeating-linear-gradient(0deg, transparent 0 10px, rgba(255,255,255,0.02) 10px 11px)',
            plinko:     'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.04) 1px, transparent 2px) 0 0/14px 14px',
            mines:      'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04) 1px, transparent 2px) 0 0/18px 18px',
            dice:       'repeating-linear-gradient(30deg, transparent 0 8px, rgba(255,255,255,0.02) 8px 10px)',
            chicken:    'repeating-linear-gradient(60deg, transparent 0 10px, rgba(255,255,255,0.02) 10px 12px)',
            limbo:      'radial-gradient(ellipse at 50% 100%, rgba(198,120,221,0.1) 0%, transparent 70%)',
            wheel:      'repeating-conic-gradient(rgba(255,255,255,0.03) 0deg 15deg, transparent 15deg 30deg)',
            hilo:       'repeating-linear-gradient(135deg, transparent 0 8px, rgba(255,255,255,0.02) 8px 16px)',
            tower:      'repeating-linear-gradient(90deg, rgba(255,255,255,0.015) 0 1px, transparent 1px 16px)',
            keno:       'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.03) 1px, transparent 2px) 0 0/12px 12px, radial-gradient(circle at 75% 75%, rgba(255,255,255,0.03) 1px, transparent 2px) 0 0/12px 12px',
            videopoker: 'repeating-linear-gradient(-30deg, transparent 0 10px, rgba(91,190,138,0.04) 10px 12px)',
            dragontiger:'radial-gradient(ellipse at 0% 100%, rgba(229,75,94,0.15) 0%, transparent 60%)',
            scratch:    'repeating-linear-gradient(45deg, rgba(198,120,221,0.04) 0 2px, transparent 2px 12px)',
          };
          const pat = patternMap[g.key] || '';
          return (
            <button key={g.key} onClick={() => { sfx.click(); onSelectGame(g.key); }}
              className="rounded-2xl overflow-hidden text-left cursor-pointer active:scale-[0.96] group"
              style={{
                background: `#0f2018`,
                border: `1px solid ${g.accent}30`,
                boxShadow: `0 2px 12px rgba(0,0,0,0.3)`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow=`0 0 20px ${g.accent}30, 0 4px 16px rgba(0,0,0,0.4)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow=`0 2px 12px rgba(0,0,0,0.3)`; }}>
              {/* Card art */}
              <div style={{
                height: 100,
                background: `${pat}, radial-gradient(ellipse at 60% 30%, ${g.accent}22 0%, transparent 65%), linear-gradient(180deg, ${g.accent}15 0%, #0a1a10 100%)`,
                position: 'relative', display:'flex', alignItems:'center', justifyContent:'center',
                borderBottom: `1px solid ${g.accent}20`,
                overflow: 'hidden',
              }}>
                {/* Big dim accent circle */}
                <div style={{
                  position:'absolute', right:-20, bottom:-20, width:80, height:80, borderRadius:'50%',
                  background: `radial-gradient(circle, ${g.accent}20 0%, transparent 70%)`,
                  filter: 'blur(8px)',
                }} />
                <span style={{ fontSize: 44, lineHeight: 1, filter: `drop-shadow(0 0 16px ${g.accent}80) drop-shadow(0 4px 8px rgba(0,0,0,0.4))`, position:'relative', zIndex:1 }}>
                  {g.emoji}
                </span>
                {g.live && (
                  <span style={{
                    position:'absolute', top:8, left:8,
                    display:'flex', alignItems:'center', gap:4, padding:'3px 7px', borderRadius:20,
                    background:'rgba(91,190,138,0.12)', border:'1px solid rgba(91,190,138,0.35)',
                  }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#5BBE8A', boxShadow:'0 0 4px #5BBE8A', animation:'pulse 1.5s infinite' }} />
                    <span style={{ fontWeight:900, fontSize:8, letterSpacing:'0.1em', color:'#5BBE8A' }}>LIVE</span>
                  </span>
                )}
                <span style={{ position:'absolute', bottom:7, right:9, fontWeight:900, fontSize:11, color:g.accent, textShadow:`0 0 8px ${g.accent}80` }}>
                  {g.hint}
                </span>
              </div>
              {/* Label */}
              <div style={{ padding:'10px 12px' }}>
                <div style={{ fontWeight:900, fontSize:12, color:'#fff', letterSpacing:'0.02em', textTransform:'uppercase' }}>{g.label}</div>
                <div style={{ fontWeight:600, fontSize:10, color:`${g.accent}90`, marginTop:2, letterSpacing:'0.06em' }}>{g.tag}</div>
              </div>
            </button>
          );
        })}
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
    blackjack: '🃏', baccarat: '🎴', plinko: '🔮', limbo: '🚀', wheel: '🎡',
    hilo: '🎴', tower: '🗼', keno: '🎯', videopoker: '🂡', dragontiger: '🐉',
    scratch: '🎴',
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

// ─── Admin Panel ─────────────────────────────────────────────────────────────

type AdminTab = 'stats' | 'withdrawals' | 'users' | 'adjust';

function AdminView({ token, userRole, notify }: { token: string; userRole: Role; notify: (m: string) => void }) {
  const [tab, setTab] = useState<AdminTab>('stats');

  const TABS: { key: AdminTab; label: string; icon: string; adminOnly?: boolean }[] = [
    { key: 'stats',       label: 'Статистика', icon: '📊' },
    { key: 'withdrawals', label: 'Виводи',     icon: '💸' },
    { key: 'users',       label: 'Гравці',     icon: '👥', adminOnly: true },
    { key: 'adjust',      label: 'Баланс',     icon: '⚙️', adminOnly: true },
  ].filter(t => !t.adminOnly || userRole === 'admin');

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0B1A12]">
      {/* Tab bar */}
      <div className="flex gap-1 px-3 py-2 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest cursor-pointer transition-all"
            style={{
              background: tab === t.key ? 'rgba(228,162,75,0.15)' : 'transparent',
              color: tab === t.key ? '#E4A24B' : 'rgba(232,242,234,0.4)',
              border: `1px solid ${tab === t.key ? 'rgba(228,162,75,0.3)' : 'transparent'}`,
            }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'stats'       && <AdminStats token={token} />}
      {tab === 'withdrawals' && <AdminWithdrawals token={token} notify={notify} />}
      {tab === 'users'       && <AdminUsers token={token} notify={notify} />}
      {tab === 'adjust'      && <AdminAdjust token={token} notify={notify} />}
    </div>
  );
}

function AdminStats({ token }: { token: string }) {
  type Stats = { total_users: number; active_today: number; total_wagered: number; total_won: number; house_edge_pct: number; games_today: number; total_deposits_usdt: number; deposits_today: number; pending_deposits: number };
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>('/admin/stats', {}, token).then(r => { if (r.ok && r.data) setS(r.data); });
  }, [token]);

  if (!s) return <div className="flex-1 flex items-center justify-center font-mono text-sm text-[#E8F2EA]/30 animate-pulse">Завантаження…</div>;

  const cards = [
    { label: 'Гравців',      value: s.total_users,             color: '#E8F2EA' },
    { label: 'Активних сьогодні', value: s.active_today,       color: '#5BBE8A' },
    { label: 'Ставок всього', value: fmtCoins(s.total_wagered), color: '#E4A24B' },
    { label: 'Виплачено',    value: fmtCoins(s.total_won),     color: '#E54B5E' },
    { label: 'Перевага казино', value: `${s.house_edge_pct}%`, color: '#5BBE8A' },
    { label: 'Ігор сьогодні', value: s.games_today,            color: '#E8F2EA' },
    { label: 'Депозитів USDT', value: fmtCoins(s.total_deposits_usdt), color: '#E4A24B' },
    { label: 'Депозитів сьогодні', value: fmtCoins(s.deposits_today), color: '#5BBE8A' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 gap-2">
        {cards.map(c => (
          <div key={c.label} className="rounded-xl px-4 py-3"
            style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="font-mono text-[9px] text-[#E8F2EA]/40 uppercase mb-1">{c.label}</div>
            <div className="font-black text-lg" style={{ color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminWithdrawals({ token, notify }: { token: string; notify: (m: string) => void }) {
  type WD = { id: number; user_id: number; full_name: string; amount_usdt: number; address: string; status: string; created_at: string };
  const [rows, setRows] = useState<WD[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [processing, setProcessing] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<Record<number, string>>({});

  const load = () => api<WD[]>(`/admin/withdrawals?status=${statusFilter}`, {}, token).then(r => { if (r.ok && r.data) setRows(r.data); });
  useEffect(() => { load(); }, [statusFilter, token]);

  async function process(id: number, action: 'approve' | 'reject') {
    setProcessing(id);
    const r = await api(`/admin/withdrawals/${id}/process`, {
      method: 'POST',
      body: JSON.stringify({ action, tx_hash: txHash[id] || '' }),
    }, token);
    setProcessing(null);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    notify(action === 'approve' ? '✅ Підтверджено' : '❌ Відхилено');
    load();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex gap-1.5 px-3 py-2 shrink-0">
        {['pending', 'done', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1 rounded-lg font-mono text-[10px] uppercase tracking-widest cursor-pointer transition-all"
            style={{ background: statusFilter === s ? 'rgba(228,162,75,0.15)' : 'rgba(255,255,255,0.04)', color: statusFilter === s ? '#E4A24B' : 'rgba(232,242,234,0.4)', border: `1px solid ${statusFilter === s ? 'rgba(228,162,75,0.3)' : 'transparent'}` }}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {rows.length === 0 && <div className="text-center font-mono text-xs text-[#E8F2EA]/30 mt-8">Немає заявок</div>}
        {rows.map(w => (
          <div key={w.id} className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-black text-xs text-[#E8F2EA]">{w.full_name}</div>
                <div className="font-mono text-[10px] text-[#E8F2EA]/40">{new Date(w.created_at).toLocaleString('uk')}</div>
              </div>
              <div className="font-black text-sm text-[#E4A24B]">{w.amount_usdt} USDT</div>
            </div>
            <div className="font-mono text-[10px] text-[#E8F2EA]/50 break-all">{w.address}</div>
            {w.status === 'pending' && (
              <div className="flex flex-col gap-1.5">
                <input className="u24-input font-mono text-xs" placeholder="tx_hash (0x…)" value={txHash[w.id] || ''}
                  onChange={e => setTxHash(h => ({ ...h, [w.id]: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={() => process(w.id, 'approve')} disabled={processing === w.id || !txHash[w.id]}
                    className="flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 transition-all"
                    style={{ background: 'rgba(76,175,125,0.15)', color: '#4caf7d', border: '1px solid rgba(76,175,125,0.3)' }}>
                    {processing === w.id ? '⏳' : '✅ Підтвердити'}
                  </button>
                  <button onClick={() => process(w.id, 'reject')} disabled={processing === w.id}
                    className="flex-1 py-2 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer disabled:opacity-40 transition-all"
                    style={{ background: 'rgba(229,75,94,0.1)', color: '#E54B5E', border: '1px solid rgba(229,75,94,0.2)' }}>
                    ❌ Відхилити
                  </button>
                </div>
              </div>
            )}
            {w.status !== 'pending' && (
              <span className="font-mono text-[10px] font-bold" style={{ color: w.status === 'done' ? '#4caf7d' : '#E54B5E' }}>
                {w.status === 'done' ? '✅ Виконано' : '❌ Відхилено'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminUsers({ token, notify }: { token: string; notify: (m: string) => void }) {
  type URow = { id: number; full_name: string; phone: string; email: string; role: string; balance?: number };
  const [rows, setRows] = useState<URow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api<{ users: URow[] }>('/admin/users', {}, token).then(r => { if (r.ok && r.data) setRows(r.data.users ?? []); });
  }, [token]);

  async function setRole(userId: number, role: string) {
    const r = await api(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }, token);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    setRows(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    notify('✅ Роль змінено');
  }

  const filtered = rows.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (u.phone || '').includes(search) || (u.email || '').includes(search),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-3 py-2 shrink-0">
        <input className="u24-input text-sm" placeholder="Пошук за ім'ям / телефоном…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
        {filtered.map(u => (
          <div key={u.id} className="rounded-xl px-3 py-2.5 flex items-center gap-3"
            style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
              style={{ background: 'rgba(228,162,75,0.12)', color: '#E4A24B' }}>
              {(u.full_name || '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-xs text-[#E8F2EA] truncate">{u.full_name}</div>
              <div className="font-mono text-[10px] text-[#E8F2EA]/40 truncate">{u.phone || u.email}</div>
            </div>
            <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
              className="font-mono text-[10px] rounded-lg px-2 py-1 cursor-pointer"
              style={{ background: '#0B1A12', color: '#E4A24B', border: '1px solid rgba(228,162,75,0.25)' }}>
              {['soldier', 'operator', 'admin', 'banned'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAdjust({ token, notify }: { token: string; notify: (m: string) => void }) {
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!userId || !amount) { notify('Заповніть всі поля.'); return; }
    setLoading(true);
    const r = await api('/admin/payments/adjust', {
      method: 'POST', body: JSON.stringify({ user_id: +userId, amount: +amount, note }),
    }, token);
    setLoading(false);
    if (!r.ok) { notify(r.error || 'Помилка.'); return; }
    notify(`✅ Баланс оновлено: user ${userId} ${+amount > 0 ? '+' : ''}${amount}`);
    setUserId(''); setAmount(''); setNote('');
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <div className="rounded-xl p-4 flex flex-col gap-3"
        style={{ background: '#112A1C', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="font-black text-xs text-[#E8F2EA] uppercase tracking-widest mb-1">Коригування балансу</div>
        <div>
          <label className="block font-mono text-[10px] text-[#E8F2EA]/40 uppercase mb-1">User ID</label>
          <input className="u24-input" type="number" placeholder="123" value={userId} onChange={e => setUserId(e.target.value)} />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-[#E8F2EA]/40 uppercase mb-1">Сума (+ зарахувати / − списати)</label>
          <input className="u24-input" type="number" placeholder="+500 або -100" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <label className="block font-mono text-[10px] text-[#E8F2EA]/40 uppercase mb-1">Примітка</label>
          <input className="u24-input" placeholder="Причина" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button onClick={submit} disabled={loading}
          className="u24-button-gold py-3 text-sm disabled:opacity-50">
          {loading ? '⏳ Зберігаємо…' : '⚡ Застосувати'}
        </button>
      </div>
      <div className="font-mono text-[10px] text-[#E8F2EA]/30 leading-relaxed px-1">
        Зміни фіксуються в audit_log. Негативна сума списує кошти, позитивна — зараховує. Мінімальний баланс = 0.
      </div>
    </div>
  );
}

// ─── Player Profile ───────────────────────────────────────────────────────────

function ProfileView({ user, wallet, notify, onLogout, onGoDeposit, onGoHistory, onGoSupport, achievements }: {
  user: User;
  wallet: CasinoWallet;
  tickets?: SupportTicket[];
  notify: (m: string) => void;
  onLogout?: () => void;
  onGoDeposit?: () => void;
  onGoHistory?: () => void;
  onGoSupport?: () => void;
  achievements?: string[];
}) {
  const [showAch, setShowAch] = useState(false);
  const achList = achievements || [];

  const winRate = wallet.total_bet > 0 ? Math.round((wallet.total_won / wallet.total_bet) * 100) : 0;
  const initial = (user.full_name || 'U')[0].toUpperCase();
  const handle = user.phone || user.email || 'user';
  const xpToNext = wallet.level * 100;
  const xpPct = Math.min(100, Math.round((wallet.xp % xpToNext) / xpToNext * 100));

  const ALL_ACHIEVEMENTS: Record<string, { label: string; emoji: string }> = {
    big_winner:          { label: 'Великий переможець',  emoji: '💰' },
    roulette_zero:       { label: 'Зеро!',               emoji: '🎡' },
    roulette_straight_win:{ label: 'Ставка на число',    emoji: '🎯' },
    slots_jackpot:       { label: 'Джекпот у слотах',    emoji: '🎰' },
    first_game:          { label: 'Перша гра',           emoji: '🎮' },
    high_roller:         { label: 'Хай-ролер',           emoji: '🃏' },
    lucky_streak:        { label: 'Серія удачі',         emoji: '🔥' },
  };

  const T = {
    bg0: '#0B1A12', bg1: '#112A1C', bg2: '#163524',
    hairline: 'rgba(255,255,255,0.09)',
    text: '#E8F2EA', textDim: 'rgba(232,242,234,0.62)', textMute: 'rgba(232,242,234,0.38)',
    amber: '#E4A24B', coral: '#E06E4A', mint: '#5BBE8A', ruby: '#E54B5E',
  };

  const settingsItems = [
    { icon: <Coins size={15} />, label: 'Поповнення', detail: '', onClick: () => onGoDeposit?.() },
    { icon: <BarChart2 size={15} />, label: 'Транзакції', detail: '', onClick: () => onGoHistory?.() },
    { icon: <Trophy size={15} />, label: 'Досягнення', detail: '', onClick: () => setShowAch(v => !v) },
    { icon: <LifeBuoy size={15} />, label: 'Підтримка', detail: '', onClick: () => onGoSupport?.() },
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

        {/* XP progress */}
        <div style={{ background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 14 }} className="px-4 py-3 flex flex-col gap-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.textDim }}>Рівень {wallet.level}</div>
            <div style={{ fontSize: 11, color: T.amber, fontFamily: 'monospace' }}>{wallet.xp % xpToNext} / {xpToNext} XP</div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${xpPct}%`, background: 'linear-gradient(90deg,#5BBE8A,#E4A24B)', borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMute }}>{xpToNext - (wallet.xp % xpToNext)} XP до {wallet.level + 1} рівня</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Ігор зіграно', val: String(wallet.games_count ?? 0) },
            { label: 'Виграно всього', val: fmtCoins(wallet.total_won) },
            { label: 'Win Rate', val: `${winRate}%` },
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

        {/* Achievements panel */}
        {showAch && (
          <div style={{ background: T.bg1, border: `1px solid ${T.hairline}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '0.5px' }}>🏆 Досягнення</span>
              <span style={{ fontSize: 11, color: T.textDim }}>{achList.length} / {Object.keys(ALL_ACHIEVEMENTS).length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {Object.entries(ALL_ACHIEVEMENTS).map(([key, ach]) => {
                const unlocked = achList.includes(key);
                return (
                  <div key={key} style={{
                    background: unlocked ? T.bg2 : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${unlocked ? 'rgba(228,162,75,0.3)' : T.hairline}`,
                    borderRadius: 10, padding: '10px 12px',
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{ach.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: unlocked ? T.amber : T.textMute, lineHeight: 1.3 }}>{ach.label}</div>
                    {!unlocked && <div style={{ fontSize: 9, color: T.textMute, marginTop: 2 }}>не відкрито</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Wake-up Screen ───────────────────────────────────────────────────────────

function WakeUpScreen() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(228,162,75,0.08) 0%, transparent 70%), #080e12' }}>
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#163524,#0d1f18)', border: '1px solid rgba(228,162,75,0.35)', boxShadow: '0 0 40px rgba(228,162,75,0.15)' }}>
          <HummingbirdLogo size={52} />
        </div>
        <div className="absolute -inset-2 rounded-3xl animate-ping opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(228,162,75,0.4), transparent 70%)' }} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="font-black text-lg uppercase tracking-widest" style={{ color: '#E4A24B', letterSpacing: 4 }}>
          {APP_NAME}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#E4A24B' }} />
          <span className="font-mono text-xs tracking-widest" style={{ color: 'rgba(228,162,75,0.6)' }}>
            ЗАПУСК СЕРВЕРА{dots}
          </span>
        </div>
        <div className="font-mono text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Free tier · Cold start ~30s
        </div>
      </div>
      <div className="w-48 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full animate-wakeup-bar" style={{ background: 'linear-gradient(90deg, #E4A24B, #5BBE8A)' }} />
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
  useEffect(() => { try { localStorage.setItem('app_lang', lang); } catch {} }, [lang]);
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

  // Casino design tokens
  const C = {
    bg:       '#07090d',
    panel:    'rgba(12,18,14,0.95)',
    card:     '#0d1a10',
    border:   'rgba(200,160,60,0.22)',
    borderHi: 'rgba(240,185,58,0.7)',
    gold:     '#F0B93A',
    goldDim:  '#c9962e',
    text:     '#F0EDE6',
    textDim:  'rgba(240,237,230,0.5)',
    textMute: 'rgba(240,237,230,0.3)',
    input:    'rgba(0,0,0,0.4)',
    error:    '#FF5A6E',
    green:    '#4ecb8d',
  };

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 15px',
    background: C.input,
    border: `1.5px solid ${C.border}`,
    borderRadius: 10, color: C.text,
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.2s',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 10, fontWeight: 700,
    color: C.textMute, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7,
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 relative overflow-hidden"
      style={{ background: C.bg }}>

      {/* Full-screen bg texture */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 120% 50% at 50% -10%, rgba(200,150,40,0.13) 0%, transparent 60%),
          radial-gradient(ellipse 80% 80% at 80% 110%, rgba(14,80,40,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 60% 60% at -10% 50%, rgba(14,60,30,0.15) 0%, transparent 55%)
        `
      }} />

      {/* Floating suit decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {[
          { s: '♠', x: '4%',  y: '8%',  sz: 100, rot: -18, op: 0.04  },
          { s: '♥', x: '87%', y: '5%',  sz: 80,  rot: 14,  op: 0.05  },
          { s: '♦', x: '2%',  y: '72%', sz: 90,  rot: -10, op: 0.035 },
          { s: '♣', x: '84%', y: '70%', sz: 110, rot: 22,  op: 0.04  },
          { s: '♥', x: '48%', y: '3%',  sz: 55,  rot: 6,   op: 0.025 },
          { s: '♦', x: '92%', y: '40%', sz: 65,  rot: -5,  op: 0.03  },
          { s: '♣', x: '0%',  y: '42%', sz: 70,  rot: 12,  op: 0.03  },
        ].map((d, i) => (
          <div key={i} className="absolute" style={{
            left: d.x, top: d.y, fontSize: d.sz,
            color: `rgba(220,170,50,${d.op})`,
            transform: `rotate(${d.rot}deg)`, lineHeight: 1,
            fontWeight: 900,
          }}>{d.s}</div>
        ))}
      </div>

      {/* Main layout — left brand panel + right form on wide, stacked on mobile */}
      <div className="relative z-10 w-full max-w-[860px] flex gap-0 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 40px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(200,160,60,0.18)' }}>

        {/* ── Left brand panel (hidden on very small screens) ── */}
        <div className="hidden md:flex flex-col justify-between p-10 flex-1"
          style={{ background: 'linear-gradient(155deg,#0a1a0d 0%,#071209 60%,#060f09 100%)', borderRight: `1px solid ${C.border}` }}>

          {/* Top: logo */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#163524,#0d1f18)', border: `1px solid rgba(200,160,60,0.35)`, boxShadow: `0 0 24px rgba(200,160,60,0.15)` }}>
                <HummingbirdLogo size={32} />
              </div>
              <div>
                <div style={{ fontFamily: '"Space Grotesk",system-ui', fontWeight: 800, fontSize: 20, letterSpacing: 3, color: C.text }}>
                  {APP_NAME.toUpperCase()}
                </div>
                <div style={{ fontSize: 10, color: C.textMute, letterSpacing: 2, textTransform: 'uppercase' }}>Casino & Messenger</div>
              </div>
            </div>

            {/* Casino features */}
            <div className="flex flex-col gap-3 mt-4">
              {[
                { icon: '🎰', title: '17 ігор', sub: 'Crash · Slots · Blackjack · Plinko та ін.' },
                { icon: '💎', title: 'Provably Fair', sub: 'Верифіковані результати HMAC-SHA256' },
                { icon: '🔒', title: 'E2E шифрування', sub: 'Захищені повідомлення Fernet' },
                { icon: '🎁', title: '+200₮ бонус', sub: 'При першій реєстрації одразу' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                  <span className="text-xl mt-0.5">{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: playing cards decoration */}
          <div className="flex items-end justify-center mt-8 select-none">
            {[
              { v: 'A', s: '♠', rot: -12, bg: '#fff', col: '#111' },
              { v: 'K', s: '♥', rot: -4,  bg: '#fff', col: '#cc2200' },
              { v: 'Q', s: '♦', rot: 5,   bg: '#fff', col: '#cc2200' },
              { v: 'J', s: '♣', rot: 13,  bg: '#fff', col: '#111' },
            ].map((card, i) => (
              <div key={i} className="rounded-xl p-2 flex flex-col justify-between -ml-6 first:ml-0"
                style={{ width: 64, height: 90, background: card.bg, transform: `rotate(${card.rot}deg) translateY(${Math.abs(card.rot) * 0.5}px)`, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', border: '1px solid rgba(0,0,0,0.1)', zIndex: i }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: card.col, lineHeight: 1 }}>{card.v}</div>
                <div style={{ fontSize: 22, textAlign: 'center', color: card.col, lineHeight: 1 }}>{card.s}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: card.col, lineHeight: 1, textAlign: 'right', transform: 'rotate(180deg)' }}>{card.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Auth form ── */}
        <div className="flex-1 flex flex-col p-6 md:p-9" style={{ background: C.panel, minWidth: 0 }}>

          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#163524,#0d1f18)', border: `1px solid rgba(200,160,60,0.35)` }}>
              <HummingbirdLogo size={24} />
            </div>
            <span style={{ fontFamily: '"Space Grotesk",system-ui', fontWeight: 800, fontSize: 17, letterSpacing: 2.5, color: C.text }}>
              {APP_NAME.toUpperCase()}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: 0.3 }}>
              {tab === 'login' ? 'Ласкаво просимо!' : 'Створити акаунт'}
            </div>
            <div style={{ fontSize: 13, color: C.textDim, marginTop: 4 }}>
              {tab === 'login' ? 'Увійдіть, щоб продовжити гру' : 'Реєстрація займає 30 секунд'}
            </div>
          </div>

          {/* Tab pills */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.border}` }}>
            {(['login', 'register'] as const).map(tab_ => (
              <button key={tab_} type="button" onClick={() => { setTab(tab_); setError(''); }}
                className="flex-1 py-2.5 text-sm font-bold cursor-pointer transition-all duration-200 rounded-lg"
                style={{
                  background: tab === tab_ ? `linear-gradient(135deg,${C.goldDim},${C.gold})` : 'transparent',
                  color: tab === tab_ ? '#140e00' : C.textDim,
                  border: 'none',
                  boxShadow: tab === tab_ ? '0 2px 12px rgba(200,150,40,0.4)' : 'none',
                }}>
                {tab_ === 'login' ? '🔑 ' + t.login : '✨ ' + t.register}
              </button>
            ))}
          </div>

          {/* Lang selector */}
          <div className="flex gap-2 mb-5">
            {(Object.keys(I18N) as LangCode[]).map(l => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className="cursor-pointer transition-all duration-150 rounded-lg px-2 py-1"
                style={{
                  background: lang === l ? 'rgba(200,150,40,0.15)' : 'transparent',
                  border: `1px solid ${lang === l ? C.borderHi : 'transparent'}`,
                  transform: lang === l ? 'scale(1.1)' : 'scale(1)',
                }}>
                <span className="text-xl">{LANG_FLAGS[l]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">

            {/* ── REGISTER fields ── */}
            {tab === 'register' && (<>
              <div>
                <label style={lbl}>{t.fullName}</label>
                <input style={inp} placeholder={t.namePlaceholder} value={form.full_name} onChange={set('full_name')} required autoFocus
                  onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div>
                <label style={lbl}>{t.country}</label>
                <CountryPicker value={country} onChange={c => setCountry(c)} t={t} />
              </div>
              <div>
                <label style={lbl}>{t.phone}</label>
                <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'rgba(0,0,0,0.5)', flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 17 }}>{country.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{country.dialCode}</span>
                  </div>
                  <input style={{ ...inp, borderRadius: 0, border: 'none', flex: 1 }}
                    placeholder={t.phonePlaceholder} value={phone} onChange={e => setPhone(e.target.value)} required inputMode="tel" />
                </div>
              </div>
              <div>
                <label style={lbl}>{t.email}</label>
                <input style={inp} type="email" placeholder={t.emailPlaceholder} value={form.email} onChange={set('email')} required autoComplete="email"
                  onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            </>)}

            {/* ── LOGIN fields ── */}
            {tab === 'login' && (<>
              <div className="flex gap-2 p-0.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)', border: `1px solid ${C.border}` }}>
                {(['email', 'phone'] as const).map(m => (
                  <button key={m} type="button" onClick={() => { setLoginMethod(m); setError(''); }}
                    className="flex-1 cursor-pointer transition-all duration-150 rounded-md py-2"
                    style={{ fontSize: 12, fontWeight: 600, border: 'none',
                      background: loginMethod === m ? 'rgba(200,150,40,0.12)' : 'transparent',
                      color: loginMethod === m ? C.gold : C.textDim }}>
                    {m === 'email' ? '✉️ Email' : '📱 ' + t.phone}
                  </button>
                ))}
              </div>
              {loginMethod === 'email' ? (
                <div>
                  <label style={lbl}>{t.email}</label>
                  <input style={inp} type="email" placeholder={t.emailPlaceholder}
                    value={form.login_email} onChange={set('login_email')} required autoFocus autoComplete="email"
                    onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
                </div>
              ) : (<>
                <div>
                  <label style={lbl}>{t.country}</label>
                  <CountryPicker value={country} onChange={c => setCountry(c)} t={t} />
                </div>
                <div>
                  <label style={lbl}>{t.phone}</label>
                  <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', background: 'rgba(0,0,0,0.5)', flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 17 }}>{country.flag}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{country.dialCode}</span>
                    </div>
                    <input style={{ ...inp, borderRadius: 0, border: 'none', flex: 1 }}
                      placeholder={t.phonePlaceholder} value={phone} onChange={e => setPhone(e.target.value)} required inputMode="tel" autoFocus />
                  </div>
                </div>
              </>)}
            </>)}

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label style={{ ...lbl, marginBottom: 0 }}>{t.password}</label>
                {tab === 'login' && <span style={{ fontSize: 10, color: C.textMute, cursor: 'pointer' }}>Забули пароль?</span>}
              </div>
              <input style={inp} type="password" placeholder="Мін. 8 символів" value={form.password} onChange={set('password')} required
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                onFocus={e => e.target.style.borderColor = C.gold} onBlur={e => e.target.style.borderColor = C.border} />
            </div>

            {/* Register bonus */}
            {tab === 'register' && (
              <div className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: 'linear-gradient(135deg,rgba(200,150,40,0.1),rgba(200,150,40,0.05))', border: `1px solid rgba(200,150,40,0.3)` }}>
                <div className="text-2xl">🎁</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>Вітальний бонус +200₮</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>Зараховується одразу після реєстрації</div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,90,110,0.1)', border: `1px solid rgba(255,90,110,0.3)`, fontSize: 13, color: C.error }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="relative overflow-hidden"
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                cursor: loading ? 'default' : 'pointer',
                background: loading ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg,${C.goldDim} 0%,${C.gold} 50%,${C.goldDim} 100%)`,
                backgroundSize: loading ? '' : '200% 100%',
                color: loading ? C.textDim : '#120c00',
                fontSize: 15, fontWeight: 800, letterSpacing: 0.5,
                boxShadow: loading ? 'none' : `0 4px 24px rgba(200,150,40,0.45), 0 1px 0 rgba(255,255,255,0.15) inset`,
                transition: 'all 0.2s',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t.loading}
                </span>
              ) : (
                tab === 'login' ? `${t.loginBtn} →` : `${t.registerBtn} →`
              )}
            </button>
          </form>

          {/* Footer badges */}
          <div className="flex items-center justify-center gap-3 mt-6 pt-5"
            style={{ borderTop: `1px solid ${C.border}` }}>
            {['🔒 SSL', '✅ Provably Fair', '⚡ 24/7'].map(b => (
              <span key={b} style={{ fontSize: 10, color: C.textMute, letterSpacing: 0.8 }}>{b}</span>
            ))}
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
  const [waking, setWaking] = useState(false);

  // Keep Render free tier awake + show wake-up screen on cold start
  // Also try to restore saved session from localStorage
  useEffect(() => {
    let wakeTimer: ReturnType<typeof setTimeout>;
    wakeTimer = setTimeout(() => setWaking(true), 1800);

    fetch('/api/ping')
      .catch(() => {})
      .finally(() => {
        clearTimeout(wakeTimer);
        setWaking(false);

        // After server is awake, try to restore saved session
        try {
          const savedToken = localStorage.getItem('nexus_token');
          const savedUser = localStorage.getItem('nexus_user');
          if (savedToken && savedUser) {
            const u = JSON.parse(savedUser) as User;
            // Verify token is still valid
            fetch('/api/auth/me', { headers: { Authorization: `Bearer ${savedToken}` } })
              .then(r => r.json())
              .then(j => {
                if (j.ok) {
                  setUser(u); setToken(savedToken); setScreen('app');
                } else {
                  localStorage.removeItem('nexus_token');
                  localStorage.removeItem('nexus_user');
                }
              })
              .catch(() => {});
          }
        } catch {}
      });

    const interval = setInterval(() => fetch('/api/ping').catch(() => {}), 10 * 60 * 1000);
    return () => { clearTimeout(wakeTimer); clearInterval(interval); };
  }, []);

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
  const [achievements, setAchievements] = useState<string[]>([]);

  // Call
  const [call, setCall] = useState<CallState | null>(null);

  // Support
  const [showSupport, setShowSupport] = useState(false);
  const [tickets] = useState<SupportTicket[]>([
    { id: 1, subject: 'Питання щодо шифрування', status: 'resolved', priority: 'normal', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
  ]);

  // Toast
  const [toast, setToast] = useState('');
  const { queue: toastQueue, remove: removeToast } = useToastQueue();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, activeChat]);

  const notify = useCallback((msg: string) => { pushToast(msg); setToast(msg); }, []);

  function updateWallet(delta: Partial<CasinoWallet>) { setWallet(prev => ({ ...prev, ...delta })); }

  useEffect(() => {
    if (!token) return;
    api<{ wallet: CasinoWallet; achievements: string[] }>('/casino/profile', {}, token).then(r => {
      if (r.ok && r.data) {
        setWallet(prev => ({ ...prev, ...r.data!.wallet }));
        setAchievements(r.data!.achievements);
      }
    });
  }, [token]);

  function handleAuth(u: User, t: string, isNew = false) {
    setUser(u); setToken(t); setScreen('app');
    setSidebarTab('profile');
    try {
      localStorage.setItem('nexus_token', t);
      localStorage.setItem('nexus_user', JSON.stringify(u));
    } catch {}
    if (isNew) {
      setTimeout(() => {
        setWallet(prev => ({ ...prev, balance: prev.balance + 200 }));
        notify('🎁 Вітаємо! +200₮ бонус нараховано!');
      }, 800);
    }
  }
  function handleLogout() {
    setUser(null); setToken(''); setScreen('auth'); setSidebarTab('profile');
    try { localStorage.removeItem('nexus_token'); localStorage.removeItem('nexus_user'); } catch {}
  }

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

  if (waking) return <WakeUpScreen />;
  if (screen === 'auth') return <AuthScreen onAuth={handleAuth} />;

  // ── Design tokens ─────────────────────────────────────────
  const T = {
    bg0: '#0B1A12', bg1: '#112A1C', bg2: '#163524',
    hairline: 'rgba(255,255,255,0.09)',
    text: '#E8F2EA', textDim: 'rgba(232,242,234,0.62)', textMute: 'rgba(232,242,234,0.38)',
    amber: '#E4A24B', coral: '#E06E4A', mint: '#5BBE8A', ruby: '#E54B5E', sky: '#6DB5D4',
  };

  // ── AppHeader ─────────────────────────────────────────────
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const AppHeader = () => (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '6px 14px 10px',
      borderBottom: `1px solid ${T.hairline}`,
      background: T.bg0,
      flexShrink: 0, gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
        <HummingbirdLogo size={20} />
        <span style={{
          fontFamily: 'var(--font-grotesk)', fontWeight: 700,
          letterSpacing: '2.2px', fontSize: 16, color: T.text,
        }}>КОЛІБРІ</span>
      </div>
      {/* Live balance pill — always visible */}
      {wallet && (
        <button onClick={() => { setSidebarTab('casino'); setCasinoView('deposit'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 11px', borderRadius: 10,
            background: 'linear-gradient(135deg,rgba(228,162,75,0.13),rgba(228,162,75,0.07))',
            border: `1px solid rgba(228,162,75,0.3)`,
            color: T.amber, fontSize: 13, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'monospace', flexShrink: 0,
            letterSpacing: 0.2,
          }}>
          <Coins size={13} />
          <AnimatedBalance value={wallet.balance} />
        </button>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        {/* Sound toggle */}
        <button onClick={() => { const v = !soundOn; setSoundOn(v); setSoundEnabled(v); if (v) sfx.click(); }}
          title={soundOn ? 'Звук увімкнено' : 'Звук вимкнено'}
          style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.hairline}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: soundOn ? T.amber : T.textDim, cursor: 'pointer', fontSize: 15 }}>
          {soundOn ? '🔊' : '🔇'}
        </button>
        {[
          { icon: <LifeBuoy size={16} />, onClick: () => setShowSupport(v => !v), title: 'Підтримка' },
          { icon: <LogOut size={16} />, onClick: handleLogout, title: 'Вийти' },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} title={btn.title} style={{
            width: 34, height: 34,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${T.hairline}`,
            borderRadius: 9,
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
    const tabs: { key: SidebarTab; icon: React.ReactNode; label: string; badge: number }[] = [
      { key: 'chats',   icon: <MessageCircle size={17} />, label: 'Чати',    badge: totalUnread },
      { key: 'casino',  icon: <Zap size={17} />,           label: casinoView !== 'lobby' ? '← Казино' : 'Казино',  badge: 0 },
      { key: 'profile', icon: <Award size={17} />,          label: 'Профіль', badge: 0 },
    ];
    if (user?.role === 'admin' || user?.role === 'operator') {
      tabs.push({ key: 'admin', icon: <Shield size={17} />, label: 'Адмін', badge: 0 });
    }
    return (
      <div style={{
        display: 'flex', gap: 6, padding: '10px 18px 4px',
        background: T.bg0, borderBottom: `1px solid ${T.hairline}`,
        flexShrink: 0,
      }}>
        {tabs.map(tab => {
          const active = sidebarTab === tab.key;
          return (
            <button key={tab.key} onClick={() => { sfx.click(); setSidebarTab(tab.key); }}
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
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderBottom: `1px solid ${T.hairline}`,
      background: T.bg0, flexShrink: 0,
    }}>
      <button onClick={() => { sfx.click(); setCasinoView('lobby'); }}
        style={{ color: T.amber, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <ChevronLeft size={22} />
      </button>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
        <div style={{ fontSize: 10, color: T.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
      {/* Live balance in game header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px', borderRadius: 8,
        background: 'rgba(228,162,75,0.08)', border: `1px solid rgba(228,162,75,0.2)`,
        color: T.amber, fontSize: 12, fontWeight: 800,
        fontFamily: 'monospace', flexShrink: 0,
      }}>
        <AnimatedBalance value={wallet.balance} />
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
          <ErrorBoundary>
          <CasinoLobby wallet={wallet} onSelectGame={v => setCasinoView(v)} onWalletUpdate={updateWallet} token={token} notify={notify} />
          </ErrorBoundary>
        )}
        {sidebarTab === 'casino' && casinoView === 'roulette' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎡" title="Рулетка" sub="Європейська · До ×35" />
            <ErrorBoundary><RouletteView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'slots' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎰" title="Слоти" sub="3 барабани · Джекпот ×50" />
            <ErrorBoundary><SlotsView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'crash' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🚀" title="Crash" sub="Забери до краху" />
            <ErrorBoundary><CrashView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'mines' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="💣" title="Mines" sub="5×5 мінне поле" />
            <ErrorBoundary><MinesView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'chicken' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🐔" title="Chicken Road" sub="Перейди дорогу · До ×30" />
            <ErrorBoundary><ChickenRoadView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'dice' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎲" title="Dice" sub="Більше / менше" />
            <ErrorBoundary><DiceView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'blackjack' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🃏" title="Blackjack" sub="Блекджек 3:2 · Дилер стоїть на 17" />
            <ErrorBoundary><BlackjackView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'baccarat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎴" title="Baccarat" sub="Гравець · Банкір · Нічия 8:1" />
            <ErrorBoundary><BaccaratView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'plinko' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🔮" title="Plinko" sub="8 / 12 / 16 рядків · До ×999" />
            <ErrorBoundary><PlinkoView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'limbo' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🚀" title="Limbo" sub="Цільовий множник · Provably Fair" />
            <ErrorBoundary><LimboView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'wheel' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎡" title="Wheel" sub="Колесо фортуни · 3 рівні ризику" />
            <ErrorBoundary><WheelView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'hilo' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎴" title="Hi-Lo" sub="Вище чи нижче · Множник ×∞" />
            <ErrorBoundary><HiloView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'tower' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🗼" title="Tower" sub="Піднімись на 9 поверхів · 4 рівні складності" />
            <ErrorBoundary><TowerView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'keno' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎯" title="Keno" sub="Обери до 10 · 10 з 40 випадкових · До ×800" />
            <ErrorBoundary><KenoView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'videopoker' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🂡" title="Video Poker" sub="Jacks or Better · Тримай · Тягни · Виграй" />
            <ErrorBoundary><VideoPokerView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'dragontiger' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🐉" title="Dragon Tiger" sub="Дракон проти Тигра · Нічия ×8" />
            <ErrorBoundary><DragonTigerView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
          </div>
        )}
        {sidebarTab === 'casino' && casinoView === 'scratch' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <GameHeader emoji="🎴" title="Scratch Card" sub="Білет на удачу · До ×50" />
            <ErrorBoundary><ScratchView wallet={wallet} onWalletUpdate={updateWallet} token={token} notify={notify} /></ErrorBoundary>
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
          <ProfileView
            user={user} wallet={wallet} tickets={tickets} notify={notify} onLogout={handleLogout}
            achievements={achievements}
            onGoDeposit={() => { setSidebarTab('casino'); setCasinoView('deposit'); }}
            onGoHistory={() => { setSidebarTab('casino'); setCasinoView('history'); }}
            onGoSupport={() => setShowSupport(true)}
          />
        )}

        {/* ADMIN TAB */}
        {sidebarTab === 'admin' && user && (user.role === 'admin' || user.role === 'operator') && (
          <AdminView token={token} userRole={user.role} notify={notify} />
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
      <ToastStack queue={toastQueue} remove={removeToast} />
    </div>
  );
}
