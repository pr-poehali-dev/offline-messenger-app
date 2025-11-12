import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { User } from '@/pages/Index';

interface UserSettingsProps {
  user: User;
  onBack: () => void;
  onLogout: () => void;
}

export default function UserSettings({ user, onBack, onLogout }: UserSettingsProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/6283c0d2-58a4-48ae-a92b-a0da53e9789b', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, name, bio, avatar }),
      });

      if (response.ok) {
        const updated = await response.json();
        localStorage.setItem('user', JSON.stringify(updated));
        onBack();
      }
    } catch (err) {
      console.error('Ошибка сохранения', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <h2 className="text-xl font-semibold">Настройки</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex justify-center">
          <Avatar className="w-32 h-32">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-primary text-white text-5xl">
              {name[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ссылка на аватар</label>
            <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Имя</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">О себе</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Номер телефона</label>
            <Input value={user.phone} disabled className="bg-muted" />
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>

          <Button onClick={onLogout} variant="destructive" className="w-full">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
}
