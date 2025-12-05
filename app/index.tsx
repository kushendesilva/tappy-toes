import { Redirect } from 'expo-router';
import { useAppModeStore } from '../store/appModeStore';

export default function Index() {
  const mode = useAppModeStore(s => s.mode);
  const hydrated = useAppModeStore(s => s.hydrated);

  // Wait for hydration
  if (!hydrated) {
    return null;
  }

  // Redirect based on mode
  if (mode === 'not_set') {
    return <Redirect href="/select-mode" />;
  }

  if (mode === 'pregnant') {
    return <Redirect href="/(tabs)/kick" />;
  }

  // mode === 'born'
  return <Redirect href="/(born)/diaper" />;
}