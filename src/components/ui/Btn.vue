<template>
  <button
    :type="type"
    :disabled="disabled"
    :style="[baseStyle, sizeStyle, variantStyle, disabled ? disabledStyle : {}]"
    @mouseenter="e => !disabled && (e.currentTarget.style.opacity = '0.85')"
    @mouseleave="e => !disabled && (e.currentTarget.style.opacity = '1')"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
})

const baseStyle = {
  fontFamily: 'var(--font-sans)',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  borderRadius: '2px',
  cursor: 'pointer',
  transition: 'opacity 120ms',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  lineHeight: 1,
  border: '1px solid var(--ink)',
  textDecoration: 'none',
}

const sizes = {
  sm: { padding: '6px 10px', fontSize: '10px', height: '32px' },
  md: { padding: '11px 16px', fontSize: '11px', height: '40px' },
}

const variants = {
  primary: { background: 'var(--ink)', color: 'var(--paper)' },
  ember: { background: 'var(--ember)', color: '#fff', borderColor: 'var(--ember)' },
  ghost: { background: 'transparent', color: 'var(--ink)' },
  text: { background: 'transparent', color: 'var(--ink)', border: 'none' },
  danger: { background: 'transparent', color: 'var(--critical)', borderColor: 'var(--critical)' },
}

const disabledStyle = { opacity: '0.4', cursor: 'not-allowed' }

const sizeStyle = computed(() => sizes[props.size] || sizes.md)
const variantStyle = computed(() => variants[props.variant] || variants.primary)
</script>
