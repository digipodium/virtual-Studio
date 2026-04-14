'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@anam-ai/js-sdk';
import { AnamEvent } from '@anam-ai/js-sdk/dist/module/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Constants ─────────────────────────────────────────────────────────────────
const ASPECT_RATIOS = [
  { id: '16/9', label: '16:9', desc: 'YouTube', icon: '🖥️' },
  { id: '9/16', label: '9:16', desc: 'Reels / TikTok', icon: '📱' },
  { id: '1/1', label: '1:1', desc: 'Square', icon: '⬛' },
  { id: '4/3', label: '4:3', desc: 'Classic', icon: '📺' },
];

const BACKGROUNDS = [
  { id: 'dark', label: 'Studio Dark', class: 'bg-gray-950' },
  { id: 'light', label: 'Studio Light', class: 'bg-gray-100' },
  { id: 'blue', label: 'Corporate Blue', class: 'bg-blue-950' },
  { id: 'gradient', label: 'Gradient', class: 'bg-gradient-to-br from-[#00c8f5] to-blue-950' },
  { id: 'green', label: 'Green Screen', class: 'bg-green-600' },
];

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
  { code: 'en-AU', label: 'English (AU)', flag: '🇦🇺' },
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
  { code: 'pl', label: 'Polish', flag: '🇵🇱' },
  { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
  { code: 'ur', label: 'Urdu', flag: '🇵🇰' },
];

const SCRIPT_TEMPLATES = {
  youtube: { label: '▶️ YouTube Intro', text: `Hey everyone, welcome back to the channel! I'm so excited to share today's topic with you.\n\nIn this video, we're going to dive deep into something that's been on my mind for a while.\n\nMake sure you stick around until the end — I have a really valuable tip that most people overlook.\n\nLet's get into it!` },
  reel: { label: '📱 Reel Hook', text: `Wait — before you scroll past, you need to hear this.\n\nMost people are doing this completely wrong, and it's costing them time and money every single day.\n\nHere's the one thing that changed everything for me...\n\nFollow for more tips like this!` },
  podcast: { label: '🎙️ Podcast Intro', text: `Welcome back to the show! Today we have an incredible episode lined up for you.\n\nWe're tackling a topic that our community has been asking about for months.\n\nSo grab your coffee, get comfortable, and let's dive in.` },
  product: { label: '🛍️ Product Promo', text: `Introducing something we've been working on for a long time.\n\nThis isn't just another product — it's a solution to a problem millions of people face every day.\n\nAvailable now. Link in the description.` },
  explainer: { label: '📚 Explainer', text: `Let me explain this as simply as possible.\n\nThere are three things you need to understand about this topic.\n\nOnce you understand these three pillars, everything else starts to make sense.` },
};

const LLM_OPTIONS = [
  { id: '0934d97d-0c3a-4f33-91b0-5e136a0ef466', label: 'GPT-4.1 Mini' },
  { id: 'CUSTOMER_CLIENT_V1', label: 'Custom / Echo' },
];

const FALLBACK_AVATARS = [
  { id: '30fa96d0-26c4-4e55-94a0-517025942e18', name: 'Cara', variantName: 'studio', thumbnailUrl: '', videoUrl: '' },
];
const FALLBACK_VOICES = [
  { id: '6bfbe25a-979d-40f3-a92b-5394170af54b', name: 'Default', provider: 'cartesia', gender: 'female', country: '', description: '', sampleUrl: '' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function wordCount(text) { return text.trim() ? text.trim().split(/\s+/).length : 0; }
function estimateDuration(text, speed = 1.0) {
  const s = Math.ceil((wordCount(text) / 130) * 60 * (1 / speed));
  return `~${Math.floor(s / 60) > 0 ? `${Math.floor(s / 60)}m ` : ''}${s % 60}s`;
}

// ── Normalize raw API data (handles both normalized backend AND raw passthrough) ──
// Avatar fields from API: id, displayName, variantName, imageUrl, videoUrl
function normalizeAvatar(av) {
  return {
    id: av.id,
    // backend may have already mapped displayName→name, or not
    name: av.name || av.displayName || 'Avatar',
    variantName: av.variantName || '',
    // backend may have already mapped imageUrl→thumbnailUrl, or not
    thumbnailUrl: av.thumbnailUrl || av.imageUrl || '',
    videoUrl: av.videoUrl || '',
  };
}

// Voice fields from API: id, displayName, provider, gender(uppercase), country,
//   description, sampleUrl, previewSampleUrl, displayTags, providerModelId
function normalizeVoice(v) {
  return {
    id: v.id,
    name: v.name || v.displayName || v.id,
    // provider from API is uppercase e.g. "ELEVENLABS" — normalize for display & detection
    provider: (v.provider || 'cartesia').toUpperCase(),
    // gender from API is uppercase "MALE"/"FEMALE" — lowercase for comparison
    gender: (v.gender || '').toLowerCase(),
    country: v.country || '',
    description: v.description || '',
    // API returns both sampleUrl and previewSampleUrl — use whichever exists
    sampleUrl: v.sampleUrl || v.previewSampleUrl || '',
    tags: v.tags || v.displayTags || [],
  };
}

// ── UI primitives ─────────────────────────────────────────────────────────────
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
    <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl border border-gray-700">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${value ? 'bg-[#00c8f5]' : 'bg-gray-600'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4 flex flex-col gap-3 bg-white">{children}</div>}
    </div>
  );
}

