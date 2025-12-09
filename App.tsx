import React, { useState } from 'react';
import { MemeConfig } from './types';
import Controls from './components/Controls';
import CanvasMeme from './components/CanvasMeme';
import { Smile } from 'lucide-react';

const App: React.FC = () => {
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [config, setConfig] = useState<MemeConfig>({
    topText: '',
    bottomText: '',
    fontSize: 40,
    textColor: '#FFFFFF',
    strokeColor: '#000000'
  });

  const handleImageSelect = (url: string) => {
    setCurrentImageSrc(url);
    // Reset text when new image is loaded for a fresh start, optional
    // setConfig(prev => ({ ...prev, topText: '', bottomText: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-2 rounded-lg">
            <Smile className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              MemeGen AI
            </h1>
            <p className="text-xs text-slate-500">Powered by Gemini 2.5</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        
        {/* Left: Controls */}
        <div className="lg:col-span-4 h-full overflow-hidden">
          <Controls 
            config={config} 
            setConfig={setConfig} 
            onImageSelect={handleImageSelect}
            currentImageSrc={currentImageSrc}
          />
        </div>

        {/* Right: Canvas / Preview */}
        <div className="lg:col-span-8 h-full bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-center p-8 overflow-y-auto">
          <CanvasMeme 
            imageSrc={currentImageSrc}
            config={config}
          />
        </div>

      </main>
    </div>
  );
};

export default App;