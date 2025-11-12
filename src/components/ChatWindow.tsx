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

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/a9369f25-daa7-4cef-ade6-4a34252aa217?user_id=${user.id}&contact_id=${contact.id}`
      );
      const data = await response.json();
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
      <div className="p-4 border-b flex items-center gap-3 bg-background">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <Avatar>
          <AvatarImage src={contact.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {contact.name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{contact.name}</h3>
          <p className="text-xs text-muted-foreground">{contact.phone}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
        {messages.map((msg) => {
          const isOwn = msg.sender_id === user.id;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  isOwn
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-background border rounded-bl-sm'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ru', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            placeholder="Напишите сообщение..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()} size="icon">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
