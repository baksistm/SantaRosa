'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';

export function AuthSync() {
  const { setCurrentUser } = useAppStore();

  async function syncUser(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email?.toLowerCase();
    const isOwner = userEmail === 'brunoalekohler@gmail.com';

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        role: isOwner ? 'Administrador' : profile.role,
      });
    } else if (user) {
      // Fallback if profile doesn't exist
      setCurrentUser({
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        name: user.user_metadata?.name || user.email || 'Usuário',
        role: isOwner ? 'Administrador' : ((user.user_metadata?.role as any) || 'Jovem aprendiz'),
      });
    }
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user.id);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUser(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  return null;
}
