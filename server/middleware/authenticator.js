const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie');

const pathToPrivateKey = path.join(__dirname, '../utils', 'private.pem');
const SECRET_KEY = fs.readFileSync(pathToPrivateKey, 'utf8');

const authenticateUser = async (req, res, next) => {
    try {
        const cookie = req.headers.cookie;

        if (!cookie) {
            return res.status(401).json({ message: 'Unauthorized - No cookies found' });
        }

        const cookies = cookieParser.parse(cookie);
        const token = cookies['token'];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token found' });
        }

       
        let jsonString = token.startsWith('j:') ? token.replace(/^j:/, '') : token;
        let cookieJson;

        try {
            cookieJson = JSON.parse(jsonString);
        } catch (error) {
            return res.status(401).json({ message: 'Invalid cookie format' });
        }

        const tokenFromCookie = cookieJson['token'];

        if (!tokenFromCookie) {
            return res.status(401).json({ message: 'Unauthorized - Token not found inside cookie' });
        }

        const tokenBody = tokenFromCookie.split(' ')[1];

        jwt.verify(tokenBody, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            req.user = decoded;
            console.log(req.user); // Attach user to request
            next();
        });

    } catch (error) {
        console.error('Authentication Error:', error.message);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = authenticateUser;







// const jwt = require('jsonwebtoken');
// const path = require('path');
// const fs = require('fs');
// const cookieParser = require('cookie');

// const pathToPrivateKey = path.join(__dirname, '../utils', 'private.pem');
// const SECRET_KEY = fs.readFileSync(pathToPrivateKey, 'utf8');

// const authenticateUser = async (req, res, next) => {
//     const cookie = req.headers.cookie;
//     const cookies = cookieParser.parse(cookie);
//     const token = cookies['token'];

//     let jsonString = token.replace(/^j:/, '');
//     let cookieJson = JSON.parse(jsonString);    
//     let tokenFromCookie = cookieJson['token'];

//     if (!tokenFromCookie) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const tokenBody = tokenFromCookie.split(' ')[1];

//     // Verify the JWT
//     jwt.verify(tokenBody, SECRET_KEY, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ message: 'Invalid token' });
//         }
//         req.user = decoded;
//         console.log(req.user); // Attach user to the request
//         next();
//     });

// }

// module.exports = authenticateUser;
