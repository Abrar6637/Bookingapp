import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/expo";

export default function TechnicianLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return <Slot />;
}