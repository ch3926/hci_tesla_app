import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function Layout() {
  return (
    <View style={{ flex: 1 }}>  {/* This makes all screens full-screen by default */}
      <Slot />  {/* This renders your screens */}
    </View>
  );
}