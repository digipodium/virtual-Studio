'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@anam-ai/js-sdk';
import { AnamEvent } from '@anam-ai/js-sdk/dist/module/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const USER_ID = 'demo-user'; // replace with your auth user id

// ── Content platform configs ──────────────────────────────────────────────────
const PLATFORMS = {
  youtube: {
    label: 'YouTube',
    icon: '▶️',
    color: 'from-red-600 to-red-800',
    border: 'border-red-500',
    genres: ['Tech & Tutorials', 'Vlog', 'Education', 'Gaming', 'Finance', 'Health & Fitness', 'Comedy', 'Travel', 'Food', 'News'],
    aspectRatio: '16/9',
    promptHint: 'engaging, informative YouTube presenter',
  },
  instagram: {
    label: 'Instagram Reels',
    icon: '📱',
    color: 'from-purple-600 to-pink-600',
    border: 'border-pink-500',
    genres: ['Lifestyle', 'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Motivation', 'Comedy', 'DIY', 'Dance'],
    aspectRatio: '9/16',
    promptHint: 'trendy, energetic Instagram creator',
  },
  tiktok: {
    label: 'TikTok',
    icon: '🎵',
    color: 'from-gray-900 to-black',
    border: 'border-cyan-400',
    genres: ['Comedy', 'Dance', 'Life Hacks', 'Cooking', 'Education', 'Fashion', 'Sports', 'ASMR', 'Story Time', 'Reactions'],
    aspectRatio: '9/16',
    promptHint: 'fun, fast-paced TikTok creator who hooks viewers in the first 3 seconds',
  },
  podcast: {
    label: 'Podcast',
    icon: '🎙️',
    color: 'from-indigo-600 to-blue-700',
    border: 'border-indigo-400',
    genres: ['True Crime', 'Business', 'Self-Help', 'Tech', 'History', 'Science', 'Sports', 'Politics', 'Interviews', 'Storytelling'],
    aspectRatio: '1/1',
    promptHint: 'conversational, insightful podcast host',
  },
  custom: {
    label: 'Custom',
    icon: '✨',
    color: 'from-gray-700 to-gray-800',
    border: 'border-gray-500',
    genres: [],
    aspectRatio: '16/9',
    promptHint: 'helpful AI assistant',
  },
};

const LLM_OPTIONS = [
  { id: '0934d97d-0c3a-4f33-91b0-5e136a0ef466', label: 'GPT-4o Mini' },
  { id: 'CUSTOMER_CLIENT_V1', label: 'Custom / Echo' },
];

