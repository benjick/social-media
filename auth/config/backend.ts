import ThirdPartyEmailPasswordNode from 'supertokens-node/recipe/thirdpartyemailpassword';
import SessionNode from 'supertokens-node/recipe/session';
import { TypeInput } from 'supertokens-node/lib/build/types';
import { appInfo } from './config';
import { usernameCheck } from '../lib/checks';
import { createPrisma } from '../prisma';

export let backendConfig = (): TypeInput => {
  const prisma = createPrisma();
  return {
    framework: 'express',
    supertokens: {
      connectionURI: process.env.SUPERTOKENS_URI ?? 'http://localhost:3567',
    },
    appInfo,
    recipeList: [
      ThirdPartyEmailPasswordNode.init({
        signUpFeature: {
          formFields: [
            {
              id: 'username',
              validate: async (username: string) => {
                if (username.length < 5) {
                  return 'Username must be at least 5 characters';
                }
                const exists = await usernameCheck.backend(username);
                if (exists) {
                  return 'Username already taken';
                }
              },
            },
            { id: 'name' },
          ],
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
                  const get = (id: string) =>
                    input.formFields.find((f) => f.id === id)!.value;

                  const email = get('email');
                  const username = get('username');
                  const name = get('name');

                  await prisma.user.create({
                    data: {
                      id: response.user.id,
                      email,
                      username,
                    },
                  });

                  await prisma.profile.create({
                    data: {
                      name,
                      userId: response.user.id,
                    },
                  });
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
