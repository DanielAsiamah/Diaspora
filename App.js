import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { GameProvider } from './src/context/GameContext';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import CourseSelectScreen from './src/screens/CourseSelectScreen';
import { colors } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [userLanguage, setUserLanguage] = useState('english');
  const [selectedCourse, setSelectedCourse] = useState('patois');
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
    <GameProvider>
      {screen === 'splash' ? (
        <SplashScreen onFinish={() => setScreen('welcome')} />
      ) : null}

      {screen === 'welcome' ? (
        <WelcomeScreen
          onGetStarted={() => setScreen('language-select')}
          onSignIn={() =>
            Alert.alert(
              'Coming soon',
              'Firebase login is next on the roadmap. For now, tap Get Started to try the beginner path.'
            )
          }
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

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.splash,
    flex: 1,
    justifyContent: 'center',
  },
});
