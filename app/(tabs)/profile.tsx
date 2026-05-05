import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ScrollView, View, Text, TextInput, Switch, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/useProfile'
import { useProgress } from '@/hooks/useProgress'
import { useSubscription } from '@/hooks/useSubscription'
import { useSettingsStore } from '@/store/settingsStore'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'
import { wordsMasteredArray } from '@/lib/lessonProgress'
import { supabase } from '@/lib/supabase'
import { LANGUAGES, languageByCode } from '@/data'

// ── Constants ─────────────────────────────────────────────────────────────────

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5] as const

const GOAL_OPTIONS: { value: 1|2|3|5; label: string; sub: string }[] = [
  { value: 1, label: '1 lesson',  sub: 'Casual' },
  { value: 2, label: '2 lessons', sub: 'Regular' },
  { value: 3, label: '3 lessons', sub: 'Serious' },
  { value: 5, label: '5 lessons', sub: 'Intense' },
]

const REMINDER_TIMES = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM',
]

// Converts DB '08:00' or '20:00' format → '8:00 AM' / '8:00 PM'
function normalizeReminderTime(raw: string): string {
  if (REMINDER_TIMES.includes(raw)) return raw
  const [hourStr = '8', minuteStr = '0'] = raw.split(':')
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)
  const meridiem = hour >= 12 ? 'PM' : 'AM'
  if (hour > 12) hour -= 12
  if (hour === 0) hour = 12
  return `${hour}:${minute.toString().padStart(2, '0')} ${meridiem}`
}

type OpenPicker = 'goal' | 'accent' | 'speed' | null


// ── Language modal ────────────────────────────────────────────────────────────

function LanguageModal({
  visible, current, onSelect, onClose,
}: {
  visible: boolean; current: string; onSelect: (code: string) => void; onClose: () => void
}) {
  const insets = useSafeAreaInsets()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return LANGUAGES
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q))
  }, [search])

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.modalSafe} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Native language</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={15} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search languages…"
            placeholderTextColor={colors.textHint}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.code}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.modalRow, item.code === current && styles.modalRowSelected]}
              onPress={() => { onSelect(item.code); onClose() }}
              activeOpacity={0.7}
            >
              <Text style={styles.langFlag}>{item.flag}</Text>
              <Text style={[styles.modalRowLabel, item.code === current && styles.modalRowLabelActive]}>
                {item.label}
              </Text>
              {item.code === current && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    </Modal>
  )
}

// ── Reminder time modal ───────────────────────────────────────────────────────

