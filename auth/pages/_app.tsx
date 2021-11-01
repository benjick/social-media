import 'tailwindcss/tailwind.css';
import React from 'react';
import { useEffect } from 'react';
import SuperTokensReact from 'supertokens-auth-react';
import Session from 'supertokens-auth-react/recipe/session';
import SuperTokensNode from 'supertokens-node';
import { redirectToAuth } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import { backendConfig } from '../config/backend';
import { frontendConfig } from '../config/frontend';

if (typeof window !== 'undefined') {
  SuperTokensReact.init(frontendConfig());
} else {
  SuperTokensNode.init(backendConfig());
}

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    async function doRefresh() {
      if (pageProps.fromSupertokens === 'needs-refresh') {
        if (await Session.attemptRefreshingSession()) {
          location.reload();
        } else {
          // user has been logged out
          redirectToAuth();
        }
      }
    }
    doRefresh();
  }, [pageProps.fromSupertokens]);
  if (pageProps.fromSupertokens === 'needs-refresh') {
    return null;
  }
  return <Component {...pageProps} />;
}

export default MyApp;
