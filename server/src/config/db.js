import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thinkify', {
      // Mongoose 8 uses these by default, but being explicit
    });

    console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║   📦 MongoDB Connected: ${conn.connection.host}           
    ╚═══════════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB error: ${err.message}`);
});

export default connectDB;
