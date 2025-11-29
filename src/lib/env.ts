import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  nextAuthSecret: required("NEXTAUTH_SECRET"),
  nextAuthUrl: required("NEXTAUTH_URL"),
  googleClientId: required("GOOGLE_CLIENT_ID"),
  googleClientSecret: required("GOOGLE_CLIENT_SECRET"),
  resendKey: process.env.RESEND_API_KEY,
  emailHost: process.env.EMAIL_SERVER_HOST,
  emailPort: process.env.EMAIL_SERVER_PORT,
  emailUser: process.env.EMAIL_SERVER_USER,
  emailPassword: process.env.EMAIL_SERVER_PASSWORD,
  stripeSecret: process.env.STRIPE_SECRET_KEY,
  stripePublishable: process.env.STRIPE_PUBLISHABLE_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  uploadthingSecret: process.env.UPLOADTHING_SECRET,
  uploadthingId: process.env.UPLOADTHING_APP_ID,
  enablePayments: process.env.ENABLE_PAYMENTS === "true",
  enableReviews: process.env.ENABLE_REVIEWS === "true",
};
