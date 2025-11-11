
import React, { useState, useEffect, useRef } from 'react';
import { DreamData, ChatMessage } from '../types';
import { createDreamChat, sendMessage } from '../services/geminiService';
import { Chat } from '@google/genai';
import { SendIcon } from './icons';

interface DreamChatProps {
  dreamData: DreamData;
}

const DreamChat: React.FC<DreamChatProps> = ({ dreamData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dreamData) {
      chatRef.current = createDreamChat(dreamData.transcription, dreamData.interpretation, dreamData.language);
      setMessages([
        { role: 'model', text: 'Ask me anything about your dream.' }
      ]);
    }
  }, [dreamData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage(chatRef.current, userInput);
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl flex flex-col h-full max-h-[85vh] backdrop-blur-sm border border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50">
        <h2 className="text-2xl font-bold text-purple-300">Explore Further</h2>
        <p className="text-sm text-gray-400">Ask about symbols, characters, or feelings.</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                    <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></span>
                    </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700/50">
        <div className="flex items-center bg-gray-900 rounded-lg">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., What does water symbolize?"
            className="w-full bg-transparent p-3 focus:outline-none"
            disabled={isLoading}
          />
          <button type="submit" className="p-3 text-purple-400 hover:text-purple-300 disabled:text-gray-600" disabled={isLoading || !userInput.trim()}>
            <SendIcon className="w-6 h-6"/>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DreamChat;