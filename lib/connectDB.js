import mongoose from "mongoose";
import dns from "dns";

// The OS default DNS resolver on this machine reports 127.0.0.1, where nothing is
// listening on port 53. This breaks the SRV lookup that mongodb+srv:// requires,
// failing with "querySrv ECONNREFUSED" before any connection to Atlas is attempted.
// Force known-good resolvers (router + public DNS) so lookups succeed.
dns.setServers(["192.168.1.1", "8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected...! DB Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection error ", error.message);
    process.exit(1);
  }
};

export default connectDB;
