// Implementing this: https://github.com/kamax-matrix/matrix-synapse-rest-password-provider#integrate

import ThirdPartyEmailPasswordNode from 'supertokens-node/recipe/thirdpartyemailpassword';
import * as SuperTokens from 'supertokens-node';

import { NextApiRequest, NextApiResponse } from 'next';
import { backendConfig } from '../../config/backend';

SuperTokens.init(backendConfig());

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(400).json({
      error: 'Wrong method',
    });
  }
  if (!req.body.user) {
    return res.status(400).json({
      error: 'Missing object',
    });
  }
  const { id, password } = req.body.user;
  if (!id || !password) {
    return res.status(400).json({
      error: 'Missing variables',
    });
  }
  // Get email from e.g. @benjick:collo.chat
  const email = id;
  const response = await ThirdPartyEmailPasswordNode.signIn(email, password);
  if (response.status !== 'OK') {
    return res.status(400).json({
      auth: {
        success: false,
      },
    });
  }
  // Get profile from somewhere
  const profile = {
    display_name: 'John Doe',
    image_url: '',
  };
  res.status(200).json({
    auth: {
      success: true,
      mxid: id,
      profile: {
        display_name: profile.display_name,
        three_pids: [
          {
            medium: 'email',
            address: response.user.email,
          },
        ],
      },
    },
  });
}
