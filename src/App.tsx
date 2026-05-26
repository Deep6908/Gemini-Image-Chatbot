import React, { useState, useCallback } from 'react';
import { Image as ImageIcon, MessageSquare, Sparkles, X, AlertCircle, Zap, Eye } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ChatHistory from './components/ChatHistory';
import PromptInput from './components/PromptInput';
import { ConversationTurn, UploadedImage } from './types';
import { analyzeImageWithGemini } from './services/geminiService';

function App() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [apiKeyMissing] = useState(!import.meta.env.VITE_GEMINI_API_KEY);

  const handleImageUpload = useCallback((file: File, dataUrl: string) => {
    setUploadedImage({ file, dataUrl });
    setConversationHistory([]);
  }, []);

  const removeImage = useCallback(() => {
    setUploadedImage(null);
    setConversationHistory([]);
  }, []);

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!uploadedImage) {
      alert('Please upload an image first!');
      return;
    }

    setIsLoading(true);

    const userMessage: ConversationTurn = {
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const historyForAPI = conversationHistory.map(turn => ({
        role: turn.role === 'assistant' ? 'model' as const : 'user' as const,
        content: turn.content,
      }));

      const aiResponse = await analyzeImageWithGemini(
        uploadedImage.file,
        prompt,
        historyForAPI
      );

      const aiMessage: ConversationTurn = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setConversationHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      const errorText = error instanceof Error
        ? error.message
        : 'An unexpected error occurred while analyzing the image. Please try again.';

      const errorMessage: ConversationTurn = {
        role: 'assistant',
        content: `⚠️ ${errorText}`,
        timestamp: new Date(),
      };

      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, conversationHistory]);

  return (
    <div className="h-screen flex flex-col relative">
      {/* Animated Background Mesh */}
      <div className="bg-mesh" />

      {/* ─── Header Bar ─── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ background: 'rgba(10, 10, 26, 0.4)' }}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-purple-400" />
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Gemini Vision</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-wider">Ready</span>
          </div>
        </div>
      </header>

      {/* ─── API Key Warning ─── */}
      {apiKeyMissing && (
        <div className="relative z-10 mx-4 mt-3 fade-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200/80">
              Set <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-amber-500/10 text-amber-300">VITE_GEMINI_API_KEY</code> in your <code className="px-1.5 py-0.5 rounded text-xs font-mono bg-amber-500/10 text-amber-300">.env</code> file. 
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="ml-1 text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">Get a free key →</a>
            </p>
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <main className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel — Image */}
        <div className="w-[380px] flex-shrink-0 border-r border-white/[0.06] flex flex-col" style={{ background: 'rgba(10, 10, 26, 0.4)' }}>
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="icon-badge">
                <ImageIcon className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Image Upload</h2>
                <p className="text-[11px] text-gray-500">JPG, PNG — Max 20MB</p>
              </div>
            </div>
          </div>

          {/* Image Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            <ImageUpload 
              onImageUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              onRemoveImage={removeImage}
              onImageClick={() => setShowImageModal(true)}
            />
          </div>

          {/* Capabilities Section */}
          {!uploadedImage && (
            <div className="p-4 border-t border-white/[0.06] fade-in">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Capabilities</p>
              <div className="space-y-2">
                {[
                  { icon: Eye, label: 'Object Identification', color: 'text-purple-400' },
                  { icon: MessageSquare, label: 'Scene Description', color: 'text-blue-400' },
                  { icon: Zap, label: 'Visual Reasoning', color: 'text-cyan-400' },
                  { icon: Sparkles, label: 'Contextual Q&A', color: 'text-emerald-400' },
                ].map((cap) => (
                  <div key={cap.label} className="flex items-center gap-2.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <cap.icon className={`w-3.5 h-3.5 ${cap.color}`} />
                    <span className="text-xs text-gray-400 font-medium">{cap.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel — Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-white/[0.06]" style={{ background: 'rgba(10, 10, 26, 0.3)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="icon-badge">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Conversation</h2>
                  <p className="text-[11px] text-gray-500">
                    {conversationHistory.length === 0 
                      ? 'Upload an image to begin' 
                      : `${Math.ceil(conversationHistory.length / 2)} exchange${Math.ceil(conversationHistory.length / 2) !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              {conversationHistory.length > 0 && (
                <button
                  onClick={() => setConversationHistory([])}
                  className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(255,255,255,0.04)' }}
                >
                  Clear chat
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-hidden">
            <ChatHistory 
              conversations={conversationHistory}
              isLoading={isLoading}
              uploadedImage={uploadedImage}
            />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/[0.06]" style={{ background: 'rgba(10, 10, 26, 0.5)' }}>
            <PromptInput 
              onSubmit={handleSubmit}
              disabled={!uploadedImage || isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* ─── Image Modal ─── */}
      {showImageModal && uploadedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-8 modal-backdrop"
          style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-full modal-content" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={uploadedImage.dataUrl}
              alt="Uploaded image full size"
              className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;