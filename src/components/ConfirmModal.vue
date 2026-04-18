<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(14,14,12,0.4);">
    <div class="max-w-md w-full overflow-hidden" style="background: var(--bone); border: 1px solid var(--bone-edge); border-radius: 4px; box-shadow: var(--shadow-3);" :class="'animate-scale-in'">

      <!-- Header -->
      <div style="background: var(--ink); padding: 20px 24px;">
        <h3 style="font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 22px; color: var(--paper); margin: 0; line-height: 1.2;">{{ title }}</h3>
      </div>

      <!-- Body -->
      <div style="padding: 24px; background: var(--bone);">
        <p style="font-size: 14px; color: var(--ink-2); line-height: 1.6; margin: 0;">{{ message }}</p>
      </div>

      <!-- Actions -->
      <div style="padding: 16px 24px; background: var(--paper-2); border-top: 1px solid var(--bone-edge); display: flex; justify-content: flex-end; gap: 8px;">
        <button
          @click="handleCancel"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; background: transparent; color: var(--ink); border: 1px solid var(--ink); border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
          @mouseenter="e => e.target.style.opacity = '0.7'"
          @mouseleave="e => e.target.style.opacity = '1'"
        >
          {{ cancelText }}
        </button>
        <button
          @click="handleConfirm"
          :style="isDangerous
            ? 'background: var(--critical); border-color: var(--critical);'
            : 'background: var(--ink); border-color: var(--ink);'"
          style="font-family: var(--font-sans); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; padding: 9px 16px; color: var(--paper); border: 1px solid; border-radius: 2px; cursor: pointer; transition: opacity 120ms;"
          @mouseenter="e => e.target.style.opacity = '0.85'"
          @mouseleave="e => e.target.style.opacity = '1'"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)
const title = ref('Confirm Action')
const message = ref('')
const confirmText = ref('Confirm')
const cancelText = ref('Cancel')
const isDangerous = ref(false)
let resolvePromise = null

const open = (options = {}) => {
  return new Promise((resolve) => {
    title.value = options.title || 'Confirm Action'
    message.value = options.message || ''
    confirmText.value = options.confirmText || 'Confirm'
    cancelText.value = options.cancelText || 'Cancel'
    isDangerous.value = options.isDangerous || false
    resolvePromise = resolve
    isOpen.value = true
  })
}

const handleConfirm = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(true)
}

const handleCancel = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ open })
</script>

<style scoped>
@keyframes scale-in {
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
  animation: scale-in 0.18s ease-out;
}
</style>
