const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const uitls = require('../utils/utils')
const crypto = require('crypto');
const { enqueuePasswordResetOtpEmail } = require('../queue/emailQueue');

const isProduction = process.env.NODE_ENV === 'production';
const tokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: process.env.SESSION_COOKIE_SAMESITE || 'lax',
    maxAge: 1000 * 60 * 60 * 24,
};

const loginController = async (req, res) => {

    try{
        const user = await prisma.user.findUnique({
            where: {username: req.body.username}
        });
        if(!user){
            return res.status(401).send({message: 'User not found'});
        }
        const isValid = await uitls.comparePassword(req.body.password, user.password);
        if(!isValid){
            return res.status(401).send({message: 'Invalid password'});
        }
        const token =  uitls.issueToken(user);
        res.cookie("token", token.token, tokenCookieOptions);
        return res.status(200).send({ success: true, message: 'Login successful' });
    }catch(e){
        return res.status(500).send({message: e.message});
    }
}


const registerController = async (req, res) => {   
    try{
        const hash = await uitls.generatePassword(req.body.password);
        const user = await prisma.user.create({
            data: {
                username: req.body.username,
                password: hash,
                email: req.body.email.toLowerCase()
            }
        });
        const token = uitls.issueToken(user);
        res.cookie("token", token.token, tokenCookieOptions);
        return res.status(200).send({ success: true, message: 'User created successfully' });
    } catch(e){
        return res.status(500).send({message: e.message});
    }
}

const schedulePasswordResetOtpEmail = async (email, otpCode) => {
    await enqueuePasswordResetOtpEmail({ email, otpCode });
};

const getOtpCode = () => {
    const forcedOtp = String(process.env.FORCED_OTP_CODE || '').trim();
    if (/^\d{6}$/.test(forcedOtp)) {
        return forcedOtp;
    }

    return String(Math.floor(100000 + Math.random() * 900000));
};

const forgotPasswordRequestController = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(200).send({ success: true, message: 'If the email exists, an OTP has been sent' });
        }

        const otpCode = getOtpCode();
        const otpHash = await uitls.generatePassword(otpCode);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.passwordResetOtp.create({
            data: {
                email,
                otpHash,
                expiresAt,
                verifiedAt: null,
                usedAt: null,
                resetTokenHash: null,
            },
        });

        await schedulePasswordResetOtpEmail(email, otpCode);
        return res.status(200).send({ success: true, message: 'If the email exists, an OTP has been sent' });
    } catch (e) {
        return res.status(500).send({ message: e.message || 'Failed to send OTP email' });
    }
};

const forgotPasswordVerifyController = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const otp = String(req.body.otp || '').trim();

        if (!email || !/^\d{6}$/.test(otp)) {
            return res.status(400).send({ message: 'Valid email and 6-digit OTP are required' });
        }

        const resetCandidates = await prisma.passwordResetOtp.findMany({
            where: {
                email,
                expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        if (!resetCandidates.length) {
            return res.status(400).send({ message: 'OTP is invalid or expired' });
        }

        let matchedRecord = null;
        for (const candidate of resetCandidates) {
            if (candidate.verifiedAt || candidate.usedAt) {
                continue;
            }

            const isMatch = await uitls.comparePassword(otp, candidate.otpHash);
            if (isMatch) {
                matchedRecord = candidate;
                break;
            }
        }

        if (!matchedRecord) {
            return res.status(400).send({ message: 'OTP is invalid or expired' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await uitls.generatePassword(resetToken);

        await prisma.passwordResetOtp.update({
            where: { id: matchedRecord.id },
            data: {
                verifiedAt: new Date(),
                resetTokenHash,
            },
        });

        return res.status(200).send({
            success: true,
            message: 'OTP verified successfully',
            resetToken,
        });
    } catch (e) {
        return res.status(500).send({ message: e.message || 'Failed to verify OTP' });
    }
};

const forgotPasswordResetController = async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const newPassword = String(req.body.newPassword || '');
        const resetToken = String(req.body.resetToken || '').trim();

        if (!email || !resetToken || newPassword.length < 6) {
            return res.status(400).send({ message: 'Email, reset token, and a valid new password are required' });
        }

        const resetRecord = await prisma.passwordResetOtp.findFirst({
            where: {
                email,
                expiresAt: { gt: new Date() },
                verifiedAt: { not: null },
                usedAt: null,
                resetTokenHash: { not: null },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!resetRecord || !resetRecord.resetTokenHash) {
            return res.status(400).send({ message: 'Reset session is invalid or expired' });
        }

        const isTokenValid = await uitls.comparePassword(resetToken, resetRecord.resetTokenHash);
        if (!isTokenValid) {
            return res.status(400).send({ message: 'Reset session is invalid or expired' });
        }

        const passwordHash = await uitls.generatePassword(newPassword);
        await prisma.user.update({
            where: { email },
            data: { password: passwordHash },
        });

        await prisma.passwordResetOtp.update({
            where: { id: resetRecord.id },
            data: { usedAt: new Date() },
        });

        await prisma.passwordResetOtp.deleteMany({
            where: {
                email,
                id: { not: resetRecord.id },
            },
        });

        return res.status(200).send({ success: true, message: 'Password reset successful' });
    } catch (e) {
        return res.status(500).send({ message: e.message || 'Failed to reset password' });
    }
};


module.exports = {
    loginController,
    registerController,
    forgotPasswordRequestController,
    forgotPasswordVerifyController,
    forgotPasswordResetController,
}
