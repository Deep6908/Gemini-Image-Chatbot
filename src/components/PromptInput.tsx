import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled: boolean;
  isLoading: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, disabled, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !disabled) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Upload an image to start..." : "Ask about the image... (Shift+Enter for new line)"}
          className="input-glow w-full px-4 py-3 rounded-xl text-[13px] text-white placeholder-gray-500 resize-none leading-relaxed"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
          rows={1}
          disabled={disabled}
        />
      </div>
      
      <button
        type="submit"
        disabled={disabled || !prompt.trim() || isLoading}
        className="btn-gradient flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
      >
        {isLoading ? (
          <Loader2 className="w-4.5 h-4.5 animate-spin text-white" />
        ) : (
          <Send className="w-4.5 h-4.5 text-white" />
        )}
      </button>
    </form>
  );
};

export default PromptInput;