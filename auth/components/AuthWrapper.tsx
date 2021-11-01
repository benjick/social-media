import React from 'react';
import { ThirdPartyEmailPasswordAuth } from 'supertokens-auth-react/recipe/thirdpartyemailpassword';

export const AuthWrapper =
  (
    Component: any,
    options: Omit<
      Parameters<typeof ThirdPartyEmailPasswordAuth>[0],
      'children'
    > = {}
  ) =>
  (...props: any[]) => {
    if (typeof window !== 'undefined') {
      return (
        <ThirdPartyEmailPasswordAuth {...options}>
          <Component {...props} />
        </ThirdPartyEmailPasswordAuth>
      );
    }
    return <Component {...props} />;
  };
