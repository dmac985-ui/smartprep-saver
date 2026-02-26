import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function ChatInput({ onSend, isLoading, placeholder }) {
  const [message, setMessage] = useState('');
  const [personality, setPersonality] = useState(() => localStorage.getItem('chatPersonality') || 'default');
  const [responseLength, setResponseLength] = useState(() => localStorage.getItem('chatResponseLength') || 'medium');

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('chatPersonality', personality);
  }, [personality]);

  useEffect(() => {
    localStorage.setItem('chatResponseLength', responseLength);
  }, [responseLength]);

  // Personality presets
  const personalities = {
    default: "",
    concise: "Respond very concisely and directly. Use short sentences. No unnecessary explanations.",
    coach: "Act like an energetic, motivational coach. Use encouraging language, emojis, and positive reinforcement.",
    strict: "Be strict, scientific, and no-nonsense. Focus on facts, evidence, and direct advice. No fluff.",
    humorous: "Be witty and add light, appropriate humor when it fits. Keep responses fun and engaging.",
    budget: "Always prioritize budget-saving tips, cheaper alternatives, and cost comparisons in every answer."
  };

  // Response length instructions
  const lengthInstructions = {
    short: "Keep your response short and to the point. Under 100 words if possible.",
    medium: "Give clear, balanced answers with useful detail.",
    detailed: "Provide thorough, step-by-step explanations and extra context when helpful."
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    // Build the enhanced prompt with personality + length
    const stylePrefix = personalities[personality] ? `${personalities[personality]}\n` : '';
    const lengthPrefix = lengthInstructions[responseLength] ? `${lengthInstructions[responseLength]}\n\n` : '';

    const fullMessage = `${stylePrefix}${lengthPrefix}User: ${message.trim()}`;

    onSend(fullMessage);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Customization Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 dark:text-slate-400">Chatbot Style</Label>
          <Select value={personality} onValueChange={setPersonality}>
            <SelectTrigger className="h-10 text-sm rounded-xl border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30">
              <SelectValue placeholder="Choose style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default (helpful & friendly)</SelectItem>
              <SelectItem value="concise">Concise & direct</SelectItem>
              <SelectItem value="coach">Motivational coach</SelectItem>
              <SelectItem value="strict">Strict nutritionist</SelectItem>
              <SelectItem value="humorous">Witty & humorous</SelectItem>
              <SelectItem value="budget">Budget-focused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500 dark:text-slate-400">Response Length</Label>
          <Select value={responseLength} onValueChange={setResponseLength}>
            <SelectTrigger className="h-10 text-sm rounded-xl border-slate-300 dark:border-slate-600 focus:border-emerald-500 focus:ring-emerald-500/30">
              <SelectValue placeholder="Choose length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Message Input */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask me to create a meal plan, find deals, or anything else..."}
            className="min-h-[56px] max-h-[200px] resize-none pr-4 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 bg-white shadow-sm"
            rows={1}
          />
        </div>
        <Button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="h-14 w-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </form>
  );
}