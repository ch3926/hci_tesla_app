import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Navigation',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="map" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}