"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useAuth } from "@/hooks/useAuth";

// Example 1: Using the store directly
export function UserProfile() {
  const { user, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <p>User ID: {user.id}</p>
    </div>
  );
}

// Example 2: Using the hook wrapper
export function AuthStatus() {
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Logged in as: {user?.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}

// Example 3: Protected component
export function ProtectedComponent() {
  const { user, loading } = useAuthStore();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to access this content</div>;

  return <div>This is protected content for {user.email}</div>;
}

// Example 4: Navigation component
export function Navigation() {
  const { user } = useAuthStore();

  return (
    <nav>
      <a href="/">Home</a>
      {user ? (
        <>
          <a href="/dashboard">Dashboard</a>
          <a href="/profile">Profile</a>
        </>
      ) : (
        <>
          <a href="/auth/login">Login</a>
          <a href="/auth/signup">Sign Up</a>
        </>
      )}
    </nav>
  );
}
