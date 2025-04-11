import { useLogto, UserInfoResponse } from "@logto/react";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

export interface ProfileData {
  username: string | null;
  email: string | null;
  createdAt: string | null;
}

let cachedData: ProfileData | null = null; // ⬅ global innerhalb des Moduls

export function useProfileData(): {
  profileData: ProfileData | null;
  loading: boolean;
  error: Error | null;
} {
  const { fetchUserInfo, isAuthenticated, isLoading } = useLogto();
  const [profileData, setProfileData] = useState<ProfileData | null>(cachedData);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false); // ⬅ Verhindert mehrfaches Laden

  useEffect(() => {
    const fetchData = async () => {
      if (fetchedRef.current || !isAuthenticated || isLoading || cachedData) return;

      try {
        fetchedRef.current = true;
        const userInfo = (await fetchUserInfo()) as UserInfoResponse;

        const username = userInfo.username ?? "Kein Name";
        const email = userInfo.email ?? "Keine Email";
        const createdAt = userInfo.created_at
          ? format(new Date(userInfo.created_at as string), "dd.MM.yyyy HH:mm:ss")
          : "Unbekanntes Erstellungsdatum";

        const data = { username, email, createdAt };
        cachedData = data;
        setProfileData(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserInfo, isAuthenticated, isLoading]);

  return { profileData, loading, error };
}
