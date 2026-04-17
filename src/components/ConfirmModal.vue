<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h3 class="text-white font-bold text-lg">{{ title }}</h3>
      </div>
      
      <div class="p-6">
        <p class="text-gray-700 text-base leading-relaxed">{{ message }}</p>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
        <button 
          @click="handleCancel"
          class="px-4 py-2 text-gray-700 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          :class="[
            'px-4 py-2 text-white font-semibold rounded-lg transition-colors',
            isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
          ]"
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
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
