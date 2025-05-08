const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const db = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB connected: ${db.connection.host}`);
    }
    catch (err) {
        console.error(`error ${err}`);
        process.exit(1);
    }
}

module.exports = connectDB;

