const SimpleHash = require('./SimpleHash');

class Sha256Hash extends SimpleHash {
    static ALGORITHM_NAME = 'sha256';
    static HASH_ITERATIONS = 1024; // 예시 값, 실제 사용하는 값으로 조정하세요

    constructor() {
        super(Sha256Hash.ALGORITHM_NAME);
    }

    static fromHexString(hex) {
        const hash = new Sha256Hash();
        hash.bytes = Buffer.from(hex, 'hex');
        return hash;
    }

    static fromBase64String(base64) {
        const hash = new Sha256Hash();
        hash.bytes = Buffer.from(base64, 'base64');
        return hash;
    }

    // 비밀번호 해싱을 위한 정적 메서드
    static hashedPassword(plainTextPassword, passwordSalt) {
        if (!plainTextPassword || !passwordSalt) {
            throw new Error('Bad password or passwordSalt!');
        }

        const hash = SimpleHash.hash(
            Sha256Hash.ALGORITHM_NAME,
            plainTextPassword,
            passwordSalt,
            Sha256Hash.HASH_ITERATIONS
        );

        return hash.toBase64();
    }
}

module.exports = Sha256Hash; 