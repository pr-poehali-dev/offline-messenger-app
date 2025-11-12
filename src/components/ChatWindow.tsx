import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { User } from '@/pages/Index';

interface ChatWindowProps {
  user: User;
  contact: any;
  onBack: () => void;
}

export default function ChatWindow({ user, contact, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesCount = useRef(0);

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/a9369f25-daa7-4cef-ade6-4a34252aa217?user_id=${user.id}&contact_id=${contact.id}`
      );
      const data = await response.json();
      
      if (data.length > prevMessagesCount.current && prevMessagesCount.current > 0) {
        const newMsg = data[data.length - 1];
        if (newMsg.sender_id !== user.id) {
          playNotificationSound();
        }
      }
      
      prevMessagesCount.current = data.length;
      setMessages(data);
    } catch (err) {
      console.error('Ошибка загрузки сообщений', err);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
  }, [contact.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await fetch('https://functions.poehali.dev/a9369f25-daa7-4cef-ade6-4a34252aa217', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: contact.id,
          content: newMessage,
        }),
      });
      setNewMessage('');
      loadMessages();
    } catch (err) {
      console.error('Ошибка отправки сообщения', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="p-3 md:p-4 border-b flex items-center gap-3 bg-gradient-to-r from-background to-muted/20 backdrop-blur-sm shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden rounded-full hover:bg-muted">
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
              {contact.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-background rounded-full"></div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm md:text-base">{contact.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            онлайн
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted h-9 w-9">
            <Icon name="Phone" size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted h-9 w-9">
            <Icon name="MoreVertical" size={18} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-muted/20 to-muted/40">
        {messages.map((msg, index) => {
          const isOwn = msg.sender_id === user.id;
          const showAvatar = !isOwn && (index === 0 || messages[index - 1].sender_id !== msg.sender_id);
          
          return (
            <div key={msg.id} className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {!isOwn && (
                <Avatar className={`w-8 h-8 ${showAvatar ? '' : 'invisible'}`}>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {contact.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`max-w-[75%] md:max-w-[60%] px-4 py-2.5 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-md'
                    : 'bg-white dark:bg-card border border-border/50 rounded-bl-md'
                }`}
              >
                <p className="break-words text-sm leading-relaxed">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1">
                  <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('ru', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {isOwn && (
                    <Icon name="Check" size={14} className="text-white/70" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 md:p-4 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              placeholder="Сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="pr-10 rounded-full border-2 focus:border-primary transition-colors"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            >
              <Icon name="Smile" size={18} className="text-muted-foreground" />
            </Button>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim()} 
            size="icon"
            className="h-11 w-11 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}