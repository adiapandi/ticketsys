import { useEffect, useRef, useState } from 'react';
import { ticketsApi } from '../api/tickets';
import { tagsApi, Tag } from '../api/tags';
import { TagBadge } from './TagBadge';

export function TagEditor({
  ticketId,
  tags,
  onChange,
}: {
  ticketId: string;
  tags: { id: string; name: string }[];
  onChange: () => void;
}) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [adding, setAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    tagsApi.list().then((res) => setAllTags(res.data));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleInputChange(value: string) {
    setInput(value);
    if (value.trim()) {
      const existingNames = new Set(tags.map((t) => t.name.toLowerCase()));
      setSuggestions(
        allTags.filter(
          (t) => t.name.toLowerCase().includes(value.toLowerCase()) && !existingNames.has(t.name.toLowerCase()),
        ),
      );
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  async function handleAddTag(name: string) {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await ticketsApi.addTag(ticketId, name.trim());
      setInput('');
      setShowSuggestions(false);
      onChange();
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveTag(tagId: string) {
    await ticketsApi.removeTag(ticketId, tagId);
    onChange();
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {tags.map((tag) => (
        <TagBadge key={tag.id} name={tag.name} onRemove={() => handleRemoveTag(tag.id)} />
      ))}

      <div className="relative" ref={containerRef}>
        <input
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag(input);
            }
          }}
          onFocus={() => input && setShowSuggestions(true)}
          disabled={adding}
          placeholder="+ tambah tag"
          className="text-xs px-2 py-1 border border-dashed border-slate-300 dark:border-slate-600 rounded-full bg-transparent text-slate-500 dark:text-slate-400 w-28 focus:outline-none focus:border-blue-400"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg z-10 py-1 max-h-40 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.name)}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
