import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { User } from '@/pages/Index';

interface ChatListProps {
  user: User;
  contacts: any[];
  selectedContact: any;
  onSelectContact: (contact: any) => void;
  onShowSettings: () => void;
  onShowAddContact: () => void;
  onShowAdmin?: () => void;
}

export default function ChatList({
  user,
  contacts,
  selectedContact,
  onSelectContact,
  onShowSettings,
  onShowAddContact,
  onShowAdmin,
}: ChatListProps) {
  return (
    <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r bg-background`}>
      <div className="p-4 border-b flex items-center justify-between bg-primary text-white">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-white">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-xs opacity-90">онлайн</p>
          </div>
        </div>
        <div className="flex gap-1">
          {onShowAdmin && (
            <Button variant="ghost" size="icon" onClick={onShowAdmin} className="text-white hover:bg-white/20">
              <Icon name="Shield" size={20} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onShowSettings} className="text-white hover:bg-white/20">
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>

      <div className="p-3">
        <Button onClick={onShowAddContact} className="w-full" variant="outline">
          <Icon name="UserPlus" size={18} className="mr-2" />
          Добавить контакт
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Icon name="MessageSquare" size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Нет контактов</p>
            <p className="text-xs mt-1">Добавьте первый контакт</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedContact?.id === contact.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {contact.name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    {contact.last_message_time && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.last_message_time).toLocaleTimeString('ru', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.last_message || contact.bio || 'Нет сообщений'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
