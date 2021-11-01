import Session from 'supertokens-node/recipe/session';
import { GetServerSideProps } from 'next';

export const createAuthServerSideProps = (
  fn?: GetServerSideProps
): GetServerSideProps => {
  return async function getServerSideProps(context) {
    let session: Session.SessionContainer | undefined;
    try {
      session = await Session.getSession(context.req, context.res);
    } catch (err) {
      if (err.type === Session.Error.TRY_REFRESH_TOKEN) {
        return { props: { fromSupertokens: 'needs-refresh' } };
      } else if (err.type === Session.Error.UNAUTHORISED) {
        return { props: {} };
      } else {
        throw err;
      }
    }
    if (fn) {
      return fn(context);
    }
    return {
      props: {},
    };
  };
};
