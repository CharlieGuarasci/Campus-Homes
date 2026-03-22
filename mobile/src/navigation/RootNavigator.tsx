import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, ActivityIndicator } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthStack } from './AuthStack';
import { TabNavigator } from './TabNavigator';

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.warn('[RootNavigator] getSession timed out — showing login');
      setLoading(false);
    }, 3000);

    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        clearTimeout(timeout);
        setSession(s);
        setLoading(false);
        console.log('[RootNavigator] Session:', s ? 'authenticated' : 'none');
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error('[RootNavigator] getSession error:', err);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { clearTimeout(timeout); subscription.unsubscribe(); };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a2035' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 12, fontSize: 13 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}
