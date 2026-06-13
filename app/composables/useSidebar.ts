const collapsed = ref(false);

export function useSidebar() {
  function toggleSidebar() {
    collapsed.value = !collapsed.value;
  }

  return {
    collapsed: readonly(collapsed),
    toggleSidebar,
  };
}
