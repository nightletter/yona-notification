const crypto = require('crypto');

class SimpleHash {
    static DEFAULT_ITERATIONS = 1;

    constructor(algorithmName) {
        if (!algorithmName) {
            throw new Error('algorithmName argument cannot be null or empty.');
        }
        this.algorithmName = algorithmName;
        this.iterations = SimpleHash.DEFAULT_ITERATIONS;
        this.bytes = null;
        this.salt = null;
    }

    // 주요 해싱 메서드
    static hash(algorithmName, source, salt = null, hashIterations = 1) {
        if (!source) {
            throw new Error('Source cannot be null or empty');
        }

        const instance = new SimpleHash(algorithmName);
        instance.iterations = Math.max(SimpleHash.DEFAULT_ITERATIONS, hashIterations);
        
        if (salt) {
            instance.salt = Buffer.from(salt);
        }

        const sourceBytes = Buffer.from(source);
        instance.bytes = instance._hashInternal(sourceBytes, instance.salt, instance.iterations);

        return instance;
    }

    // 내부 해싱 로직
    _hashInternal(bytes, salt, hashIterations) {
        try {
            let digest = crypto.createHash(this.algorithmName);
            
            if (salt) {
                digest.update(salt);
            }
            
            let hashed = digest.update(bytes).digest();

            // 추가 반복 해싱
            const iterations = hashIterations - SimpleHash.DEFAULT_ITERATIONS;
            for (let i = 0; i < iterations; i++) {
                digest = crypto.createHash(this.algorithmName);
                hashed = digest.update(hashed).digest();
            }

            return hashed;
        } catch (error) {
            if (error.message.includes('Unknown hash')) {
                throw new Error(`No native '${this.algorithmName}' hash algorithm available`);
            }
            throw error;
        }
    }

    // 유틸리티 메서드들
    toHex() {
        return this.bytes ? this.bytes.toString('hex') : '';
    }

    toBase64() {
        return this.bytes ? this.bytes.toString('base64') : '';
    }

    getBytes() {
        return this.bytes;
    }

    getSalt() {
        return this.salt;
    }

    getIterations() {
        return this.iterations;
    }

    getAlgorithmName() {
        return this.algorithmName;
    }
}

module.exports = SimpleHash; 