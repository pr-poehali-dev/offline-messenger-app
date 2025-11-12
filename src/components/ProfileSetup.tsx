import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { User } from '@/pages/Index';

interface ProfileSetupProps {
  user: User;
  onComplete: (user: User) => void;
}

export default function ProfileSetup({ user, onComplete }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phoneContact, setPhoneContact] = useState(user.phone);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!name) return;

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6283c0d2-58a4-48ae-a92b-a0da53e9789b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_profile',
          user_id: user.id,
          name,
          bio,
          phone_contact: phoneContact,
          avatar,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onComplete(data);
      }
    } catch (err) {
      console.error('Ошибка сохранения профиля', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Настройка профиля</CardTitle>
          <CardDescription>Заполните информацию о себе</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-primary text-white text-3xl">
                {name ? name[0].toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Ссылка на аватар (опционально)</label>
            <Input
              placeholder="https://..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ваше имя *</label>
            <Input
              placeholder="Иван Иванов"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Номер телефона для поиска</label>
            <Input
              type="tel"
              value={phoneContact}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">О себе</label>
            <Textarea
              placeholder="Расскажите о себе..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleComplete}
            disabled={loading || !name}
            className="w-full"
          >
            {loading ? 'Сохранение...' : 'Продолжить'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}