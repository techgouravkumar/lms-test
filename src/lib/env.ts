const env = {
  DATABASE_URL: String(process.env.DATABASE_URL || ""),
  NODE_ENV: String(process.env.NODE_ENV || "development"),
  JWT_SECRET: String(process.env.JWT_SECRET || ""),
  JWT_SECRET_EXPIRY: Number(process.env.JWT_SECRET_EXPIRY || 365),
  emailCredentials: {
    user: String(process.env.EMAIL_USER || ""),
    pass: String(process.env.EMAIL_PASS || ""),
  },
  cloudinary: {
    CLOUD_NAME: String(process.env.CLOUDINARY_CLOUD_NAME || ""),
    API_KEY: String(process.env.CLOUDINARY_API_KEY || ""),
    API_SECRET: String(process.env.CLOUDINARY_API_SECRET || ""),
  },
  firebase: {
    FIREBASE_API_KEY: String(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""),
    FIREBASE_AUTH_DOMAIN: String(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || ""),
    FIREBASE_PROJECT_ID: String(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""),
    FIREBASE_STORAGE_BUCKET: String(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""),
    FIREBASE_MESSAGING_SENDER_ID: String(
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ""
    ),
    FIREBASE_APP_ID: String(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""),
    FIREBASE_DATABASE_URL: String(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || ""),
  },
};

export default env;
