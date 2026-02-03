import * as admin from 'firebase-admin';
import { logger } from '../../lib/logger';

// Get Auth instance
const getAuth = () => admin.auth();

export interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: string;
  createdAt: string;
  lastSignInTime: string;
}

export const getUsers = async (limit = 100, pageToken?: string) => {
  const listUsersResult = await getAuth().listUsers(limit, pageToken);
  return {
    users: listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: (user.customClaims?.role as string) || 'user',
      createdAt: user.metadata.creationTime,
      lastSignInTime: user.metadata.lastSignInTime,
    })),
    pageToken: listUsersResult.pageToken,
  };
};

export const createUser = async (data: { email: string; password?: string; role?: string; displayName?: string; generateInviteLink?: boolean }) => {
  try {
    const userRecord = await getAuth().createUser({
      email: data.email,
      password: data.password || undefined, // undefined if not provided
      displayName: data.displayName,
    });

    if (data.role) {
      await getAuth().setCustomUserClaims(userRecord.uid, { role: data.role });
    }

    let inviteLink: string | undefined;
    if (data.generateInviteLink) {
      inviteLink = await getAuth().generatePasswordResetLink(data.email);
    }

    return { ...userRecord, inviteLink };
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

export const generateResetLink = async (uid: string): Promise<string> => {
  try {
    const user = await getAuth().getUser(uid);
    if (!user.email) throw new Error('User has no email');
    return await getAuth().generatePasswordResetLink(user.email);
  } catch (error) {
    logger.error(`Error generating reset link for ${uid}:`, error);
    throw error;
  }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'user') => {
  try {
    await getAuth().setCustomUserClaims(uid, { role });
  } catch (error) {
    logger.error(`Error setting role ${role} for user ${uid}:`, error);
    throw error;
  }
};

export const deleteUser = async (uid: string) => {
  try {
    await getAuth().deleteUser(uid);
  } catch (error) {
    logger.error(`Error deleting user ${uid}:`, error);
    throw error;
  }
};
