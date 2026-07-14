export const APP_NAME = 'SafeLink AI'
export const APP_DESCRIPTION = 'AI-Powered URL Safety & Intelligence Platform'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SCANNER: '/scanner',
  SCAN_DETAILS: '/scan/:id',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',
}

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#06B6D4',
  accent: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  bgDark: '#0B1220',
  card: '#111827',
}

export const SCORE_THRESHOLDS = {
  SAFE: 80,
  LOW_RISK: 60,
  MEDIUM_RISK: 40,
}

export const PLAN_LIMITS = {
  starter: { scans: 500, history: 7 },
  professional: { scans: 5000, history: 90 },
  enterprise: { scans: Infinity, history: Infinity },
}
