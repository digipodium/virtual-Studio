// components/AvatarPicker.jsx
'use client';
import { useState } from 'react';

export default function AvatarPicker({ avatars, selectedAvatar, onSelect, disabled }) {
  const [search, setSearch] = useState('');

  const filtered = avatars.filter(av =>
    av.name.toLowerCase().includes(search.toLowerCase()) ||
    (av.variantName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search avatars..."
        className="w-full bg-gray-800 text-white text-xs rounded-xl px-3 py-2 border border-gray-700 focus:border-purple-500 focus:outline-none"
      />

      <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
        {filtered.map(av => (
          <button key={av.id}
            onClick={() => !disabled && onSelect(av)}
            disabled={disabled}
            className={`relative rounded-xl overflow-hidden border-2 aspect-square transition-all group ${
              selectedAvatar?.id === av.id
                ? 'border-purple-500 shadow-lg shadow-purple-500/30'
                : 'border-gray-700 hover:border-gray-500'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>

            {/* Avatar image — uses imageUrl from API */}
            {av.thumbnailUrl ? (
              <img src={av.thumbnailUrl} alt={av.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-3xl">👤</div>
            )}

            {/* Name overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1.5">
              <p className="text-white text-xs font-medium truncate text-center leading-tight">{av.name}</p>
              {av.variantName && (
                <p className="text-gray-400 text-xs truncate text-center leading-tight">{av.variantName}</p>
              )}
            </div>

            {/* Selected badge */}
            {selectedAvatar?.id === av.id && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-600">{filtered.length} of {avatars.length} avatars</p>
    </div>
  );
}