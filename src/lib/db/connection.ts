import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;



interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  let uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable");
  }

  // Clean the URI - remove accidental quotes or whitespace from environment variables
  uri = uri.trim().replace(/^["'](.+)["']$/, '$1');

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    console.log("DB: Initiating connection...");
    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log("DB: Connection established successfully.");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
