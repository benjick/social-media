import { useEffect, useState } from 'react';
import { User, Profile } from '.prisma/client';

export function useUser() {
  const [user, setUser] = useState<User & { profile: Profile }>();
  const getUser = async () => {
    const res = await fetch('/api/user');
    if (res.status === 200) {
      const json = await res.json();
      setUser(json);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  return user;
}
