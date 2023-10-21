export default () => ({
  database: {
    url: process.env.DATABASE_URL,
  },
  env: {
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV,
    port: parseInt(process?.env?.PORT || '0', 10),
  },
});
