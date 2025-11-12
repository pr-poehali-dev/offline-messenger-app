import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AdminPanelProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function AdminPanel({ onBack, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const loadUsers = async () => {
    try {
      const response = await fetch(
        'https://functions.poehali.dev/410cf00d-ff37-4c5b-ac2d-2bd427dbd6c9?action=all'
      );
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Ошибка загрузки пользователей', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    try {
      await fetch('https://functions.poehali.dev/410cf00d-ff37-4c5b-ac2d-2bd427dbd6c9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, name }),
      });
      setPhone('');
      setPassword('');
      setName('');
      loadUsers();
    } catch (err) {
      console.error('Ошибка создания пользователя', err);
    }
  };

  const toggleBlock = async (userId: number, isBlocked: boolean) => {
    try {
      await fetch('https://functions.poehali.dev/410cf00d-ff37-4c5b-ac2d-2bd427dbd6c9', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, is_blocked: !isBlocked }),
      });
      loadUsers();
    } catch (err) {
      console.error('Ошибка блокировки', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="p-4 border-b flex items-center justify-between bg-primary text-white">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Icon name="Shield" size={24} />
            <h2 className="text-xl font-semibold">Админ-панель</h2>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} className="text-white hover:bg-white/20">
          <Icon name="LogOut" size={20} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Создать пользователя</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Input placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={createUser} disabled={!phone || !password || !name} className="w-full">
              <Icon name="UserPlus" size={18} className="mr-2" />
              Создать пользователя
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Пользователи ({users.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar>
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.name || 'Без имени'}</h3>
                    {user.is_admin && <Badge variant="secondary">Админ</Badge>}
                    {user.is_blocked && <Badge variant="destructive">Заблокирован</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
                {!user.is_admin && (
                  <Button
                    variant={user.is_blocked ? 'outline' : 'destructive'}
                    size="sm"
                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                  >
                    {user.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
