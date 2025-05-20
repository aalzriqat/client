import { jwtDecode, JwtPayload } from "jwt-decode"; 

// Extend JwtPayload if your token has custom claims like 'role' or 'id' within a 'user' object
interface CustomJwtPayload extends JwtPayload {
  user?: {
    id?: string;
    role?: string;
  };
  // Add other custom claims if they exist at the root of the token
}

/**
 * Decodes a JWT token.
 * @param token The JWT token string.
 * @returns The decoded token payload or null if decoding fails or token is invalid.
 */
export const decodeToken = (token: string | null | undefined): CustomJwtPayload | null => {
  if (typeof token !== "string" || !token) {
    // console.error("Invalid token specified: must be a non-empty string");
    return null;
  }
  try {
    return jwtDecode<CustomJwtPayload>(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired.
 * @param token The JWT token string.
 * @returns True if the token is expired or invalid, false otherwise.
 */
export const isTokenExpired = (token: string | null | undefined): boolean => {
  const decodedToken = decodeToken(token);
  if (!decodedToken || typeof decodedToken.exp === 'undefined') {
    // If no token, or no expiration claim, consider it expired/invalid for safety
    return true; 
  }
  const currentTimeInSeconds = Date.now() / 1000;
  return decodedToken.exp < currentTimeInSeconds;
};

/**
 * Calculates the ISO week number for a given date.
 * @param date The date object.
 * @returns The ISO week number.
 */
export function getWeekNumber(date: Date): number {
  // Create a new date object to avoid modifying the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return weekNo;
}

// The Axios instance, setAuthToken, and interceptor from the old utils/index.js 
// have been removed as this functionality is handled by apiService.ts and authSlice.ts
// to maintain a single source of truth for API client configuration and token management.
// Specifically:
// - Axios client is `apiClient` in `apiService.ts`.
// - Token is stored in localStorage as 'userToken' by `authSlice.ts`.
// - `apiClient` in `apiService.ts` has a request interceptor that reads 'userToken' 
//   and sets the 'x-auth-token' header.