const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	user1: { type: String, required: true },
	user2: { type: String, required: true },
	messages:
			[{
				sender: { type: String, required: true },
				message: { type: String, required: true },
				date: { type: Date, default: Date.now },
			}]
});

const Chat = mongoose.model('Chat', userSchema);

module.exports = Chat;
