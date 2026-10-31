"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

type GoogleOAuthClientProviderProps = {
  children: React.ReactNode;
};

export default function GoogleOAuthClientProvider({
  children,
}: GoogleOAuthClientProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (!clientId) {
    return <>{children}</>;
  }

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
