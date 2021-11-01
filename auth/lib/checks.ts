import { createPrisma } from '../prisma';

export const usernameCheck = {
  backend: async (username: string) => {
    const prisma = createPrisma();
    if (username.length < 5) {
      return false;
    }
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    return user !== null;
  },
  frontend: async (username: string) => {
    const res = await fetch('/api/checks?username=' + username);
    const json = await res.json();
    return json.exists ?? false;
  },
};
