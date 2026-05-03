import { useMemo } from 'react'
import { View, Alert, StyleSheet } from 'react-native'
import ChapterHeader from '@/components/home/ChapterHeader'
import CollapsibleSection from '@/components/home/CollapsibleSection'
import GroupNode from '@/components/home/GroupNode'
import { NODE_SIZE, NODE_STEP, WAVE, buildDots } from '@/lib/pathLayout'
import { ROUTES } from '@/lib/routes'
import type { ChapterData } from '@/components/home/ChapterHeader'

const SECTION_TOP_PAD = 28

export type GroupSectionConfig = {
  /** Unique key for this section (e.g. 'vocab', 'verbs', 'homo') */
  key: string
  /** Chapter header data */
  chapter: ChapterData
  /** All nodes in this section */
  nodes: { id: string; emoji: string; name: string }[]
  /** Set of completed group IDs */
  completedGroups: Set<string> | string[]
  /** Current expanded state */
  expanded: boolean
  /** Set expanded callback */
  onToggle: () => void
  /** Whether to show a locked alert when tapping a locked item */
  showLockedAlert?: boolean
}

export function calcSectionHeight(count: number): number {
  return SECTION_TOP_PAD + count * NODE_STEP + 60
}

/**
 * Creates the memoized section height for a group section.
 */
export function useSectionHeight(count: number): number {
  return useMemo(() => calcSectionHeight(count), [count])
}

/**
 * Creates progressive-unlock data for a group section:
 * - `unlockedIds`: set of IDs that are unlocked (first always unlocked, rest unlocked when previous completed)
 * - `heroIdx`: index of the first incomplete+unlocked item
 * - `items`: positioned node data ready for rendering
 */
export function useGroupSectionData(
  nodes: { id: string; emoji: string; name: string }[],
  completedGroups: Set<string> | string[],
  availableWidth: number,
) {
  const completedSet = Array.isArray(completedGroups)
    ? new Set(completedGroups)
    : completedGroups

  const unlockedIds = useMemo(() => {
    const set = new Set<string>()
    nodes.forEach((g, i) => {
      if (i === 0 || completedSet.has(nodes[i - 1]!.id)) set.add(g.id)
    })
    return set
  }, [nodes, completedSet])

  const heroIdx = useMemo(() => {
    const idx = nodes.findIndex((g) => !completedSet.has(g.id) && unlockedIds.has(g.id))
    return idx >= 0 ? idx : null
  }, [nodes, completedSet, unlockedIds])

  const items = useMemo(() =>
    nodes.map((g, i) => {
      const done     = completedSet.has(g.id)
      const unlocked = unlockedIds.has(g.id) || done
      return {
        id: g.id, emoji: g.emoji, name: g.name, index: i,
        left: Math.round(availableWidth * WAVE[i % WAVE.length]!),
        top:  SECTION_TOP_PAD + i * NODE_STEP,
        done, unlocked,
        isCurrent: g.id === (heroIdx !== null ? nodes[heroIdx]?.id : null),
        stars: done ? 3 : 0,
      }
    }),
    [nodes, completedSet, unlockedIds, heroIdx, availableWidth],
  )

  return { unlockedIds, heroIdx, items }
}

/**
 * Renders a full group section (ChapterHeader + CollapsibleSection + nodes).
 */
export function GroupSection({
  config,
  items,
  expanded,
  availableWidth,
  onNavigate,
}: {
  config: GroupSectionConfig
  items: ReturnType<typeof useGroupSectionData>['items']
  expanded: boolean
  availableWidth: number
  onNavigate: (id: string, done: boolean) => void
}) {
  const dots = useMemo(() => buildDots(items), [items])
  const sectionH = useMemo(() => calcSectionHeight(items.length), [items.length])

  return (
    <View>
      <ChapterHeader item={config.chapter} expanded={expanded} onPress={config.onToggle} />
      <CollapsibleSection expanded={expanded} sectionHeight={sectionH}>
        {dots.map((d) => (
          <View key={`${config.key}-${d.key}`} style={[styles.dot, { left: d.x, top: d.y, opacity: d.opacity }]} />
        ))}
        {items.map((item) => (
          <GroupNode
            key={item.id}
            emoji={item.emoji} name={item.name} stars={item.stars}
            index={item.index} left={item.left} top={item.top}
            done={item.done} unlocked={item.unlocked} isCurrent={item.isCurrent}
            expanded={expanded}
            onPress={() => {
              if (config.showLockedAlert && !item.unlocked) {
                Alert.alert('Locked', 'Complete the previous topic to unlock this one.')
                return
              }
              onNavigate(item.id, item.done)
            }}
          />
        ))}
      </CollapsibleSection>
    </View>
  )
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#B4B2A9',
  },
})
