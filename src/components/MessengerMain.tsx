import { useState, useEffect } from 'react';
import { User } from '@/pages/Index';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import UserSettings from './UserSettings';
import AddContact from './AddContact';

interface MessengerMainProps {
  user: User;
  onLogout: () => void;
  onShowAdmin?: () => void;
}

export default function MessengerMain({ user, onLogout, onShowAdmin }: MessengerMainProps) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);

  const loadContacts = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/046a3eb6-894f-43dc-b0a4-37c8ff07ba6e?user_id=${user.id}`
      );
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error('Ошибка загрузки контактов', err);
    }
  };

  useEffect(() => {
    loadContacts();
    const interval = setInterval(loadContacts, 1000);
    return () => clearInterval(interval);
  }, [user.id]);

  if (showSettings) {
    return <UserSettings user={user} onBack={() => setShowSettings(false)} onLogout={onLogout} />;
  }

  if (showAddContact) {
    return (
      <AddContact
        userId={user.id}
        onBack={() => {
          setShowAddContact(false);
          loadContacts();
        }}
      />
    );
  }

  return (
    <div className="h-screen flex bg-background">
      <ChatList
        user={user}
        contacts={contacts}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
        onShowSettings={() => setShowSettings(true)}
        onShowAddContact={() => setShowAddContact(true)}
        onShowAdmin={onShowAdmin}
      />
      {selectedContact ? (
        <ChatWindow
          user={user}
          contact={selectedContact}
          onBack={() => setSelectedContact(null)}
        />
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            <p className="text-lg">Выберите чат для начала общения</p>
          </div>
        </div>
      )}
    </div>
  );
}
