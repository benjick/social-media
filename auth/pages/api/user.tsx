import { superTokensNextWrapper } from 'supertokens-node/nextjs';
import { verifySession } from 'supertokens-node/recipe/session/framework/express';
import supertokens from 'supertokens-node';
import { backendConfig } from '../../config/backend';
import { getPrisma } from '../../prisma';

supertokens.init(backendConfig());

export default async function user(req, res) {
  await superTokensNextWrapper(
    async (next) => {
      return await verifySession()(req, res, next);
    },
    req,
    res
  );

  const prisma = getPrisma();
  const id = req.session.getUserId();
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      profile: true,
    },
  });

  return res.json(user);
}
