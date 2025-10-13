const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "https://dhaka-jobs.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());
// Serve uploaded CVs
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// MongoDB connection
const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.58zpnyp.mongodb.net/?retryWrites=true&w=majority`,
  { serverApi: { version: ServerApiVersion.v1 } }
);

async function run() {
  try {
    await client.connect();
    const db = client.db("dhakaPortalDb404");
    const jobsCollection = db.collection("jobs");
    const appliedCollection = db.collection("applied");

    // Get all jobs
    app.get("/jobs", async (req, res) => {
      const jobs = await jobsCollection.find().toArray();
      res.send(jobs);
    });

    // Get single job
    app.get("/jobs/:id", async (req, res) => {
      const job = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(job);
    });

    // Get all applied jobs
    app.get("/applied", async (req, res) => {
      const applied = await appliedCollection.find().toArray();
      res.send(applied);
    });

    // POST applied job with CV
    app.post("/applied", upload.single("cv"), async (req, res) => {
      try {
        const appliedData = JSON.parse(req.body.appliedData); // parse JSON
        if (req.file) {
          appliedData.cvLink = `/uploads/${req.file.filename}`;
        }
        const result = await appliedCollection.insertOne(appliedData);
        res.send({ success: true, result });
      } catch (err) {
        res.status(500).send({ success: false, message: err.message });
      }
    });

    console.log("Server running and MongoDB connected!");
  } finally {
    // optional client.close()
  }
}

run().catch(console.dir);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
