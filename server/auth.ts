import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { pbkdf2Sync, randomBytes } from "crypto";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { z } from "zod";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const PostgresSessionStore = connectPg(session);

// Simple password hashing using pbkdf2
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  return salt + ':' + hash.toString('hex');
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const testHash = pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  return hash === testHash.toString('hex');
}

// Request types
interface AuthRequest extends Request {
  user?: { id: string; email: string; firstName?: string };
}

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional()
});

export function setupAuth(app: Express) {
  // Session setup
  const sessionStore = new PostgresSessionStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    tableName: "sessions"
  });

  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user ? { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        authProvider: user.authProvider 
      } : null);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'), null);
        }

        // Check if user already exists
        let user = await storage.getUserByEmail(email);
        
        if (user) {
          // Update user's Google info if they logged in with Google
          if (user.authProvider !== 'google') {
            user = await storage.upsertUser({
              ...user,
              authProvider: 'google',
              profileImageUrl: profile.photos?.[0]?.value || user.profileImageUrl
            });
          }
        } else {
          // Create new user
          const userId = randomBytes(16).toString('hex');
          user = await storage.createUser({
            id: userId,
            email,
            firstName: profile.name?.givenName || null,
            lastName: profile.name?.familyName || null,
            profileImageUrl: profile.photos?.[0]?.value || null,
            authProvider: 'google'
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
  }

  // Register endpoint
  app.post('/api/register', async (req: AuthRequest, res: Response) => {
    try {
      const { email, password, firstName, lastName } = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const hashedPassword = hashPassword(password);
      const userId = randomBytes(16).toString('hex');
      
      const user = await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        authProvider: "email"
      });

      // Set session
      req.session.userId = user.id;
      res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post('/api/login', async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      req.session.userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req: AuthRequest, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth?error=google_auth_failed' }),
    (req: AuthRequest, res: Response) => {
      // Set session for passport user
      if (req.user) {
        req.session.userId = req.user.id;
      }
      res.redirect('/');
    }
  );

  // Get current user
  app.get('/api/auth/user', async (req: AuthRequest, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        authProvider: user.authProvider
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
}

// Authentication middleware
export function isAuthenticated(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}