import { APIError, betterAuth } from 'better-auth';
import { pool } from '../database/pool.js';
import { customSession } from 'better-auth/plugins';
import { query } from '../database/query.js';
import config from '../config/config.js';

const ALLOWED_DOMAINS = ['g.bracu.ac.bd'];

function isAllowedEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return false;

  return ALLOWED_DOMAINS.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

export const auth = betterAuth({
  database: pool,
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  user: {
    modelName: 'auth_user',
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: config.auth.googleClientId,
      clientSecret: config.auth.googleClientSecret,
      hd: 'g.bracu.ac.bd',
    },
  },
  baseURL: config.app.backendUrl,
  trustedOrigins: [config.app.frontendUrl],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isAllowedEmail(user.email)) {
            throw new APIError('BAD_REQUEST', {
              message: `Email domain not allowed. Please use an email from the following domains: ${ALLOWED_DOMAINS.join(', ')}`,
            });
          }
        },
        after: async (user) => {
          try {
            await query(
              `INSERT INTO users (user_id, name, university_email, avatar, is_verified)
             VALUES ($1, $2, $3, $4, $5)`,
              [user.id, user.name, user.email, user.image ?? null, user.emailVerified],
            );
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error inserting user into users table:', error);
            }
          }
        },
      },
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      try {
        const { rows } = await query(
          `SELECT
        role,
        account_status,
        is_verified,
        slug,
        sid
       FROM users
       WHERE user_id = $1`,
          [user.id],
        );

        const profile = rows[0];

        if (!profile) {
          console.error('Auth user has no application profile', {
            userId: user.id,
          });

          throw new APIError('INTERNAL_SERVER_ERROR', {
            message: 'User profile not found',
          });
        }
        if (profile.account_status !== 'active') {
          throw new APIError('FORBIDDEN', {
            message: `Your account is ${profile.account_status}. Please contact support for assistance.`,
          });
        }

        return {
          session,
          user: {
            ...user,
            ...profile,
          },
        };
      } catch (error) {
        if (error instanceof APIError) {
          throw error;
        }

        console.error('Failed to load user profile', {
          userId: user.id,
          error,
        });

        throw new APIError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to load user profile',
        });
      }
    }),
  ],
});
