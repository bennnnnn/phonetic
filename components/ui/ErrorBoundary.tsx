import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, spacing, radius, fontSize } from '@/lib/tokens'

type Props = { children: React.ReactNode; fallback?: React.ReactNode }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <View style={styles.wrap}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.sub}>{this.state.error?.message ?? 'An unexpected error occurred.'}</Text>
          <TouchableOpacity style={styles.btn} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.neutral,
    paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, textAlign: 'center' },
  sub: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.xl,
  },
  btnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: '700' },
})
