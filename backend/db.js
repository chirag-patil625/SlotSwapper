const mongoose = require('mongoose');

const mongoDBURL = process.env.MONGODB_URI;

const connectToMongo = async () => {
    try {
        if (!mongoDBURL) {
            throw new Error('MONGODB_URI is not defined in the .env file');
        }
        await mongoose.connect(mongoDBURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connection Successful");
    } catch (err) {
        console.error("Connection Error:", err.message);
    }
};

module.exports = connectToMongo;