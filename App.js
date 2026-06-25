import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { GameProvider } from './src/context/GameContext';
import CourseSelectScreen from './src/screens/CourseSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProficiencyCheckScreen from './src/screens/ProficiencyCheckScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SplashScreen from './src/screens/SplashScreen';
import StartUnitScreen from './src/screens/StartUnitScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import { colors } from './src/theme';

function AppContent() {
  const { initializing, profile, syncProgress, isAuthenticated } = useAuth();
  const hasResolvedInitialRoute = useRef(false);
  const [screen, setScreen] = useState('boot');
  const [userLanguage, setUserLanguage] = useState('english');
  const [selectedCourse, setSelectedCourse] = useState('patois');
  const [onboardingPlan, setOnboardingPlan] = useState(null);

  const handleHeartsSync = useCallback(
    (heartFields) => {
      if (isAuthenticated) {
        syncProgress(heartFields);
      }
    },
    [isAuthenticated, syncProgress]
  );

  useEffect(() => {
    if (initializing || hasResolvedInitialRoute.current) {
      return;
    }

    if (!isAuthenticated) {
      hasResolvedInitialRoute.current = true;
      setScreen('splash');
      return;
    }

    const savedLanguage = profile?.baseLanguage || 'english';
    const savedCourse = profile?.currentCourse || 'patois';

    setUserLanguage(savedLanguage);
    setSelectedCourse(savedCourse);

    hasResolvedInitialRoute.current = true;

    if (profile?.onboardingCompleted && profile?.currentCourse) {
      setScreen('home');
      return;
    }

    setScreen('language-select');
  }, [initializing, isAuthenticated, profile]);

  function goToPostAuthFlow(nextProfile = profile) {
    if (nextProfile?.baseLanguage) {
      setUserLanguage(nextProfile.baseLanguage);
    }

    if (nextProfile?.currentCourse) {
      setSelectedCourse(nextProfile.currentCourse);
      setScreen('home');
      return;
    }

    if (nextProfile?.onboardingCompleted && !nextProfile?.currentCourse) {
      setScreen('course-select');
      return;
    }

    setScreen('language-select');
  }

  if (initializing || screen === 'boot') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GameProvider
      profileHearts={profile?.hearts}
      profileNextHeartAt={profile?.nextHeartAt}
      onHeartsSync={handleHeartsSync}
    >
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
            if (isAuthenticated) {
              syncProgress({ baseLanguage: lang });
            }
            setScreen('proficiency-check');
          }}
          onBack={() => {
            if (!isAuthenticated) {
              setScreen('welcome');
            }
          }}
        />
      ) : null}

      {screen === 'proficiency-check' ? (
        <ProficiencyCheckScreen
          userLanguage={userLanguage}
          onBack={() => setScreen('language-select')}
          onComplete={(plan) => {
            setOnboardingPlan(plan);
            if (isAuthenticated) {
              syncProgress(plan);
            }
            setScreen('course-select');
          }}
        />
      ) : null}

      {screen === 'course-select' ? (
        <CourseSelectScreen
          userLanguage={userLanguage}
          onSelectCourse={(courseId) => {
            setSelectedCourse(courseId);
            setScreen('start-unit');
          }}
          onBack={() => setScreen('language-select')}
        />
      ) : null}

      {screen === 'start-unit' ? (
        <StartUnitScreen
          courseId={selectedCourse}
          recommendedStartUnit={onboardingPlan?.recommendedStartUnit || profile?.recommendedStartUnit || 1}
          onBack={() => setScreen('course-select')}
          onComplete={({ selectedStartUnit }) => {
            if (isAuthenticated) {
              syncProgress({
                currentCourse: selectedCourse,
                currentLesson: null,
                selectedStartUnit,
                onboardingCompleted: true,
              });
            }
            setScreen('home');
          }}
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
