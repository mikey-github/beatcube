export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export interface Score {
  score: number;
  musique: { name: string };
  playedAt: string;
}

export interface Success {
  id: number;
  name: string;
  description: string;
}

export interface UserSuccess {
  success: { id: number };
  obtained_at: string;
}

export interface LeaderboardEntry {
  id: number;
  username: string;
  totalScore: number;
  numberOfGame: number;
  averageAccuracy: number;
  fullCombos: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  createdAt?: string;
  roles?: string[];
  isBanned?: boolean;
  banReason?: string;
  banExpiry?: string;
}

export interface Upload {
  musique: { name: string; singer: string; uuid: string };
  utilisateur: { username: string };
  uploadAt: string;
}
