import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';

interface AddContactProps {
  userId: number;
  onBack: () => void;
}

export default function AddContact({ userId, onBack }: AddContactProps) {
  const [phone, setPhone] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchUser = async () => {
    setLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const response = await fetch(
        `https://functions.poehali.dev/410cf00d-ff37-4c5b-ac2d-2bd427dbd6c9?action=search&phone=${phone}`
      );

      if (response.ok) {
        const data = await response.json();
        setFoundUser(data);
      } else {
        setError('Пользователь не найден');
      }
    } catch (err) {
      setError('Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    try {
      await fetch('https://functions.poehali.dev/046a3eb6-894f-43dc-b0a4-37c8ff07ba6e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, contact_id: foundUser.id }),
      });
      onBack();
    } catch (err) {
      setError('Ошибка добавления контакта');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <h2 className="text-xl font-semibold">Добавить контакт</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Поиск по номеру телефона</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="+7..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
              />
              <Button onClick={searchUser} disabled={loading || !phone}>
                <Icon name="Search" size={18} />
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}

            {foundUser && (
              <div className="border rounded-lg p-4 space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={foundUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {foundUser.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{foundUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{foundUser.phone}</p>
                    {foundUser.bio && (
                      <p className="text-sm text-muted-foreground mt-1">{foundUser.bio}</p>
                    )}
                  </div>
                </div>
                <Button onClick={addContact} className="w-full">
                  <Icon name="UserPlus" size={18} className="mr-2" />
                  Добавить в контакты
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
