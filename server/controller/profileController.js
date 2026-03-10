const { PrismaClient } = require('@prisma/client');
const path = require('path');

const Sstorage = require('../config/supabaseConfig');

const prisma = new PrismaClient();
const STORAGE_BUCKET = 'Files-uploader';

const getUserId = (user) => user?.sub || user?.id;

const toSafeBool = (value, fallback) => {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
};

const getMyProfile = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      about: user.profile?.about || '',
      avatarUrl: user.profile?.avatarUrl || '',
      portfolioName: user.profile?.portfolioName || '',
      portfolioLink: user.profile?.portfolioLink || '',
      emailNotifications: toSafeBool(user.profile?.emailNotifications, true),
      desktopNotifications: toSafeBool(user.profile?.desktopNotifications, true),
      sharedActivity: toSafeBool(user.profile?.sharedActivity, false),
      twoFactorEnabled: toSafeBool(user.profile?.twoFactorEnabled, true),
      createdAt: user.profile?.createdAt || null,
      updatedAt: user.profile?.updatedAt || null,
    };

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

// Get general recent activity for the user
const getMyRecentActivity = async (req, res) => {
  try {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }
    const activities = await prisma.activityLog.findMany({
      where: { actorId: userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return res.status(200).json({ activities });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    const {
      username,
      email,
      firstName,
      lastName,
      about,
      avatarUrl,
      portfolioName,
      portfolioLink,
      emailNotifications,
      desktopNotifications,
      sharedActivity,
      twoFactorEnabled,
    } = req.body || {};

    const userUpdates = {};

    if (typeof username === 'string' && username.trim().length > 0) {
      const normalizedUsername = username.trim();
      const existingUsername = await prisma.user.findFirst({
        where: {
          username: normalizedUsername,
          id: { not: userId },
        },
      });
      if (existingUsername) {
        return res.status(409).send('Username already in use');
      }
        getMyRecentActivity,
      userUpdates.username = normalizedUsername;
    }

    if (typeof email === 'string' && email.trim().length > 0) {
      const normalizedEmail = email.trim().toLowerCase();
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: userId },
        },
      });
      if (existingEmail) {
        return res.status(409).send('Email already in use');
      }
      userUpdates.email = normalizedEmail;
    }

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdates,
      });
    }

    const profileData = {
      firstName: typeof firstName === 'string' ? firstName.trim() : undefined,
      lastName: typeof lastName === 'string' ? lastName.trim() : undefined,
      about: typeof about === 'string' ? about.trim() : undefined,
      avatarUrl: typeof avatarUrl === 'string' ? avatarUrl.trim() : undefined,
      portfolioName: typeof portfolioName === 'string' ? portfolioName.trim() : undefined,
      portfolioLink: typeof portfolioLink === 'string' ? portfolioLink.trim() : undefined,
      emailNotifications: typeof emailNotifications === 'boolean' ? emailNotifications : undefined,
      desktopNotifications: typeof desktopNotifications === 'boolean' ? desktopNotifications : undefined,
      sharedActivity: typeof sharedActivity === 'boolean' ? sharedActivity : undefined,
      twoFactorEnabled: typeof twoFactorEnabled === 'boolean' ? twoFactorEnabled : undefined,
    };

    const sanitizedProfileData = Object.fromEntries(
      Object.entries(profileData).filter(([, value]) => value !== undefined)
    );

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...sanitizedProfileData,
      },
      update: sanitizedProfileData,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.profile?.firstName || '',
        lastName: updatedUser.profile?.lastName || '',
        about: updatedUser.profile?.about || '',
        avatarUrl: updatedUser.profile?.avatarUrl || '',
        portfolioName: updatedUser.profile?.portfolioName || '',
        portfolioLink: updatedUser.profile?.portfolioLink || '',
        emailNotifications: toSafeBool(updatedUser.profile?.emailNotifications, true),
        desktopNotifications: toSafeBool(updatedUser.profile?.desktopNotifications, true),
        sharedActivity: toSafeBool(updatedUser.profile?.sharedActivity, false),
        twoFactorEnabled: toSafeBool(updatedUser.profile?.twoFactorEnabled, true),
      },
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

const uploadMyProfileImage = async (req, res) => {
  try {
    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).send('Unauthorized');
    }

    if (!req.file) {
      return res.status(400).send('Please upload an image');
    }

    const extension = path.extname(req.file.originalname || '').toLowerCase();
    const safeBaseName = path
      .basename(req.file.originalname || 'avatar', extension)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 60) || 'avatar';

    const fileName = `${Date.now()}-${safeBaseName}${extension || '.jpg'}`;
    const objectPath = `${userId}/user_images/${fileName}`;

    const { data, error } = await Sstorage
      .from(STORAGE_BUCKET)
      .upload(objectPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (error || !data) {
      const message = error?.message || 'Failed to upload image to storage';
      console.error('Supabase avatar upload error:', message);
      return res.status(400).send(message);
    }

    const { data: publicUrlData } = Sstorage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    const avatarUrl = publicUrlData?.publicUrl || '';

    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        avatarUrl,
      },
      update: {
        avatarUrl,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      avatarUrl,
      storagePath: data.path,
    });
  } catch (error) {
    console.error('Internal server error:', error.message);
    return res.status(500).send('Internal server error');
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadMyProfileImage,
  getMyRecentActivity,
};
