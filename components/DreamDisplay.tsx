
import React, { useState } from 'react';
import { DreamData } from '../types';
import { CloseIcon, TagIcon } from './icons';

interface DreamDisplayProps {
  dreamData: DreamData;
  onUpdateTags: (tags: string[]) => void;
}

const DreamDisplay: React.FC<DreamDisplayProps> = ({ dreamData, onUpdateTags }) => {
  const [tagInput, setTagInput] = useState('');

  // A simple markdown-to-html converter
  const renderMarkdown = (text: string) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !dreamData.tags.includes(newTag)) {
      onUpdateTags([...dreamData.tags, newTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(dreamData.tags.filter(tag => tag !== tagToRemove));
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
        <div>
          <h3 className="text-xl font-semibold text-purple-300 mb-2 flex items-center">
            <TagIcon className="w-5 h-5 mr-2"/>
            Tags
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {dreamData.tags.map(tag => (
              <span key={tag} className="flex items-center bg-purple-900/70 text-purple-200 px-3 py-1 rounded-full text-sm">
                {tag}
                <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-purple-300 hover:text-white">
                    <CloseIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <form onSubmit={handleAddTag} className="flex items-center gap-2">
            <input 
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">Add</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DreamDisplay;
