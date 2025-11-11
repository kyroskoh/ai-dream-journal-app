
import React from 'react';
import { DreamData } from '../types';

interface DreamDisplayProps {
  dreamData: DreamData;
}

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dreamData }) => {
  // A simple markdown-to-html converter
  const renderMarkdown = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 flex flex-col space-y-6 h-full max-h-[85vh] overflow-y-auto backdrop-blur-sm border border-gray-700/50">
      <div>
        <h2 className="text-2xl font-bold text-purple-300 mb-4">The Canvas of Your Mind</h2>
        <img 
          src={dreamData.imageUrl} 
          alt="Surrealist representation of the dream" 
          className="w-full rounded-lg object-cover shadow-2xl shadow-purple-900/20"
        />
      </div>
      
      <div className="space-y-4">
        <div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Dream Transcription</h3>
            <p className="text-gray-300 italic bg-black/20 p-4 rounded-lg">"{dreamData.transcription}"</p>
        </div>
        <div>
            <h3 className="text-xl font-semibold text-purple-300 mb-2">Psychological Interpretation</h3>
            <div 
              className="text-gray-300 space-y-3 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(dreamData.interpretation) }}
            />
        </div>
      </div>
    </div>
  );
};

export default DreamDisplay;
