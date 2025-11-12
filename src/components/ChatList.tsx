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
    <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 lg:w-[420px] border-r bg-background shadow-sm`}>
      <div className="p-4 md:p-5 border-b flex items-center justify-between bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="border-2 border-white shadow-md h-11 w-11">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-white/20 text-white">{user.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-semibold text-base">{user.name}</h2>
            <p className="text-xs opacity-90 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              онлайн
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {onShowAdmin && (
            <Button variant="ghost" size="icon" onClick={onShowAdmin} className="text-white hover:bg-white/20 rounded-full">
              <Icon name="Shield" size={20} />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onShowSettings} className="text-white hover:bg-white/20 rounded-full">
            <Icon name="Settings" size={20} />
          </Button>
        </div>
      </div>

      <div className="p-3 bg-muted/30 border-b">
        <Button onClick={onShowAddContact} className="w-full shadow-sm hover:shadow-md transition-shadow" variant="default" size="sm">
          <Icon name="UserPlus" size={18} className="mr-2" />
          Добавить контакт
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {contacts.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="MessageSquare" size={40} className="text-primary/30" />
            </div>
            <p className="text-sm font-medium">Нет контактов</p>
            <p className="text-xs mt-1 opacity-70">Добавьте первый контакт для общения</p>
          </div>
        ) : (
          contacts.map((contact, index) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact)}
              className={`p-3.5 md:p-4 border-b cursor-pointer transition-all hover:bg-muted/70 active:scale-[0.98] ${
                selectedContact?.id === contact.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-background">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                      {contact.name?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-background rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold truncate text-sm">{contact.name}</h3>
                    {contact.last_message_time && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(contact.last_message_time).toLocaleTimeString('ru', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate leading-relaxed">
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