function Steps({ current }) {
  return (
    <div className="flex items-center">
      {['Configure', 'Script', 'Record'].map((label, i) => (
        <div key={i} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${i === current ? 'bg-[#00c8f5] text-white' :
            i < current ? 'text-green-400' : 'text-gray-600'
            }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${i === current ? 'border-white bg-white text-[#00c8f5]' :
              i < current ? 'border-green-400 bg-green-400 text-gray-900' :
                'border-gray-600 text-gray-600'
              }`}>{i < current ? '✓' : i + 1}</div>
            <span className="hidden sm:block">{label}</span>
          </div>
          {i < 2 && <div className={`w-6 h-px mx-0.5 ${i < current ? 'bg-green-400' : 'bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  );
}

function RecPill({ status, elapsed }) {
  const cfg = {
    connecting: { bg: 'bg-yellow-600', dot: 'bg-yellow-200 animate-pulse', label: 'Connecting...' },
    loading: { bg: 'bg-blue-600', dot: 'bg-blue-200 animate-pulse', label: 'Starting avatar...' },
    speaking: { bg: 'bg-red-600', dot: 'bg-red-200 animate-ping', label: `REC ${formatTime(elapsed)}` },
    done: { bg: 'bg-green-600', dot: 'bg-green-200', label: 'Complete!' },
    error: { bg: 'bg-red-900', dot: 'bg-red-300', label: 'Error' },
  }[status];
  if (!cfg) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${cfg.bg}`}>
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span className="text-white text-xs font-bold">{cfg.label}</span>
    </div>
  );
}

// ── Provider badge color ──────────────────────────────────────────────────────
function providerBadgeClass(provider = '') {
  const p = provider.toUpperCase();
  if (p.includes('ELEVEN')) return 'bg-orange-100 text-orange-600';
  if (p.includes('CARTESIA')) return 'bg-blue-100 text-blue-600';
  return 'bg-gray-100 text-gray-400';
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ScriptStudioPage() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/login');
    }
  }, [router]);

  const anamClientRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const recStartRef = useRef(null);
  const timerRef = useRef(null);
  const speechDoneTimer = useRef(null);
  const audioPreviewRef = useRef(null);

  // Remote data — stored already normalized
  const [avatars, setAvatars] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Picker search/filter state
  const [avatarSearch, setAvatarSearch] = useState('');
  const [voiceSearch, setVoiceSearch] = useState('');
  const [voiceGender, setVoiceGender] = useState('all');
  const [voiceProvider, setVoiceProvider] = useState('all'); // all | CARTESIA | ELEVENLABS
  const [langSearch, setLangSearch] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);

  // Selections
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedLlm, setSelectedLlm] = useState(LLM_OPTIONS[0].id);
  const [personaName, setPersonaName] = useState('Presenter');

  // Expression & tuning
  const [emotion, setEmotion] = useState('neutral');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.8);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(false);
  const [endOfSpeechSens, setEndOfSpeechSens] = useState(0.5);
  const [speechEnhancement, setSpeechEnhancement] = useState(0.8);

  // Language
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  // Format
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [disableMic, setDisableMic] = useState(true);
  const [skipGreeting, setSkipGreeting] = useState(true);

  // Script
  const [script, setScript] = useState('');
  const [scriptTitle, setScriptTitle] = useState('');

  // Session/recording
  const [step, setStep] = useState(0);
  const [recStatus, setRecStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [captionText, setCaptionText] = useState('');

  // Output
  const [outputBlob, setOutputBlob] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [outputDuration, setOutputDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Derived
  const isElevenLabs = selectedVoice?.provider?.toUpperCase().includes('ELEVEN');
  const isBusy = ['connecting', 'loading', 'speaking'].includes(recStatus);
  const canGenerate = script.trim().length > 0 && !!selectedAvatar && !!selectedVoice && !isBusy;

  // Available provider options for filter (derived from loaded voices)
  const availableProviders = ['all', ...new Set(voices.map(v => v.provider).filter(Boolean))];

  // Filtered lists
  const filteredAvatars = avatars.filter(av =>
    `${av.name} ${av.variantName}`.toLowerCase().includes(avatarSearch.toLowerCase())
  );

  const filteredVoices = voices.filter(v => {
    const matchSearch = `${v.name} ${v.country} ${v.description}`.toLowerCase().includes(voiceSearch.toLowerCase());
    const matchGender = voiceGender === 'all' || v.gender === voiceGender;
    const matchProvider = voiceProvider === 'all' || v.provider.toUpperCase() === voiceProvider.toUpperCase();
    return matchSearch && matchGender && matchProvider;
  });

  const filteredLangs = LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_URL}/api/anam/avatars/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to upload avatar');

      // Add new avatar to list and select it
      const newAvatar = {
        id: data.avatar.id,
        name: data.avatar.name || 'My Avatar',
        thumbnailUrl: data.avatar.thumbnailUrl || URL.createObjectURL(file), // use preview if thumb not yet ready
        variantName: 'One-Shot',
      };

      setAvatars(prev => [newAvatar, ...prev]);
      setSelectedAvatar(newAvatar);
      setPersonaName(newAvatar.name);

    } catch (err) {
      console.error('Avatar upload error:', err);
      setErrorMsg(`Avatar upload failed: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [avRes, voRes] = await Promise.all([
          fetch(`${API_URL}/api/anam/avatars`),
          fetch(`${API_URL}/api/anam/voices`),
        ]);
        const [avData, voData] = await Promise.all([avRes.json(), voRes.json()]);

        // ── Avatars ──
        // Backend sends: { success: true, avatars: [...] }
        // Each avatar already normalized by Express: { id, name, variantName, thumbnailUrl, videoUrl }
        // But guard against backend sending raw { data: [...] } passthrough
        let rawAvatars = [];
        if (avData.success) {
          const av = avData.avatars;
          if (Array.isArray(av)) {
            // ✅ Correctly normalized by backend
            rawAvatars = av;
          } else if (av?.data && Array.isArray(av.data)) {
            // Backend accidentally passed through { data: [...], meta: {} }
            rawAvatars = av.data;
          }
        }
        const normalizedAvatars = rawAvatars.length > 0
          ? rawAvatars.map(normalizeAvatar)
          : FALLBACK_AVATARS;

        // ── Voices ──
        // Backend sends: { success: true, voices: [...] }
        let rawVoices = [];
        if (voData.success) {
          const vo = voData.voices;
          if (Array.isArray(vo)) {
            rawVoices = vo;
          } else if (vo?.data && Array.isArray(vo.data)) {
            rawVoices = vo.data;
          }
        }
        const normalizedVoices = rawVoices.length > 0
          ? rawVoices.map(normalizeVoice)
          : FALLBACK_VOICES;
        console.log(normalizedAvatars);

        setAvatars(normalizedAvatars);
        setVoices(normalizedVoices);
        setSelectedAvatar(normalizedAvatars[0]);
        setSelectedVoice(normalizedVoices[0]);

      } catch (e) {
        console.error('Load error:', e);
        setLoadError('Could not reach server — using fallback data');
        setAvatars(FALLBACK_AVATARS);
        setVoices(FALLBACK_VOICES);
        setSelectedAvatar(FALLBACK_AVATARS[0]);
        setSelectedVoice(FALLBACK_VOICES[0]);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      anamClientRef.current?.stopStreaming().catch(() => { });
      clearInterval(timerRef.current);
      clearTimeout(speechDoneTimer.current);
    };
  }, []);

  // ── Voice audio preview ───────────────────────────────────────────────
  const playVoicePreview = useCallback((voice) => {
    if (!voice.sampleUrl) return;
    const audio = audioPreviewRef.current;
    if (!audio) return;
    if (playingVoiceId === voice.id) {
      audio.pause();
      setPlayingVoiceId(null);
      return;
    }
    audio.src = voice.sampleUrl;
    audio.play().then(() => setPlayingVoiceId(voice.id)).catch(console.error);
    audio.onended = () => setPlayingVoiceId(null);
  }, [playingVoiceId]);

  // ── Build personaConfig ───────────────────────────────────────────────
  const buildPersonaConfig = useCallback(() => {
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
      systemPrompt: `You are ${personaName}, a professional video presenter. Speak clearly and naturally. Respond in ${selectedLang.label}.`,
      voiceGenerationOptions,
      voiceDetectionOptions: {
        endOfSpeechSensitivity: endOfSpeechSens,
        speechEnhancementLevel: speechEnhancement,
      },
    };
  }, [personaName, selectedAvatar, selectedVoice, selectedLlm, selectedLang,
    emotion, speechSpeed, volume, stability, similarityBoost, style,
    useSpeakerBoost, endOfSpeechSens, speechEnhancement, skipGreeting, isElevenLabs]);

  // ── Generate & record ─────────────────────────────────────────────────
  const generateAndRecord = useCallback(async () => {
    if (!script.trim() || !selectedAvatar || !selectedVoice) return;
    setOutputBlob(null); setOutputUrl(null); setOutputDuration(0);
    setErrorMsg(''); setCaptionText('');
    recordedChunks.current = [];

    try {
      setRecStatus('connecting');
      const res = await fetch(`${API_URL}/api/anam/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPersonaConfig()),
      });
      const data = await res.json();
      if (!data.success || !data.sessionToken) throw new Error(data.error || 'No session token');

      const client = createClient(data.sessionToken, { disableInputAudio: disableMic });
      anamClientRef.current = client;

      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => setRecStatus('loading'));

      client.addListener(AnamEvent.SESSION_READY, async () => {
        const videoEl = document.getElementById('script-video');
        if (videoEl?.srcObject) {
          const mr = new MediaRecorder(videoEl.srcObject, { mimeType: 'video/webm;codecs=vp9,opus' });
          mr.ondataavailable = e => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
          mr.onstop = async () => {
            const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setOutputBlob(blob);
            setOutputUrl(url);
            const duration = Date.now() - recStartRef.current;
            setOutputDuration(duration);
            setRecStatus('done');

            // Auto save to dashboard
            autoSaveVideo(blob, scriptTitle || 'AI Avatar Video');
          };
          mr.start(500);
          mediaRecorderRef.current = mr;
        }

        recStartRef.current = Date.now();
        setElapsed(0);
        setRecStatus('speaking');
        timerRef.current = setInterval(() => setElapsed(Date.now() - recStartRef.current), 500);

        try { await client.talk(script.trim()); } catch (e) { console.error('Talk error:', e); }

        const estMs = Math.ceil((wordCount(script) / 130) * 60 * 1000 * (1 / speechSpeed)) + 3000;
        speechDoneTimer.current = setTimeout(async () => {
          clearInterval(timerRef.current);
          mediaRecorderRef.current?.stop();
          try { await client.stopStreaming(); } catch (_) { }
          anamClientRef.current = null;
        }, estMs);
      });

      client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, e => {
        if (e.role === 'persona') setCaptionText(e.content);
      });
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        clearInterval(timerRef.current);
        if (recStatus !== 'done') mediaRecorderRef.current?.stop();
      });

      await client.streamToVideoElement('script-video');
    } catch (err) {
      setRecStatus('error');
      setErrorMsg(err.message || 'Something went wrong');
      clearInterval(timerRef.current);
    }
  }, [script, selectedAvatar, selectedVoice, buildPersonaConfig, disableMic, speechSpeed, recStatus]);

  const cancelRecording = useCallback(async () => {
    clearInterval(timerRef.current);
    clearTimeout(speechDoneTimer.current);
    mediaRecorderRef.current?.stop();
    try { await anamClientRef.current?.stopStreaming(); } catch (_) { }
    anamClientRef.current = null;
    setRecStatus('idle');
    setCaptionText('');
  }, []);

  const downloadOutput = useCallback(() => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `${scriptTitle || 'script-video'}-${Date.now()}.webm`;
    a.click();
  }, [outputUrl, scriptTitle]);

  const autoSaveVideo = async (blob, title) => {
    if (!blob) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('video', blob, `${title}.webm`);

      const uploadRes = await fetch(`${API_URL}/api/upload-video`, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');

      const saveRes = await fetch(`${API_URL}/api/users/save-video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: title,
          url: uploadData.videoUrl
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const saveToDashboard = useCallback(async () => {
    if (!outputBlob) return;
    await autoSaveVideo(outputBlob, scriptTitle || 'AI Avatar Video');
    if (isSaved) alert('Video saved to dashboard!');
  }, [outputBlob, scriptTitle, isSaved]);

  const reset = () => {
    setRecStatus('idle'); setOutputBlob(null); setOutputUrl(null); setCaptionText(''); setIsSaved(false);
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white flex flex-col">
      <audio ref={audioPreviewRef} className="hidden" />

      {/* Top bar */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0 bg-[#111827]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00c8f5] to-blue-600 flex items-center justify-center text-sm">📝</div>
          <div>
            <p className="font-bold text-sm">Script <span className="text-purple-500">Studio</span></p>

            <p className="text-xs text-gray-400 leading-none">Avatar video from script</p>
          </div>
        </div>
        <Steps current={step} />
        <div className="w-28" />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel ── */}
        <div className="w-[420px] border-r border-gray-100 flex flex-col shrink-0 bg-white">
          <div className="flex border-b border-gray-100 shrink-0">
            {[['⚙️ Configure', 0], ['📝 Script', 1]].map(([label, idx]) => (
              <button key={idx} onClick={() => !isBusy && setStep(idx)}
                className={`flex-1 py-3 text-xs font-semibold transition-colors ${step === idx ? 'text-gray-900 border-b-2 border-[#00c8f5]' : 'text-gray-400 hover:text-gray-600'
                  }`}>{label}</button>
            ))}
          </div>

          {/* Load error banner */}
          {loadError && (
            <div className="mx-4 mt-3 px-3 py-2 bg-yellow-900/40 border border-yellow-700 rounded-xl text-xs text-yellow-300">
              ⚠️ {loadError}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

            {/* ══ STEP 0 ══ */}
            {step === 0 && (<>

              {/* Avatar */}
              <Section title={`👤 Avatar ${loading ? '(loading...)' : `— ${avatars.length} available`}`}>

                {/* Inputs */}
                <input
                  value={personaName}
                  onChange={e => setPersonaName(e.target.value)}
                  placeholder="Presenter name..."
                  className="w-full bg-[#0f172a] text-white text-sm rounded-xl px-3 py-2.5 border border-[#1e293b] focus:border-[#00c8f5] focus:ring-1 focus:ring-[#00c8f5] outline-none transition-all"
                />

                <input
                  value={avatarSearch}
                  onChange={e => setAvatarSearch(e.target.value)}
                  placeholder="Search by name or variant..."
                  className="w-full bg-[#0f172a] text-gray-300 text-xs rounded-xl px-3 py-2 border border-[#1e293b] focus:border-[#00c8f5] focus:ring-1 focus:ring-[#00c8f5] outline-none transition-all"
                />

                {loading ? (
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-square rounded-xl bg-[#1e293b] animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">

                    {/* Upload Avatar */}
                    <button
                      onClick={handleUploadClick}
                      disabled={isUploadingAvatar}
                      className="relative rounded-xl border border-dashed border-[#1e293b] flex flex-col items-center justify-center p-3 transition-all hover:border-[#00c8f5] hover:bg-[#020617] group aspect-square"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-6 h-6 border-2 border-[#00c8f5] border-t-transparent rounded-full animate-spin mb-1" />
                      ) : (
                        <div className="text-2xl mb-1 text-gray-500 group-hover:text-[#00c8f5] group-hover:scale-110 transition-transform">
                          📸
                        </div>
                      )}
                      <p className="text-[10px] font-semibold text-gray-500 group-hover:text-[#00c8f5]">
                        Upload
                      </p>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </button>

                    {/* Empty */}
                    {filteredAvatars.length === 0 ? (
                      <div className="col-span-2 flex items-center justify-center py-6">
                        <p className="text-xs text-gray-500 text-center">
                          No avatars match "{avatarSearch}"
                        </p>
                      </div>
                    ) : (
                      filteredAvatars.map(av => (
                        <button
                          key={av.id}
                          onClick={() => setSelectedAvatar(av)}
                          className={`relative rounded-xl overflow-hidden border aspect-square transition-all group
            ${selectedAvatar?.id === av.id
                              ? 'border-[#00c8f5] shadow-[0_0_15px_#00c8f5]'
                              : 'border-[#1e293b] hover:border-[#00c8f5]/50'
                            }`}
                        >

                          {/* Image */}
                          {av.thumbnailUrl ? (
                            <img
                              src={av.thumbnailUrl}
                              alt={av.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#020617] flex items-center justify-center text-3xl">
                              👤
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 py-1.5">
                            <p className="text-white text-xs font-semibold truncate text-center">
                              {av.name}
                            </p>

                            {av.variantName && (
                              <p className="text-gray-400 truncate text-center text-[9px]">
                                {av.variantName}
                              </p>
                            )}
                          </div>

                          {/* Selected */}
                          {selectedAvatar?.id === av.id && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-[#00c8f5] rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Footer */}
                <p className="text-xs text-gray-400">
                  {filteredAvatars.length} of {avatars.length} avatars
                  {selectedAvatar && (
                    <span className="text-[#00c8f5] ml-2 font-medium">
                      · Selected: {selectedAvatar.name}
                      {selectedAvatar.variantName ? ` (${selectedAvatar.variantName})` : ''}
                    </span>
                  )}
                </p>
              </Section>
              {/* Voice */}
              <Section title={`🔊 Voice — ${voices.length} available`}>
                {/* Search */}
                <input value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)}
                  placeholder="Search by name, country, description..."
                  className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />

                {/* Gender + Provider filter row */}
                <div className="flex gap-2">
                  {/* Gender */}
                  <div className="flex rounded-xl border border-gray-700 overflow-hidden shrink-0">
                    {[['all', '👥 All'], ['female', '👩 F'], ['male', '👨 M']].map(([g, icon]) => (
                      <button key={g} onClick={() => setVoiceGender(g)}
                        className={`px-2.5 py-1.5 text-xs transition-colors ${voiceGender === g ? 'bg-[#00c8f5] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}>{icon}</button>
                    ))}
                  </div>

                  {/* Provider — dynamically built from loaded voices */}
                  <div className="flex rounded-xl border border-gray-700 overflow-hidden flex-1">
                    {availableProviders.slice(0, 3).map(p => (
                      <button key={p} onClick={() => setVoiceProvider(p)}
                        className={`flex-1 px-2 py-1.5 text-xs transition-colors capitalize ${voiceProvider === p ? 'bg-[#00c8f5] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                          }`}>
                        {p === 'all' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice list */}
                <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {filteredVoices.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-6">No voices match your filters</p>
                  ) : filteredVoices.map(v => (
                    <div key={v.id} onClick={() => setSelectedVoice(v)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${selectedVoice?.id === v.id
                        ? 'border-[#00c8f5] bg-[#00c8f5] text-white shadow-sm'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}>

                      {/* Gender icon */}
                      <span className="text-lg shrink-0">
                        {v.gender === 'female' ? '👩' : v.gender === 'male' ? '👨' : '🎙️'}
                      </span>

                      {/* Name + meta */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${selectedVoice?.id === v.id ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {v.country && (
                            <span className="text-xs text-gray-500">{v.country}</span>
                          )}
                          {v.provider && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${providerBadgeClass(v.provider)}`}>
                              {v.provider}
                            </span>
                          )}
                          {v.tags?.map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                        {v.description && (
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{v.description}</p>
                        )}
                      </div>

                      {/* Audio preview */}
                      {v.sampleUrl && (
                        <button onClick={e => { e.stopPropagation(); playVoicePreview(v); }}
                          title="Preview voice"
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${playingVoiceId === v.id
                            ? 'bg-[#00c8f5] text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-400'
                            }`}>
                          {playingVoiceId === v.id ? '⏹' : '▶'}
                        </button>
                      )}

                      {/* Selected */}
                      {selectedVoice?.id === v.id && (
                        <span className="text-[#00c8f5] text-sm shrink-0">✓</span>
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-600">
                  {filteredVoices.length} of {voices.length} voices
                  {selectedVoice && (
                    <span className="text-[#00c8f5] ml-2">
                      · Selected: {selectedVoice.name}
                    </span>
                  )}
                </p>

                {/* LLM */}
                <div className="border-t border-gray-800 pt-3">
                  <p className="text-xs text-gray-500 mb-1.5 font-semibold">AI Brain</p>
                  <div className="flex gap-2">
                    {LLM_OPTIONS.map(l => (
                      <button key={l.id} onClick={() => setSelectedLlm(l.id)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${selectedLlm === l.id
                          ? 'border-[#00c8f5] bg-[#00c8f5] text-white shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                          }`}>{l.label}</button>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Expression & Voice Tuning */}
              <Section title="🎭 Expression & Voice Tuning">
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">
                    Emotion
                    <span className="text-gray-600 font-normal ml-1">
                      {isElevenLabs ? '(not available for ElevenLabs)' : '(Cartesia voices)'}
                    </span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {EMOTIONS.map(e => (
                      <button key={e.id}
                        onClick={() => !isElevenLabs && setEmotion(e.id)}
                        disabled={isElevenLabs}
                        className={`flex flex-col items-center py-2.5 rounded-xl border text-xs font-medium transition-all ${emotion === e.id && !isElevenLabs
                          ? 'border-[#00c8f5] bg-[#00c8f5] text-white shadow-sm'
                          : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                          } ${isElevenLabs ? 'opacity-30 cursor-not-allowed' : ''}`}>
                        <span className="text-xl mb-0.5">{e.icon}</span>{e.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider label="Speech Speed" value={speechSpeed}
                  min={isElevenLabs ? 0.7 : 0.6} max={isElevenLabs ? 1.2 : 1.5} step={0.05}
                  onChange={setSpeechSpeed} format={v => `${v.toFixed(2)}×`}
                  hint={isElevenLabs ? '0.7–1.2× for ElevenLabs' : '0.6–1.5× for Cartesia'} />

                {!isElevenLabs && (
                  <Slider label="Volume" value={volume} min={0.5} max={2.0} step={0.05}
                    onChange={setVolume} format={v => `${v.toFixed(2)}×`}
                    hint="0.5 = quieter · 1.0 = normal · 2.0 = louder" />
                )}

                {isElevenLabs && (<>
                  <Slider label="Stability" value={stability} min={0} max={1} step={0.05}
                    onChange={setStability} format={v => v.toFixed(2)}
                    hint="Lower = more emotional variation" />
                  <Slider label="Similarity Boost" value={similarityBoost} min={0} max={1} step={0.05}
                    onChange={setSimilarityBoost} format={v => v.toFixed(2)}
                    hint="How closely to match original voice" />
                  <Slider label="Style" value={style} min={0} max={1} step={0.05}
                    onChange={setStyle} format={v => v.toFixed(2)}
                    hint="Style amplification — may increase latency" />
                  <Toggle label="Speaker Boost" desc="Enhanced similarity (v2 only)"
                    value={useSpeakerBoost} onChange={setUseSpeakerBoost} />
                </>)}

                <div className="border-t border-gray-800 pt-3 flex flex-col gap-3">
                  <p className="text-xs text-gray-500 font-semibold">Voice Detection</p>
                  <Slider label="End-of-Speech Sensitivity" value={endOfSpeechSens}
                    min={0} max={1} step={0.05} onChange={setEndOfSpeechSens}
                    format={v => v.toFixed(2)} hint="Higher = avatar responds sooner" />
                  <Slider label="Speech Enhancement" value={speechEnhancement}
                    min={0} max={1} step={0.05} onChange={setSpeechEnhancement}
                    format={v => v.toFixed(2)} hint="Reduces background noise" />
                </div>
              </Section>

              {/* Language */}
              <Section title="🌍 Language & Accent">
                <p className="text-xs text-gray-500">Select a voice in the matching language for the best accent. The language code controls speech recognition.</p>
                <input value={langSearch} onChange={e => setLangSearch(e.target.value)}
                  placeholder="Search language..."
                  className="w-full bg-gray-50 text-gray-900 text-xs rounded-xl px-3 py-2 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {filteredLangs.map(lang => (
                    <button key={lang.code} onClick={() => setSelectedLang(lang)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-sm transition-all ${selectedLang.code === lang.code
                        ? 'border-[#00c8f5] bg-[#00c8f5] text-white'
                        : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}>
                      <span className="text-xl">{lang.flag}</span>
                      <p className={`text-xs font-medium flex-1 text-left ${selectedLang.code === lang.code ? 'text-white' : 'text-gray-900'}`}>{lang.label}</p>
                      {selectedLang.code === lang.code && <span className="text-white text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Format */}
              <Section title="🎬 Format & Background" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                  {ASPECT_RATIOS.map(r => (
                    <button key={r.id} onClick={() => setSelectedRatio(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${selectedRatio.id === r.id ? 'border-[#00c8f5] bg-[#00c8f5] text-white' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}>
                      <div className="flex items-center gap-2">
                        <span>{r.icon}</span>
                        <div><p className="text-xs font-bold">{r.label}</p><p className="text-xs text-gray-500">{r.desc}</p></div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUNDS.map(bg => (
                    <button key={bg.id} onClick={() => setSelectedBg(bg)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-all ${selectedBg.id === bg.id ? 'border-[#00c8f5] text-white bg-[#00c8f5]' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                        }`}>
                      <span className={`w-3 h-3 rounded-full border border-white/20 ${bg.class}`} />
                      {bg.label}
                    </button>
                  ))}
                </div>
              </Section>

              {/* Advanced */}
              <Section title="⚙️ Advanced" defaultOpen={false}>
                <Toggle label="Disable Microphone" desc="Script-only mode — no live input captured"
                  value={disableMic} onChange={setDisableMic} />
                <Toggle label="Skip Greeting" desc="Avatar jumps straight to your script"
                  value={skipGreeting} onChange={setSkipGreeting} />
              </Section>

              <button onClick={() => setStep(1)}
                className="w-full py-3 bg-[#00c8f5] hover:bg-[#00c8f5] rounded-xl font-semibold text-sm transition-colors">
                Next: Write Script →
              </button>
            </>)}

            {/* ══ STEP 1 ══ */}
            {step === 1 && (<>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Video Title</label>
                <input value={scriptTitle} onChange={e => setScriptTitle(e.target.value)}
                  placeholder="My awesome video..."
                  className="w-full bg-gray-50 text-gray-900 text-sm rounded-xl px-3 py-2.5 border border-gray-100 focus:border-[#00c8f5] focus:outline-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Templates</label>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(SCRIPT_TEMPLATES).map(([key, t]) => (
                    <button key={key} onClick={() => setScript(t.text)}
                      className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-100 text-xs font-medium text-gray-700 transition-colors">
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Script *</label>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>{wordCount(script)} words</span>
                    <span>{estimateDuration(script, speechSpeed)}</span>
                  </div>
                </div>
                <textarea value={script} onChange={e => setScript(e.target.value)}
                  placeholder={`Write or paste your script here...\n\nThe avatar will speak exactly what you write in ${selectedLang.label}.`}
                  rows={14}
                  className="w-full bg-gray-50 text-gray-900 text-sm rounded-xl px-3 py-3 resize-none 
                  border border-[#00c8f5] shadow-[0_0_8px_#00c8f5]/50 
                  focus:border-[#00c8f5] focus:shadow-[0_0_12px_#00c8f5] focus:outline-none 
                 leading-relaxed hover:shadow-[0_0_12px_#00c8f5] transition-all duration-300" />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 text-xs">
                <p className="font-semibold text-gray-400 mb-2">Session Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-500">
                  <span>Avatar: <span className="text-gray-900">{selectedAvatar?.name}{selectedAvatar?.variantName ? ` · ${selectedAvatar.variantName}` : ''}</span></span>
                  <span>Voice: <span className="text-gray-900">{selectedVoice?.name}</span></span>
                  <span>Language: <span className="text-gray-900">{selectedLang.flag} {selectedLang.label}</span></span>
                  <span>Emotion: <span className="text-gray-900">{isElevenLabs ? 'N/A' : `${EMOTIONS.find(e => e.id === emotion)?.icon} ${emotion}`}</span></span>
                  <span>Speed: <span className="text-gray-900">{speechSpeed.toFixed(2)}×</span></span>
                  <span>Format: <span className="text-gray-900">{selectedRatio.label}</span></span>
                </div>
              </div>

              <button onClick={() => { setStep(2); generateAndRecord(); }}
                disabled={!canGenerate}
                className="w-full py-3.5 bg-gradient-to-r from-[#00c8f5] to-blue-600 hover:from-[#00c8f5] hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all">
                ⏺ Generate & Record
              </button>
              {!script.trim() && <p className="text-xs text-yellow-500 text-center">Write your script to continue</p>}
            </>)}
          </div>
        </div>

        {/* ── Right: Preview ── */}
        <div className="flex-1 flex flex-col items-center p-6 gap-5 overflow-y-auto">
          <div className="flex items-center gap-3">
            <RecPill status={recStatus} elapsed={elapsed} />
            {recStatus === 'done' && (
              <span className="text-xs text-green-400">
                {formatTime(outputDuration)} · {((outputBlob?.size || 0) / (1024 * 1024)).toFixed(1)} MB
              </span>
            )}
          </div>

          <div className={`relative overflow-hidden rounded-2xl border border-gray-700 flex items-center justify-center w-full ${selectedBg.class}`}
            style={{ aspectRatio: selectedRatio.id, maxHeight: '65vh' }}>
            <video id="script-video" autoPlay playsInline className="w-full h-full object-cover" />

            {recStatus === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center 
              bg-[#0f172a]/80 backdrop-blur-sm border border-[#1e293b] hover:border-[#00c8f5] transition-all duration-300">
                {selectedAvatar?.thumbnailUrl ? (
                  <img src={selectedAvatar.thumbnailUrl} alt=""
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 mb-3 opacity-70"
                    onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="text-5xl mb-3 opacity-20">👤</div>
                )}
                <p className="text-gray-900 text-sm font-semibold">{selectedAvatar?.name || 'No avatar selected'}</p>
                {selectedAvatar?.variantName && (
                  <p className="text-gray-500 text-xs mt-0.5">{selectedAvatar.variantName}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{selectedLang.flag} {selectedLang.label}</span>
                  <span>·</span>
                  <span>{isElevenLabs ? '🎵 ElevenLabs' : `${EMOTIONS.find(e => e.id === emotion)?.icon} ${emotion}`}</span>
                  <span>·</span>
                  <span>{speechSpeed.toFixed(1)}×</span>
                </div>
              </div>
            )}

            {(recStatus === 'connecting' || recStatus === 'loading') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75">
                <div className="w-12 h-12 border-4 border-[#00c8f5] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-gray-300 text-sm">
                  {recStatus === 'connecting' ? 'Connecting...' : 'Starting avatar...'}
                </p>
              </div>
            )}

            {recStatus === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-8">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-red-400 font-semibold">Generation failed</p>
                <p className="text-gray-400 text-xs text-center mt-2">{errorMsg}</p>
              </div>
            )}

            {recStatus === 'speaking' && captionText && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <p className="text-white text-sm text-center leading-relaxed drop-shadow">{captionText}</p>
              </div>
            )}

            {recStatus === 'speaking' && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span className="text-white text-xs font-bold">REC</span>
              </div>
            )}

            {recStatus === 'done' && outputUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                <div className="bg-white/90 backdrop-blur rounded-2xl px-6 py-4 shadow-xl text-center border border-gray-100 animate-in zoom-in">
                  <div className="text-3xl mb-2">✅</div>
                  <p className="font-bold text-sm text-gray-800">Video Ready!</p>
                  <p className="text-xs text-green-600 font-medium mt-0.5">{formatTime(outputDuration)}</p>
                </div>
              </div>
            )}

            <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg">
              <span className="text-xs text-gray-400">{selectedRatio.label} · {selectedLang.flag}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 w-full max-w-md">
            {(recStatus === 'idle' || recStatus === 'error') && (
              <button onClick={() => { setStep(2); generateAndRecord(); }} disabled={!canGenerate}
                className="flex-1 py-3 bg-gradient-to-r from-[#00c8f5] to-blue-600 hover:from-[#00c8f5] hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-sm transition-all">
                ⏺ Generate & Record
              </button>
            )}
            {isBusy && (
              <button onClick={cancelRecording}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-sm transition-colors">
                ✕ Cancel
              </button>
            )}
            {recStatus === 'done' && (<>
              <button onClick={downloadOutput}
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-sm transition-colors">
                ⬇ Download
              </button>
              <button onClick={reset}
                className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition-colors">
                🔄 New Take
              </button>
            </>)}
          </div>

          {/* Output player */}
          {recStatus === 'done' && outputUrl && (
            <div className="w-full max-w-lg bg-gray-50 rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm text-gray-800">{scriptTitle || 'Untitled Video'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selectedAvatar?.name} · {selectedLang.flag} {selectedLang.label} · {selectedRatio.label} · {formatTime(outputDuration)}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full border border-green-200 font-semibold">Ready</span>
              </div>
              <video src={outputUrl} controls className="w-full rounded-xl bg-black" />
              <div className="flex gap-2 mt-3">
                <button onClick={saveToDashboard} disabled={isSaving || isSaved}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isSaved ? 'bg-gray-100 text-gray-400' : 'bg-[#00c8f5] hover:bg-cyan-500 text-white shadow-md'
                    }`}>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved! ✓' : '💾 Save to Dashboard'}
                </button>
                <button onClick={() => { setStep(0); reset(); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors">
                  ⚙️
                </button>
                <button onClick={() => { setStep(1); reset(); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors">
                  ✏️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}