function TimeModal({
  visible, current, onSelect, onClose,
}: {
  visible: boolean; current: string; onSelect: (time: string) => void; onClose: () => void
}) {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <SafeAreaView style={styles.modalSafe} edges={['top']}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Reminder time</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
          {REMINDER_TIMES.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.modalRow, time === current && styles.modalRowSelected]}
              onPress={() => { onSelect(time); onClose() }}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalRowLabel, time === current && styles.modalRowLabelActive]}>
                {time}
              </Text>
              {time === current && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { user, signOut } = useAuthStore()
  const { profile, refetch } = useProfile()
  const { progress, refetch: refetchProgress } = useProgress()

  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [openPicker, setOpenPicker] = useState<OpenPicker>(null)
  const [langModalVisible, setLangModalVisible] = useState(false)
  const [timeModalVisible, setTimeModalVisible] = useState(false)
  const { requestPermission, scheduleReminder, cancelAll } = useNotifications()
  const {
    isPro, loading: subLoading,
    referralCount, freeMonthsRemaining, referralsToNextMonth,
    purchasePro, restorePurchases: restoreSub,
  } = useSubscription()

  const wordsCount = useMemo(() => {
    const set = new Set<string>()
    progress.forEach((p) => wordsMasteredArray(p).forEach((w) => set.add(w)))
    return set.size
  }, [progress])

  const {
    soundEnabled, setSoundEnabled,
    hapticsEnabled, setHapticsEnabled,
    notificationsEnabled, setNotificationsEnabled,
    audioSpeed, setAudioSpeed,
    accent, setAccent,
    dyslexiaFont, setDyslexiaFont,
    largerText, setLargerText,
  } = useSettingsStore()

  useEffect(() => {
    if (profile?.preferred_accent) setAccent(profile.preferred_accent)
    if (profile?.dyslexia_font !== undefined) setDyslexiaFont(profile.dyslexia_font)
    if (profile?.larger_text !== undefined) setLargerText(profile.larger_text)
  }, [profile?.preferred_accent, profile?.dyslexia_font, profile?.larger_text])

  const displayName = profile?.display_name || (user?.user_metadata?.display_name as string | undefined) || 'Learner'
  const initial = displayName.charAt(0).toUpperCase()
  const streak = profile?.streak_days ?? 0
  const xp = profile?.total_xp ?? 0
  const level = profile?.level ?? 1
  const currentGoal = (profile?.daily_goal ?? 2) as 1|2|3|5
  const currentTime = normalizeReminderTime(profile?.reminder_time ?? '8:00 AM')
  const currentLang = profile?.native_language ?? 'es'

  const goalOption = GOAL_OPTIONS.find((g) => g.value === currentGoal) ?? GOAL_OPTIONS[1]!
  const langOption = languageByCode(currentLang)
  const safeSpeed = typeof audioSpeed === 'number' ? audioSpeed : 1.0
  const speedLabel = safeSpeed === 1.0 ? '1×' : `${safeSpeed}×`

  const saveName = useCallback(async () => {
    const trimmed = nameInput.trim()
    if (!trimmed || !user) { setIsEditingName(false); return }
    try {
      await supabase.from('user_profiles').update({ display_name: trimmed }).eq('id', user.id)
      await refetch()
    } catch {
      Alert.alert('Update failed', 'Could not save your name.')
    } finally {
      setIsEditingName(false)
    }
  }, [nameInput, user, refetch])

  const saveDailyGoal = useCallback(async (goal: 1|2|3|5) => {
    if (!user) return
    try {
      await supabase.from('user_profiles').update({ daily_goal: goal }).eq('id', user.id)
      await refetch()
    } catch {
      Alert.alert('Update failed', 'Could not save your daily goal.')
    }
  }, [user, refetch])

  const saveReminder = useCallback(async (time: string) => {
    if (!user) return
    const { error: dbErr } = await supabase
      .from('user_profiles')
      .update({ reminder_time: time })
      .eq('id', user.id)
    if (dbErr) {
      Alert.alert('Update failed', 'Could not save reminder time.')
      return
    }
    await refetch()
    if (notificationsEnabled) {
      scheduleReminder(time).catch(() => {})
    }
  }, [user, refetch, notificationsEnabled])

  const saveAccent = useCallback(async (v: 'american' | 'british') => {
    setAccent(v)
    if (!user) return
    try {
      await supabase.from('user_profiles').update({ preferred_accent: v }).eq('id', user.id)
      await refetch()
    } catch {
      Alert.alert('Update failed', 'Could not save accent.')
    }
  }, [user, refetch, setAccent])

  const saveNativeLanguage = useCallback(async (code: string) => {
    if (!user) return
    try {
      await supabase.from('user_profiles').update({ native_language: code }).eq('id', user.id)
      await refetch()
    } catch {
      Alert.alert('Update failed', 'Could not save your native language.')
    }
  }, [user, refetch])

  const toggleDyslexiaFont = useCallback(async (v: boolean) => {
    setDyslexiaFont(v)
    if (!user) return
    supabase.from('user_profiles').update({ dyslexia_font: v }).eq('id', user.id).then(() => {})
  }, [user, setDyslexiaFont])

  const toggleLargerText = useCallback(async (v: boolean) => {
    setLargerText(v)
    if (!user) return
    supabase.from('user_profiles').update({ larger_text: v }).eq('id', user.id).then(() => {})
  }, [user, setLargerText])

  const toggleNotifications = useCallback(async (v: boolean) => {
    if (v) {
      const granted = await requestPermission()
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Enable notifications in your device Settings to receive daily reminders.',
        )
        return
      }
      setNotificationsEnabled(true)
      scheduleReminder(currentTime).catch(() => {})
    } else {
      setNotificationsEnabled(false)
      cancelAll().catch(() => {})
    }
  }, [setNotificationsEnabled, currentTime, requestPermission, scheduleReminder, cancelAll])

  const handleResetProgress = () => {
    Alert.alert(
      'Reset progress',
      'This will erase all your XP, lessons, and word mastery. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset everything',
          style: 'destructive',
          onPress: async () => {
            if (!user) return
            try {
              await supabase.from('user_progress').delete().eq('user_id', user.id)
              await supabase.from('user_profiles')
                .update({ total_xp: 0, level: 1, streak_days: 0 })
                .eq('id', user.id)
              await Promise.all([refetch(), refetchProgress()])
            } catch {
              Alert.alert('Reset failed', 'Could not reset your progress. Please try again.')
            }
          },
        },
      ]
    )
  }

  const togglePicker = (name: OpenPicker) => {
    setOpenPicker((prev) => (prev === name ? null : name))
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Teal header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>

            <View style={styles.headerInfo}>
              {isEditingName ? (
                <TextInput
                  style={styles.nameInput}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={saveName}
                  maxLength={30}
                  selectTextOnFocus
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
              ) : (
                <Text style={styles.displayName}>{displayName}</Text>
              )}
              <Text style={styles.headerSub}>{goalOption.sub} · {goalOption.label}</Text>
            </View>

            {isEditingName ? (
              <TouchableOpacity style={styles.saveBtn} onPress={saveName} accessibilityLabel="Save name">
                <Text style={styles.saveBtnText}>save</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editBtn} onPress={() => { setNameInput(displayName); setIsEditingName(true) }} accessibilityLabel="Edit name">
                <Text style={styles.editBtnText}>edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.miniStats}>
            {[
              { label: 'streak', value: String(streak) },
              { label: 'XP',     value: String(xp) },
              { label: 'words',  value: String(wordsCount) },
              { label: 'level',  value: String(level) },
            ].map((s) => (
              <View key={s.label} style={styles.miniStat}>
                <Text style={styles.miniStatNum}>{s.value}</Text>
                <Text style={styles.miniStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Pro card ──────────────────────────────────────────────────── */}
          {isPro ? (
            <View style={styles.proCard}>
              <View style={[styles.proIconWrap, { backgroundColor: colors.primaryMid }]}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proTitle}>Pro active</Text>
                <Text style={styles.proSub}>
                  {freeMonthsRemaining > 0
                    ? `${freeMonthsRemaining} free month${freeMonthsRemaining > 1 ? 's' : ''} remaining`
                    : 'Unlimited lessons · pronunciation check'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.proCard}>
              <View style={styles.proIconWrap}>
                <Ionicons name="star" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.proTitle}>Unlock Pro</Text>
                <Text style={styles.proSub}>
                  {referralCount === 0
                    ? `Invite ${referralsToNextMonth} friends for 1 free month, or tap upgrade`
                    : `Invite ${referralsToNextMonth} more for 1 free month, or tap upgrade`}
                </Text>
              </View>
              <TouchableOpacity style={styles.upgradeBtn} onPress={() => void purchasePro()} accessibilityLabel="Upgrade to Pro">
                <Text style={styles.upgradeBtnText}>{subLoading ? '...' : 'upgrade'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Learning ──────────────────────────────────────────────────── */}
          <Text style={styles.sectionHeader}>Learning</Text>
          <View style={styles.section}>

            {/* Daily goal */}
            <TouchableOpacity style={styles.row} onPress={() => togglePicker('goal')} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="flag-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Daily goal</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{goalOption.label}</Text>
                <Ionicons name={openPicker === 'goal' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textHint} />
              </View>
            </TouchableOpacity>
            {openPicker === 'goal' && (
              <View style={styles.pickerPanel}>
                {GOAL_OPTIONS.map((opt, i) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pickerRow, i < GOAL_OPTIONS.length - 1 && styles.pickerRowBorder]}
                    onPress={() => { void saveDailyGoal(opt.value); setOpenPicker(null) }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerLabel, opt.value === currentGoal && styles.pickerLabelActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.pickerSub}>{opt.sub}</Text>
                    </View>
                    {opt.value === currentGoal && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Reminder time */}
            <TouchableOpacity
              style={styles.row}
              onPress={() => { setOpenPicker(null); setTimeModalVisible(true) }}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#EF9F27' }]}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Reminder time</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{currentTime}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
              </View>
            </TouchableOpacity>

            {/* Audio speed */}
            <TouchableOpacity style={styles.row} onPress={() => togglePicker('speed')} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: '#5DCAA5' }]}>
                <Ionicons name="speedometer-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Audio speed</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{speedLabel}</Text>
                <Ionicons name={openPicker === 'speed' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textHint} />
              </View>
            </TouchableOpacity>
            {openPicker === 'speed' && (
              <View style={[styles.pickerPanel, styles.speedPanel]}>
                {SPEED_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.speedChip, s === safeSpeed && styles.speedChipActive]}
                    onPress={() => { setAudioSpeed(s); setOpenPicker(null) }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.speedChipText, s === safeSpeed && styles.speedChipTextActive]}>
                      {s === 1.0 ? '1×' : `${s}×`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Accent */}
            <TouchableOpacity style={styles.row} onPress={() => togglePicker('accent')} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: '#5B8FE0' }]}>
                <Ionicons name="language-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Accent</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{accent === 'american' ? '🇺🇸 American' : '🇬🇧 British'}</Text>
                <Ionicons name={openPicker === 'accent' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textHint} />
              </View>
            </TouchableOpacity>
            {openPicker === 'accent' && (
              <View style={styles.pickerPanel}>
                {([
                  { value: 'american', label: 'American English', flag: '🇺🇸' },
                  { value: 'british',  label: 'British English',  flag: '🇬🇧' },
                ] as const).map((opt, i) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.pickerRow, i === 0 && styles.pickerRowBorder]}
                    onPress={() => { void saveAccent(opt.value); setOpenPicker(null) }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langFlag}>{opt.flag}</Text>
                    <Text style={[styles.pickerLabel, { flex: 1 }, opt.value === accent && styles.pickerLabelActive]}>
                      {opt.label}
                    </Text>
                    {opt.value === accent && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Native language */}
            <TouchableOpacity
              style={[styles.row, styles.rowLast]}
              onPress={() => { setOpenPicker(null); setLangModalVisible(true) }}
              activeOpacity={0.7}
            >
              <View style={[styles.rowIcon, { backgroundColor: '#E67E22' }]}>
                <Ionicons name="earth-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Native language</Text>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {langOption ? `${langOption.flag}  ${langOption.label}` : 'Spanish'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
              </View>
            </TouchableOpacity>
          </View>

          {/* ── Accessibility ─────────────────────────────────────────────── */}
          <Text style={styles.sectionHeader}>Accessibility</Text>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#9B59B6' }]}>
                <Ionicons name="text-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Dyslexia-friendly font</Text>
              <Switch
                value={dyslexiaFont}
                onValueChange={(v) => void toggleDyslexiaFont(v)}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={dyslexiaFont ? colors.primary : colors.surface}
              />
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <View style={[styles.rowIcon, { backgroundColor: '#5B8FE0' }]}>
                <Ionicons name="expand-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Larger text</Text>
              <Switch
                value={largerText}
                onValueChange={(v) => void toggleLargerText(v)}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={largerText ? colors.primary : colors.surface}
              />
            </View>
          </View>

          {/* ── App ───────────────────────────────────────────────────────── */}
          <Text style={styles.sectionHeader}>App</Text>
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="volume-medium-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Sound effects</Text>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={soundEnabled ? colors.primary : colors.surface}
              />
            </View>
            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: '#E74C3C' }]}>
                <Ionicons name="phone-portrait-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Haptic feedback</Text>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={hapticsEnabled ? colors.primary : colors.surface}
              />
            </View>
            <View style={[styles.row, styles.rowLast]}>
              <View style={[styles.rowIcon, { backgroundColor: '#EF9F27' }]}>
                <Ionicons name="notifications-circle-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Daily reminders</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={(v) => void toggleNotifications(v)}
                trackColor={{ false: colors.border, true: colors.primaryMid }}
                thumbColor={notificationsEnabled ? colors.primary : colors.surface}
              />
            </View>
          </View>

          {/* ── Referrals ─────────────────────────────────────────────────── */}
          <Text style={styles.sectionHeader}>Referrals</Text>
          <View style={styles.section}>
            <View style={[styles.row, styles.rowLast]}>
              <View style={[styles.rowIcon, { backgroundColor: '#AF52DE' }]}>
                <Ionicons name="people-outline" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Friends invited</Text>
                <Text style={styles.rowValueSmall}>
                  {referralCount} friend{referralCount !== 1 ? 's' : ''} signed up
                  {freeMonthsRemaining > 0 ? ` · ${freeMonthsRemaining} free month${freeMonthsRemaining > 1 ? 's' : ''}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.referralShareBtn}
                onPress={async () => {
                  try {
                    const { Share, Platform } = await import('react-native')
                    const { data } = await supabase.from('user_profiles').select('referral_code').eq('id', user?.id).single()
                    const code = (data as { referral_code?: string } | null)?.referral_code
                    if (!code) return
                    const inviteLink = `phonicsflow://signup?ref=${code}`
                    await Share.share({
                      message: `Hey! I've been using PhonicsFlow to learn English phonics 📚\n\nDownload it using my invite link so we can study together 🙌\n\n👉 ${inviteLink}`,
                      url: inviteLink,
                      title: 'Join me on PhonicsFlow',
                    })
                  } catch {}
                }}
              >
                <Ionicons name="share-outline" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={() => void restoreSub()} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: '#888780' }]}>
                <Ionicons name="card-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.rowLabel}>Restore purchases</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.row} onPress={handleResetProgress} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: colors.error }]}>
                <Ionicons name="refresh-outline" size={18} color="#fff" />
              </View>
              <Text style={[styles.rowLabel, styles.dangerText]}>Reset progress</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.row, styles.rowLast]} onPress={signOut} activeOpacity={0.7}>
              <View style={[styles.rowIcon, { backgroundColor: colors.error }]}>
                <Ionicons name="log-out-outline" size={18} color="#fff" />
              </View>
              <Text style={[styles.rowLabel, styles.dangerText]}>Sign out</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LanguageModal
        visible={langModalVisible}
        current={currentLang}
        onSelect={(code) => void saveNativeLanguage(code)}
        onClose={() => setLangModalVisible(false)}
      />
      <TimeModal
        visible={timeModalVisible}
        current={currentTime}
        onSelect={(time) => void saveReminder(time)}
        onClose={() => setTimeModalVisible(false)}
      />
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral },

  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingTop: spacing.md,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontSize: 18, fontWeight: '500' },
  headerInfo: { flex: 1 },
  displayName: { color: '#fff', fontSize: fontSize.xl, fontWeight: '700' },
  nameInput: {
    color: '#fff', fontSize: fontSize.xl, fontWeight: '700',
    borderBottomWidth: 1.5, borderBottomColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 2, minWidth: 80,
  },
  headerSub: { color: '#9FE1CB', fontSize: fontSize.sm, marginTop: 2 },
  editBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full, paddingVertical: 5, paddingHorizontal: 11,
  },
  editBtnText: { fontSize: fontSize.sm, color: '#fff' },
  saveBtn: {
    backgroundColor: colors.surface,
    borderRadius: radius.full, paddingVertical: 5, paddingHorizontal: 11,
  },
  saveBtnText: { fontSize: fontSize.sm, color: colors.primary, fontWeight: '700' },

  miniStats: { flexDirection: 'row', gap: 6 },
  miniStat: {
    flex: 1, alignItems: 'center', gap: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 4,
  },
  miniStatNum:  { color: '#fff', fontSize: 15, fontWeight: '500' },
  miniStatLabel: { color: '#9FE1CB', fontSize: 9 },

  scroll:  { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm },

  proCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.text, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.sm,
  },
  proIconWrap: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  proTitle: { color: '#fff', fontSize: fontSize.md, fontWeight: '700' },
  proSub:   { color: '#888780', fontSize: fontSize.sm, marginTop: 2 },
  upgradeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8, paddingVertical: 6, paddingHorizontal: 11,
  },
  upgradeBtnText: { color: '#fff', fontWeight: '500', fontSize: fontSize.md },

  sectionHeader: {
    fontSize: fontSize.xs, fontWeight: '700', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.sm, paddingHorizontal: spacing.xs,
  },
  section: {
    backgroundColor: colors.surface, borderRadius: radius.xl,
    overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },

  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, gap: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
  dangerText: { color: colors.error },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowValue: { fontSize: fontSize.sm, color: colors.textMuted },
  rowValueSmall: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  referralShareBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  // Inline picker panels
  pickerPanel: {
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pickerRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
  pickerLabelActive: { color: colors.primary },
  pickerSub: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 1 },
  langFlag: { fontSize: 18, width: 26 },

  speedPanel: {
    flexDirection: 'row', paddingHorizontal: spacing.md,
    paddingVertical: spacing.md, gap: spacing.sm,
  },
  speedChip: {
    flex: 1, alignItems: 'center', paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
  },
  speedChipActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  speedChipText:       { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
  speedChipTextActive: { color: '#fff' },

  // Modals
  modalSafe:   { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: '700', color: colors.text },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    margin: spacing.md,
    backgroundColor: colors.neutral, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  searchInput: {
    flex: 1, fontSize: fontSize.md, color: colors.text,
  },
  modalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: 14, paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border,
  },
  modalRowSelected: { backgroundColor: colors.primaryLight },
  modalRowLabel:       { flex: 1, fontSize: fontSize.md, color: colors.text },
  modalRowLabelActive: { color: colors.primary, fontWeight: '600' },
})
