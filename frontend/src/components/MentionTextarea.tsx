import { useState, useRef } from 'react';

interface Candidate {
  id: string;
  name: string;
}

export function MentionTextarea({
  value,
  onChange,
  candidates,
  onMention,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  candidates: Candidate[];
  onMention: (userId: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [suggestions, setSuggestions] = useState<Candidate[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    onChange(text);

    // Cari "@" terakhir sebelum posisi kursor, tanpa spasi di antaranya
    const beforeCursor = text.slice(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    if (atIndex !== -1 && !beforeCursor.slice(atIndex).includes(' ') && atIndex !== cursorPos - 1) {
      const query = beforeCursor.slice(atIndex + 1).toLowerCase();
      const matches = candidates.filter((c) => c.name.toLowerCase().includes(query));
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else if (atIndex === cursorPos - 1) {
      // Baru saja ngetik "@" doang
      setSuggestions(candidates);
      setShowSuggestions(candidates.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function handleSelectMention(candidate: Candidate) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart;
    const beforeCursor = value.slice(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    const newText = value.slice(0, atIndex) + `@${candidate.name} ` + value.slice(cursorPos);
    onChange(newText);
    onMention(candidate.id);
    setShowSuggestions(false);
    setTimeout(() => textarea.focus(), 0);
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
      />
      {showSuggestions && (
        <div className="absolute left-0 bottom-full mb-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10 py-1 max-h-40 overflow-y-auto">
          {suggestions.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelectMention(c)}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              @{c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
