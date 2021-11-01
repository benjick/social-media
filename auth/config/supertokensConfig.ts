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
        signUpFeature: {
          formFields: [{ id: 'username' }, { id: 'name' }],
        },
        override: {
          apis: (originalImplementation) => {
            return {
              ...originalImplementation,
              // emailPasswordSignInPOST: undefined,
              emailPasswordSignUpPOST: async (input) => {
                if (
                  originalImplementation.emailPasswordSignUpPOST === undefined
                ) {
                  throw Error('Should never come here');
                }
                // First we call the original implementation
                let response =
                  await originalImplementation.emailPasswordSignUpPOST(input);
                // If sign up was successful
                if (response.status === 'OK') {
                  // We can get the form fields from the input like this
                  let formFields = input.formFields;
                  console.log('formFields', formFields);
                  let user = response.user;
                  // some post sign up logic
                }
                return response;
              },
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
        useShadowDom: false,
        getRedirectionURL: async (context) => {
          if (context.action === 'SUCCESS') {
            if (context.redirectToPath !== undefined) {
              // we are navigating back to where the user was before they authenticated
              return context.redirectToPath;
            }
            return '/profile';
          }
          return undefined;
        },
        emailVerificationFeature: {
          mode: 'REQUIRED',
        },
        signInAndUpFeature: {
          signUpForm: {
            formFields: [
              {
                id: 'username',
                label: 'Username',
                placeholder: 'Pick a username',
              },
              {
                id: 'name',
                label: 'Your name',
                placeholder: 'First name and last name',
              },
            ],
          },
          providers: [],
        },
      }),
      SessionReact.init(),
    ],
  };
};
