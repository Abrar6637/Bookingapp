import { useAuth } from "@clerk/expo";
import { Redirect, Slot } from "expo-router";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export default function CustomerLayout() {
  usePushNotifications();

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Slot />;
}