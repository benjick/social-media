import { NextApiRequest, NextApiResponse } from 'next';
import { usernameCheck } from '../../../lib/checks';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let { username } = req.query;
  if (username) {
    if (Array.isArray(username)) {
      username = username.join('');
    }
    const exists = await usernameCheck.backend(username);
    return res.status(200).json({
      exists,
    });
  }
  return res.status(404).json({
    error: true,
  });
}
