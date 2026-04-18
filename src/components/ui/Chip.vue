<template>
  <span :style="[chipStyle, style]">
    <span v-if="dot" :style="dotStyle" />
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tone: { type: String, default: 'neutral' },
  dot: { type: Boolean, default: true },
  style: { type: [Object, String], default: () => ({}) },
})

const tones = {
  neutral: { bg: 'var(--paper-2)', bd: 'var(--border)', fg: 'var(--ink-2)', dot: '#A39C8E' },
  pos:     { bg: '#E5EAD9', bd: '#B8C4A0', fg: '#3A4F2A', dot: '#4F6B3A' },
  cau:     { bg: '#F5E9C8', bd: '#DBC68A', fg: '#7A5512', dot: '#B5841E' },
  crit:    { bg: '#F1DAD3', bd: '#D9B5AB', fg: '#6E1F1F', dot: '#8C2A2A' },
  info:    { bg: '#DCE3E7', bd: '#B6C0C7', fg: '#2B4654', dot: '#3B5A6B' },
  ember:   { bg: '#F3D9C5', bd: '#D9A37E', fg: '#7C2D12', dot: '#C2410C' },
  ink:     { bg: 'var(--ink)', bd: 'var(--ink)', fg: 'var(--paper)', dot: 'var(--paper)' },
}

const t = computed(() => tones[props.tone] || tones.neutral)

const chipStyle = computed(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '4px 8px',
  borderRadius: '2px',
  border: `1px solid ${t.value.bd}`,
  background: t.value.bg,
  color: t.value.fg,
  lineHeight: 1,
  whiteSpace: 'nowrap',
}))

const dotStyle = computed(() => ({
  width: '5px',
  height: '5px',
  borderRadius: '999px',
  background: t.value.dot,
  display: 'inline-block',
  flexShrink: 0,
}))
</script>
