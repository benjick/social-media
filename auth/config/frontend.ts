import ThirdPartyEmailPasswordReact from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import SessionReact from 'supertokens-auth-react/recipe/session';
import { appInfo } from './config';
import { usernameCheck } from '../lib/checks';

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
                validate: async (username: string) => {
                  if (username.length < 5) {
                    return 'Username must be at least 5 characters';
                  }
                  const exists = await usernameCheck.frontend(username);
                  if (exists) {
                    return 'Username already taken';
                  }
                },
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
