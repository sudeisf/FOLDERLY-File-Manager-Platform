const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const uitls = require('../utils/utils')

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
        res.cookie("token", token, tokenCookieOptions);
        return res.status(200).send({token: token , success: true});
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
                email: req.body.email
            }
        });
        const token = uitls.issueToken(user);
        res.cookie("token", token, tokenCookieOptions);
        return res.status(200).send({success: true,message: 'User created successfully'});
    } catch(e){
        return res.status(500).send({message: e.message});
    }
}


module.exports = {
    loginController,
    registerController
}
