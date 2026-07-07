import type { SnAccount } from '~/types/auth'

interface AccountPickerOptions {
  allowMultiple?: boolean
  title?: string
  placeholder?: string
}

interface UseAccountPickerReturn {
  isOpen: Ref<boolean>
  options: Ref<AccountPickerOptions>
  open: (opts?: Partial<AccountPickerOptions>) => Promise<SnAccount | SnAccount[] | null>
  handleSelect: (accounts: SnAccount | SnAccount[] | null) => void
}

export function useAccountPicker(): UseAccountPickerReturn {
  const isOpen = ref(false)
  const options = ref<AccountPickerOptions>({
    allowMultiple: false,
    title: 'Select Account',
    placeholder: 'Search accounts...',
  })

  let resolvePromise: ((value: SnAccount | SnAccount[] | null) => void) | null = null

  function open(opts?: Partial<AccountPickerOptions>): Promise<SnAccount | SnAccount[] | null> {
    if (opts) {
      options.value = { ...options.value, ...opts }
    }
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleSelect(accounts: SnAccount | SnAccount[] | null) {
    if (resolvePromise) {
      resolvePromise(accounts)
      resolvePromise = null
    }
  }

  watch(isOpen, (val) => {
    if (!val && resolvePromise) {
      resolvePromise(null)
      resolvePromise = null
    }
  })

  return {
    isOpen,
    options,
    open,
    handleSelect,
  }
}
