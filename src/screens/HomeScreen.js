import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import HeartsBar from '../components/HeartsBar';
import MascotHero from '../components/MascotHero';
import OutOfHeartsModal from '../components/OutOfHeartsModal';
import PrimaryButton from '../components/PrimaryButton';
import { useGame } from '../context/GameContext';
import { coursesData } from '../data/lessons';
import { colors, fonts, radius, spacing } from '../theme';

// Helper to calculate winding path offset
const getMarginLeft = (index) => {
  const cycle = index % 8;
  if (cycle === 0) return 0;
  if (cycle === 1) return 45;
  if (cycle === 2) return 75;
  if (cycle === 3) return 45;
  if (cycle === 4) return 0;
  if (cycle === 5) return -45;
  if (cycle === 6) return -75;
  if (cycle === 7) return -45;
  return 0;
};

// Node component inside winding path
function PathNode({
  node,
  index,
  isCompleted,
  isActive,
  isLocked,
  themeColor,
  accentColor,
  onPress,
}) {
  const isChest = node.type === 'chest';
  const isCamera = node.type === 'camera';
  const isTrophy = node.type === 'trophy';

  // Winding offset
  const marginLeft = getMarginLeft(index);

  return (
    <View style={[styles.nodeRow, { transform: [{ translateX: marginLeft }] }]}>
      {/* Connector Line */}
      {index > 0 && <View style={styles.pathLine} />}

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.nodeCircle,
          isCompleted && [styles.nodeCompleted, { backgroundColor: themeColor, borderColor: themeColor + 'CC' }],
          isActive && [styles.nodeActive, { borderColor: accentColor }],
          isLocked && styles.nodeLocked,
          isChest && styles.nodeChestStyle,
          isTrophy && styles.nodeTrophyStyle,
          pressed && { transform: [{ scale: 0.95 }] },
        ]}
      >
        {isChest ? (
          <Text style={styles.nodeEmoji}>{node.claimed ? '📂' : '🎁'}</Text>
        ) : isTrophy ? (
          <Text style={styles.nodeEmoji}>🏆</Text>
        ) : isCamera ? (
          <Text style={styles.nodeEmoji}>🗣️</Text>
        ) : (
          <Text style={[styles.nodeText, isCompleted && styles.nodeTextCompleted]}>
            {isCompleted ? '✓' : index + 1}
          </Text>
        )}
      </Pressable>

      {/* active glow indicator */}
      {isActive && (
        <View style={[styles.activeIndicatorRing, { borderColor: accentColor }]} />
      )}
    </View>
  );
}

