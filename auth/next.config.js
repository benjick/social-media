module.exports = {
  async redirects() {
    return [
      {
        source: '/_matrix-internal/identity/v1/check_credentials',
        destination: '/api/check_credentials',
        permanent: false,
      },
    ];
  },
};
