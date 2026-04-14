// components/VoicePicker.jsx
'use client';
import { useState, useRef } from 'react';

export default function VoicePicker({ voices, selectedVoice, onSelect, disabled }) {
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');   // all | male | female
  const [playing, setPlaying]     = useState(null);
  const audioRef = useRef(null);

  const filtered = voices.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                        (v.country || '').toLowerCase().includes(search.toLowerCase());
    const matchGender = filter === 'all' || v.gender === filter;
    return matchSearch && matchGender;
  });

  const playPreview = (voice) => {
    if (!voice.sampleUrl) return;
    if (playing === voice.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = voice.sampleUrl;
      audioRef.current.play().then(() => setPlaying(voice.id)).catch(() => {});
      audioRef.current.onended = () => setPlaying(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <audio ref={audioRef} className="hidden" />

      {/* Search + filter */}
      <div className="flex gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search voices..."
          className="flex-1 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
        />
        <div className="flex rounded-xl border border-gray-700 overflow-hidden">
          {['all', 'female', 'male'].map(g => (
            <button key={g} onClick={() => setFilter(g)}
              className={`px-2.5 py-2 text-xs font-medium transition-colors capitalize ${
                filter === g ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}>
              {g === 'all' ? '👥' : g === 'female' ? '👩' : '👨'}
            </button>
          ))}
        </div>
      </div>

      {/* Voice list */}
      <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">No voices match your search</p>
        ) : filtered.map(v => (
          <div key={v.id}
            onClick={() => !disabled && onSelect(v)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
              selectedVoice?.id === v.id
                ? 'border-purple-500 bg-purple-600/20'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}>

            {/* Gender icon */}
            <span className="text-lg shrink-0">
              {v.gender === 'female' ? '👩' : v.gender === 'male' ? '👨' : '🎙️'}
            </span>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{v.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {v.country && <span className="text-xs text-gray-500">{v.country}</span>}
                {v.provider && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    v.provider.toLowerCase().includes('eleven')
                      ? 'bg-orange-900/50 text-orange-300'
                      : 'bg-blue-900/50 text-blue-300'
                  }`}>{v.provider}</span>
                )}
              </div>
            </div>

            {/* Play preview */}
            {v.sampleUrl && (
              <button
                onClick={e => { e.stopPropagation(); playPreview(v); }}
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  playing === v.id ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                }`}>
                {playing === v.id ? '⏹' : '▶'}
              </button>
            )}

            {/* Selected check */}
            {selectedVoice?.id === v.id && (
              <span className="text-purple-400 text-sm shrink-0">✓</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600">{filtered.length} of {voices.length} voices</p>
    </div>
  );
}