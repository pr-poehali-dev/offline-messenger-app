import { useState, useEffect } from 'react';
import LoginScreen from '@/components/LoginScreen';
import ProfileSetup from '@/components/ProfileSetup';
import MessengerMain from '@/components/MessengerMain';
import AdminPanel from '@/components/AdminPanel';

export interface User {
  id: number;
  phone: string;
  name?: string;
  bio?: string;
  avatar?: string;
  is_admin: boolean;
  is_blocked: boolean;
  is_profile_completed: boolean;
}

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setShowAdminPanel(false);
  };

  const handleProfileComplete = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!user.is_profile_completed) {
    return <ProfileSetup user={user} onComplete={handleProfileComplete} />;
  }

  if (showAdminPanel && user.is_admin) {
    return <AdminPanel onBack={() => setShowAdminPanel(false)} onLogout={handleLogout} />;
  }

  return (
    <MessengerMain 
      user={user} 
      onLogout={handleLogout}
      onShowAdmin={user.is_admin ? () => setShowAdminPanel(true) : undefined}
    />
  );
}