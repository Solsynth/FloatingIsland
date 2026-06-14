import {
  IconCompass,
  IconBuilding,
  IconHardDrive,
  IconMessageSquare,
  IconPalette,
  IconCode,
  IconWallet,
} from "#components";

export interface NavItem {
  icon: any;
  labelKey: string;
  href: string;
  badge?: number | null;
  requiresAuth?: boolean;
}

/**
 * Main navigation items shared between desktop sidebar and mobile menu.
 * Uses i18n keys for labels.
 */
export function useMainNav() {
  const { t } = useI18n();
  const { unreadCount: chatUnreadCount } = useChat();

  const navItems = computed<NavItem[]>(() => [
    { icon: IconCompass, labelKey: "nav.explore", href: "/" },
    { icon: IconBuilding, labelKey: "nav.realms", href: "/realms" },
    { icon: IconHardDrive, labelKey: "nav.drive", href: "/drive" },
    {
      icon: IconMessageSquare,
      labelKey: "nav.chat",
      href: "/chat",
      badge: chatUnreadCount.value > 0 ? chatUnreadCount.value : null,
    },
    { icon: IconWallet, labelKey: "nav.wallet", href: "/wallets" },
    { icon: IconPalette, labelKey: "nav.creatorHub", href: "/creators" },
    { icon: IconCode, labelKey: "nav.developerHub", href: "/developers" },
  ]);

  return { navItems };
}
