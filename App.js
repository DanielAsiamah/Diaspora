import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import CourseSelectScreen from './src/screens/CourseSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { colors } from './src/theme';

function AppContent() {
  const { initializing, profile, syncProgress, isAuthenticated } = useAuth();
  const [screen, setScreen] = useState('splash');
  const [userLanguage, setUserLanguage] = useState('english');
  const [selectedCourse, setSelectedCourse] = useState('patois');

  const handleHeartsSync = useCallback(
    (hearts) => {
      if (isAuthenticated) {
        syncProgress({ hearts });
      }
    },
    [isAuthenticated, syncProgress]
  );

  function goToPostAuthFlow() {
    if (profile?.currentCourse) {
      setSelectedCourse(profile.currentCourse);
      setScreen('home');
      return;
    }

    setScreen('language-select');
  }

  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GameProvider profileHearts={profile?.hearts} onHeartsSync={handleHeartsSync}>
      {screen === 'splash' ? <SplashScreen onFinish={() => setScreen('welcome')} /> : null}

      {screen === 'welcome' ? (
        <WelcomeScreen
          onGetStarted={() => setScreen('language-select')}
          onSignIn={() => setScreen('login')}
        />
      ) : null}

      {screen === 'login' ? (
        <LoginScreen
          onBack={() => setScreen('welcome')}
          onSuccess={goToPostAuthFlow}
          onSignUp={() => setScreen('signup')}
        />
      ) : null}

      {screen === 'signup' ? (
        <SignUpScreen
          onBack={() => setScreen('login')}
          onSuccess={goToPostAuthFlow}
          onSignIn={() => setScreen('login')}
        />
      ) : null}

      {screen === 'language-select' ? (
        <LanguageSelectScreen
          onSelectLanguage={(lang) => {
            setUserLanguage(lang);
            setScreen('course-select');
          }}
          onBack={() => setScreen('welcome')}
        />
      ) : null}

      {screen === 'course-select' ? (
        <CourseSelectScreen
          userLanguage={userLanguage}
          onSelectCourse={(courseId) => {
            setSelectedCourse(courseId);
            if (isAuthenticated) {
              syncProgress({ currentCourse: courseId, currentLesson: null });
            }
            setScreen('home');
          }}
          onBack={() => setScreen('language-select')}
        />
      ) : null}

      {screen === 'home' ? (
        <HomeScreen
          userLanguage={userLanguage}
          courseId={selectedCourse}
          onBack={() => setScreen('course-select')}
        />
      ) : null}
    </GameProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.splash,
    flex: 1,
    justifyContent: 'center',
  },
});
