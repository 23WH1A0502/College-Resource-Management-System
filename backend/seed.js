import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "./src/models/Resource.js";
import connectDB from "./src/util/db.js";

dotenv.config();

const sampleResources = [
  {
    name: "Conference Room A",
    type: "Room",
    description: "Large conference room with projector and whiteboard",
    location: "Building A - 1st Floor",
    capacity: 30,
    available: true
  },
  {
    name: "Projector - Model XYZ",
    type: "Equipment",
    description: "High resolution projector for presentations",
    location: "Equipment Store - Building B",
    capacity: 1,
    available: true
  },
  {
    name: "Laboratory A",
    type: "Room",
    description: "Computer lab with 25 workstations",
    location: "Building C - 2nd Floor",
    capacity: 25,
    available: true
  },
  {
    name: "Seminar Hall",
    type: "Room",
    description: "Large auditorium for seminars and events",
    location: "Building D - Ground Floor",
    capacity: 100,
    available: true
  },
  {
    name: "Smart Board",
    type: "Equipment",
    description: "Interactive smart board for classrooms",
    location: "Building A - 3rd Floor",
    capacity: 1,
    available: true
  },
  {
    name: "Library Study Room",
    type: "Room",
    description: "Quiet study room with individual desks",
    location: "Library - 1st Floor",
    capacity: 10,
    available: true
  },
  {
    name: "Sports Equipment - Basketball",
    type: "Equipment",
    description: "Basketballs for sports activities",
    location: "Sports Complex - Storage",
    capacity: 5,
    available: true
  },
  {
    name: "Meeting Room B",
    type: "Room",
    description: "Small meeting room for team discussions",
    location: "Building A - 2nd Floor",
    capacity: 8,
    available: true
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Connected to database");

    // Clear existing resources
    await Resource.deleteMany({});
    console.log("Cleared existing resources");

    // Insert sample resources
    const createdResources = await Resource.insertMany(sampleResources);
    console.log(`Successfully added ${createdResources.length} sample resources!`);
    
    createdResources.forEach((resource, index) => {
      console.log(`${index + 1}. ${resource.name} - ${resource.type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
