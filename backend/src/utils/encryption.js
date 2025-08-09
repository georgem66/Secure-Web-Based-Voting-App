import crypto from 'crypto';
import NodeRSA from 'node-rsa';
import { config } from '../config/config.js';

class EncryptionService {
  constructor() {
    this.aesKey = crypto.scryptSync(config.ENCRYPTION_KEY, 'salt', 32);
    this.rsaKeyPair = new NodeRSA({ b: config.RSA_KEY_SIZE });
  }

  // Generate RSA key pair for end-to-end encryption
  generateRSAKeyPair() {
    const key = new NodeRSA({ b: config.RSA_KEY_SIZE });
    return {
      publicKey: key.exportKey('public'),
      privateKey: key.exportKey('private'),
    };
  }

  // AES-256-GCM encryption for vote data
  encryptVote(voteData) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(config.VOTE_ENCRYPTION_ALGORITHM, this.aesKey);
    cipher.setAAD(Buffer.from('vote-data'));
    
    let encrypted = cipher.update(JSON.stringify(voteData), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  // AES-256-GCM decryption for vote data
  decryptVote(encryptedData) {
    const { encrypted, iv, authTag } = encryptedData;
    
    const decipher = crypto.createDecipher(config.VOTE_ENCRYPTION_ALGORITHM, this.aesKey);
    decipher.setAAD(Buffer.from('vote-data'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }

  // RSA encryption for session key exchange
  rsaEncrypt(data, publicKey) {
    const key = new NodeRSA(publicKey);
    return key.encrypt(data, 'base64');
  }

  // RSA decryption
  rsaDecrypt(encryptedData, privateKey) {
    const key = new NodeRSA(privateKey);
    return key.decrypt(encryptedData, 'utf8');
  }

  // Generate secure hash for blockchain-style ledger
  generateHash(data, previousHash) {
    const timestamp = new Date().toISOString();
    const payload = JSON.stringify({ data, previousHash, timestamp });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  // Generate transaction hash for vote confirmation
  generateTransactionHash(userId, candidateId, timestamp) {
    const data = `${userId}:${candidateId}:${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate secure random token
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive data
  hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

export const encryptionService = new EncryptionService();