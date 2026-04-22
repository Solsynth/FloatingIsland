export interface SnAuthFactor {
  id: string;
  type: number;
  name?: string;
}

export interface SnAuthChallenge {
  id: string;
  accountId: number;
  stepTotal: number;
  stepRemain: number;
  blacklistFactors: string[];
  createdAt: string;
}

export interface SnAuthToken {
  token: string;
  expiresAt?: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
}

export interface UserProfilePicture {
  id: string;
  url: string | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
}

export interface UserPresence {
  status: "online" | "away" | "busy" | "offline";
  lastSeenAt: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  bio: string;
  gender: string;
  pronouns: string;
  timeZone: string;
  location: string;
  links: { name: string; url: string }[];
  birthday: string | null;
  lastSeenAt: string;
  experience: number;
  level: number;
  levelingProgress: number;
  socialCredits: number;
  socialCreditsLevel: number;
  picture: UserProfilePicture | null;
  background: UserProfilePicture | null;
  verification: {
    type: number;
    title: string;
    description: string;
    verifiedBy: string;
  } | null;
  presence?: UserPresence;
}

export interface UserBadge {
  id: string;
  type: string;
  label: string | null;
  caption: string | null;
  activatedAt: string;
}

export interface UserContact {
  type: number;
  content: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  nick: string;
  language: string;
  region: string;
  activatedAt: string;
  isSuperuser: boolean;
  profile: UserProfile;
  contacts: UserContact[];
  badges: UserBadge[];
  createdAt: string;
  updatedAt: string;
}

export const FACTOR_TYPES: Record<
  number,
  { label: string; description: string; icon: string }
> = {
  0: {
    label: "Password",
    description: "Enter your account password",
    icon: "key",
  },
  1: {
    label: "Email",
    description: "Verification code sent to your email",
    icon: "mail",
  },
  2: {
    label: "In-App Notification",
    description: "Approve login from your device",
    icon: "bell",
  },
  3: {
    label: "TOTP",
    description: "Time-based one-time password",
    icon: "timer",
  },
  4: { label: "PIN", description: "Enter your security PIN", icon: "shield" },
};

export type LoginStep = "lookup" | "picker" | "check";

export interface CaptchaConfig {
  provider: string;
  apiKey: string;
}

export interface WalletOrder {
  id: string;
  productIdentifier: string | null;
  remarks: string | null;
  amount: number;
  currency: string;
  expiredAt?: string | null;
}

export interface SpellInfo {
  type: number;
  account: {
    name: string;
  };
  createdAt: string;
  affectedAt: string;
  expiredAt?: string;
}
