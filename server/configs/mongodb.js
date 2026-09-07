import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

//Connect to MongoDB database

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database Connected successfully'))

        await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
    }
    export default connectDB