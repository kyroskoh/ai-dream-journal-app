
import React, { useState, useRef, useEffect } from 'react';
import { GlobeIcon } from './icons';

const supportedLanguages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Russian', 'Portuguese', 'Hindi'];

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (lang: string) => {
    onLanguageChange(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center h-12 w-12 md:w-auto md:px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full md:rounded-lg transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <GlobeIcon className="h-6 w-6 text-gray-400" />
        <span className="hidden md:inline md:ml-2 font-semibold">{currentLanguage}</span>
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 right-0 md:right-auto md:left-0">
          <ul className="py-1 max-h-60 overflow-y-auto">
            {supportedLanguages.map(lang => (
              <li key={lang}>
                <button
                  onClick={() => handleSelect(lang)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-600 ${currentLanguage === lang ? 'font-bold text-white' : 'text-gray-300'}`}
                >
                  {lang}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;