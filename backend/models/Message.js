const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { 
    type: String, 
    required: true,
    index: true // Taaki 35 lakh users mein search fast ho
  },
  receiverId: { 
    type: String, 
    required: true,
    index: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  senderRole: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: String, 
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
  },
  encrypted: {
    type: Boolean,
    default: true   // All messages are AES-256 encrypted by frontend
  }
}, { 
  timestamps: true // Isse 'createdAt' aur 'updatedAt' apne aap ban jayega
});

module.exports = mongoose.model('Message', MessageSchema);