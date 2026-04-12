export default defineNuxtPlugin(async () => {
  const auth = useAuth();
  await auth.initAuth();
  // Ensure isLoading is false after initAuth completes
  auth.isLoading.value = false;
});
