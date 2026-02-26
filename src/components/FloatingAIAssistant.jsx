import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, X, Loader2 } from "lucide-react";
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const { data: profiles } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => base44.entities.UserProfile.list('-created_date', 1),
  });

  const profile = profiles?.[0];
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    const initConversation = async () => {
      if (profile && !conversationId && isOpen) {
        const conv = await base44.agents.createConversation({
          agent_name: "meal_planner",
          metadata: { name: "AI Assistant Chat" }
        });
        setConversationId(conv.id);

        const healthGoals = Array.isArray(profile.health_goals) ? profile.health_goals.join(', ') : 'None';
        const allergies = Array.isArray(profile.allergies) ? profile.allergies.join(', ') : 'None';
        
        const initialMessage = `User Profile Context:
- Dietary Framework: ${profile.dietary_framework}
- Health Goals: ${healthGoals}
- Allergies: ${allergies}

Greet the user briefly and ask how you can help them with meal planning, nutrition advice, or finding deals.`;

        await base44.agents.addMessage(conv, {
          role: 'user',
          content: initialMessage
        });
      }
    };
    initConversation();
  }, [profile, conversationId, isOpen]);

  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      const messages = Array.isArray(data?.messages) ? data.messages : [];
      const displayMessages = messages.filter((m, idx) => 
        !(idx === 0 && m?.role === 'user' && m?.content?.includes('User Profile Context'))
      );
      setMessages(displayMessages || []);
      const hasRunningTools = messages && Array.isArray(messages) && messages.some(m => 
        m?.tool_calls && Array.isArray(m.tool_calls) && m.tool_calls.some(tc => tc?.status === 'running' || tc?.status === 'in_progress')
      );
      const lastMessageIsUser = messages && messages.length > 0 && messages[messages.length - 1]?.role === 'user';
      setIsLoading(hasRunningTools || lastMessageIsUser);
    });

    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content) => {
    if (!conversationId) {
      toast.error('Please log in to use the AI assistant.');
      return;
    }
    setIsLoading(true);
    const conv = await base44.agents.getConversation(conversationId);
    await base44.agents.addMessage(conv, { role: 'user', content });
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-4 border-black z-50 hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black z-50 flex flex-col bg-white">
          <CardHeader className="border-b-4 border-black p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="font-black">AI ASSISTANT</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4" ref={scrollContainerRef}>
              {safeMessages.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-bold text-slate-800 mb-2">AI Assistant Ready</p>
                  <p className="text-sm text-slate-500">Ask me about meals, nutrition, or deals!</p>
                </div>
              )}

              {safeMessages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}

              {isLoading && safeMessages.length > 0 && safeMessages[safeMessages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border-2 border-black rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-bold">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t-4 border-black">
            <ChatInput onSend={handleSend} isLoading={isLoading} placeholder="Ask me anything..." />
          </div>
        </Card>
      )}
    </>
  );
}