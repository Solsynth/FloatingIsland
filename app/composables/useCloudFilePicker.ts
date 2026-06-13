import type { SnCloudFile } from '~/types/drive'

interface CloudFilePickerOptions {
  allowMultiple?: boolean
  allowedTypes?: ('image' | 'video' | 'file')[]
  usage?: string
  cropAspectRatio?: number | null
}

interface UseCloudFilePickerReturn {
  isOpen: Ref<boolean>
  options: Ref<CloudFilePickerOptions>
  open: (opts?: Partial<CloudFilePickerOptions>) => Promise<SnCloudFile | SnCloudFile[] | null>
  handleSelect: (files: SnCloudFile | SnCloudFile[] | null) => void
}

export function useCloudFilePicker(): UseCloudFilePickerReturn {
  const isOpen = ref(false)
  const options = ref<CloudFilePickerOptions>({
    allowMultiple: false,
    allowedTypes: ['image', 'video', 'file'],
    cropAspectRatio: null,
  })

  let resolvePromise: ((value: SnCloudFile | SnCloudFile[] | null) => void) | null = null

  function open(opts?: Partial<CloudFilePickerOptions>): Promise<SnCloudFile | SnCloudFile[] | null> {
    if (opts) {
      options.value = { ...options.value, ...opts }
    }
    isOpen.value = true

    return new Promise((resolve) => {
      resolvePromise = resolve
    })
  }

  function handleSelect(files: SnCloudFile | SnCloudFile[] | null) {
    if (resolvePromise) {
      resolvePromise(files)
      resolvePromise = null
    }
  }

  // Resolve with null if drawer is closed without selection
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