export default function HomeScreen({ courseId = 'patois', userLanguage, onBack }) {
  const {
    hearts,
    maxHearts,
    hasHearts,
    showOutOfHearts,
    loseHeart,
    refillHearts,
    closeOutOfHearts,
  } = useGame();

  // Active Bottom Tab: 'home' | 'shop' | 'leaderboard' | 'profile' | 'chats' | 'settings'
  const [activeTab, setActiveTab] = useState('home');

  // Course Data
  const course = useMemo(() => coursesData[courseId] || coursesData.patois, [courseId]);
  const lessons = useMemo(() => course.units[0].lessons, [course]);

  // Game States
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(120);
  const [gems, setGems] = useState(565);
  const [streak, setStreak] = useState(3);
  const [selectedNode, setSelectedNode] = useState(null); // Node clicked for details
  const [quizActive, setQuizActive] = useState(false); // Quick quiz modal
  const [selectedChoice, setSelectedChoice] = useState(null);

  // Shop States
  const [purchasedItems, setPurchasedItems] = useState([]);

  // Chats States
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Wah gwaan! Ready to learn some phrases today? 🇯🇲' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Node details
  const activeNodeIndex = useMemo(() => {
    return lessons.findIndex((node) => !completed.includes(node.id) && node.type !== 'chest');
  }, [lessons, completed]);

  const activeNodeId = useMemo(() => {
    const act = lessons[activeNodeIndex];
    return act ? act.id : null;
  }, [lessons, activeNodeIndex]);

  const progress = useMemo(() => {
    const playableLessons = lessons.filter(l => l.type !== 'chest');
    const donePlayable = completed.filter(id => {
      const lesson = lessons.find(l => l.id === id);
      return lesson && lesson.type !== 'chest';
    });
    return playableLessons.length > 0 ? donePlayable.length / playableLessons.length : 0;
  }, [lessons, completed]);

  // Handle node tap
  function handleNodePress(node, index) {
    const isLocked = index > 0 && !completed.includes(lessons[index - 1].id);
    if (isLocked) {
      Alert.alert('Lesson Locked', 'Please complete the previous lessons first to unlock this unit!');
      return;
    }

    if (node.type === 'chest') {
      if (node.claimed || completed.includes(node.id)) {
        Alert.alert('Already Claimed', 'You have already opened this treasure chest!');
        return;
      }
      // Claim chest rewards
      setGems((g) => g + 25);
      setXp((x) => x + node.xp);
      setCompleted((prev) => [...prev, node.id]);
      Alert.alert('Chest Opened! 🎁', `You claimed ${node.xp} XP and 25 Gems!`);
      return;
    }

    setSelectedNode({ ...node, index });
  }

  // Quiz Handling
  const quiz = selectedNode?.quiz;
  const isQuizCorrect = selectedChoice === quiz?.answer;

  function handleChoicePress(choice) {
    if (!hasHearts || isQuizCorrect || choice === selectedChoice) return;
    setSelectedChoice(choice);
    if (choice !== quiz.answer) {
      loseHeart();
    }
  }

  function handleCompleteQuiz() {
    if (!isQuizCorrect) return;

    if (selectedNode) {
      if (!completed.includes(selectedNode.id)) {
        setCompleted((prev) => [...prev, selectedNode.id]);
        setXp((prev) => prev + selectedNode.xp);
        // Chance to increase streak
        if (completed.length === 0) setStreak((s) => s + 1);
      }
    }

    // Reset
    setSelectedChoice(null);
    setQuizActive(false);
    setSelectedNode(null);
  }

  // Shop actions
  function buyItem(itemId, cost) {
    if (gems < cost) {
      Alert.alert('Not enough gems', 'Earn more gems by completing lessons and opening chests.');
      return;
    }
    setGems((g) => g - cost);
    setPurchasedItems((prev) => [...prev, itemId]);
    if (itemId === 'refill') {
      refillHearts();
      Alert.alert('Hearts Refilled! ❤️', 'Your hearts have been fully restored.');
    } else {
      Alert.alert('Purchased! 🛍️', 'This item is now active in your profile.');
    }
  }

  // Chat Actions
  function sendChatMessage() {
    if (!chatInput.trim()) return;
    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    // Mock bot reply after 1s
    setTimeout(() => {
      let replyText = 'Respect! That sounds good. 👍';
      if (courseId === 'patois') {
        replyText = 'Likkle more! Let us practice more Jamaican talk. Do you know what "Bless up" means?';
      } else if (courseId === 'swahili') {
        replyText = 'Karibu! Kiswahili is beautiful. Sijambo!';
      }
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: replyText },
      ]);
    }, 1000);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header Stats Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.courseSelectButton}>
          <Text style={styles.courseFlag}>{course.flag}</Text>
          <Text style={styles.courseText}>▼</Text>
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

      {!hasHearts && (
        <View style={styles.noHeartsBanner}>
          <Text style={styles.noHeartsTitle}>No Hearts Left 💔</Text>
          <Text style={styles.noHeartsText}>
            Tap a chest, buy refills in the shop, or wait for automatic refill.
          </Text>
        </View>
      )}

      {/* MAIN VIEW AREA (Rendered based on selected tab) */}
      <View style={styles.mainContainer}>
        {activeTab === 'home' && (
          <ScrollView
            contentContainerStyle={styles.pathScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Unit Header Card */}
            <View style={[styles.unitHeaderCard, { backgroundColor: course.themeColor }]}>
              <View style={styles.unitHeaderTextCol}>
                <Text style={styles.unitNumberText}>{course.units[0].title}</Text>
                <Text style={styles.unitDescText}>{course.units[0].description}</Text>
              </View>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Unit Details',
                    `This unit covers: Greetings, vocabulary and dialogue practice in ${course.title}.`
                  )
                }
                style={styles.notebookBtn}
              >
                <Text style={styles.notebookEmoji}>📓</Text>
              </Pressable>
            </View>

            {/* Winding Nodes Path Map */}
            <View style={styles.pathMapContainer}>
              {lessons.map((node, index) => {
                const isCompleted = completed.includes(node.id);
                const isLocked = index > 0 && !completed.includes(lessons[index - 1].id);
                const isActive = node.id === activeNodeId && !isLocked && !isCompleted;

                return (
                  <PathNode
                    key={node.id}
                    node={node}
                    index={index}
                    isCompleted={isCompleted}
                    isActive={isActive}
                    isLocked={isLocked}
                    themeColor={course.themeColor}
                    accentColor={course.accentColor}
                    onPress={() => handleNodePress(node, index)}
                  />
                );
              })}

              {/* Absolutely Positioned Mascot Character on path */}
              <View style={styles.mascotContainer}>
                <MascotHero />
                <View style={styles.starsRow}>
                  <Text style={styles.mascotStar}>⭐</Text>
                  <Text style={styles.mascotStar}>⭐</Text>
                  <Text style={styles.mascotStar}>⭐</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        {/* SHOP TAB */}
        {activeTab === 'shop' && (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Diaspora Shop 💎</Text>
            <Text style={styles.tabSubtitle}>Spend gems to purchase exclusive items and powerups.</Text>

            <View style={styles.shopItem}>
              <Text style={styles.shopItemEmoji}>❤️</Text>
              <View style={styles.shopItemDetails}>
                <Text style={styles.shopItemName}>Refill Hearts</Text>
                <Text style={styles.shopItemDesc}>Instantly restores all 5 hearts</Text>
              </View>
              <Pressable onPress={() => buyItem('refill', 150)} style={styles.buyButton}>
                <Text style={styles.buyButtonText}>150 💎</Text>
              </Pressable>
            </View>

            <View style={styles.shopItem}>
              <Text style={styles.shopItemEmoji}>🔥</Text>
              <View style={styles.shopItemDetails}>
                <Text style={styles.shopItemName}>Streak Freeze</Text>
                <Text style={styles.shopItemDesc}>Keep your streak active if you miss a day</Text>
              </View>
              <Pressable
                disabled={purchasedItems.includes('freeze')}
                onPress={() => buyItem('freeze', 300)}
                style={[styles.buyButton, purchasedItems.includes('freeze') && styles.buyButtonDisabled]}
              >
                <Text style={styles.buyButtonText}>
                  {purchasedItems.includes('freeze') ? 'ACTIVE' : '300 💎'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.shopItem}>
              <Text style={styles.shopItemEmoji}>🎩</Text>
              <View style={styles.shopItemDetails}>
                <Text style={styles.shopItemName}>Mascot Hat</Text>
                <Text style={styles.shopItemDesc}>Dress the mascot in a cool diaspora headwear</Text>
              </View>
              <Pressable
                disabled={purchasedItems.includes('hat')}
                onPress={() => buyItem('hat', 400)}
                style={[styles.buyButton, purchasedItems.includes('hat') && styles.buyButtonDisabled]}
              >
                <Text style={styles.buyButtonText}>
                  {purchasedItems.includes('hat') ? 'EQUIPPED' : '400 💎'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Leaderboard 🏆</Text>
            <Text style={styles.tabSubtitle}>Compete weekly with other learners in the diaspora.</Text>

            <View style={styles.leaderRow}>
              <Text style={styles.leaderRank}>🥇</Text>
              <Text style={styles.leaderName}>Aisha S.</Text>
              <Text style={styles.leaderXp}>1,450 XP</Text>
            </View>
            <View style={styles.leaderRow}>
              <Text style={styles.leaderRank}>🥈</Text>
              <Text style={styles.leaderName}>Kofi B.</Text>
              <Text style={styles.leaderXp}>1,210 XP</Text>
            </View>
            <View style={styles.leaderRow}>
              <Text style={styles.leaderRank}>🥉</Text>
              <Text style={styles.leaderName}>Marcus J.</Text>
              <Text style={styles.leaderXp}>980 XP</Text>
            </View>
            <View style={[styles.leaderRow, styles.leaderRowUser]}>
              <Text style={styles.leaderRank}>4</Text>
              <Text style={[styles.leaderName, styles.bold]}>You (Learner)</Text>
              <Text style={styles.leaderXp}>{xp} XP</Text>
            </View>
          </ScrollView>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>🦉</Text>
              </View>
              <Text style={styles.profileName}>Diaspora Scholar</Text>
              <Text style={styles.profileNative}>Native Language: {userLanguage?.toUpperCase() || 'ENGLISH'}</Text>
            </View>

            <Text style={styles.sectionLabel}>Your Statistics</Text>
            <View style={styles.statsCardGrid}>
              <View style={styles.statsCardGridItem}>
                <Text style={styles.gridStatVal}>{xp}</Text>
                <Text style={styles.gridStatLbl}>Total XP</Text>
              </View>
              <View style={styles.statsCardGridItem}>
                <Text style={styles.gridStatVal}>{streak} Days</Text>
                <Text style={styles.gridStatLbl}>Active Streak</Text>
              </View>
              <View style={styles.statsCardGridItem}>
                <Text style={styles.gridStatVal}>{gems}</Text>
                <Text style={styles.gridStatLbl}>Gems Balance</Text>
              </View>
              <View style={styles.statsCardGridItem}>
                <Text style={styles.gridStatVal}>{completed.length}</Text>
                <Text style={styles.gridStatLbl}>Completed Steps</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* CHATS TAB */}
        {activeTab === 'chats' && (
          <View style={styles.chatsContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>Chat with Duo 🦉</Text>
              <Text style={styles.chatStatus}>Practice your chosen course dialect</Text>
            </View>

            <ScrollView
              style={styles.chatMsgScroll}
              contentContainerStyle={{ padding: spacing.md }}
              showsVerticalScrollIndicator={false}
            >
              {chatMessages.map((msg) => (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubble,
                    msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatText,
                      msg.sender === 'user' ? styles.chatTextUser : styles.chatTextBot,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatInputRow}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type here..."
                style={styles.chatTextInput}
                onSubmitEditing={sendChatMessage}
              />
              <Pressable onPress={sendChatMessage} style={styles.chatSendBtn}>
                <Text style={styles.chatSendBtnText}>➔</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <ScrollView contentContainerStyle={styles.tabContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.tabTitle}>Settings ⚙️</Text>
            <Text style={styles.tabSubtitle}>Configure preferences for your learning experience.</Text>

            <View style={styles.settingOption}>
              <Text style={styles.settingName}>Sound Effects</Text>
              <View style={styles.switchMockActive}>
                <View style={styles.switchMockKnobActive} />
              </View>
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.settingName}>Daily Reminders</Text>
              <View style={styles.switchMockActive}>
                <View style={styles.switchMockKnobActive} />
              </View>
            </View>

            <View style={styles.settingOption}>
              <Text style={styles.settingName}>Dark Theme (Beta)</Text>
              <View style={styles.switchMockInactive}>
                <View style={styles.switchMockKnobInactive} />
              </View>
            </View>

            <Pressable
              onPress={() => {
                Alert.alert('Reset Progress', 'Are you sure you want to clear your learning streak?', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                      setCompleted([]);
                      setXp(0);
                      setStreak(0);
                      setGems(100);
                      Alert.alert('Cleared!', 'All progress reset.');
                    },
                  },
                ]);
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset My Progress</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* NODE CLICK DETAIL OVERLAY (Bottom Sheet Popover style) */}
      {selectedNode && (
        <Modal animationType="slide" transparent visible={!!selectedNode}>
          <View style={styles.modalOverlay}>
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetTitle}>{selectedNode.title}</Text>
                <Pressable onPress={() => setSelectedNode(null)} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.bottomSheetSub}>{selectedNode.subtitle}</Text>

              <View style={styles.bottomSheetDetailsCard}>
                <Text style={styles.phraseLabel}>TARGET PHRASE:</Text>
                <Text style={styles.phraseVal}>{selectedNode.phrase}</Text>
                <Text style={styles.meaningVal}>"{selectedNode.meaning}"</Text>

                <View style={styles.divider} />
                <Text style={styles.culturalNoteTitle}>💡 Cultural Context</Text>
                <Text style={styles.culturalNoteText}>{selectedNode.note}</Text>
              </View>

              <View style={styles.bottomSheetFooter}>
                <PrimaryButton
                  label={`START LESSON (+${selectedNode.xp} XP)`}
                  disabled={!hasHearts}
                  onPress={() => setQuizActive(true)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* QUIZ MODAL OVERLAY */}
      {quizActive && quiz && (
        <Modal animationType="slide" visible={quizActive}>
          <SafeAreaView style={styles.quizSafeArea}>
            <View style={styles.quizHeader}>
              <Pressable
                onPress={() => {
                  setSelectedChoice(null);
                  setQuizActive(false);
                }}
                style={styles.quizCloseBtn}
              >
                <Text style={styles.quizCloseBtnText}>✕</Text>
              </Pressable>
              <View style={styles.quizProgressTrack}>
                <View style={[styles.quizProgressFill, { width: selectedChoice ? '100%' : '50%' }]} />
              </View>
            </View>

            <View style={styles.quizBody}>
              <Text style={styles.quizPrompt}>{quiz.prompt}</Text>

              <View style={styles.quizChoicesList}>
                {quiz.choices.map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = choice === quiz.answer;
                  const showSuccess = selectedChoice && isCorrect;
                  const showFailure = isSelected && !isCorrect;

                  return (
                    <Pressable
                      key={choice}
                      disabled={selectedChoice !== null}
                      onPress={() => handleChoicePress(choice)}
                      style={[
                        styles.quizChoiceCard,
                        isSelected && styles.quizChoiceSelected,
                        showSuccess && styles.quizChoiceCorrect,
                        showFailure && styles.quizChoiceWrong,
                      ]}
                    >
                      <Text style={styles.quizChoiceText}>{choice}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Verification & Success Bottom Banner */}
            <View style={styles.quizFooter}>
              {selectedChoice ? (
                <View
                  style={[
                    styles.quizFeedbackBox,
                    isQuizCorrect ? styles.quizFeedbackSuccess : styles.quizFeedbackError,
                  ]}
                >
                  <Text style={styles.quizFeedbackTitle}>
                    {isQuizCorrect ? 'Correct! 🎉' : 'Incorrect choice 💔'}
                  </Text>
                  <Text style={styles.quizFeedbackBody}>
                    {isQuizCorrect
                      ? 'You successfully understood the expression.'
                      : `The correct translation was "${quiz.answer}".`}
                  </Text>
                  <View style={{ marginTop: spacing.md }}>
                    <PrimaryButton label="CONTINUE" onPress={handleCompleteQuiz} />
                  </View>
                </View>
              ) : (
                <Text style={styles.chooseToVerifyText}>Select an option above to verify your answer</Text>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      )}

      {/* Out of Hearts dialog */}
      <OutOfHeartsModal
        visible={showOutOfHearts}
        onClose={closeOutOfHearts}
        onRefill={refillHearts}
      />

      {/* BOTTOM TAB BAR NAVIGATION */}
      <View style={styles.bottomTabBar}>
        <Pressable
          onPress={() => setActiveTab('home')}
          style={[styles.tabItem, activeTab === 'home' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>🏠</Text>
          <Text style={[styles.tabItemText, activeTab === 'home' && { color: course.themeColor }]}>Path</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('shop')}
          style={[styles.tabItem, activeTab === 'shop' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>🛍️</Text>
          <Text style={[styles.tabItemText, activeTab === 'shop' && { color: course.themeColor }]}>Shop</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('leaderboard')}
          style={[styles.tabItem, activeTab === 'leaderboard' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>🏆</Text>
          <Text style={[styles.tabItemText, activeTab === 'leaderboard' && { color: course.themeColor }]}>Leagues</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('profile')}
          style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>👤</Text>
          <Text style={[styles.tabItemText, activeTab === 'profile' && { color: course.themeColor }]}>Profile</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('chats')}
          style={[styles.tabItem, activeTab === 'chats' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>🦉</Text>
          <Text style={[styles.tabItemText, activeTab === 'chats' && { color: course.themeColor }]}>Chats</Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('settings')}
          style={[styles.tabItem, activeTab === 'settings' && styles.tabItemActive]}
        >
          <Text style={styles.tabItemEmoji}>⚙️</Text>
          <Text style={[styles.tabItemText, activeTab === 'settings' && { color: course.themeColor }]}>Settings</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 58,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  courseSelectButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  courseFlag: {
    fontSize: 24,
  },
  courseText: {
    color: colors.textLight,
    fontSize: 10,
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statPill: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statIcon: {
    fontSize: 15,
  },
  statText: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 13,
  },
  noHeartsBanner: {
    backgroundColor: colors.errorBg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  noHeartsTitle: {
    color: colors.error,
    fontFamily: fonts.extraBold,
    fontSize: 14,
  },
  noHeartsText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  mainContainer: {
    flex: 1,
  },
  pathScrollContent: {
    paddingBottom: 110, // padding for character & footer
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  unitHeaderCard: {
    borderRadius: radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  unitHeaderTextCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  unitNumberText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: fonts.black,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  unitDescText: {
    color: colors.surface,
    fontFamily: fonts.extraBold,
    fontSize: 18,
    marginTop: 4,
  },
  notebookBtn: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  notebookEmoji: {
    fontSize: 22,
  },
  pathMapContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    position: 'relative',
    width: '100%',
  },
  nodeRow: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    position: 'relative',
    width: 80,
    zIndex: 2,
  },
  pathLine: {
    backgroundColor: colors.border,
    height: 90,
    position: 'absolute',
    top: -50,
    width: 8,
    zIndex: 1,
  },
  nodeCircle: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderColor: '#1899D6',
    borderBottomWidth: 5,
    borderRadius: radius.pill,
    borderWidth: 0,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  nodeCompleted: {
    borderBottomWidth: 5,
  },
  nodeActive: {
    backgroundColor: colors.blue,
    borderBottomWidth: 5,
  },
  nodeLocked: {
    backgroundColor: colors.locked,
    borderBottomColor: '#BDBDBD',
  },
  nodeChestStyle: {
    backgroundColor: '#FFE5B4',
    borderBottomColor: '#D2B48C',
  },
  nodeTrophyStyle: {
    backgroundColor: '#FFE766',
    borderBottomColor: '#CCAC00',
  },
  nodeText: {
    color: colors.surface,
    fontFamily: fonts.black,
    fontSize: 20,
  },
  nodeTextCompleted: {
    color: colors.surface,
  },
  nodeEmoji: {
    fontSize: 26,
  },
  activeIndicatorRing: {
    borderRadius: radius.pill,
    borderWidth: 3,
    height: 74,
    position: 'absolute',
    width: 74,
    zIndex: -1,
  },
  mascotContainer: {
    alignItems: 'center',
    position: 'absolute',
    right: 8,
    top: 140,
    width: 100,
    zIndex: 0,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  mascotStar: {
    color: colors.accent,
    fontSize: 16,
  },
  tabContent: {
    padding: spacing.lg,
    paddingBottom: 80,
  },
  tabTitle: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 26,
  },
  tabSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    marginBottom: spacing.lg,
    marginTop: 4,
  },
  shopItem: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderRadius: radius.lg,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  shopItemEmoji: {
    fontSize: 32,
  },
  shopItemDetails: {
    flex: 1,
  },
  shopItemName: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 16,
  },
  shopItemDesc: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: colors.blue,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buyButtonDisabled: {
    backgroundColor: colors.locked,
  },
  buyButtonText: {
    color: colors.surface,
    fontFamily: fonts.black,
    fontSize: 13,
  },
  leaderRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomWidth: 1,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  leaderRowUser: {
    backgroundColor: colors.primaryLight + '30',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  leaderRank: {
    fontFamily: fonts.black,
    fontSize: 18,
    width: 24,
  },
  leaderName: {
    color: colors.textDark,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  leaderXp: {
    color: colors.textMuted,
    fontFamily: fonts.black,
    fontSize: 14,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  profileName: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 22,
    marginTop: spacing.sm,
  },
  profileNative: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 12,
    marginTop: 2,
  },
  statsCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statsCardGridItem: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomWidth: 3,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
    width: '47%',
  },
  gridStatVal: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 22,
  },
  gridStatLbl: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 11,
    marginTop: 2,
  },
  chatsContainer: {
    flex: 1,
  },
  chatHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    padding: spacing.md,
  },
  chatTitle: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 20,
  },
  chatStatus: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  chatMsgScroll: {
    flex: 1,
  },
  chatBubble: {
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    maxWidth: '80%',
    padding: spacing.md,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.blue,
  },
  chatBubbleBot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
  },
  chatText: {
    fontSize: 15,
  },
  chatTextUser: {
    color: colors.surface,
    fontFamily: fonts.semiBold,
  },
  chatTextBot: {
    color: colors.textDark,
    fontFamily: fonts.semiBold,
  },
  chatInputRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  chatTextInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    fontFamily: fonts.medium,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  chatSendBtn: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  chatSendBtnText: {
    color: colors.surface,
    fontFamily: fonts.black,
    fontSize: 18,
  },
  settingOption: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingName: {
    color: colors.textDark,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  switchMockActive: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 48,
  },
  switchMockKnobActive: {
    alignSelf: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 24,
    width: 24,
  },
  switchMockInactive: {
    backgroundColor: colors.locked,
    borderRadius: 20,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: 2,
    width: 48,
  },
  switchMockKnobInactive: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 24,
    width: 24,
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: '#FFEBEB',
    borderColor: '#FFC1C1',
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  resetButtonText: {
    color: colors.error,
    fontFamily: fonts.extraBold,
    fontSize: 15,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomSheetTitle: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 22,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: colors.textLight,
    fontSize: 18,
  },
  bottomSheetSub: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
    marginTop: 4,
  },
  bottomSheetDetailsCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  phraseLabel: {
    color: colors.textLight,
    fontFamily: fonts.black,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  phraseVal: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 28,
    marginTop: 2,
  },
  meaningVal: {
    color: colors.blue,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginTop: 2,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.sm,
  },
  culturalNoteTitle: {
    color: colors.textDark,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  culturalNoteText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  bottomSheetFooter: {
    marginTop: spacing.lg,
  },
  quizSafeArea: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  quizHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  quizCloseBtn: {
    marginRight: spacing.md,
    padding: 4,
  },
  quizCloseBtnText: {
    color: colors.textMuted,
    fontSize: 20,
  },
  quizProgressTrack: {
    backgroundColor: colors.border,
    borderRadius: radius.pill,
    flex: 1,
    height: 12,
    overflow: 'hidden',
  },
  quizProgressFill: {
    backgroundColor: colors.primary,
    height: '100%',
  },
  quizBody: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  quizPrompt: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 26,
    lineHeight: 32,
  },
  quizChoicesList: {
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  quizChoiceCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.md,
  },
  quizChoiceSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.primaryLight + '10',
  },
  quizChoiceCorrect: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  quizChoiceWrong: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
  },
  quizChoiceText: {
    color: colors.textDark,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  quizFooter: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    minHeight: 100,
    padding: spacing.lg,
  },
  chooseToVerifyText: {
    color: colors.textLight,
    fontFamily: fonts.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  quizFeedbackBox: {
    borderRadius: radius.md,
    padding: spacing.md,
  },
  quizFeedbackSuccess: {
    backgroundColor: colors.successBg,
  },
  quizFeedbackError: {
    backgroundColor: colors.errorBg,
  },
  quizFeedbackTitle: {
    color: colors.textDark,
    fontFamily: fonts.black,
    fontSize: 18,
  },
  quizFeedbackBody: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    marginTop: 4,
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
  bold: {
    fontWeight: 'bold',
  },
});
