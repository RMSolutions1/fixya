export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  isSuperAdmin: boolean;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
