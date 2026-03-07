const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const pathToPrivateKey = path.join(__dirname, 'private.pem');
let privateKey;

try {
    privateKey = fs.readFileSync(pathToPrivateKey, 'utf8');
} catch (error) {
    console.error('Error reading private key:', error);
    throw new Error('Private key could not be read');
}

async function generatePassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const issueToken = (user) => {
    const id = user.id;
    const payload = {
        sub: id,
        iat: Math.floor(Date.now() / 1000), // Convert milliseconds to seconds
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 1 day expiration
    };

    const signToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256'
    });

    return {
        token: "Bearer " + signToken,
        expires: '1d'
    };
};

module.exports = {
    generatePassword,
    comparePassword,
    issueToken
};
