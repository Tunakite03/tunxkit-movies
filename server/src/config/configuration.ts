/** Application configuration loaded from environment variables */
export default () =>
   ({
      port: parseInt(process.env['PORT'] ?? '4000', 10),
      cors: {
         origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:3000',
      },
      jwt: {
         secret: process.env['JWT_SECRET'] ?? '',
         expiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
      },
      google: {
         clientId: process.env['GOOGLE_CLIENT_ID'] ?? '',
         clientSecret: process.env['GOOGLE_CLIENT_SECRET'] ?? '',
         callbackUrl: process.env['GOOGLE_CALLBACK_URL'] ?? 'http://localhost:4000/api/v1/auth/google/callback',
      },
      tmdb: {
         apiKey: process.env['TMDB_API_KEY'] ?? '',
         baseUrl: 'https://api.themoviedb.org/3',
      },
   }) as const;
