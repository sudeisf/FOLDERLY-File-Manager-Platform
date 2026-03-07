const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();
const uitls = require('../utils/utils')

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
        res.cookie("token", token, {httpOnly: true});
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
        res.cookie("token", token, {httpOnly: true});
        return res.status(200).send({success: true,message: 'User created successfully'});
    } catch(e){
        return res.status(500).send({message: e.message});
    }
}


module.exports = {
    loginController,
    registerController
}
