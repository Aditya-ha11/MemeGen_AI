import React, { useState } from 'react';
import { MemeConfig, GeneratorMode, CaptionSuggestion } from '../types';
import { generateMemeImage, generateMemeCaptions, generateCaptionsForImage } from '../services/geminiService';
import { Wand2, ImagePlus, Type, Loader2, Sparkles, Upload } from 'lucide-react';

interface ControlsProps {
  config: MemeConfig;
  setConfig: React.Dispatch<React.SetStateAction<MemeConfig>>;
  onImageSelect: (url: string, isBase64: boolean) => void;
  currentImageSrc: string | null;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig, onImageSelect, currentImageSrc }) => {
  const [activeTab, setActiveTab] = useState<GeneratorMode>(GeneratorMode.AI_GENERATE);
  const [prompt, setPrompt] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);

  const handleImageGenerate = async () => {
    if (!prompt) return;
    setIsLoading(true);
    try {
      const base64Image = await generateMemeImage(prompt);
      onImageSelect(base64Image, true);
    } catch (e) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string, true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionGenerate = async () => {
    // If we have an image, we can do multimodal captioning
    // If not, we rely on the topic text
    setIsCaptionLoading(true);
    try {
      let suggestions: CaptionSuggestion[] = [];
      
      if (currentImageSrc && !topic) {
        // Multimodal: Look at image
        // Extract base64 mime type if possible, assume png if unknown for simplicity or parse
        // Our service handles split
        suggestions = await generateCaptionsForImage(currentImageSrc, 'image/png');
      } else if (topic) {
        // Text-based generation
        suggestions = await generateMemeCaptions(topic);
      } else if (currentImageSrc) {
        // Fallback if user didn't type topic but has image
        suggestions = await generateCaptionsForImage(currentImageSrc, 'image/png');
      }

      if (suggestions.length > 0) {
        // Pick the first one automatically, or could show list. 
        // For simplicity, let's just cycle or pick random? Let's pick first.
        setConfig(prev => ({
          ...prev,
          topText: suggestions[0].top,
          bottomText: suggestions[0].bottom
        }));
      }
    } catch (e) {
      alert("Could not generate captions.");
    } finally {
      setIsCaptionLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full flex flex-col gap-6 overflow-y-auto">
      
      {/* 1. Source Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ImagePlus className="text-blue-400" /> Image Source
        </h3>
        <div className="flex gap-2 p-1 bg-slate-900 rounded-lg">
          <button
            onClick={() => setActiveTab(GeneratorMode.AI_GENERATE)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === GeneratorMode.AI_GENERATE 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Generate
          </button>
          <button
            onClick={() => setActiveTab(GeneratorMode.UPLOAD)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === GeneratorMode.UPLOAD 
                ? 'bg-blue-600 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upload
          </button>
        </div>

        {activeTab === GeneratorMode.AI_GENERATE ? (
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A grumpy cat programming on a laptop in a futuristic city..."
              className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
            <button
              onClick={handleImageGenerate}
              disabled={isLoading || !prompt}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
              Generate Image
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-slate-750 transition-colors">
            <Upload className="text-slate-500 mb-2" size={32} />
            <span className="text-sm text-slate-400 mb-4">Upload your own image</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileUpload}
              className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        )}
      </div>

      <hr className="border-slate-700" />

      {/* 2. Caption Controls */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Type className="text-green-400" /> Text Editor
        </h3>
        
        {/* AI Caption Generator */}
        <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 space-y-2">
           <label className="text-xs font-semibold text-violet-400 flex items-center gap-1">
             <Sparkles size={12} /> AI CAPTION ASSISTANT
           </label>
           <div className="flex gap-2">
             <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={currentImageSrc ? "Topic (optional)..." : "Topic..."}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-violet-500"
             />
             <button 
                onClick={handleCaptionGenerate}
                disabled={isCaptionLoading || (!topic && !currentImageSrc)}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-md flex items-center gap-1 disabled:opacity-50"
             >
                {isCaptionLoading ? <Loader2 size={14} className="animate-spin"/> : "Suggest"}
             </button>
           </div>
           <p className="text-[10px] text-slate-500">
             {currentImageSrc 
               ? "Leave empty to let AI look at the image and decide." 
               : "Enter a topic to generate captions without an image."}
           </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">TOP TEXT</label>
            <input
              type="text"
              value={config.topText}
              onChange={(e) => setConfig({ ...config, topText: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
              placeholder="WHEN YOU..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">BOTTOM TEXT</label>
            <input
              type="text"
              value={config.bottomText}
              onChange={(e) => setConfig({ ...config, bottomText: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-sans"
              placeholder="BOTTOM TEXT"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">FONT SIZE</label>
            <input
              type="range"
              min="20"
              max="100"
              value={config.fontSize}
              onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
              className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
             <label className="block text-xs font-medium text-slate-400 mb-1">TEXT COLOR</label>
             <div className="flex gap-2">
                {['#FFFFFF', '#000000', '#FF0000', '#FFFF00'].map(c => (
                  <button
                    key={c}
                    onClick={() => setConfig({...config, textColor: c})}
                    className={`w-6 h-6 rounded-full border-2 ${config.textColor === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;