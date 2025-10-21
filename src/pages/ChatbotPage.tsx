import { useEffect } from 'react';
import { NavigationHeader } from '../components/shared/NavigationHeader';

interface ChatbotPageProps {
  onBack: () => void;
  onNavigate: (page: 'dashboard' | 'profile' | 'chatbot' | 'resume') => void;
}

export function ChatbotPage({ onBack, onNavigate }: ChatbotPageProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v3.3/inject.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      (window as any).botpress.init({
        botId: 'b4851ca3-f874-4918-9c07-0c6d3ca344dd',
        configuration: {
          version: 'v2',
          composerPlaceholder: '',
          botName: 'Blu Ko',
          botDescription: '',
          website: {},
          email: {},
          phone: {},
          termsOfService: {},
          privacyPolicy: {},
          color: '#3276EA',
          variant: 'solid',
          headerVariant: 'glass',
          themeMode: 'light',
          fontFamily: 'inter',
          radius: 4,
          feedbackEnabled: false,
          footer: '[⚡ by Botpress](https://botpress.com/?from=webchat)',
          soundEnabled: false,
          proactiveMessageEnabled: false,
          proactiveBubbleMessage: 'Hi! 👋 Need help?',
          proactiveBubbleTriggerType: 'afterDelay',
          proactiveBubbleDelayTime: 10,
        },
        clientId: '536d7021-0f1c-49cc-9344-9ab44e8c6b28',
        selector: '#webchat',
      });

      (window as any).botpress.on('webchat:ready', () => {
        (window as any).botpress.open();
      });
    };

    const style = document.createElement('style');
    style.innerHTML = `
      #webchat .bpWebchat {
        position: unset !important;
        width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        max-width: 100% !important;
      }
      #webchat .bpFab {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(style);
      if ((window as any).botpress) {
        try {
          (window as any).botpress.close();
        } catch (e) {
          console.log('Botpress cleanup');
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B5C] via-[#003A6E] to-[#1E4C80] flex flex-col">
      <NavigationHeader currentPage="chatbot" onNavigate={onNavigate} />
      <div className="flex-1 container mx-auto px-4 py-4">
        <div id="webchat" style={{ width: '100%', height: 'calc(100vh - 120px)' }}></div>
      </div>
    </div>
  );
}
