
const mongoose = require( 'mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://puneet:1234@cluster0.50yvakj.mongodb.net/StudioDB?appName=Cluster0'
);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }

};

module.exports = connectDB;