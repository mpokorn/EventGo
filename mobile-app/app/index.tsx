import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to events (browsing doesn't require auth)
  return <Redirect href="/(tabs)" />;
}
