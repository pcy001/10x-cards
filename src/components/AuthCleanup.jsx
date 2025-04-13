export default function AuthCleanup() {
  if (typeof window !== 'undefined' && !document.cookie.includes("sb-auth-token")) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("sb-supabase-auth-token");
  }
  
  return null;
} 