const dotenv = require('dotenv');
const crypto = require('crypto');
const algorithm = process.env.TOKEN_ALGORITHM_CRYPTO;
const secretKey = process.env.TOKEN_SECRET_CRYPTO;
const key_in_bytes = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key_in_bytes, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return iv.toString('hex')+'##'+encrypted.toString('hex');
};
const decrypt = (hash) => {
      var klo = hash.split("##");
      var iv = klo[0];
      var content= klo[1];
    const decipher = crypto.createDecipheriv(algorithm, key_in_bytes, Buffer.from(iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
};