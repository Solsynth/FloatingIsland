const REDIRECT_KEY = "auth_redirect_url";

export function useAuthRedirect() {
  function saveRedirect(url: string) {
    if (import.meta.client && url) {
      sessionStorage.setItem(REDIRECT_KEY, url);
    }
  }

  function getRedirect(): string | null {
    if (import.meta.client) {
      return sessionStorage.getItem(REDIRECT_KEY);
    }
    return null;
  }

  function clearRedirect() {
    if (import.meta.client) {
      sessionStorage.removeItem(REDIRECT_KEY);
    }
  }

  return {
    saveRedirect,
    getRedirect,
    clearRedirect,
  };
}
