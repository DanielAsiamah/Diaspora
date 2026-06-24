import { LinearGradient } from 'expo-linear-gradient';
import { useAudioPlayer } from 'expo-audio';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';

import HeartsBar from '../components/HeartsBar';
import MascotHero from '../components/MascotHero';
import OutOfHeartsModal from '../components/OutOfHeartsModal';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import { getCourseById, getPublishedUnits } from '../data/curriculumRepository';
import { colors, fonts, radius, spacing } from '../theme';

const getMarginLeft = (index) => {
  const cycle = index % 8;
  if (cycle === 0) return 0;
  if (cycle === 1) return 44;
  if (cycle === 2) return 76;
  if (cycle === 3) return 44;
  if (cycle === 4) return 0;
  if (cycle === 5) return -44;
  if (cycle === 6) return -76;
  return -44;
};

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

function normaliseAnswer(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9' ]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsFromAnswer(answer) {
  return answer
    .replace(/[?!.,/]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function createLessonExercises(lesson) {
  if (!lesson) return [];

  const quizAnswer = lesson.quiz?.answer || lesson.meaning;
  const answerWords = wordsFromAnswer(lesson.meaning);
  const extras = ['please', 'soon', 'friend', 'today', 'good', 'hello'].filter(
    (word) => !answerWords.map((item) => item.toLowerCase()).includes(word)
  );

  return [
    {
      id: 'choice',
      type: 'choice',
      title: `What does "${lesson.phrase}" mean?`,
      prompt: lesson.phrase,
      phrase: lesson.phrase,
      answer: quizAnswer,
      choices: lesson.quiz?.choices || shuffle([quizAnswer, 'Goodbye', 'Thank you']),
    },
    {
      id: 'build',
      type: 'build',
      title: `Build the meaning of "${lesson.phrase}"`,
      prompt: lesson.phrase,
      answer: lesson.meaning,
      wordBank: shuffle([...answerWords, ...extras.slice(0, Math.max(2, 6 - answerWords.length))]),
    },
  ];
}

function PathNode({ node, index, isCompleted, isActive, isLocked, themeColor, accentColor, onPress }) {
  const isChest = node.type === 'chest';
  const isTrophy = node.type === 'trophy';
  const marginLeft = getMarginLeft(index);

  return (
    <View style={[styles.nodeRow, { transform: [{ translateX: marginLeft }] }]}>
      {index > 0 ? <View style={styles.pathLine} /> : null}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.nodeCircle,
          isCompleted && [styles.nodeCompleted, { backgroundColor: themeColor, borderColor: themeColor }],
          isActive && [styles.nodeActive, { borderColor: accentColor }],
          isLocked && styles.nodeLocked,
          isChest && styles.nodeChest,
          isTrophy && styles.nodeTrophy,
          pressed && !isLocked && { transform: [{ scale: 0.95 }] },
        ]}
      >
        {isChest ? (
          <Text style={styles.nodeEmoji}>🎁</Text>
        ) : isTrophy ? (
          <Text style={styles.nodeEmoji}>🏆</Text>
        ) : (
          <Text style={[styles.nodeText, isCompleted && styles.nodeTextCompleted]}>
            {isCompleted ? '✓' : index + 1}
          </Text>
        )}
      </Pressable>
      {isActive ? <View style={[styles.activeRing, { borderColor: accentColor }]} /> : null}
    </View>
  );
}

