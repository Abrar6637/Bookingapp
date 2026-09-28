import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  const role = user?.unsafeMetadata?.role as string | undefined;

  if (!role) {
    return <Redirect href="/(onboarding)/role-selection" />;
  }

  if (role === 'technician') {
    return <Redirect href="/(technician)/(tabs)" />;
  }

  return <Redirect href="/(customer)/(tabs)" />;
}