// ── Prompt builder ────────────────────────────────────────────────────────────
function buildSystemPrompt(platform, genre, customInstructions) {
  const cfg = PLATFORMS[platform];
  const genreLine = genre ? `You specialise in ${genre} content.` : '';
  const base = `[STYLE] Reply in natural speech without heavy formatting. Add natural pauses using '...' where appropriate. Keep responses concise and energetic.
[PERSONALITY] You are an expert ${cfg.promptHint}. ${genreLine} Your goal is to create compelling, platform-native content that resonates with your audience.
[PLATFORM] You are creating content for ${cfg.label}.${platform !== 'custom' ? ` Adapt your tone, pacing, and style for ${cfg.label} audiences.` : ''}`;
  return customInstructions ? `${base}\n[EXTRA] ${customInstructions}` : base;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  idle:       { label: 'Ready',         dot: 'bg-gray-500' },
  fetching:   { label: 'Loading...',    dot: 'bg-yellow-400 animate-pulse' },
  connecting: { label: 'Connecting...', dot: 'bg-yellow-500 animate-pulse' },
  loading:    { label: 'Starting...',   dot: 'bg-blue-500 animate-pulse' },
  connected:  { label: 'Live',          dot: 'bg-green-500' },
  error:      { label: 'Error',         dot: 'bg-red-500' },
  stopped:    { label: 'Ended',         dot: 'bg-gray-400' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function PersonaCard({ persona, active, onSelect, onEdit, onDelete }) {
  const cfg = PLATFORMS[persona.platform] || PLATFORMS.custom;
  return (
    <div className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
      active ? `${cfg.border} bg-gray-800` : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
    }`} onClick={() => onSelect(persona)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{cfg.icon}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{persona.name}</p>
            <p className="text-xs text-gray-400">{cfg.label} · {persona.genre || 'General'}</p>
          </div>
        </div>
        {active && <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full shrink-0">Active</span>}
      </div>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{persona.description || persona.systemPrompt?.slice(0, 80)}</p>
      <div className="flex gap-2 mt-3">
        <button onClick={(e) => { e.stopPropagation(); onEdit(persona); }}
          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Edit</button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(persona._id); }}
          className="text-xs px-2 py-1 bg-red-900/50 hover:bg-red-800 rounded-lg transition-colors text-red-300">Delete</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AvatarStudioPage() {
  const anamClientRef    = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks   = useRef([]);
  const recordingStart   = useRef(null);
  const timerRef         = useRef(null);

  // Remote data
  const [avatars, setAvatars]   = useState([]);
  const [voices, setVoices]     = useState([]);
  const [personas, setPersonas] = useState([]);

  // Active persona & session
  const [activePersona, setActivePersona] = useState(null);
  const [status, setStatus]               = useState('idle');
  const [errorMsg, setErrorMsg]           = useState('');
  const [isMuted, setIsMuted]             = useState(false);
  const [messages, setMessages]           = useState([]);
  const [personaSpeech, setPersonaSpeech] = useState('');
  const [userSpeech, setUserSpeech]       = useState('');

  // Script / talk
  const [scriptText, setScriptText] = useState('');
  const [isScriptMode, setIsScriptMode] = useState(false);

  // Recording
  const [isRecording, setIsRecording]     = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings]       = useState([]); // { url, name, duration, size, platform }

  // Persona builder modal
  const [showBuilder, setShowBuilder]     = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [builderStep, setBuilderStep]     = useState(0); // 0=platform 1=genre 2=details 3=avatar/voice
  const [draft, setDraft] = useState({
    name: '', platform: 'youtube', genre: '', description: '',
    avatarId: '', voiceId: '', llmId: LLM_OPTIONS[0].id,
    customInstructions: '', systemPrompt: '',
  });

  // UI
  const [activeTab, setActiveTab]   = useState('personas'); // personas | recordings | script
  const [showRecChat, setShowRecChat] = useState(false);

  // ── Load initial data ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setStatus('fetching');
      try {
        const [avRes, voRes, peRes] = await Promise.all([
          fetch(`${API_URL}/api/anam/avatars`),
          fetch(`${API_URL}/api/anam/voices`),
          fetch(`${API_URL}/api/anam/personas?userId=${USER_ID}`),
        ]);
        const [avData, voData, peData] = await Promise.all([avRes.json(), voRes.json(), peRes.json()]);

        const fallbackAv = [{ id: '30fa96d0-26c4-4e55-94a0-517025942e18', name: 'Cara' }];
        const fallbackVo = [{ id: '6bfbe25a-979d-40f3-a92b-5394170af54b', name: 'Default' }];

        const avList = (avData.success && avData.avatars?.length) ? avData.avatars : fallbackAv;
        const voList = (voData.success && voData.voices?.length)  ? voData.voices  : fallbackVo;

        setAvatars(avList);
        setVoices(voList);
        setDraft(d => ({ ...d, avatarId: avList[0]?.id || '', voiceId: voList[0]?.id || '' }));

        if (peData.success) setPersonas(peData.personas);
      } catch (err) {
        console.error('Load error:', err);
      }
      setStatus('idle');
    };
    load();
    return () => { anamClientRef.current?.stopStreaming().catch(() => {}); };
  }, []);

  // ── Persona CRUD ────────────────────────────────────────────────────────
  const savePersona = useCallback(async () => {
    const systemPrompt = buildSystemPrompt(draft.platform, draft.genre, draft.customInstructions);
    const payload = { ...draft, systemPrompt, userId: USER_ID };

    try {
      if (editingPersona) {
        const res = await fetch(`${API_URL}/api/anam/personas/${editingPersona._id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setPersonas(ps => ps.map(p => p._id === editingPersona._id ? data.persona : p));
      } else {
        const res = await fetch(`${API_URL}/api/anam/personas`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) setPersonas(ps => [data.persona, ...ps]);
      }
      setShowBuilder(false);
      setEditingPersona(null);
      setBuilderStep(0);
    } catch (err) {
      console.error('Save persona error:', err);
    }
  }, [draft, editingPersona]);

  const deletePersona = useCallback(async (id) => {
    if (!confirm('Delete this persona?')) return;
    await fetch(`${API_URL}/api/anam/personas/${id}`, { method: 'DELETE' });
    setPersonas(ps => ps.filter(p => p._id !== id));
    if (activePersona?._id === id) setActivePersona(null);
  }, [activePersona]);

  const openEdit = useCallback((persona) => {
    setEditingPersona(persona);
    setDraft({
      name: persona.name, platform: persona.platform, genre: persona.genre,
      description: persona.description, avatarId: persona.avatarId, voiceId: persona.voiceId,
      llmId: persona.llmId, customInstructions: '', systemPrompt: persona.systemPrompt,
    });
    setBuilderStep(0);
    setShowBuilder(true);
  }, []);

  // ── Session ─────────────────────────────────────────────────────────────
  const startSession = useCallback(async (persona) => {
    if (!persona) return;
    try {
      setStatus('connecting');
      setErrorMsg('');
      setMessages([]);
      setPersonaSpeech('');
      setUserSpeech('');

      const res = await fetch(`${API_URL}/api/anam/session-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: persona.name, avatarId: persona.avatarId,
          voiceId: persona.voiceId, llmId: persona.llmId,
          systemPrompt: persona.systemPrompt,
        }),
      });
      const data = await res.json();
      if (!data.success || !data.sessionToken) throw new Error(data.error || 'No session token');

      const client = createClient(data.sessionToken);
      anamClientRef.current = client;

      client.addListener(AnamEvent.CONNECTION_ESTABLISHED, () => setStatus('loading'));
      client.addListener(AnamEvent.SESSION_READY, () => setStatus('connected'));
      client.addListener(AnamEvent.CONNECTION_CLOSED, () => {
        setStatus('stopped');
        setPersonaSpeech('');
        setUserSpeech('');
      });
      client.addListener(AnamEvent.MESSAGE_HISTORY_UPDATED, (msgs) =>
        setMessages(msgs.map(m => ({ role: m.role, content: m.content })))
      );
      client.addListener(AnamEvent.MESSAGE_STREAM_EVENT_RECEIVED, (e) => {
        if (e.role === 'persona') setPersonaSpeech(e.content);
        else setUserSpeech(e.content);
      });

      await client.streamToVideoElement('anam-video');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (isRecording) stopRecording();
    try { await anamClientRef.current?.stopStreaming(); } catch (_) {}
    anamClientRef.current = null;
    setStatus('stopped');
  }, [isRecording]);

  const toggleMute = useCallback(() => {
    const c = anamClientRef.current;
    if (!c) return;
    if (isMuted) { c.unmuteInputAudio(); setIsMuted(false); }
    else         { c.muteInputAudio();   setIsMuted(true); }
  }, [isMuted]);

  // ── Talk / script ────────────────────────────────────────────────────────
  const sendScript = useCallback(async () => {
    if (!scriptText.trim() || !anamClientRef.current) return;
    try {
      await anamClientRef.current.talk(scriptText.trim());
      setScriptText('');
    } catch (err) {
      console.error('Talk error:', err);
    }
  }, [scriptText]);

  // ── Recording (client-side MediaRecorder) ────────────────────────────────
  const startRecording = useCallback(() => {
    const videoEl = document.getElementById('anam-video');
    if (!videoEl || !videoEl.srcObject) return;

    recordedChunks.current = [];
    const stream = videoEl.srcObject;
    const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });

    mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunks.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      const duration = Date.now() - recordingStart.current;
      const platform = activePersona?.platform || 'custom';
      setRecordings(rs => [{
        url, duration,
        name: `${activePersona?.name || 'Recording'} — ${new Date().toLocaleTimeString()}`,
        size: (blob.size / (1024 * 1024)).toFixed(1),
        platform,
        blob,
      }, ...rs]);
    };

    mr.start(1000);
    mediaRecorderRef.current = mr;
    recordingStart.current = Date.now();
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = setInterval(() => setRecordingTime(t => t + 1000), 1000);
  }, [activePersona]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  const downloadRecording = useCallback((rec) => {
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = `${rec.name}.webm`;
    a.click();
  }, []);

  const deleteRecording = useCallback((idx) => {
    setRecordings(rs => rs.filter((_, i) => i !== idx));
  }, []);

  // ── Builder helpers ───────────────────────────────────────────────────────
  const openBuilder = () => {
    setEditingPersona(null);
    setDraft({ name: '', platform: 'youtube', genre: '', description: '',
      avatarId: avatars[0]?.id || '', voiceId: voices[0]?.id || '',
      llmId: LLM_OPTIONS[0].id, customInstructions: '', systemPrompt: '' });
    setBuilderStep(0);
    setShowBuilder(true);
  };

  const isActive = status === 'connected';
  const isBusy   = ['connecting', 'loading', 'fetching'].includes(status);
  const statusCfg = STATUS[status] || STATUS.idle;
  const activePlatformCfg = PLATFORMS[activePersona?.platform || 'custom'];

  return (
    <div className="min-h-screen bg-[#080810] text-white flex flex-col">

      {/* ── Top bar ── */}
      <div className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-sm">A</div>
          <div>
            <span className="font-bold text-base">Anam Content Studio</span>
            <p className="text-xs text-gray-500 leading-none">AI Avatar Creator</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            <span className="text-sm text-gray-400">{statusCfg.label}</span>
          </div>
          <button onClick={openBuilder}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors">
            + New Persona
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left sidebar ── */}
        <div className="w-72 border-r border-gray-800 flex flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {[['personas','🎭 Personas'], ['recordings','🎬 Recordings'], ['script','📝 Script']].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  activeTab === id ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">

            {/* Personas tab */}
            {activeTab === 'personas' && (
              <div className="flex flex-col gap-2">
                {personas.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <div className="text-4xl mb-3">🎭</div>
                    <p className="text-sm font-medium">No personas yet</p>
                    <p className="text-xs mt-1">Create your first persona to get started</p>
                    <button onClick={openBuilder}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors">
                      + Create Persona
                    </button>
                  </div>
                ) : (
                  personas.map(p => (
                    <PersonaCard key={p._id} persona={p}
                      active={activePersona?._id === p._id}
                      onSelect={setActivePersona}
                      onEdit={openEdit}
                      onDelete={deletePersona} />
                  ))
                )}
              </div>
            )}

            {/* Recordings tab */}
            {activeTab === 'recordings' && (
              <div className="flex flex-col gap-2">
                {recordings.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <div className="text-4xl mb-3">🎬</div>
                    <p className="text-sm font-medium">No recordings yet</p>
                    <p className="text-xs mt-1">Start a session and hit Record</p>
                  </div>
                ) : recordings.map((rec, i) => (
                  <div key={i} className="bg-gray-800/70 rounded-xl p-3 border border-gray-700">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{rec.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {PLATFORMS[rec.platform]?.icon} {formatDuration(rec.duration)} · {rec.size} MB
                        </p>
                      </div>
                    </div>
                    <video src={rec.url} controls className="w-full rounded-lg mt-2 bg-black" style={{ maxHeight: 100 }} />
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => downloadRecording(rec)}
                        className="flex-1 text-xs py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
                        ⬇ Download
                      </button>
                      <button onClick={() => deleteRecording(i)}
                        className="text-xs px-3 py-1.5 bg-red-900/50 hover:bg-red-800 rounded-lg text-red-300 transition-colors">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Script tab */}
            {activeTab === 'script' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-gray-500">Type what you want the avatar to say. Works during an active session.</p>
                <textarea
                  value={scriptText}
                  onChange={e => setScriptText(e.target.value)}
                  placeholder="Enter your script here..."
                  rows={8}
                  className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl p-3 resize-none border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={sendScript}
                  disabled={!isActive || !scriptText.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold transition-colors"
                >
                  ▶ Deliver Script
                </button>
                {!isActive && (
                  <p className="text-xs text-yellow-500 text-center">Start a session first to use the script</p>
                )}

                {/* Quick script templates */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Quick templates</p>
                  {[
                    { label: 'Hook opener', text: "Hey everyone! Welcome back to the channel. Today I'm going to show you something that completely changed how I think about this topic..." },
                    { label: 'Call to action', text: "If you found this helpful, don't forget to like and subscribe. Drop a comment below letting me know what you think!" },
                    { label: 'Intro greeting', text: "Welcome! I'm so excited to connect with you today. Let's dive right in." },
                  ].map((t, i) => (
                    <button key={i} onClick={() => setScriptText(t.text)}
                      className="w-full text-left text-xs px-3 py-2 mb-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors">
                      <span className="font-medium text-gray-300">{t.label}</span>
                      <span className="text-gray-500 ml-2 line-clamp-1">{t.text.slice(0, 40)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Centre: Video ── */}
        <div className="flex-1 flex flex-col p-5 gap-4 min-w-0">

          {/* Platform banner */}
          {activePersona && (
            <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r ${activePlatformCfg.color} bg-opacity-20 border ${activePlatformCfg.border} border-opacity-50`}>
              <span className="text-xl">{activePlatformCfg.icon}</span>
              <div>
                <p className="font-semibold text-sm">{activePersona.name}</p>
                <p className="text-xs text-white/70">{activePlatformCfg.label} · {activePersona.genre || 'General'}</p>
              </div>
              {isActive && (
                <div className="ml-auto flex items-center gap-2">
                  {isRecording && (
                    <span className="text-red-400 text-xs font-mono font-bold animate-pulse">
                      ● {formatDuration(recordingTime)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Video container */}
          <div className="flex-1 relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-800 min-h-0">
            <video id="anam-video" autoPlay playsInline className="w-full h-full object-cover" />

            {/* Overlays */}
            {(status === 'idle' || status === 'stopped' || status === 'fetching') && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95">
                <div className="text-6xl mb-4">{activePersona ? activePlatformCfg.icon : '🎭'}</div>
                <p className="text-lg font-semibold">{activePersona?.name || 'Select a Persona'}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {!activePersona ? 'Choose a persona from the sidebar to begin' :
                   status === 'stopped' ? 'Session ended' : 'Press Start Session to go live'}
                </p>
              </div>
            )}
            {isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/85">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-300">{statusCfg.label}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 p-8">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="text-red-400 font-semibold">Connection failed</p>
                <p className="text-gray-400 text-sm mt-2 text-center">{errorMsg}</p>
              </div>
            )}

            {/* Captions */}
            {isActive && (personaSpeech || userSpeech) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5">
                {personaSpeech && (
                  <p className="text-white text-sm text-center">
                    <span className="text-blue-300 font-semibold">{activePersona?.name}: </span>{personaSpeech}
                  </p>
                )}
                {userSpeech && (
                  <p className="text-gray-300 text-xs text-center mt-1">
                    <span className="text-green-300 font-semibold">You: </span>{userSpeech}
                  </p>
                )}
              </div>
            )}

            {/* Live + Rec badges */}
            {isActive && (
              <div className="absolute top-3 left-3 flex gap-2">
                <div className="flex items-center gap-1.5 bg-red-600/90 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-1.5 bg-gray-900/90 border border-red-500 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-bold font-mono">{formatDuration(recordingTime)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat toggle */}
            {isActive && (
              <button onClick={() => setShowRecChat(s => !s)}
                className="absolute top-3 right-3 w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-sm">
                💬
              </button>
            )}

            {/* Inline conversation overlay */}
            {isActive && showRecChat && (
              <div className="absolute top-12 right-3 w-64 bg-gray-900/95 rounded-xl border border-gray-700 p-3 max-h-60 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-4">Start speaking…</p>
                ) : messages.map((m, i) => (
                  <div key={i} className={`text-xs rounded-lg px-2.5 py-2 mb-1.5 ${
                    m.role === 'user' ? 'bg-green-900/50 text-green-200' : 'bg-gray-800 text-gray-200'
                  }`}>
                    <span className="font-semibold">{m.role === 'user' ? 'You' : activePersona?.name}: </span>
                    {m.content}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3 shrink-0">
            {!isActive && !isBusy ? (
              <button onClick={() => startSession(activePersona)}
                disabled={!activePersona || isBusy}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm transition-colors">
                {status === 'error' ? '🔄 Retry' : '▶ Start Session'}
              </button>
            ) : (
              <>
                <button onClick={stopSession} disabled={isBusy}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 font-semibold text-sm transition-colors">
                  ⏹ Stop
                </button>
                <button onClick={toggleMute} disabled={isBusy}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isMuted ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}>
                  {isMuted ? '🔇' : '🎙️'}
                </button>
                {isActive && (
                  <button onClick={isRecording ? stopRecording : startRecording}
                    className={`px-5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isRecording ? 'bg-red-700 hover:bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                    }`}>
                    {isRecording ? '⏹ Stop Rec' : '⏺ Record'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Persona Builder Modal ── */}
      <Modal open={showBuilder} onClose={() => { setShowBuilder(false); setBuilderStep(0); }}
        title={editingPersona ? 'Edit Persona' : 'Create New Persona'}>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Platform', 'Genre', 'Details', 'Avatar & Voice'].map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i <= builderStep ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'
              }`}>{i + 1}</div>
              <span className={`text-xs hidden sm:block ${i === builderStep ? 'text-white' : 'text-gray-600'}`}>{s}</span>
              {i < 3 && <div className={`flex-1 h-px ${i < builderStep ? 'bg-blue-600' : 'bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Platform */}
        {builderStep === 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-4">Choose your content platform</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PLATFORMS).map(([key, cfg]) => (
                <button key={key} onClick={() => setDraft(d => ({ ...d, platform: key, genre: '' }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    draft.platform === key ? `${cfg.border} bg-gradient-to-br ${cfg.color} bg-opacity-20` : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  }`}>
                  <div className="text-2xl mb-1">{cfg.icon}</div>
                  <p className="font-semibold text-sm">{cfg.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Genre */}
        {builderStep === 1 && (
          <div>
            <p className="text-sm text-gray-400 mb-4">Select your content genre</p>
            {PLATFORMS[draft.platform].genres.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS[draft.platform].genres.map(g => (
                  <button key={g} onClick={() => setDraft(d => ({ ...d, genre: g }))}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition-all text-left ${
                      draft.genre === g ? 'border-blue-500 bg-blue-600/20 text-white' : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <input value={draft.genre} onChange={e => setDraft(d => ({ ...d, genre: e.target.value }))}
                  placeholder="Enter your genre or content type..."
                  className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none" />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {builderStep === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Persona Name *</label>
              <input value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                placeholder="e.g. Aria, Max, TechBot..."
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Description</label>
              <input value={draft.description} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                placeholder="Brief description of this persona..."
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1.5">Custom Instructions (optional)</label>
              <textarea value={draft.customInstructions} onChange={e => setDraft(d => ({ ...d, customInstructions: e.target.value }))}
                placeholder={`Extra personality traits, speaking style, topics to cover...\n\nBase prompt will be built automatically for ${PLATFORMS[draft.platform].label}.`}
                rows={4}
                className="w-full bg-gray-800 text-gray-200 text-sm rounded-xl px-4 py-3 resize-none border border-gray-700 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
              <p className="text-xs font-medium text-gray-400 mb-1">Preview System Prompt</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {buildSystemPrompt(draft.platform, draft.genre, draft.customInstructions).slice(0, 200)}...
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Avatar & Voice */}
        {builderStep === 3 && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">Select Avatar</p>
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {avatars.map(av => (
                  <button key={av.id} onClick={() => setDraft(d => ({ ...d, avatarId: av.id }))}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                      draft.avatarId === av.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-500'
                    }`}>
                    {av.thumbnailUrl
                      ? <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-2xl">👤</div>}
                    {draft.avatarId === av.id && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <span className="text-white text-lg">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">Select Voice</p>
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {voices.map(v => (
                  <button key={v.id} onClick={() => setDraft(d => ({ ...d, voiceId: v.id }))}
                    className={`text-left px-3 py-2 rounded-xl border text-sm transition-all ${
                      draft.voiceId === v.id ? 'border-blue-500 bg-blue-600/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}>
                    <span className="font-medium">{v.name || v.id}</span>
                    {v.gender && <span className="text-xs text-gray-400 ml-2">{v.gender}</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">AI Brain</p>
              <div className="flex gap-2">
                {LLM_OPTIONS.map(llm => (
                  <button key={llm.id} onClick={() => setDraft(d => ({ ...d, llmId: llm.id }))}
                    className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                      draft.llmId === llm.id ? 'border-blue-500 bg-blue-600/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}>
                    {llm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal nav buttons */}
        <div className="flex gap-3 mt-6">
          {builderStep > 0 && (
            <button onClick={() => setBuilderStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-sm font-semibold hover:bg-gray-800 transition-colors">
              ← Back
            </button>
          )}
          {builderStep < 3 ? (
            <button onClick={() => setBuilderStep(s => s + 1)}
              disabled={builderStep === 2 && !draft.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-semibold transition-colors">
              Next →
            </button>
          ) : (
            <button onClick={savePersona}
              disabled={!draft.name.trim() || !draft.avatarId || !draft.voiceId}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-40 text-sm font-semibold transition-colors">
              {editingPersona ? '✓ Save Changes' : '✓ Create Persona'}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}