function LessonPlayer({ lesson, hearts, maxHearts, onExit, onMistake, onComplete }) {
  const exercises = useMemo(() => createLessonExercises(lesson), [lesson]);
  const correctSound = useAudioPlayer(require('../../assets/sounds/correct.mp3'));
  const wrongSound = useAudioPlayer(require('../../assets/sounds/wrong.mp3'));
  const [step, setStep] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [builtWords, setBuiltWords] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const exercise = exercises[step];
  const progress = (step + (feedback?.correct ? 1 : 0)) / exercises.length;

  function selectedAnswer() {
    if (exercise.type === 'choice') return selectedChoice;
    return builtWords.join(' ');
  }

  function canCheck() {
    return exercise.type === 'choice' ? Boolean(selectedChoice) : builtWords.length > 0;
  }

  function checkAnswer() {
    const answer = selectedAnswer();
    const correct = normaliseAnswer(answer) === normaliseAnswer(exercise.answer);
    const feedbackSound = correct ? correctSound : wrongSound;
    feedbackSound.seekTo(0).then(() => feedbackSound.play());
    Vibration.vibrate(correct ? 35 : [0, 80, 70, 120]);
    if (!correct) onMistake();
    setFeedback({ correct, answer });
  }

  function continueLesson() {
    if (step === exercises.length - 1) {
      onComplete();
      return;
    }
    setStep((current) => current + 1);
    setSelectedChoice(null);
    setBuiltWords([]);
    setFeedback(null);
  }

  return (
    <SafeAreaView style={styles.lessonSafeArea}>
      <StatusBar style="light" />
      <View style={styles.lessonTopBar}>
        <Pressable
          accessibilityLabel="Exit lesson"
          accessibilityRole="button"
          hitSlop={12}
          onPress={onExit}
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>
        <View style={styles.lessonProgressTrack}>
          <View style={[styles.lessonProgressFill, { width: `${Math.max(progress * 100, 12)}%` }]} />
        </View>
        <HeartsBar hearts={hearts} maxHearts={maxHearts} />
      </View>

      <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.lessonTitle}>{exercise.title}</Text>
        <View style={styles.lessonPromptRow}>
          <MascotHero />
          <View style={styles.speechCard}>
            <Text style={styles.soundIcon}>🔊</Text>
            <View style={styles.speechTextWrap}>
              <Text style={styles.phraseText}>{exercise.prompt}</Text>
              <Text style={styles.phraseHint}>{lesson.note}</Text>
            </View>
          </View>
        </View>

        {exercise.type === 'choice' ? (
          <View style={styles.choiceList}>
            {exercise.choices.map((choice) => {
              const selected = selectedChoice === choice;
              return (
                <Pressable
                  key={choice}
                  disabled={Boolean(feedback)}
                  onPress={() => setSelectedChoice(choice)}
                  style={[styles.answerCard, selected && styles.answerCardSelected]}
                >
                  <Text style={styles.answerCardText}>{choice}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.buildArea}>
            <View style={styles.answerTray}>
              {builtWords.length === 0 ? (
                <Text style={styles.answerPlaceholder}>Tap words to build your answer</Text>
              ) : (
                builtWords.map((word, index) => (
                  <Pressable
                    key={`${word}-${index}`}
                    disabled={Boolean(feedback)}
                    onPress={() => setBuiltWords((words) => words.filter((_, itemIndex) => itemIndex !== index))}
                    style={styles.wordChipSelected}
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                  </Pressable>
                ))
              )}
            </View>
            <View style={styles.wordBank}>
              {exercise.wordBank.map((word, index) => {
                const used = builtWords.includes(word);
                return (
                  <Pressable
                    key={`${word}-${index}`}
                    disabled={used || Boolean(feedback)}
                    onPress={() => setBuiltWords((words) => [...words, word])}
                    style={[styles.wordChip, used && styles.wordChipUsed]}
                  >
                    <Text style={styles.wordChipText}>{word}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.lessonFooter,
          feedback?.correct && styles.correctFooter,
          feedback && !feedback.correct && styles.wrongFooter,
        ]}
      >
        {feedback ? (
          <View style={styles.feedbackCopy}>
            <Text style={[styles.feedbackTitle, !feedback.correct && styles.feedbackTitleWrong]}>
              {feedback.correct ? 'Correct!' : 'Incorrect'}
            </Text>
            <Text style={styles.feedbackBody}>
              {feedback.correct ? '+10 XP — keep going.' : `Correct answer: ${exercise.answer}`}
            </Text>
          </View>
        ) : null}
        <PrimaryButton
          label={feedback ? 'GOT IT' : 'CHECK'}
          disabled={!feedback && !canCheck()}
          onPress={feedback ? continueLesson : checkAnswer}
        />
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen({ courseId = 'patois', userLanguage, onBack }) {
  const { profile, syncProgress, isAuthenticated } = useAuth();
  const {
    hearts,
    maxHearts,
    hasHearts,
    showOutOfHearts,
    loseHeart,
    refillHearts,
    closeOutOfHearts,
  } = useGame();

  const [activeTab, setActiveTab] = useState('path');
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(profile?.xp ?? 120);
  const [gems, setGems] = useState(565);
  const [streak, setStreak] = useState(profile?.streak ?? 3);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);

  useEffect(() => {
    if (profile) {
      setXp(profile.xp ?? 0);
      setStreak(profile.streak ?? 0);
    }
  }, [profile?.xp, profile?.streak]);

  const course = useMemo(() => {
    const selectedCourse = getCourseById(courseId);
    return {
      ...selectedCourse,
      units: getPublishedUnits(courseId),
    };
  }, [courseId]);
  const lessons = useMemo(
    () => course.units.flatMap((unit) => unit.lessons),
    [course]
  );
  const playableLessons = useMemo(
    () => lessons.filter((lesson) => lesson.type !== 'chest'),
    [lessons]
  );

  const activeNodeId = useMemo(() => {
    const next = lessons.find((lesson, index) => {
      const previousComplete = index === 0 || completed.includes(lessons[index - 1].id);
      return previousComplete && !completed.includes(lesson.id) && lesson.type !== 'chest';
    });
    return next?.id;
  }, [completed, lessons]);

  function handleNodePress(node, index) {
    const isLocked = index > 0 && !completed.includes(lessons[index - 1].id);
    if (isLocked) {
      Alert.alert('Lesson locked', 'Finish the previous step first to unlock this lesson.');
      return;
    }

    if (node.type === 'chest') {
      if (completed.includes(node.id)) {
        Alert.alert('Already opened', 'You claimed this reward already.');
        return;
      }
      setGems((current) => current + 25);
      setXp((current) => current + node.xp);
      setCompleted((current) => [...current, node.id]);
      Alert.alert('Chest opened! 🎁', `You earned ${node.xp} XP and 25 gems.`);
      return;
    }

    setSelectedNode({ ...node, index });
  }

  function startLesson() {
    if (!hasHearts) {
      Alert.alert('No hearts left', 'Refill hearts from the shop or wait before starting another lesson.');
      return;
    }
    setActiveLesson(selectedNode);
    setSelectedNode(null);
  }

  function completeLesson() {
    if (activeLesson && !completed.includes(activeLesson.id)) {
      const nextXp = xp + activeLesson.xp;
      const nextStreak = completed.length === 0 ? streak + 1 : streak;

      setCompleted((current) => [...current, activeLesson.id]);
      setXp(nextXp);
      setGems((current) => current + 5);
      if (completed.length === 0) {
        setStreak(nextStreak);
      }

      if (isAuthenticated) {
        syncProgress({
          xp: nextXp,
          streak: nextStreak,
          currentCourse: courseId,
          currentLesson: activeLesson.id,
        });
      }
    }
    setActiveLesson(null);
  }

  function buyItem(itemId, cost) {
    if (gems < cost) {
      Alert.alert('Not enough gems', 'Complete lessons and open chests to earn more.');
      return;
    }

    setGems((current) => current - cost);
    setPurchasedItems((current) => [...current, itemId]);
    if (itemId === 'refill') {
      refillHearts();
      Alert.alert('Hearts refilled!', 'You are ready for more lessons.');
    } else {
      Alert.alert('Purchased!', 'This boost is now active.');
    }
  }

  if (activeLesson) {
    return (
      <LessonPlayer
        lesson={activeLesson}
        hearts={hearts}
        maxHearts={maxHearts}
        onExit={() => setActiveLesson(null)}
        onMistake={loseHeart}
        onComplete={completeLesson}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.courseSelectButton}>
          <Text style={styles.courseFlag}>{course.flag}</Text>
          <Text style={styles.courseChevron}>⌄</Text>
        </Pressable>
        <View style={styles.statsContainer}>
          <View style={styles.statPill}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statText}>{streak}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statText}>{gems}</Text>
          </View>
          <HeartsBar hearts={hearts} maxHearts={maxHearts} />
        </View>
      </View>

      <View style={styles.mainContainer}>
        {activeTab === 'path' ? (
          <ScrollView contentContainerStyle={styles.pathContent} showsVerticalScrollIndicator={false}>
            {course.units.map((unit) => {
              const unitColor = unit.themeColor || course.themeColor;
              const firstGlobalIndex = lessons.findIndex((lesson) => lesson.id === unit.lessons[0]?.id);
              const playableInUnit = unit.lessons.filter((lesson) => lesson.type !== 'chest');
              const completedInUnit = playableInUnit.filter((lesson) => completed.includes(lesson.id)).length;
              const unitProgress = playableInUnit.length ? completedInUnit / playableInUnit.length : 0;
              const containsActiveLesson = unit.lessons.some((lesson) => lesson.id === activeNodeId);

              return (
                <View key={unit.id} style={styles.unitSection}>
                  <LinearGradient
                    colors={[unitColor, colors.splashWarm]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.unitHeaderCard}
                  >
                    <View style={styles.unitCopy}>
                      <Text style={styles.unitEyebrow}>{unit.title}</Text>
                      <Text style={styles.unitTitle}>{unit.description}</Text>
                      <Text style={styles.unitSubcopy}>{unit.goal}</Text>
                    </View>
                    <View style={styles.unitBook}>
                      <Text style={styles.unitBookIcon}>📚</Text>
                    </View>
                  </LinearGradient>

                  <View style={styles.progressCard}>
                    <Text style={styles.progressLabel}>Unit progress</Text>
                    <Text style={styles.progressValue}>{Math.round(unitProgress * 100)}%</Text>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.round(unitProgress * 100)}%`,
                            backgroundColor: unitColor,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.pathMapContainer}>
                    {unit.lessons.map((node, unitIndex) => {
                      const globalIndex = firstGlobalIndex + unitIndex;
                      const isCompleted = completed.includes(node.id);
                      const isLocked = globalIndex > 0 && !completed.includes(lessons[globalIndex - 1].id);
                      const isActive = node.id === activeNodeId && !isLocked && !isCompleted;

                      return (
                        <PathNode
                          key={node.id}
                          node={node}
                          index={unitIndex}
                          isCompleted={isCompleted}
                          isActive={isActive}
                          isLocked={isLocked}
                          themeColor={unitColor}
                          accentColor={course.accentColor}
                          onPress={() => handleNodePress(node, globalIndex)}
                        />
                      );
                    })}
                    {containsActiveLesson ? (
                      <View style={styles.mascotContainer}>
                        <MascotHero />
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : null}

        {activeTab === 'shop' ? (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Shop 💎</Text>
            <Text style={styles.tabSubtitle}>Use gems for boosts that keep lessons moving.</Text>
            <ShopItem emoji="❤️" title="Refill Hearts" detail="Restore all 5 hearts instantly." action="150 💎" onPress={() => buyItem('refill', 150)} />
            <ShopItem
              emoji="🔥"
              title="Streak Freeze"
              detail="Protect your streak if you miss a day."
              action={purchasedItems.includes('freeze') ? 'ACTIVE' : '300 💎'}
              disabled={purchasedItems.includes('freeze')}
              onPress={() => buyItem('freeze', 300)}
            />
            <ShopItem
              emoji="🎩"
              title="Mascot Hat"
              detail="Give your guide a fresh lesson look."
              action={purchasedItems.includes('hat') ? 'OWNED' : '400 💎'}
              disabled={purchasedItems.includes('hat')}
              onPress={() => buyItem('hat', 400)}
            />
          </ScrollView>
        ) : null}

        {activeTab === 'leaderboard' ? (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Leagues 🏆</Text>
            <Text style={styles.tabSubtitle}>Climb by finishing lessons and keeping your streak alive.</Text>
            {[
              ['🥇', 'Aisha S.', '1,450 XP'],
              ['🥈', 'Kofi B.', '1,210 XP'],
              ['🥉', 'Marcus J.', '980 XP'],
              ['4', 'You', `${xp} XP`],
            ].map(([rank, name, score]) => (
              <View key={name} style={[styles.leaderRow, name === 'You' && styles.leaderRowUser]}>
                <Text style={styles.leaderRank}>{rank}</Text>
                <Text style={styles.leaderName}>{name}</Text>
                <Text style={styles.leaderXp}>{score}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}

        {activeTab === 'profile' ? (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>🦉</Text>
              </View>
              <Text style={styles.profileName}>Diaspora Scholar</Text>
              <Text style={styles.profileNative}>Native language: {userLanguage?.toUpperCase() || 'ENGLISH'}</Text>
            </View>
            <View style={styles.statsGrid}>
              <StatCard label="Total XP" value={xp} />
              <StatCard label="Streak" value={`${streak} days`} />
              <StatCard label="Gems" value={gems} />
              <StatCard label="Lessons" value={completed.filter((id) => playableLessons.some((lesson) => lesson.id === id)).length} />
            </View>
          </ScrollView>
        ) : null}

        {activeTab === 'settings' ? (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Settings ⚙️</Text>
            <Text style={styles.tabSubtitle}>Lesson-focused settings for the learning path.</Text>
            <SettingRow label="Sound effects" active />
            <SettingRow label="Daily reminders" active />
            <SettingRow label="Dark theme" active />
          </ScrollView>
        ) : null}
      </View>

      <LessonPreview node={selectedNode} course={course} onClose={() => setSelectedNode(null)} onStart={startLesson} />

      <OutOfHeartsModal visible={showOutOfHearts} onClose={closeOutOfHearts} onRefill={refillHearts} />

      <View style={styles.bottomTabBar}>
        <TabButton icon="🏠" label="Path" active={activeTab === 'path'} color={course.themeColor} onPress={() => setActiveTab('path')} />
        <TabButton icon="🛍️" label="Shop" active={activeTab === 'shop'} color={course.themeColor} onPress={() => setActiveTab('shop')} />
        <TabButton icon="🏆" label="Leagues" active={activeTab === 'leaderboard'} color={course.themeColor} onPress={() => setActiveTab('leaderboard')} />
        <TabButton icon="👤" label="Profile" active={activeTab === 'profile'} color={course.themeColor} onPress={() => setActiveTab('profile')} />
        <TabButton icon="⚙️" label="Settings" active={activeTab === 'settings'} color={course.themeColor} onPress={() => setActiveTab('settings')} />
      </View>
    </SafeAreaView>
  );
}

function LessonPreview({ node, course, onClose, onStart }) {
  return (
    <Modal animationType="slide" transparent visible={Boolean(node)} onRequestClose={onClose}>
      <View style={styles.previewBackdrop}>
        <View style={styles.previewSheet}>
          <Pressable onPress={onClose} style={styles.previewClose}>
            <Text style={styles.previewCloseText}>×</Text>
          </Pressable>
          <Text style={styles.previewTitle}>{node?.phrase}</Text>
          <Text style={styles.previewSubtitle}>{node?.title}</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>In this lesson</Text>
            <Text style={styles.previewPhrase}>{node?.phrase}</Text>
            <Text style={styles.previewMeaning}>{node?.meaning}</Text>
            <View style={styles.contextRow}>
              <Text style={styles.contextIcon}>💡</Text>
              <Text style={styles.contextTitle}>Cultural context</Text>
            </View>
            <Text style={styles.previewNote}>{node?.note}</Text>
          </View>
          <PrimaryButton label={`START LESSON (+${node?.xp || 0} XP)`} onPress={onStart} />
        </View>
      </View>
    </Modal>
  );
}

function TabButton({ icon, label, active, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tabItem, active && styles.tabItemActive]}>
      <Text style={styles.tabItemEmoji}>{icon}</Text>
      <Text style={[styles.tabItemText, active && { color }]}>{label}</Text>
    </Pressable>
  );
}

function ShopItem({ emoji, title, detail, action, disabled, onPress }) {
  return (
    <View style={styles.shopItem}>
      <Text style={styles.shopEmoji}>{emoji}</Text>
      <View style={styles.shopCopy}>
        <Text style={styles.shopTitle}>{title}</Text>
        <Text style={styles.shopDetail}>{detail}</Text>
      </View>
      <Pressable disabled={disabled} onPress={onPress} style={[styles.buyButton, disabled && styles.buyButtonDisabled]}>
        <Text style={styles.buyButtonText}>{action}</Text>
      </Pressable>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statCardValue}>{value}</Text>
      <Text style={styles.statCardLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ label, active }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingName}>{label}</Text>
      <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
        <View style={[styles.switchKnob, active && styles.switchKnobActive]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.splash,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  courseSelectButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  courseFlag: {
    fontSize: 24,
  },
  courseChevron: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statIcon: {
    fontSize: 17,
  },
  statText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  mainContainer: {
    flex: 1,
    paddingBottom: 72,
  },
  pathContent: {
    padding: spacing.md,
    paddingBottom: 140,
  },
  unitSection: {
    marginBottom: spacing.xl,
  },
  unitHeaderCard: {
    borderRadius: radius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 132,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  unitCopy: {
    flex: 1,
  },
  unitEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  unitTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 27,
    lineHeight: 34,
    marginTop: spacing.xs,
  },
  unitSubcopy: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fonts.semiBold,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  unitBook: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.xl,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  unitBookIcon: {
    fontSize: 34,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  progressLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  progressValue: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 24,
    marginTop: 2,
  },
  progressTrack: {
    backgroundColor: colors.locked,
    borderRadius: radius.pill,
    height: 12,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: radius.pill,
    height: '100%',
  },
  pathMapContainer: {
    alignItems: 'center',
    minHeight: 560,
    paddingTop: spacing.xl,
  },
  nodeRow: {
    alignItems: 'center',
    height: 104,
    justifyContent: 'center',
    position: 'relative',
    width: 180,
  },
  pathLine: {
    backgroundColor: colors.border,
    height: 78,
    position: 'absolute',
    top: -42,
    width: 8,
  },
  nodeCircle: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderBottomColor: 'rgba(0,0,0,0.25)',
    borderBottomWidth: 6,
    borderColor: '#167EAD',
    borderRadius: 42,
    borderWidth: 4,
    height: 84,
    justifyContent: 'center',
    width: 84,
    zIndex: 2,
  },
  nodeCompleted: {
    borderBottomColor: colors.primaryDark,
  },
  nodeActive: {
    borderWidth: 5,
  },
  nodeLocked: {
    backgroundColor: colors.locked,
    borderColor: colors.border,
    opacity: 0.55,
  },
  nodeChest: {
    backgroundColor: colors.accent,
    borderColor: colors.accentDark,
  },
  nodeTrophy: {
    backgroundColor: colors.purple,
    borderColor: '#9A50D6',
  },
  nodeText: {
    color: colors.splash,
    fontFamily: fonts.black,
    fontSize: 28,
  },
  nodeTextCompleted: {
    color: colors.text,
  },
  nodeEmoji: {
    fontSize: 32,
  },
  activeRing: {
    borderRadius: 50,
    borderWidth: 4,
    height: 100,
    position: 'absolute',
    width: 100,
  },
  mascotContainer: {
    position: 'absolute',
    right: 6,
    top: 260,
    transform: [{ scale: 0.82 }],
  },
  tabContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  tabTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 30,
  },
  tabSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  shopItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  shopEmoji: {
    fontSize: 30,
  },
  shopCopy: {
    flex: 1,
  },
  shopTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 17,
  },
  shopDetail: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: colors.blue,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buyButtonDisabled: {
    backgroundColor: colors.locked,
  },
  buyButtonText: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 12,
  },
  leaderRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  leaderRowUser: {
    borderColor: colors.primary,
  },
  leaderRank: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 24,
    width: 40,
  },
  leaderName: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.black,
    fontSize: 17,
  },
  leaderXp: {
    color: colors.accent,
    fontFamily: fonts.black,
    fontSize: 15,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 56,
    borderWidth: 2,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  avatarEmoji: {
    fontSize: 54,
  },
  profileName: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 24,
    marginTop: spacing.md,
  },
  profileNative: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    marginTop: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    width: '47%',
  },
  statCardValue: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 22,
  },
  statCardLabel: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    marginTop: spacing.xs,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  settingName: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  switchTrack: {
    backgroundColor: colors.locked,
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    padding: 3,
    width: 54,
  },
  switchTrackActive: {
    backgroundColor: colors.primary,
  },
  switchKnob: {
    backgroundColor: colors.text,
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  switchKnobActive: {
    alignSelf: 'flex-end',
  },
  previewBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.58)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewSheet: {
    backgroundColor: colors.surfaceMuted,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  previewClose: {
    alignSelf: 'flex-end',
    padding: spacing.xs,
  },
  previewCloseText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 34,
  },
  previewTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 34,
  },
  previewSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    marginTop: spacing.xs,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginVertical: spacing.lg,
    padding: spacing.lg,
  },
  previewLabel: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previewPhrase: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 34,
    marginTop: spacing.sm,
  },
  previewMeaning: {
    color: colors.blue,
    fontFamily: fonts.black,
    fontSize: 21,
    marginTop: spacing.xs,
  },
  contextRow: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
  contextIcon: {
    fontSize: 20,
  },
  contextTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 17,
  },
  previewNote: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.sm,
  },
  bottomTabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 72,
    left: 0,
    paddingBottom: spacing.sm,
    position: 'absolute',
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    opacity: 0.55,
  },
  tabItemActive: {
    opacity: 1,
  },
  tabItemEmoji: {
    fontSize: 22,
  },
  tabItemText: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 10,
    marginTop: 2,
  },
  lessonSafeArea: {
    backgroundColor: '#140F0C',
    flex: 1,
  },
  lessonTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#2B211B',
    borderColor: '#4A3529',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  closeButtonPressed: {
    opacity: 0.65,
  },
  closeButtonText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 38,
    lineHeight: 40,
  },
  lessonProgressTrack: {
    backgroundColor: '#33261F',
    borderRadius: radius.pill,
    flex: 1,
    height: 18,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    height: '100%',
  },
  lessonContent: {
    padding: spacing.lg,
    paddingBottom: 220,
  },
  lessonTitle: {
    color: colors.text,
    fontFamily: fonts.black,
    fontSize: 31,
    lineHeight: 38,
    marginBottom: spacing.lg,
  },
  lessonPromptRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  speechCard: {
    alignItems: 'center',
    backgroundColor: '#1E1612',
    borderColor: '#4A3529',
    borderRadius: radius.lg,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  soundIcon: {
    fontSize: 28,
  },
  speechTextWrap: {
    flex: 1,
  },
  phraseText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 23,
    lineHeight: 32,
  },
  phraseHint: {
    color: colors.textLight,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  choiceList: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  answerCard: {
    alignItems: 'center',
    backgroundColor: '#1E1612',
    borderColor: '#4A3529',
    borderBottomWidth: 5,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
  },
  answerCardSelected: {
    backgroundColor: 'rgba(244, 185, 66, 0.14)',
    borderColor: colors.accent,
  },
  answerCardText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: 'center',
  },
  buildArea: {
    marginTop: spacing.xl,
  },
  answerTray: {
    alignContent: 'flex-start',
    borderBottomColor: '#4A3529',
    borderBottomWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    minHeight: 76,
    paddingBottom: spacing.md,
  },
  answerPlaceholder: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  wordBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  wordChip: {
    backgroundColor: '#1E1612',
    borderColor: '#4A3529',
    borderBottomWidth: 4,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wordChipSelected: {
    backgroundColor: '#2B211B',
    borderColor: colors.accent,
    borderBottomWidth: 4,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  wordChipUsed: {
    opacity: 0.22,
  },
  wordChipText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  lessonFooter: {
    backgroundColor: '#1E1612',
    borderTopColor: '#2E221B',
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    position: 'absolute',
    right: 0,
  },
  correctFooter: {
    backgroundColor: '#173823',
  },
  wrongFooter: {
    backgroundColor: '#3A1D1C',
  },
  feedbackCopy: {
    marginBottom: spacing.md,
  },
  feedbackTitle: {
    color: colors.primary,
    fontFamily: fonts.black,
    fontSize: 24,
  },
  feedbackTitleWrong: {
    color: colors.error,
  },
  feedbackBody: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: spacing.xs,
  },
});
