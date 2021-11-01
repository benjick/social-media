import ThirdPartyEmailPasswordNode from 'supertokens-node/recipe/thirdpartyemailpassword';
import SessionNode from 'supertokens-node/recipe/session';

import ThirdPartyEmailPasswordReact from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import SessionReact from 'supertokens-auth-react/recipe/session';
import { TypeInput } from 'supertokens-node/lib/build/types';

const port = process.env.APP_PORT || 3000;
const websiteDomain =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  `http://localhost:${port}`;
console.log('websiteDomain', websiteDomain);
const apiBasePath = '/api/auth/';

let appInfo = {
  appName: 'SuperTokens Demo App',
  websiteDomain,
  apiDomain: websiteDomain,
  apiBasePath,
};

export let backendConfig = (): TypeInput => {
  return {
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_URI ?? 'http://localhost:3567',
    },
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordNode.init({
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,
              // emailPasswordSignInPOST: undefined,
              emailPasswordSignUpPOST: undefined,
              thirdPartySignInUpPOST: undefined,
            };
          },
        },
        providers: [],
      }),
      SessionNode.init({
        override: {
          functions: (originalImplementation) => {
            return {
              ...originalImplementation,
              createNewSession: async (input) => {
                let userId = input.userId;
                let roles = ['admin', 'inviter']; // TODO: fetch role based on userId
                input.accessTokenPayload = {
                  ...input.accessTokenPayload,
                  roles,
                };
                return originalImplementation.createNewSession(input);
              },
            };
          },
        },
      }),
    ],
    isInServerlessEnv: true,
  };
};

export let frontendConfig = () => {
  return {
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordReact.init({
        emailVerificationFeature: {
          mode: 'REQUIRED',
        },
        signInAndUpFeature: {
          providers: [],
        },
      }),
      SessionReact.init(),
    ],
  };
};
