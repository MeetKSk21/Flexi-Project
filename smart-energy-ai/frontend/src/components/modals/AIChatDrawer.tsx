import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m_1",
    sender: "assistant",
    text: "Hello! I am your Autonomous Energy Advisor powered by the SmartEnergy 6-Agent AI system. How can I help you optimize your power, battery storage, or electricity bills today?",
    timestamp: "Just Now"
  }
];

const SUGGESTIONS = [
  "How can I cut my bill by 20%?",
  "Explain today's peak anomaly",
  "Is it optimal to charge my EV now?",
  "How is my solar and battery performing?"
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  currencySymbol = "₹"
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: "u_" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: "a_" + Date.now(),
          sender: "assistant",
          text: data.reply || "I have updated your optimization metrics.",
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error("Chat response failed");
      }
    } catch {
      // Local fallback advisor response
      let fallbackText = `Based on your telemetry, deferring your EV charger to 02:00 AM and running your washer at midday will save approximately ${currencySymbol}420 every month.`;
      if (query.toLowerCase().includes("anomaly")) {
        fallbackText = "Our Isolation Forest algorithm detected an unusual HVAC compressor surge earlier today. Smart relays isolated the secondary loop to protect your electrical panel.";
      } else if (query.toLowerCase().includes("ev") || query.toLowerCase().includes("charge")) {
        fallbackText = `Your EV is currently held in standby. The lowest tariff window opens tonight at 02:00 (${currencySymbol}3.00/kWh off-peak).`;
      }

      const aiMsg: ChatMessage = {
        id: "a_" + Date.now(),
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface-container-low border-l border-outline-variant/30 shadow-2xl flex flex-col h-full z-10">
        {/* Header */}
        <div className="p-4 bg-surface-container-high border-b border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface">AI Energy Advisor</h3>
              <p className="text-[11px] text-cyan-bright font-medium">Coordinator Multi-Agent Brain</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="p-3 bg-surface-container/50 border-b border-outline-variant/20 flex gap-2 overflow-x-auto no-scrollbar">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="px-2.5 py-1 rounded-full bg-surface-container-highest hover:bg-cyan-bright/20 hover:text-cyan-bright transition-all text-[11px] font-medium text-on-surface-variant whitespace-nowrap cursor-pointer border border-outline-variant/30"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-primary text-on-primary rounded-tr-none shadow-md'
                      : 'bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-tl-none shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                <span className="text-[10px] text-on-surface-variant/70 mt-1 px-1">
                  {m.timestamp}
                </span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 p-3 bg-surface-container-high rounded-xl w-24 border border-outline-variant/30">
              <span className="w-2 h-2 rounded-full bg-cyan-bright animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-bright animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-cyan-bright animate-bounce [animation-delay:0.4s]"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-surface-container-high border-t border-outline-variant/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about your home energy..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-xs text-on-surface focus:outline-none focus:border-cyan-bright transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-cyan-bright transition-all disabled:opacity-40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
