import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MarketplaceScreen } from '@/screens/marketplace/MarketplaceScreen';
import { CreateListingScreen } from '@/screens/marketplace/CreateListingScreen';
import { ConversationsScreen } from '@/screens/messages/ConversationsScreen';
import { ChatScreen } from '@/screens/messages/ChatScreen';
import { BoardScreen } from '@/screens/board/BoardScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { COLORS } from '@/lib/constants';

export type MarketplaceStackParamList = {
  MarketplaceHome: undefined;
  CreateListing: undefined;
};

export type MessagesStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string; otherUserName?: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

const Tab                = createBottomTabNavigator();
const MarketplaceStack   = createNativeStackNavigator<MarketplaceStackParamList>();
const MessagesStack      = createNativeStackNavigator<MessagesStackParamList>();
const ProfileStack       = createNativeStackNavigator<ProfileStackParamList>();

function MarketplaceNavigator() {
  return (
    <MarketplaceStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketplaceStack.Screen name="MarketplaceHome" component={MarketplaceScreen} />
      <MarketplaceStack.Screen name="CreateListing"   component={CreateListingScreen} />
    </MarketplaceStack.Navigator>
  );
}

function MessagesNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={{ headerShown: false }}>
      <MessagesStack.Screen name="Conversations" component={ConversationsScreen} />
      <MessagesStack.Screen name="Chat"          component={ChatScreen} />
    </MessagesStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile"     component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: COLORS.gray200,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [string, string]> = {
            Marketplace: ['home',        'home-outline'],
            Messages:    ['chatbubble',  'chatbubble-outline'],
            Board:       ['newspaper',   'newspaper-outline'],
            ProfileTab:  ['person',      'person-outline'],
          };
          const [active, inactive] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return (
            <Ionicons
              name={(focused ? active : inactive) as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
      <Tab.Screen name="Messages"    component={MessagesNavigator} />
      <Tab.Screen name="Board"       component={BoardScreen} />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
