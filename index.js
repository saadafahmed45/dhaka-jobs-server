// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://dhaka-jobs.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// MongoDB connection
const dbUserName = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const uri = `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.58zpnyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("dhakaPortalDb404");
    const jobsCollection = database.collection("jobs");
    const appliedCollection = database.collection("applied");

    // GET all jobs
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.json(result);
    });

    // GET single job
    app.get("/jobs/:id", async (req, res) => {
      const result = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.json(result);
    });

    // POST applied job with CV
    app.post("/applied", upload.single("cv"), async (req, res) => {
      try {
        const appliedData = JSON.parse(req.body.appliedData);
        if (req.file) appliedData.cvLink = `/uploads/${req.file.filename}`;

        const result = await appliedCollection.insertOne(appliedData);
        res.json({ success: true, result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
      }
    });

    // GET all applied jobs
    app.get("/applied", async (req, res) => {
      const result = await appliedCollection.find().toArray();
      res.json(result);
    });

    app.listen(process.env.PORT || 5000, () => console.log("Server running"));
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);
