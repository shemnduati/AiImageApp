import { Redirect, Slot, Stack, usePathname } from "expo-router";
import "../global.css";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { SessionProvider, useSession } from "@/context/AuthContext";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {

  function Header() {
    const { currentTheme } = useTheme();
    const { session, isLoading } = useSession();
    const pathname = usePathname();

    const isAuthScreen = pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up";

    // if we have a session and we're not on the welcome screen, redirect to the App
    if (session && !isLoading && isAuthScreen) {
      return (
        <>
          <StatusBar
            style={currentTheme === 'dark' ? 'light' : 'dark'}
            backgroundColor={currentTheme === 'dark' ? '#111827' : '#ffffff'}
          />
          <Redirect href="/(app)/(tabs)" />
        </>
      );
    }
    return (
      <StatusBar
        style={currentTheme === 'dark' ? 'light' : 'dark'}
        backgroundColor={currentTheme === 'dark' ? '#111827' : '#ffffff'}
      />
    );
  }

  return <SessionProvider>
    <ThemeProvider>
      <Header />
      <Slot />
    </ThemeProvider>
  </SessionProvider>
}
