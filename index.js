const express = require("express");
const app = express();
const cors = require("cors");
// const port = 5000;
app.use(express.json());
// app.use(cors());

//middleware
//Must remove "/" from your production URL
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dhaka-jobs.vercel.app",
      "http://192.168.0.110:3000/",
    ],
    credentials: true,
  })
);
require("dotenv").config();

// const dbuser = jobsRelexDb;
// const dbppass = Djk0lCrf6r1baq8h;
// env set
const port = process.env.PORT || 5000;
const dbUserName = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// mogodb setting
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${dbUserName}:${dbPassword}@cluster0.58zpnyp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const myjob = [
  {
    id: 1,
    logo: "https://i.ibb.co/PzrbTxh/google-1-1-1.png",
    job_title: "Technical Database Engineer",
    company_name: "Google LLC",
  },
];

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("dhakaPortalDb404");
    const jobsCollection = database.collection("jobs");
    const appliedCollection = database.collection("applied");

    // get

    app.get("/jobs", async (req, res) => {
      const cusor = jobsCollection.find();
      const result = await cusor.toArray();
      res.send(result);
    });

    app.get("/applied", async (req, res) => {
      const cusor = appliedCollection.find();
      const result = await cusor.toArray();
      res.send(result);
    });
    // get single data

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });
    // applied
    app.get("/applied/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await appliedCollection.findOne(query);
      res.send(result);
    });

    //jobs post

    app.post("/jobs", async (req, res) => {
      const jobs = req.body;
      const result = await jobsCollection.insertOne(jobs);
      res.send(result);
      console.log(result);
    });

    // applied post

    app.post("/applied", async (req, res) => {
      const applied = req.body;
      const result = await appliedCollection.insertOne(applied);
      res.send(result);
      console.log("server", result);
    });

    // update

    // app.put("/jobs/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const jobs = req.body;
    //   const filter = { _id: new ObjectId(id) };
    //   const option = { upsert: true };
    //   const updateProduct = {
    //     $set: {
    //       name: jobs.name,
    //       description: jobs.description,
    //       image: jobs.image,
    //       price: jobs.price,
    //       // amenities: jobs.amenities.selectedAmenities,
    //     },
    //   };
    //   const result = await jobsCollection.updateOne(
    //     filter,
    //     updateProduct,
    //     option
    //   );
    //   res.send(result);
    //   console.log();
    // });

    // Delete the first document in  collection

    app.delete("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("jobs is delete ", id);
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });

    // applied delete

    app.delete("/applied/:id", async (req, res) => {
      const id = req.params.id;
      console.log("applied id delete  ", id);
      const query = { _id: new ObjectId(id) };
      const result = await appliedCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("This is the Dhaka-portal Server");
});

app.get("/data", async (req, res) => {
  res.send(data);
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
