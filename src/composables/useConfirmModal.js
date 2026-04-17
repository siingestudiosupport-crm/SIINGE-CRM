let modalInstance = null

export const useConfirmModal = () => {
  const setModalInstance = (instance) => {
    modalInstance = instance
  }

  const confirm = async (options = {}) => {
    if (!modalInstance) {
      console.error('ConfirmModal instance not initialized')
      return false
    }
    return await modalInstance.open(options)
  }

  const alert = async (message, title = 'Alert') => {
    return confirm({
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      isDangerous: false
    })
  }

  return { confirm, alert, setModalInstance }
}
