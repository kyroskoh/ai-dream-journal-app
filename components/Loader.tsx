
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Transcribing your dream...",
  "Consulting the collective unconscious...",
  "Painting your subconscious...",
  "Decoding the symbols...",
  "Unveiling the archetypes...",
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mb-6"></div>
      <div className="relative h-8 w-80 overflow-hidden">
        {loadingMessages.map((msg, index) => (
            <p
                key={index}
                className={`absolute w-full transition-transform duration-500 ease-in-out ${index === messageIndex ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                style={{ transform: `translateY(${(index - messageIndex) * 100}%)` }}
            >
                {msg}
            </p>
        ))}
      </div>
    </div>
  );
};

export default Loader;
