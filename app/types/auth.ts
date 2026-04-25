export interface SnAuthFactor {
  id: string;
  type: number;
  name?: string;
  enabledAt?: string | null;
  createdAt?: string;
  createdResponse?: Record<string, unknown>;
}

export interface SnAuthChallenge {
  id: string;
  stepRemain?: number;
  stepTotal?: number;
  riskLevel?: number;
  factors?: SnAuthFactor[];
  doneAt?: string | null;
  grantAid?: string | null;
  grantToken?: string | null;
  accountId?: string;
}

export interface SnAuthToken {
  token: string;
  expiresIn?: number;
  refreshToken?: string;
  refreshExpiresIn?: number;
  expiresAt?: string;
  refreshExpiresAt?: string;
}

export interface SnAccountProfile {
  id?: string;
  bio?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  pronouns?: string;
  location?: string;
  timeZone?: string;
  birthday?: string | null;
  picture?: { id: string } | null;
  background?: { id: string } | null;
  links?: { url: string; name?: string; label?: string }[];
  verification?: {
    type: number;
    title?: string;
    description?: string;
    verifiedBy?: string;
  } | null;
  level?: number;
  experience?: number;
  levelingProgress?: number;
}

export interface SnAccount {
  id: string;
  name: string;
  nick?: string;
  language?: string;
  region?: string;
  profile?: SnAccountProfile;
  badges?: { id: string; type: number; label?: string; caption?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SnContactMethod {
  id: string;
  type: number;
  content: string;
  isPrimary: boolean;
  isPublic: boolean;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface SnAccountConnection {
  id: string;
  provider: string;
  providedIdentifier: string;
  meta: Record<string, string>;
  lastUsedAt: string;
  createdAt: string;
}

export interface SnAuthSession {
  id: string;
  type: number;
  label?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    city?: string;
    country?: string;
    countryCode?: string;
    latitude?: number;
    longitude?: number;
  };
  isCurrent?: boolean;
  childrenCount?: number;
  createdAt: string;
  updatedAt?: string;
  lastGrantedAt: string;
  expiredAt?: string;
  audiences?: string[];
  scopes?: string[];
  clientId?: string;
  client?: SnAuthClient | null;
  parentSessionId?: string | null;
  accountId?: string;
  challengeId?: string;
}

export interface SnAuthClient {
  id: string;
  platform: number;
  deviceName: string;
  deviceLabel?: string | null;
  deviceId: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface SnAuthDevice {
  deviceId: string;
  deviceName: string;
  deviceLabel?: string;
  platform: number;
  isCurrent: boolean;
  sessions: SnAuthSession[];
}

export const SESSION_TYPES: Record<number, { label: string; icon: string }> = {
  0: { label: "Login", icon: "key" },
  1: { label: "OAuth", icon: "link" },
  2: { label: "OIDC", icon: "user-circle" },
  3: { label: "API Key", icon: "code" },
};

export const PLATFORM_TYPES: Record<number, { label: string; icon: string }> = {
  0: { label: "Unknown", icon: "help-circle" },
  1: { label: "Web", icon: "globe" },
  2: { label: "iOS", icon: "smartphone" },
  3: { label: "Android", icon: "smartphone" },
  4: { label: "macOS", icon: "laptop" },
  5: { label: "Windows", icon: "monitor" },
  6: { label: "Linux", icon: "terminal" },
};

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
  5: { label: "Recovery Code", description: "Single-use recovery code", icon: "key-round" },
  6: { label: "WebAuthn", description: "Hardware security key or biometric", icon: "fingerprint" },
  7: { label: "Passkey", description: "Platform authenticator", icon: "key-square" },
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
