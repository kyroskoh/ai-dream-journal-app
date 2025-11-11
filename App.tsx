
import React, { useState, useCallback } from 'react';
import { AppState, DreamData } from './types';
import DreamRecorder from './components/DreamRecorder';
import DreamDisplay from './components/DreamDisplay';
import DreamChat from './components/DreamChat';
import Loader from './components/Loader';
import { generateDreamImage, interpretDream } from './services/geminiService';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingStart = () => {
    setAppState(AppState.RECORDING);
    setError(null);
    setDreamData(null);
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
        generateDreamImage(transcription),
        interpretDream(transcription),
      ]);

      setDreamData({
        transcription,
        imageUrl,
        interpretation,
      });
      setAppState(AppState.DISPLAYING);
    } catch (err) {
      console.error(err);
      setError("An error occurred while analyzing your dream. Please try again.");
      setAppState(AppState.IDLE);
    }
  }, []);
  
  const handleReset = () => {
    setAppState(AppState.IDLE);
    setDreamData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 selection:bg-purple-500 selection:text-white">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold tracking-wider text-white">AI Dream Journal</h1>
        </div>
        {appState === AppState.DISPLAYING && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300 font-semibold"
          >
            Record New Dream
          </button>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-center w-full">
        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4 max-w-md text-center" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        {appState === AppState.IDLE && (
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2 text-purple-300">Unlock Your Subconscious</h2>
            <p className="text-lg text-gray-400 mb-8">Press the button and describe your dream. Let AI reveal its secrets.</p>
            <DreamRecorder onRecordingStart={handleRecordingStart} onRecordingFinish={handleRecordingFinish} />
          </div>
        )}

        {appState === AppState.RECORDING && (
           <div className="text-center">
             <h2 className="text-4xl font-bold mb-2 text-purple-300 animate-pulse">Listening...</h2>
             <p className="text-lg text-gray-400 mb-8">Speak freely. Your dream is being transcribed.</p>
             <DreamRecorder onRecordingStart={handleRecordingStart} onRecordingFinish={handleRecordingFinish} isRecordingExternally={true} />
           </div>
        )}

        {appState === AppState.PROCESSING && <Loader />}
        
        {appState === AppState.DISPLAYING && dreamData && (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
            <DreamDisplay dreamData={dreamData} />
            <DreamChat dreamData={dreamData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
