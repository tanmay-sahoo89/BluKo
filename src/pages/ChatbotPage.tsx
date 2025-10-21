import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Send, FileText, Lightbulb, Briefcase, Award } from 'lucide-react';
import { NavigationHeader } from '../components/shared/NavigationHeader';

interface Message {
  id: string;
  message: string;
  is_user_message: boolean;
  created_at: string;
}

interface ChatbotPageProps {
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot' | 'resume') => void;
}

export function ChatbotPage({ onBack, onNavigate }: ChatbotPageProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);

      if (data.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome',
          message: "Hello! I'm your resume building assistant. I'll help you create a professional resume by gathering information about your work experience, skills, certifications, and more. Let's start with your contact information. What's your phone number?",
          is_user_message: false,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      message: userMessage,
      is_user_message: true,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    await supabase.from('chatbot_conversations').insert({
      user_id: user.id,
      message: userMessage,
      is_user_message: true,
    });

    const botResponse = await getBotResponse(userMessage, messages);

    const newBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      message: botResponse,
      is_user_message: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newBotMessage]);

    await supabase.from('chatbot_conversations').insert({
      user_id: user.id,
      message: botResponse,
      is_user_message: false,
    });

    setLoading(false);
  };

  const getBotResponse = async (userMessage: string, history: Message[]): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    const questionFlow = [
      { keywords: ['phone', 'number', 'contact'], response: "Great! Now, what city or location are you based in?" },
      { keywords: ['city', 'location', 'live', 'based'], response: "Perfect! Now let's talk about your work experience. What is your most recent or current job title?" },
      { keywords: ['job', 'title', 'position', 'work as'], response: "Excellent! What company do you work for or did you work for?" },
      { keywords: ['company', 'employer', 'organization'], response: "Great! Can you tell me about your key responsibilities and achievements in this role?" },
      { keywords: ['responsibilities', 'duties', 'achievements', 'tasks'], response: "That's helpful! Do you have any certifications or licenses related to your work? If yes, please list them." },
      { keywords: ['certification', 'license', 'certified', 'licensed'], response: "Excellent! What are your top skills? Please list the skills you're most proficient in." },
      { keywords: ['skill', 'good at', 'proficient'], response: "Great! What languages do you speak and at what level? (e.g., English - Native, Spanish - Conversational)" },
      { keywords: ['language', 'speak', 'bilingual'], response: "Perfect! Can you tell me about your education? What school did you attend and what did you study?" },
    ];

    for (const question of questionFlow) {
      const hasKeyword = question.keywords.some(keyword => lowerMessage.includes(keyword));
      if (hasKeyword) {
        return question.response;
      }
    }

    if (lowerMessage.includes('done') || lowerMessage.includes('finished') || lowerMessage.includes('complete')) {
      return "Great job! You've provided all the necessary information. You can now go to 'My Profile' to review your information or 'My Resumes' to generate your professional resume. Is there anything else you'd like to add?";
    }

    return "Thank you for sharing that information! Is there anything else you'd like to tell me about your professional background?";
  };

  const quickActions = [
    { icon: FileText, label: 'Generate Resume', prompt: 'Help me generate a professional resume' },
    { icon: Lightbulb, label: 'Career Tips', prompt: 'Give me career advice for blue collar workers' },
    { icon: Briefcase, label: 'Work Experience', prompt: 'Tell me about my work experience' },
    { icon: Award, label: 'Add Certification', prompt: 'I want to add a new certification' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021334] via-[#012A61] to-[#275A91]">
      <NavigationHeader currentPage="chatbot" onNavigate={onNavigate} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="w-full flex items-center gap-3 bg-[#275A91] hover:bg-[#275A91]/80 text-white p-3 rounded-lg transition-all duration-200 text-left"
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="text-sm">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Example Prompts</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p className="cursor-pointer hover:text-[#FDC787] transition-colors" onClick={() => handleQuickAction('What certifications do I need?')}>
                  What certifications do I need?
                </p>
                <p className="cursor-pointer hover:text-[#FDC787] transition-colors" onClick={() => handleQuickAction('How do I describe my work experience?')}>
                  How do I describe my work experience?
                </p>
                <p className="cursor-pointer hover:text-[#FDC787] transition-colors" onClick={() => handleQuickAction('What skills should I highlight?')}>
                  What skills should I highlight?
                </p>
                <p className="cursor-pointer hover:text-[#FDC787] transition-colors" onClick={() => handleQuickAction('Help me write a summary')}>
                  Help me write a summary
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-[#012A61] bg-opacity-50 backdrop-blur-lg border border-[#A5CCCC] border-opacity-20 rounded-2xl shadow-2xl flex flex-col h-[calc(100vh-200px)]">
              <div className="p-6 border-b border-[#A5CCCC] border-opacity-20">
                <h2 className="text-2xl font-bold text-white">AI Resume Assistant</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Answer questions or use quick actions to build your professional resume
                </p>
              </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_user_message ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.is_user_message
                        ? 'bg-[#FDC787] text-[#021334]'
                        : 'bg-[#275A91] text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#275A91] text-white rounded-lg p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-[#A5CCCC] border-opacity-20">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#A5CCCC] bg-opacity-20 border border-[#A5CCCC] border-opacity-30 rounded-lg text-white placeholder-gray-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FDC787] focus:border-transparent"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-[#FDC787] hover:bg-[#FDC787]/90 text-[#021334] font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
