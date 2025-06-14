export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    isGuest: boolean;
  }
  
  export interface AuthContextType extends AuthState {
    login: (password: string) => Promise<void>;
    logout: () => void;
    loginAsGuest: () => void;
  }
  
  export interface JWTPayload {
    exp: number;
    iat: number;
  }