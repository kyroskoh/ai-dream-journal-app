
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { AppState, DreamData } from './types';
import DreamRecorder from './components/DreamRecorder';
import DreamDisplay from './components/DreamDisplay';
import DreamChat from './components/DreamChat';
import Loader from './components/Loader';
import { generateDreamImage, interpretDream } from './services/geminiService';
import { LogoIcon, SearchIcon } from './components/icons';
import LanguageSelector from './components/LanguageSelector';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [dreamHistory, setDreamHistory] = useState<DreamData[]>([]);
  const [currentDream, setCurrentDream] = useState<DreamData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('English');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedDreams = localStorage.getItem('dreamHistory');
      if (savedDreams) {
        setDreamHistory(JSON.parse(savedDreams));
      }
    } catch (err) {
      console.error("Failed to load dreams from local storage:", err);
      setError("Could not load your dream history.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('dreamHistory', JSON.stringify(dreamHistory));
    } catch (err) {
      console.error("Failed to save dreams to local storage:", err);
      setError("There was a problem saving your latest dream.");
    }
  }, [dreamHistory]);
  
  const filteredDreams = useMemo(() => {
    if (!searchQuery.trim()) {
      return dreamHistory;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return dreamHistory.filter(dream => {
        const inTranscription = dream.transcription.toLowerCase().includes(lowercasedQuery);
        const inTags = dream.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery));
        return inTranscription || inTags;
    });
  }, [dreamHistory, searchQuery]);

  const handleRecordingStart = () => {
    setAppState(AppState.RECORDING);
    setError(null);
    setCurrentDream(null);
  };

  const handleRecordingFinish = useCallback(async (transcription: string) => {
    if (!transcription.trim()) {
      setError("The dream transcription was empty. Please try recording again.");
      setAppState(AppState.IDLE);
      return;
    }

    setAppState(AppState.PROCESSING);
    try {
      const [imageUrl, interpretation] = await Promise.all([
        generateDreamImage(transcription, language),
        interpretDream(transcription, language),
      ]);

      const newDream: DreamData = {
        id: new Date().toISOString(),
        date: new Date().toISOString(),
        transcription,
        imageUrl,
        interpretation,
        tags: [],
        language,
      };
      
      setDreamHistory(prev => [newDream, ...prev]);
      setCurrentDream(newDream);
      setAppState(AppState.DISPLAYING);

    } catch (err) {
      console.error(err);
      setError("An error occurred while analyzing your dream. Please try again.");
      setAppState(AppState.IDLE);
    }
  }, [language]);
  
  const handleReturnToJournal = () => {
    setAppState(AppState.IDLE);
    setCurrentDream(null);
    setError(null);
  };

  const handleViewDream = (dream: DreamData) => {
    setCurrentDream(dream);
    setAppState(AppState.DISPLAYING);
  };

  const handleUpdateTags = (dreamId: string, newTags: string[]) => {
    setDreamHistory(prev =>
      prev.map(dream => (dream.id === dreamId ? { ...dream, tags: newTags } : dream))
    );
    if (currentDream?.id === dreamId) {
      setCurrentDream(prev => (prev ? { ...prev, tags: newTags } : null));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 selection:bg-purple-500 selection:text-white">
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between p-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold tracking-wider text-white">AI Dream Journal</h1>
        </div>
        {appState === AppState.DISPLAYING && (
          <button
            onClick={handleReturnToJournal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300 font-semibold"
          >
            Return to Journal
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-6xl">
        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4 max-w-md text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {appState === AppState.IDLE && (
          <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-2 text-purple-300">Your Dream Archive</h2>
                <p className="text-lg text-gray-400">Search your past dreams or record a new one.</p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="relative flex-grow w-full">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"/>
                    <input 
                        type="text"
                        placeholder="Search by keyword or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
                <DreamRecorder onRecordingStart={handleRecordingStart} onRecordingFinish={handleRecordingFinish} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDreams.map(dream => (
                    <div key={dream.id} onClick={() => handleViewDream(dream)} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer group transition-transform hover:scale-105 duration-300">
                        <img src={dream.imageUrl} alt="Dream visualization" className="w-full h-48 object-cover"/>
                        <div className="p-4">
                            <p className="text-sm text-gray-400 mb-2">{new Date(dream.date).toLocaleDateString()}</p>
                            <p className="text-gray-300 truncate">{dream.transcription}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {dream.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             {filteredDreams.length === 0 && (
                <div className="text-center col-span-full py-16">
                    <p className="text-gray-500">{searchQuery ? 'No dreams match your search.' : 'Your journal is empty. Record your first dream!'}</p>
                </div>
            )}
          </div>
        )}

        {appState === AppState.RECORDING && (
           <div className="text-center">
             <h2 className="text-4xl font-bold mb-2 text-purple-300 animate-pulse">Listening...</h2>
             <p className="text-lg text-gray-400 mb-8">Speak freely in {language}. Your dream is being transcribed.</p>
             <DreamRecorder onRecordingStart={() => {}} onRecordingFinish={handleRecordingFinish} isRecordingExternally={true} />
           </div>
        )}

        {appState === AppState.PROCESSING && <Loader />}
        
        {appState === AppState.DISPLAYING && currentDream && (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <DreamDisplay dreamData={currentDream} onUpdateTags={(newTags) => handleUpdateTags(currentDream.id, newTags)} />
            <DreamChat dreamData={currentDream} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;