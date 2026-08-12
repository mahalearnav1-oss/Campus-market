import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ initialValue = '', onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('campusmarket_search_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      const updated = [query, ...history.filter((h) => h !== query)].slice(0, 5);
      setHistory(updated);
      try {
        localStorage.setItem('campusmarket_search_history', JSON.stringify(updated));
      } catch (e) {
        // Ignore
      }
    }
    setShowHistory(false);
    onSearch(query);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const selectHistoryItem = (item: string) => {
    setSearchTerm(item);
    setShowHistory(false);
    onSearch(item);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex items-center bg-[#EDE5D9] rounded-2xl border border-[#D6C8B8] p-2 shadow-warm-subtle backdrop-blur-xl">
        <div className="pl-3 pointer-events-none text-[#8B7562]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          type="text"
          value={searchTerm}
          onFocus={() => setShowHistory(true)}
          onBlur={() => setTimeout(() => setShowHistory(false), 150)}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author, ISBN, or course code…"
          className="w-full pl-3 pr-28 py-2.5 bg-transparent text-sm font-sans text-[#3B2A22] placeholder-[#8B7562] focus:outline-none"
        />

        <div className="absolute right-2 flex items-center gap-2">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="font-sans text-[10px] tracking-wider uppercase text-[#8B7562] hover:text-[#3B2A22] px-2 py-1 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="btn-primary text-xs font-semibold uppercase px-5 py-2.5 !rounded-xl"
          >
            Search
          </button>
        </div>
      </form>

      {/* Recent search history dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#EDE5D9] border border-[#D6C8B8] rounded-2xl shadow-2xl z-30 overflow-hidden backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#D6C8B8]">
            <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#8B7562] font-semibold">Recent Searches</span>
            <button
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('campusmarket_search_history');
              }}
              className="font-sans text-[9px] tracking-wider uppercase text-[#8B7562] hover:text-[#3B2A22] transition-colors"
            >
              Clear History
            </button>
          </div>
          {history.map((item) => (
            <button
              key={item}
              onClick={() => selectHistoryItem(item)}
              className="w-full text-left px-4 py-2.5 text-xs font-sans text-[#3B2A22] hover:text-[#8B6A4F] hover:bg-[#E7DED1] transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B7562]">
                <polyline points="12 8 12 12 14 14" />
                <path d="M3.05 11a9 9 0 1 1 .5 4" />
              </svg>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
