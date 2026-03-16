const crypto = require('crypto');

// Advanced Data Masking Middleware Class
class DataMaskingMiddleware {
  constructor(options = {}) {
    this.options = {
      enabled: options.enabled !== false,
      encryptionKey: options.encryptionKey || process.env.DATA_MASKING_KEY || 'default-key-change-in-prod',
      defaultMaskType: options.defaultMaskType || 'mask', // 'mask', 'partial', 'encrypt', 'hash'
      maskedFields: options.maskedFields || ['password', 'email', 'phone', 'aadhar', 'ssn', 'creditCard'],
      partialReveal: options.partialReveal || 4, // Show last N characters for partial masking
      logMaskedData: options.logMaskedData || false,
      roleBasedMasking: options.roleBasedMasking || {},
      environment: options.environment || process.env.NODE_ENV || 'development'
    };

    // Encryption setup
    this.algorithm = 'aes-256-cbc';
    this.key = crypto.scryptSync(this.options.encryptionKey, 'salt', 32);
    this.iv = crypto.randomBytes(16);
  }

  // Main middleware function
  maskSensitiveData(req, res, next) {
    if (!this.options.enabled) return next();

    const userRole = req.user?.role || 'guest';
    const routeMasking = this.getRouteSpecificMasking(req.path);

    const originalJson = res.json;
    const originalSend = res.send;

    res.json = (data) => {
      const maskedData = this.maskObject(data, userRole, routeMasking);
      if (this.options.logMaskedData) {
        console.log(`Masked data for ${req.path}:`, JSON.stringify(maskedData, null, 2));
      }
      return originalJson.call(this, maskedData);
    };

    res.send = (data) => {
      if (typeof data === 'object') {
        const maskedData = this.maskObject(data, userRole, routeMasking);
        if (this.options.logMaskedData) {
          console.log(`Masked data for ${req.path}:`, JSON.stringify(maskedData, null, 2));
        }
        return originalSend.call(this, JSON.stringify(maskedData));
      }
      return originalSend.call(this, data);
    };

    next();
  }

  // Get masking rules specific to a route
  getRouteSpecificMasking(path) {
    // Example: different masking for admin routes
    if (path.includes('/admin')) {
      return { maskType: 'encrypt', fields: ['password', 'email'] };
    }
    return {};
  }

  // Advanced object masking with recursion and different strategies
  maskObject(obj, userRole = 'guest', routeMasking = {}) {
    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskObject(item, userRole, routeMasking));
    }

    const masked = {};
    const rolePermissions = this.options.roleBasedMasking[userRole] || {};

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.options.maskedFields.some(field => lowerKey.includes(field));
      const canAccess = rolePermissions[key] !== false;

      if (isSensitive && !canAccess) {
        const maskType = routeMasking.maskType || this.options.defaultMaskType;
        masked[key] = this.applyMasking(value, maskType, key);
      } else {
        masked[key] = this.maskObject(value, userRole, routeMasking);
      }
    }

    return masked;
  }

  // Apply different masking strategies
  applyMasking(value, maskType, fieldName) {
    if (value === null || value === undefined) return value;

    const strValue = String(value);

    switch (maskType) {
      case 'mask':
        return '***MASKED***';

      case 'partial':
        if (strValue.length <= this.options.partialReveal) return strValue;
        return '*'.repeat(strValue.length - this.options.partialReveal) + strValue.slice(-this.options.partialReveal);

      case 'encrypt':
        try {
          const cipher = crypto.createCipher(this.algorithm, this.key);
          let encrypted = cipher.update(strValue, 'utf8', 'hex');
          encrypted += cipher.final('hex');
          return `__ENCRYPTED__${encrypted}`;
        } catch (error) {
          console.error('Encryption error:', error);
          return '***ENCRYPTION_FAILED***';
        }

      case 'hash':
        return crypto.createHash('sha256').update(strValue).digest('hex').substring(0, 16) + '...';

      case 'custom':
        // Allow custom masking functions
        if (this.options.customMaskers && this.options.customMaskers[fieldName]) {
          return this.options.customMaskers[fieldName](value);
        }
        return '***CUSTOM_MASKED***';

      default:
        return '***MASKED***';
    }
  }

  // Decrypt encrypted data (for internal use)
  decrypt(value) {
    if (typeof value !== 'string' || !value.startsWith('__ENCRYPTED__')) return value;

    try {
      const encrypted = value.replace('__ENCRYPTED__', '');
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return '***DECRYPTION_FAILED***';
    }
  }

  // Update masking configuration dynamically
  updateConfig(newOptions) {
    Object.assign(this.options, newOptions);
  }

  // Get current masking status
  getMaskingStatus(req, res) {
    res.json({
      enabled: this.options.enabled,
      maskedFields: this.options.maskedFields,
      defaultMaskType: this.options.defaultMaskType,
      environment: this.options.environment,
      roleBasedMasking: Object.keys(this.options.roleBasedMasking),
      logMaskedData: this.options.logMaskedData
    });
  }

  // Middleware for conditional masking based on headers
  conditionalMasking(req, res, next) {
    const bypassMasking = req.headers['x-bypass-masking'] === 'true' && req.user?.role === 'admin';
    if (bypassMasking) {
      return next();
    }
    this.maskSensitiveData(req, res, next);
  }
}

// Factory function for easy instantiation
function createDataMaskingMiddleware(options) {
  const middleware = new DataMaskingMiddleware(options);
  return {
    maskSensitiveData: middleware.maskSensitiveData.bind(middleware),
    getMaskingStatus: middleware.getMaskingStatus.bind(middleware),
    conditionalMasking: middleware.conditionalMasking.bind(middleware),
    updateConfig: middleware.updateConfig.bind(middleware),
    decrypt: middleware.decrypt.bind(middleware)
  };
}

module.exports = createDataMaskingMiddleware;