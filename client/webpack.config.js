module.exports = {
  target: 'node',
  resolve: {
    fallback: {
      'crypto': require.resolve('crypto-browserify'),
    },
  },
};
