import React, { useEffect, useRef } from 'react';
import { User, Bot, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConversationTurn, UploadedImage } from '../types';

interface ChatHistoryProps {
  conversations: ConversationTurn[];
  isLoading: boolean;
  uploadedImage?: UploadedImage | null;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ conversations, isLoading, uploadedImage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, isLoading]);

  // Empty state
  if (conversations.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-sm fade-in">
          {/* Animated icon */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-2xl opacity-20" style={{ background: 'var(--gradient-primary)', filter: 'blur(16px)' }} />
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">Start a Conversation</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {uploadedImage 
              ? 'Your image is ready! Ask anything about it — try identifying objects, describing scenes, or asking specific questions.'
              : 'Upload an image first, then ask questions about it in natural language.'
            }
          </p>

          {uploadedImage && (
            <div className="space-y-2">
              {['What do you see in this image?', 'Describe this scene in detail', 'What objects are present?'].map((suggestion) => (
                <div
                  key={suggestion}
                  className="px-4 py-2.5 rounded-xl text-xs text-gray-400 font-medium cursor-default"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  "{suggestion}"
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto p-6 space-y-5"
    >
      {conversations.map((turn, index) => (
        <div
          key={index}
          className={`flex gap-3 ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {/* AI Avatar */}
          {turn.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1" style={{ background: 'var(--gradient-primary)' }}>
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          
          {/* Message Bubble */}
          <div className={`max-w-[75%] ${turn.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
            <div className="px-4 py-3">
              {turn.role === 'user' ? (
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{turn.content}</p>
              ) : (
                <div className="text-[13px] leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{turn.content}</ReactMarkdown>
                </div>
              )}
              <p className="text-[10px] opacity-40 mt-2 font-medium">
                {turn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* User Avatar */}
          {turn.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <User className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      ))}
      
      {/* Typing Indicator */}
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1" style={{ background: 'var(--gradient-primary)' }}>
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="msg-ai">
            <div className="px-5 py-4 flex items-center gap-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;