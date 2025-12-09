import mongoose from "mongoose";
import { environment } from "./enviroment";

interface DatabaseConnection {
    connect: () => Promise<typeof mongoose>;
    disconnect: () => Promise<void>;
    isConnected: () => boolean;
}

class Database implements DatabaseConnection {
  private static instance: Database;
  private connectionState: number = 0;

  private constructor() {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connected successfully");
      this.connectionState = 1;
    });

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
      this.connectionState = 0;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
      this.connectionState = 0;
    });

    process.on("SIGINT", async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<typeof mongoose> {
    if (this.connectionState === 1) {
      console.log("MongoDB is already connected");
      return mongoose;
    }

    const mongoOptions: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    try {
      console.log("Connecting to MongoDB...");

      if (environment.isTest) {
        console.log("Running in test environment");
      }

      await mongoose.connect(environment.mongodbUri, mongoOptions);
      this.connectionState = 1;
      return mongoose;
    } catch (error) {
      this.connectionState = 0;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Failed to connect to MongoDB:", errorMessage);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connectionState === 0) {
      console.log("MongoDB already disconnected");
      return;
    }

    try {
      await mongoose.connection.close();
      this.connectionState = 0;
      console.log("MongoDB connection closed gracefully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error closing MongoDB connection:", errorMessage);
      throw error;
    }
  }

  public isConnected(): boolean {
    return this.connectionState === 1 && mongoose.connection.readyState === 1;
  }

  public getConnectionState(): string {
    const states: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    return states[mongoose.connection.readyState] || "unknown";
  }
}

export const database = Database.getInstance();