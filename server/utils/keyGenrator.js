const crypto = require('crypto');
const fs = require('fs');


function generateKey() {

    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem'
        }
    });

    fs.writeFileSync(__dirname + '/public.pem', keyPair.publicKey);
    fs.writeFileSync(__dirname + '/private.pem', keyPair.privateKey);

}


generateKey();