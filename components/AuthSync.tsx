'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { UserRole } from '@/lib/types';

export function AuthSync() {
  const { setCurrentUser } = useAppStore();

  const syncUser = useCallback(async (userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      const dbRole = (profile.function?.trim() || 'Jovem aprendiz') as UserRole;
      setCurrentUser({
        id: profile.id,
        username: profile.username,
        name: profile.name,
        role: dbRole,
      });
    } else if (user) {
      // Fallback if profile doesn't exist
      const fallbackRole = (user.user_metadata?.role || 'Jovem aprendiz') as UserRole;
      setCurrentUser({
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        name: user.user_metadata?.name || user.email || 'Usuário',
        role: fallbackRole,
      });
    }
  }, [setCurrentUser]);

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
  }, [setCurrentUser, syncUser]);

  return null;
}
