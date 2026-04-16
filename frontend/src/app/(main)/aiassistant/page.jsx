'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageSquare } from 'lucide-react';
import { createClient } from '@anam-ai/js-sdk';
import { AnamEvent } from '@anam-ai/js-sdk/dist/module/types';
import ProtectedRoute from '@/components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Constants ─────────────────────────────────────────────────────────────────
const EMOTIONS = [
  { id: 'neutral', label: 'Neutral', icon: '😐' },
  { id: 'content', label: 'Content', icon: '😊' },
  { id: 'calm', label: 'Calm', icon: '😌' },
  { id: 'sad', label: 'Sad', icon: '😢' },
  { id: 'angry', label: 'Angry', icon: '😠' },
  { id: 'scared', label: 'Scared', icon: '😨' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', label: 'Korean', flag: '🇰🇷' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
  { code: 'tr', label: 'Turkish', flag: '🇹🇷' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'ur', label: 'Urdu', flag: '🇵🇰' },
];

const ASSISTANT_ROLES = [
  { id: 'assistant', label: 'General Assistant', icon: '🤖', prompt: `You are a friendly, helpful AI assistant. Answer questions clearly and concisely. Add natural pauses using '...' Keep responses under 60 words unless asked for detail.` },
  { id: 'support', label: 'Customer Support', icon: '🎧', prompt: `You are a professional customer support agent. Listen carefully, empathize, and provide clear solutions. Be concise and always offer to escalate if needed.` },
  { id: 'tutor', label: 'Tutor', icon: '📚', prompt: `You are a patient and encouraging tutor. Break complex concepts into simple steps. Ask questions to check understanding. Be warm and supportive.` },
  { id: 'sales', label: 'Sales Rep', icon: '💼', prompt: `You are an enthusiastic but non-pushy sales representative. Understand customer needs first, then explain how the product helps. Be genuine and consultative.` },
  { id: 'therapist', label: 'Wellness Coach', icon: '🌿', prompt: `You are a calm and empathetic wellness coach. Listen actively, validate feelings, and offer constructive, uplifting guidance. Never diagnose or prescribe.` },
  { id: 'interviewer', label: 'Interviewer', icon: '📋', prompt: `You are a professional interviewer conducting a mock job interview. Ask structured questions, evaluate answers thoughtfully, and give constructive feedback.` },
  { id: 'custom', label: 'Custom', icon: '✏️', prompt: '' },
];

const LLM_OPTIONS = [
  { id: '0934d97d-0c3a-4f33-91b0-5e136a0ef466', label: 'GPT-4.1 Mini', desc: 'Fast & cost-effective' },
  { id: 'CUSTOMER_CLIENT_V1', label: 'Custom LLM', desc: 'Your own model' },
];

const FALLBACK_AVATARS = [{ id: '30fa96d0-26c4-4e55-94a0-517025942e18', name: 'Cara', variantName: 'studio', thumbnailUrl: '', videoUrl: '' }];
const FALLBACK_VOICES = [{ id: '6bfbe25a-979d-40f3-a92b-5394170af54b', name: 'Default', provider: 'CARTESIA', gender: 'female', country: '', description: '', sampleUrl: '' }];

// ── Normalisers (same as script studio) ───────────────────────────────────────
function normalizeAvatar(av) {
  return { id: av.id, name: av.name || av.displayName || 'Avatar', variantName: av.variantName || '', thumbnailUrl: av.thumbnailUrl || av.imageUrl || '', videoUrl: av.videoUrl || '' };
}
function normalizeVoice(v) {
  return { id: v.id, name: v.name || v.displayName || v.id, provider: (v.provider || 'cartesia').toUpperCase(), gender: (v.gender || '').toLowerCase(), country: v.country || '', description: v.description || '', sampleUrl: v.sampleUrl || v.previewSampleUrl || '', tags: v.tags || v.displayTags || [] };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function providerBadge(p = '') {
  const u = p.toUpperCase();
  if (u.includes('ELEVEN')) return 'bg-orange-900/50 text-orange-300';
  if (u.includes('CARTESIA')) return 'bg-blue-900/50 text-blue-300';
  return 'bg-gray-700 text-gray-400';
}

// ── Small UI ──────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, format, hint }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-xs font-semibold text-gray-400">{label}</label>
        <span className="text-xs font-mono text-[#00c8f5]">{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#00c8f5]" />
      {hint && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
    </div>
  );
}
function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-[#00c8f5]' : 'bg-gray-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
function Panel({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4 flex flex-col gap-3">{children}</div>}
    </div>
  );
}

// ── Session status dot ────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const cfg = {
    idle: { color: 'bg-gray-500', label: 'Idle' },
    connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Connecting' },
    loading: { color: 'bg-blue-500 animate-pulse', label: 'Loading avatar' },
    connected: { color: 'bg-green-500', label: 'Connected' },
    listening: { color: 'bg-green-400 animate-pulse', label: 'Listening' },
    speaking: { color: 'bg-[#00c8f5] animate-pulse', label: 'Speaking' },
    error: { color: 'bg-red-500', label: 'Error' },
    ended: { color: 'bg-gray-600', label: 'Session ended' },
  }[status] || { color: 'bg-gray-500', label: status };
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${cfg.color}`} />
      <span className="text-xs text-gray-400">{cfg.label}</span>
    </div>
  );
}

// ── Chat bubble ───────────────────────────────────────────────────────────────
function ChatBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${isUser ? 'bg-[#00c8f5]' : 'bg-gray-700'
        }`}>
        {isUser ? '👤' : '🤖'}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser
          ? 'bg-[#00c8f5] text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-100'
        }`}>
        {message.content}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function VirtualAssistantPageContent() {
  const router = useRouter();

  const anamClientRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const chatBottomRef = useRef(null);
  const sessionTimer = useRef(null);

  // Remote data
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sidebar tab
  const [sideTab, setSideTab] = useState('avatar'); // avatar | voice | persona | expression | language | advanced

  // Picker filters
  const [avatarSearch, setAvatarSearch] = useState('');
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceGender, setVoiceGender] = useState('all');
  const [voiceProvider, setVoiceProvider] = useState('all');
  const [langSearch, setLangSearch] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  // Config selections
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedLlm, setSelectedLlm] = useState(LLM_OPTIONS[0].id);
  const [selectedRole, setSelectedRole] = useState(ASSISTANT_ROLES[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [personaName, setPersonaName] = useState('Aria');
  const [skipGreeting, setSkipGreeting] = useState(false);
  const [maxSessionMins, setMaxSessionMins] = useState(30);

  // Voice generation options
  const [emotion, setEmotion] = useState('neutral');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.8);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(false);

  // Voice detection options
  const [endOfSpeechSens, setEndOfSpeechSens] = useState(0.5);
  const [speechEnhancement, setSpeechEnhancement] = useState(0.8);
  const [silenceSkipSecs, setSilenceSkipSecs] = useState(5);
  const [silenceEndSecs, setSilenceEndSecs] = useState(3);

  // Session state
  const [sessionStatus, setSessionStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(null);

  // Mic / audio device
  const [isMuted, setIsMuted] = useState(false);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  // Conversation
  const [messages, setMessages] = useState([]);
  const [liveCaption, setLiveCaption] = useState({ role: '', text: '' });
  const [textInput, setTextInput] = useState('');
  const [showChat, setShowChat] = useState(true);

  const isElevenLabs = selectedVoice?.provider?.includes('ELEVEN');
  const isActive = sessionStatus === 'connected' || sessionStatus === 'listening' || sessionStatus === 'speaking';
  const isBusy = sessionStatus === 'connecting' || sessionStatus === 'loading';
  const availableProviders = ['all', ...new Set(voices.map(v => v.provider).filter(Boolean))];

  // Filtered lists
  const filteredAvatars = avatars.filter(av =>
    `${av.name} ${av.variantName}`.toLowerCase().includes(avatarSearch.toLowerCase())
  );
  const filteredVoices = voices.filter(v => {
    const match = `${v.name} ${v.country} ${v.description}`.toLowerCase().includes(voiceSearch.toLowerCase());
    const gender = voiceGender === 'all' || v.gender === voiceGender;
    const prov = voiceProvider === 'all' || v.provider === voiceProvider;
    return match && gender && prov;
  });
  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [avRes, voRes] = await Promise.all([
          fetch(`${API_URL}/api/anam/avatars`),
          fetch(`${API_URL}/api/anam/voices`),
        ]);
        const [avData, voData] = await Promise.all([avRes.json(), voRes.json()]);

        let rawAv = [];
        if (avData.success) {
          const av = avData.avatars;
          rawAv = Array.isArray(av) ? av : (av?.data || []);
        }
        let rawVo = [];
        if (voData.success) {
          const vo = voData.voices;
          rawVo = Array.isArray(vo) ? vo : (vo?.data || []);
        }

        const avList = rawAv.length > 0 ? rawAv.map(normalizeAvatar) : FALLBACK_AVATARS;
        const voList = rawVo.length > 0 ? rawVo.map(normalizeVoice) : FALLBACK_VOICES;

        setAvatars(avList);
        setVoices(voList);
        setSelectedAvatar(avList[0]);
        setSelectedVoice(voList[0]);
      } catch (e) {
        console.error(e);
        setAvatars(FALLBACK_AVATARS); setSelectedAvatar(FALLBACK_AVATARS[0]);
        setVoices(FALLBACK_VOICES); setSelectedVoice(FALLBACK_VOICES[0]);
      } finally {
        setLoading(false);
      }

      // Load mic devices
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
      } catch (_) { }
    })();

    return () => {
      anamClientRef.current?.stopStreaming().catch(() => { });
      clearInterval(sessionTimer.current);
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, liveCaption]);

  // ── Voice preview ─────────────────────────────────────────────────────
  const playVoicePreview = useCallback((voice) => {
    if (!voice.sampleUrl) return;
    const audio = audioPreviewRef.current;
    if (!audio) return;
    if (playingVoiceId === voice.id) { audio.pause(); setPlayingVoiceId(null); return; }
    audio.src = voice.sampleUrl;
    audio.play().then(() => setPlayingVoiceId(voice.id)).catch(console.error);
    audio.onended = () => setPlayingVoiceId(null);
  }, [playingVoiceId]);

  // ── Build personaConfig ───────────────────────────────────────────────
  const buildPersonaConfig = useCallback(() => {
    const systemPrompt = selectedRole.id === 'custom'
      ? (customPrompt.trim() || 'You are a helpful assistant.')
      : selectedRole.prompt;

    const voiceGenerationOptions = isElevenLabs
      ? { speed: speechSpeed, stability, similarityBoost, style, useSpeakerBoost }
      : { speed: speechSpeed, volume, emotion };

    return {
      name: personaName,
      avatarId: selectedAvatar?.id,
      voiceId: selectedVoice?.id,
      llmId: selectedLlm,
      languageCode: selectedLang.code.split('-')[0],
      skipGreeting,
      maxSessionLengthSeconds: maxSessionMins * 60,
      systemPrompt,
      voiceGenerationOptions,
      voiceDetectionOptions: {
        endOfSpeechSensitivity: endOfSpeechSens,
        speechEnhancementLevel: speechEnhancement,
        silenceBeforeSkipTurnSeconds: silenceSkipSecs,
        silenceBeforeSessionEndSeconds: silenceEndSecs,
      },
    };
  }, [personaName, selectedAvatar, selectedVoice, selectedLlm, selectedLang,
    selectedRole, customPrompt, skipGreeting, maxSessionMins,
    emotion, speechSpeed, volume, stability, similarityBoost, style,
    useSpeakerBoost, endOfSpeechSens, speechEnhancement, silenceSkipSecs,
    silenceEndSecs, isElevenLabs]);

  // ── Start session ─────────────────────────────────────────────────────
  const startSession = useCallback(async () => {
    if (!selectedAvatar || !selectedVoice) return;
    setErrorMsg(''); setMessages([]); setLiveCaption({ role: '', text: '' });

    try {
      setSessionStatus('connecting');
      const res = await fetch(`${API_URL}/api/anam/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPersonaConfig()),
      });
      const data = await res.json();
      if (!data.success || !data.sessionToken) throw new Error(data.error || 'No session token');

      const client = createClient(data.sessionToken, {
        disableInputAudio: false,
        ...(selectedDevice && { audioDeviceId: selectedDevice }),
      });
      anamClientRef.current = client;

      // ── Events ──
      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => {
        setSessionStatus('loading');
      });

      client.addListener(AnamEvent.SESSION_READY, () => {
        setSessionStatus('connected');
        setSessionStarted(Date.now());
        // Session elapsed timer
        sessionTimer.current = setInterval(() => {
          setSessionElapsed(Date.now() - Date.now()); // will be recalculated below
        }, 1000);
        // Better elapsed tracking
        const start = Date.now();
        clearInterval(sessionTimer.current);
        sessionTimer.current = setInterval(() => setSessionElapsed(Date.now() - start), 1000);
      });

      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        clearInterval(sessionTimer.current);
        setSessionStatus('ended');
        setIsMuted(false);
        anamClientRef.current = null;
      });

      // Live speech captions — distinguish listening vs speaking
      client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (e) => {
        if (e.role === 'persona') {
          setSessionStatus('speaking');
          setLiveCaption({ role: 'persona', text: e.content });
        } else {
          setSessionStatus('listening');
          setLiveCaption({ role: 'user', text: e.content });
        }
      });

      // Full message history (after each turn completes)
      client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (msgs) => {
        setMessages(msgs.map(m => ({ role: m.role, content: m.content })));
        setLiveCaption({ role: '', text: '' });
        setSessionStatus('connected');
      });

      await client.streamToVideoElement('assistant-video');

    } catch (err) {
      console.error(err);
      setSessionStatus('error');
      setErrorMsg(err.message || 'Failed to connect');
      clearInterval(sessionTimer.current);
    }
  }, [selectedAvatar, selectedVoice, buildPersonaConfig, selectedDevice]);

  // ── Stop session ──────────────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    clearInterval(sessionTimer.current);
    try { await anamClientRef.current?.stopStreaming(); } catch (_) { }
    anamClientRef.current = null;
    setSessionStatus('ended');
    setIsMuted(false);
    setLiveCaption({ role: '', text: '' });
  }, []);

  // ── Mute / unmute ─────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const c = anamClientRef.current;
    if (!c) return;
    if (isMuted) { c.unmuteInputAudio(); setIsMuted(false); }
    else { c.muteInputAudio(); setIsMuted(true); }
  }, [isMuted]);

  // ── Change mic device mid-session ─────────────────────────────────────
  const changeMicDevice = useCallback(async (deviceId) => {
    setSelectedDevice(deviceId);
    if (isActive && anamClientRef.current) {
      try { await anamClientRef.current.changeAudioInputDevice(deviceId); } catch (e) { console.error(e); }
    }
  }, [isActive]);

  // ── Interrupt persona ─────────────────────────────────────────────────
  const interruptPersona = useCallback(() => {
    anamClientRef.current?.interruptPersona?.();
  }, []);

  // ── Send text message ─────────────────────────────────────────────────
  const sendTextMessage = useCallback(() => {
    const text = textInput.trim();
    if (!text || !isActive || !anamClientRef.current) return;
    try {
      anamClientRef.current.sendUserMessage(text);
      // Manually add to transcript (sendUserMessage doesn't trigger events)
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setTextInput('');
    } catch (e) { console.error(e); }
  }, [textInput, isActive]);

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(); }
  };

  const SIDE_TABS = [
    { id: 'avatar', label: '👤', title: 'Avatar' },
    { id: 'voice', label: '🔊', title: 'Voice' },
    { id: 'persona', label: '🎭', title: 'Persona' },
    { id: 'expression', label: '✨', title: 'Expression' },
    { id: 'language', label: '🌍', title: 'Language' },
    { id: 'advanced', label: '⚙️', title: 'Advanced' },
  ];

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-white text-gray-900 flex flex-col overflow-hidden">
      <audio ref={audioPreviewRef} className="hidden" />

      {/* ── Top bar ── */}
      <div className="border-b border-gray-100 px-5 py-2.5 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00c8f5] to-purple-600 flex items-center justify-center text-sm font-bold">A</div>
          <div>
            <p className="font-bold text-sm leading-none">Virtual Assistant</p>
            <p className="text-xs text-gray-500 mt-0.5">Anam AI · Real-time</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusDot status={sessionStatus} />
          {isActive && (
            <span className="text-xs font-mono text-gray-500">{formatTime(sessionElapsed)}</span>
          )}
          {/* Chat toggle */}
          <button onClick={() => setShowChat(s => !s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showChat ? 'bg-[#00c8f5] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
            💬 Chat
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left config sidebar — icon tabs ── */}
        <div className="flex shrink-0">
          {/* Icon rail */}
          <div className="w-12 border-r border-gray-100 flex flex-col items-center py-3 gap-1 bg-gray-50">
            {SIDE_TABS.map(t => (
              <button key={t.id} onClick={() => setSideTab(t.id)}
                title={t.title}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${sideTab === t.id ? 'bg-[#00c8f5] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isActive}>
                {t.label}
              </button>
            ))}
            <div className="flex-1" />
            <Link href="/feedback" title="Feedback" className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-[#00c8f5] hover:bg-white transition-all mb-3">
              <MessageSquare size={20} />
            </Link>
          </div>
          
          {/* Expanded panel */}
          <div className="w-72 border-r border-gray-100 bg-white flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 shrink-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {SIDE_TABS.find(t => t.id === sideTab)?.title}
              </p>
              {isActive && <p className="text-xs text-yellow-600 mt-0.5">End session to reconfigure</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">

              {/* ── AVATAR ── */}
              {sideTab === 'avatar' && (
                <>
                  <input value={personaName} onChange={e => setPersonaName(e.target.value)}
                    placeholder="Assistant name..."
                    className="w-full bg-gray-50 text-gray-900 text-sm rounded-xl px-3 py-2.5 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />
                  <input value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)}
                    placeholder="Search avatars..."
                    className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />
                  {loading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />)}
                    </div>
                  ) : filteredAvatars.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-6">No avatars match</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 pr-0.5">
                      {filteredAvatars.map(av => (
                        <button key={av.id} onClick={() => !isActive && setSelectedAvatar(av)}
                          disabled={isActive}
                          className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${selectedAvatar?.id === av.id ? 'border-[#00c8f5] shadow-lg shadow-[#00c8f5]/20' : 'border-gray-100 hover:border-gray-200'
                            } ${isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          {av.thumbnailUrl
                            ? <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                            : <div className="w-full h-full bg-gray-50 flex items-center justify-center text-2xl text-gray-300">👤</div>}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1 py-1">
                            <p className="text-white text-[9px] font-semibold truncate text-center">{av.name}</p>
                          </div>
                          {selectedAvatar?.id === av.id && (
                            <div className="absolute top-1 right-1 w-4 h-4 bg-[#00c8f5] rounded-full flex items-center justify-center border border-white">
                              <span className="text-white text-[8px]">✓</span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-600">{filteredAvatars.length} of {avatars.length} avatars</p>
                </>
              )}

              {/* ── VOICE ── */}
              {sideTab === 'voice' && (
                <>
                  <input value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)}
                    placeholder="Search by name, country..."
                    className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />

                  <div className="flex gap-2">
                    <div className="flex rounded-xl border border-gray-800 overflow-hidden shrink-0">
                      {[['all', '👥'], ['female', '👩'], ['male', '👨']].map(([g, icon]) => (
                        <button key={g} onClick={() => setVoiceGender(g)}
                          className={`px-2.5 py-1.5 text-xs transition-colors ${voiceGender === g ? 'bg-[#00c8f5] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{icon}</button>
                      ))}
                    </div>
                    <div className="flex rounded-xl border border-gray-800 overflow-hidden flex-1">
                      {availableProviders.slice(0, 3).map(p => (
                        <button key={p} onClick={() => setVoiceProvider(p)}
                          className={`flex-1 py-1.5 text-xs transition-colors capitalize ${voiceProvider === p ? 'bg-[#00c8f5] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {p === 'all' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-0.5">
                    {filteredVoices.length === 0
                      ? <p className="text-xs text-gray-600 text-center py-6">No voices match</p>
                      : filteredVoices.map(v => (
                        <div key={v.id} onClick={() => !isActive && setSelectedVoice(v)}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${selectedVoice?.id === v.id ? 'border-[#00c8f5] bg-[#00c8f5] text-white' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-800'
                            } ${isActive ? 'cursor-not-allowed opacity-60' : ''}`}>
                          <span className="text-base shrink-0">{v.gender === 'female' ? '👩' : v.gender === 'male' ? '👨' : '🎙️'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{v.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {v.country && <span className="text-xs text-gray-600">{v.country}</span>}
                              {v.provider && <span className={`text-xs px-1.5 py-0.5 rounded-full ${providerBadge(v.provider)}`}>{v.provider}</span>}
                            </div>
                          </div>
                          {v.sampleUrl && (
                            <button onClick={e => { e.stopPropagation(); playVoicePreview(v); }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${playingVoiceId === v.id ? 'bg-[#00c8f5] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-500'}`}>
                              {playingVoiceId === v.id ? '⏹' : '▶'}
                            </button>
                          )}
                          {selectedVoice?.id === v.id && <span className="text-[#00c8f5] text-xs shrink-0">✓</span>}
                        </div>
                      ))
                    }
                  </div>
                  <p className="text-xs text-gray-600">{filteredVoices.length} of {voices.length} voices</p>

                  {/* LLM */}
                  <div className="border-t border-gray-800 pt-3">
                    <p className="text-xs text-gray-500 font-semibold mb-2">AI Brain</p>
                    {LLM_OPTIONS.map(l => (
                      <button key={l.id} onClick={() => !isActive && setSelectedLlm(l.id)}
                        disabled={isActive}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border mb-1.5 transition-all ${selectedLlm === l.id ? 'border-[#00c8f5] bg-[#00c8f5] text-white' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 text-gray-800'
                          } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <p className="text-xs font-medium">{l.label}</p>
                        <p className={`text-xs ${selectedLlm === l.id ? 'text-white/80' : 'text-gray-500'}`}>{l.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Live mic device switcher */}
                  {audioDevices.length > 1 && (
                    <div className="border-t border-gray-800 pt-3">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Microphone</p>
                      <select value={selectedDevice} onChange={e => changeMicDevice(e.target.value)}
                        className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none">
                        <option value="">Default microphone</option>
                        {audioDevices.map(d => (
                          <option key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 8)}`}</option>
                        ))}
                      </select>
                      {isActive && <p className="text-xs text-green-600 mt-1">✓ Can switch during session</p>}
                    </div>
                  )}
                </>
              )}

              {/* ── PERSONA ── */}
              {sideTab === 'persona' && (
                <>
                  <p className="text-xs text-gray-500">Choose a role that defines how the assistant behaves and responds.</p>
                  {ASSISTANT_ROLES.map(role => (
                    <button key={role.id} onClick={() => !isActive && setSelectedRole(role)}
                      disabled={isActive}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${selectedRole.id === role.id ? 'border-[#00c8f5] bg-[#00c8f5]' : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                        } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{role.icon}</span>
                        <p className="text-sm font-semibold">{role.label}</p>
                      </div>
                      {role.id !== 'custom' && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.prompt}</p>
                      )}
                    </button>
                  ))}
                  {selectedRole.id === 'custom' && (
                      <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                      disabled={isActive}
                      placeholder="Write your custom system prompt here..."
                      rows={6}
                      className="w-full bg-gray-50 text-gray-800 text-xs rounded-xl px-3 py-3 resize-none border border-gray-100 focus:border-[#00c8f5] focus:outline-none disabled:opacity-40" />
                  )}
                </>
              )}

              {/* ── EXPRESSION ── */}
              {sideTab === 'expression' && (
                <>
                  {/* Emotion */}
                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2">
                      Emotion
                      <span className="text-gray-600 font-normal ml-1">
                        {isElevenLabs ? '(not available for ElevenLabs)' : '(Cartesia)'}
                      </span>
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {EMOTIONS.map(e => (
                        <button key={e.id} onClick={() => !isElevenLabs && !isActive && setEmotion(e.id)}
                          disabled={isElevenLabs || isActive}
                          className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-all ${emotion === e.id && !isElevenLabs ? 'border-[#00c8f5] bg-[#00c8f5] text-white' : 'border-gray-800 bg-gray-800/50 text-gray-400'
                            } ${isElevenLabs || isActive ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-600'}`}>
                          <span className="text-xl mb-0.5">{e.icon}</span>{e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Slider label="Speech Speed" value={speechSpeed}
                    min={isElevenLabs ? 0.7 : 0.6} max={isElevenLabs ? 1.2 : 1.5} step={0.05}
                    onChange={v => !isActive && setSpeechSpeed(v)}
                    format={v => `${v.toFixed(2)}×`}
                    hint={isElevenLabs ? '0.7–1.2× (ElevenLabs)' : '0.6–1.5× (Cartesia)'} />

                  {!isElevenLabs && (
                    <Slider label="Volume" value={volume} min={0.5} max={2.0} step={0.05}
                      onChange={v => !isActive && setVolume(v)}
                      format={v => `${v.toFixed(2)}×`} hint="0.5–2.0×" />
                  )}

                  {isElevenLabs && (<>
                    <Slider label="Stability" value={stability} min={0} max={1} step={0.05}
                      onChange={v => !isActive && setStability(v)} format={v => v.toFixed(2)}
                      hint="Lower = more variation" />
                    <Slider label="Similarity Boost" value={similarityBoost} min={0} max={1} step={0.05}
                      onChange={v => !isActive && setSimilarityBoost(v)} format={v => v.toFixed(2)} />
                    <Slider label="Style" value={style} min={0} max={1} step={0.05}
                      onChange={v => !isActive && setStyle(v)} format={v => v.toFixed(2)}
                      hint="May increase latency" />
                    <Toggle label="Speaker Boost" desc="v2 only"
                      value={useSpeakerBoost} onChange={v => !isActive && setUseSpeakerBoost(v)} />
                  </>)}

                  <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
                    <p className="text-xs font-semibold text-gray-400">Voice Detection</p>
                    <Slider label="End-of-Speech Sensitivity" value={endOfSpeechSens}
                      min={0} max={1} step={0.05} onChange={v => !isActive && setEndOfSpeechSens(v)}
                      format={v => v.toFixed(2)} hint="Higher = faster response" />
                    <Slider label="Speech Enhancement" value={speechEnhancement}
                      min={0} max={1} step={0.05} onChange={v => !isActive && setSpeechEnhancement(v)}
                      format={v => v.toFixed(2)} hint="Noise reduction" />
                    <Slider label="Silence Before Skip (s)" value={silenceSkipSecs}
                      min={1} max={15} step={1} onChange={v => !isActive && setSilenceSkipSecs(v)}
                      format={v => `${v}s`} hint="Seconds of silence before avatar prompts user" />
                    <Slider label="Silence Before End (s)" value={silenceEndSecs}
                      min={1} max={10} step={1} onChange={v => !isActive && setSilenceEndSecs(v)}
                      format={v => `${v}s`} hint="Seconds of silence before session ends" />
                  </div>
                </>
              )}

              {/* ── LANGUAGE ── */}
              {sideTab === 'language' && (
                <>
                  <p className="text-xs text-gray-500">Controls both speech recognition and the language the assistant speaks in.</p>
                  <input value={langSearch} onChange={e => setLangSearch(e.target.value)}
                    placeholder="Search language..."
                    className="w-full bg-gray-800 text-white text-xs rounded-xl px-3 py-2 border border-gray-800 focus:border-[#00c8f5] focus:outline-none" />
                  <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-0.5">
                    {filteredLangs.map(lang => (
                      <button key={lang.code} onClick={() => !isActive && setSelectedLang(lang)}
                        disabled={isActive}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${selectedLang.code === lang.code ? 'border-[#00c8f5] bg-[#00c8f5]' : 'border-gray-800 bg-gray-800/50 hover:border-gray-700'
                          } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="text-xl">{lang.flag}</span>
                        <p className="text-xs font-medium flex-1 text-left">{lang.label}</p>
                        {selectedLang.code === lang.code && <span className="text-[#00c8f5] text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* ── ADVANCED ── */}
              {sideTab === 'advanced' && (
                <>
                  <Toggle label="Skip Greeting" desc="Avatar starts without an opening message"
                    value={skipGreeting} onChange={v => !isActive && setSkipGreeting(v)} />

                  <div>
                    <p className="text-xs text-gray-400 font-semibold mb-2">Max Session Length</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[5, 10, 20, 30].map(m => (
                        <button key={m} onClick={() => !isActive && setMaxSessionMins(m)}
                          disabled={isActive}
                          className={`py-2 rounded-xl border text-xs font-semibold transition-all ${maxSessionMins === m ? 'border-[#00c8f5] bg-[#00c8f5] text-white' : 'border-gray-800 bg-gray-800 text-gray-400 hover:border-gray-600'
                            } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {m}m
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-1.5">Session auto-ends after {maxSessionMins} minutes</p>
                  </div>

                  {/* Config summary */}
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <p className="text-xs font-semibold text-gray-400 mb-2">Current Config</p>
                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                      <span>Name: <span className="text-gray-800">{personaName}</span></span>
                      <span>Avatar: <span className="text-gray-800">{selectedAvatar?.name}{selectedAvatar?.variantName ? ` (${selectedAvatar.variantName})` : ''}</span></span>
                      <span>Voice: <span className="text-gray-800">{selectedVoice?.name}</span></span>
                      <span>Provider: <span className="text-gray-800">{selectedVoice?.provider}</span></span>
                      <span>Role: <span className="text-gray-800">{selectedRole.label}</span></span>
                      <span>Language: <span className="text-gray-800">{selectedLang.flag} {selectedLang.label}</span></span>
                      <span>Emotion: <span className="text-gray-800">{isElevenLabs ? 'N/A' : emotion}</span></span>
                      <span>Speed: <span className="text-gray-800">{speechSpeed.toFixed(2)}×</span></span>
                      <span>Max session: <span className="text-gray-800">{maxSessionMins}m</span></span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Centre: Video ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Video */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center overflow-hidden min-h-0 border-x border-gray-100">
            <video id="assistant-video" autoPlay playsInline className="w-full h-full object-cover" />

            {/* Idle overlay */}
            {(sessionStatus === 'idle' || sessionStatus === 'ended') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95">
                {selectedAvatar?.thumbnailUrl ? (
                  <img src={selectedAvatar.thumbnailUrl} alt=""
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 mb-4"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center text-6xl mb-4">👤</div>
                )}
                <p className="text-xl font-bold text-gray-900">{personaName}</p>
                <p className="text-gray-500 text-sm mt-1">{selectedRole.label}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                  <span>{selectedLang.flag} {selectedLang.label}</span>
                  <span>·</span>
                  <span>{selectedVoice?.name || '—'}</span>
                  {!isElevenLabs && <><span>·</span><span>{EMOTIONS.find(e => e.id === emotion)?.icon} {emotion}</span></>}
                </div>
                {sessionStatus === 'ended' && (
                  <p className="text-yellow-600 text-xs mt-3">Session ended</p>
                )}
              </div>
            )}

            {/* Connecting / loading */}
            {isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <div className="w-14 h-14 border-4 border-[#00c8f5] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-300">
                  {sessionStatus === 'connecting' ? 'Connecting...' : 'Initialising avatar...'}
                </p>
              </div>
            )}

            {/* Error */}
            {sessionStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-8">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-400 font-semibold text-lg">Connection failed</p>
                <p className="text-gray-400 text-sm text-center mt-2">{errorMsg}</p>
              </div>
            )}

            {/* Live caption */}
            {isActive && liveCaption.text && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-xl shadow-black/5 animate-in slide-in-from-bottom-4">
                <p className={`text-sm text-center leading-relaxed font-medium ${liveCaption.role === 'user' ? 'text-[#00c8f5]' : 'text-gray-800'}`}>
                  <span className="opacity-40">{liveCaption.role === 'user' ? 'You: ' : `${personaName}: `}</span>
                  {liveCaption.text}
                </p>
              </div>
            )}

            {/* Status badges */}
            {isActive && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-green-50/90 backdrop-blur border border-green-100 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-700 text-xs font-bold">LIVE</span>
                </div>
                {sessionStatus === 'listening' && (
                  <div className="flex items-center gap-1.5 bg-blue-50/90 backdrop-blur border border-blue-100 px-3 py-1.5 rounded-full animate-in zoom-in">
                    <span className="text-blue-700 text-xs font-bold">🎤 Listening</span>
                  </div>
                )}
                {sessionStatus === 'speaking' && (
                  <div className="flex items-center gap-1.5 bg-cyan-50/90 backdrop-blur border border-cyan-100 px-3 py-1.5 rounded-full animate-in zoom-in">
                    <span className="text-cyan-700 text-xs font-bold">🔊 Speaking</span>
                  </div>
                )}
              </div>
            )}

            {/* Session timer badge */}
            {isActive && (
              <div className="absolute top-4 right-4 bg-white/60 backdrop-blur border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                <span className="text-xs font-mono text-gray-500">{formatTime(sessionElapsed)}</span>
              </div>
            )}
          </div>

          {/* ── Control bar ── */}
          <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-3 bg-white shrink-0">
            {/* Start / stop */}
            {!isActive && !isBusy ? (
              <button onClick={startSession}
                disabled={!selectedAvatar || !selectedVoice || isBusy}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00c8f5] hover:bg-[#00c8f5] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition-colors">
                ▶ Start Session
              </button>
            ) : isBusy ? (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-500 font-medium">
                <span className="w-3 h-3 border-2 border-[#00c8f5] border-t-transparent rounded-full animate-spin" />
                Connecting...
              </div>
            ) : (
              <button onClick={stopSession}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-700 hover:bg-red-600 rounded-xl font-semibold text-sm transition-colors">
                ⏹ End Session
              </button>
            )}

            {/* Mute */}
            {isActive && (
              <button onClick={toggleMute}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isMuted ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                {isMuted ? '🔇 Unmute' : '🎙️ Mute'}
              </button>
            )}

            {/* Interrupt */}
            {sessionStatus === 'speaking' && (
              <button onClick={interruptPersona}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-xl text-sm font-semibold transition-colors">
                ✋ Interrupt
              </button>
            )}

            {/* Retry */}
            {(sessionStatus === 'error' || sessionStatus === 'ended') && (
              <button onClick={startSession}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl text-sm transition-colors">
                🔄 Restart
              </button>
            )}

            {/* Text input — only when active */}
            {isActive && (
              <div className="flex-1 flex gap-2">
                <input value={textInput} onChange={e => setTextInput(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  placeholder="Type a message (or speak)..."
                  className="flex-1 bg-gray-800 text-white text-sm rounded-xl px-4 py-2.5 border border-gray-700 focus:border-[#00c8f5] focus:outline-none" />
                <button onClick={sendTextMessage} disabled={!textInput.trim()}
                  className="px-4 py-2.5 bg-[#00c8f5] hover:bg-[#00c8f5] disabled:opacity-40 rounded-xl text-sm font-semibold transition-colors">
                  Send
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Chat history ── */}
        {showChat && (
          <div className="w-72 border-l border-gray-100 flex flex-col bg-white shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conversation</p>
                <p className="text-xs text-gray-400 mt-0.5">{messages.length} messages</p>
              </div>
              {messages.length > 0 && (
                <button onClick={() => setMessages([])}
                  className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                  Clear
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 py-12">
                  <div className="text-4xl mb-3 opactiy-20">💬</div>
                  <p className="text-xs font-medium">No messages yet</p>
                  <p className="text-xs mt-1">
                    {isActive ? 'Start speaking or type a message' : 'Start a session to chat'}
                  </p>
                </div>
              ) : (
                messages.map((m, i) => <ChatBubble key={i} message={m} />)
              )}

              {/* Live in-progress caption at bottom of chat */}
              {isActive && liveCaption.text && (
                <div className={`flex gap-2 ${liveCaption.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 opacity-60 ${liveCaption.role === 'user' ? 'bg-[#00c8f5]' : 'bg-gray-700'}`}>
                    {liveCaption.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed opacity-70 italic ${liveCaption.role === 'user' ? 'bg-[#00c8f5] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm border border-gray-100'
                    }`}>
                    {liveCaption.text}
                    <span className="inline-block w-1 h-3 bg-current ml-1 animate-pulse" />
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick send in chat panel */}
            {isActive && (
              <div className="p-3 border-t border-gray-100 shrink-0">
                <div className="flex gap-2">
                  <input value={textInput} onChange={e => setTextInput(e.target.value)}
                    onKeyDown={handleTextKeyDown}
                    placeholder="Message..."
                    className="flex-1 bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />
                  <button onClick={sendTextMessage} disabled={!textInput.trim()}
                    className="px-3 py-2 bg-[#00c8f5] hover:bg-[#00c8f5] disabled:opacity-40 rounded-xl text-xs font-bold transition-colors">
                    ↑
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VirtualAssistantPage() {
  return (
    <ProtectedRoute>
      <VirtualAssistantPageContent />
    </ProtectedRoute>
  );
}