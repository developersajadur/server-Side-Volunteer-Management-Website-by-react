const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



// ------------------- middleware ------------------------

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("VolunteerHub Server Is Running");
})


// ---------------------------------------------------------------



const uri = "mongodb+srv://VolunteerHub:rIEdfqbg8m2Bl9S8@volunteerhub.pjcv7iq.mongodb.net/?retryWrites=true&w=majority&appName=VolunteerHub";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // ------------------------------ databases Collections ------------------------------
    const VolunteerCollections = client.db("VolunteerHub").collection("VolunteerCollections");
    const jobRequestCollections = client.db("VolunteerHub").collection("JobRequestCollections");



  // ----------------------------------- post all VolunteerCollections --------------------------------

  app.post("/volunteers-post", async (req, res) =>{
    const VolunteerCollectionsData = req.body;
    const result = await VolunteerCollections.insertOne(VolunteerCollectionsData);
    res.send(result);
  })

    // --------------------------- get all VolunteerCollections post --------------------------
    app.get("/volunteers-post", async (req, res) => {
      const option = {
          projection: { thumbnail: 1, postTitle: 1, category: 1, volunteersNeeded: 1, deadline: 1, location: 1 }
      };
      const VolunteerCollectionsData = await VolunteerCollections.find({}, option).toArray();
      res.send(VolunteerCollectionsData);
  });

  // -------------------------------- update post ----------------------------

  app.put("/volunteers-post/:id", async (req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatePost = req.body;
    const post ={
      $set:{
        thumbnail: updatePost.thumbnail,
        postTitle: updatePost.postTitle,
        category: updatePost.category,
        volunteersNeeded: updatePost.volunteersNeeded,
        deadline: updatePost.deadline,
        location: updatePost.location,
        description: updatePost.description
      }
    }
    const result = await VolunteerCollections.updateOne(filter, post, options);
    res.send(result);

  })

  // -------------------------- get single post ------------------------------
  app.get("/volunteers-post/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const VolunteerCollectionsData = await VolunteerCollections.findOne(query);
    res.send(VolunteerCollectionsData);
 })
  // ---------------------------- delete a Volunteer post ----------------------------


  app.delete("/volunteers-post/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await VolunteerCollections.deleteOne(query);
    res.send(result);
  });
 // --------------------------- get all VolunteerCollections by email --------------------------

  app.get("/volunteers-post/user/:email" , async(req, res) => {
    const email = req.params.email;
    const VolunteerCollectionsData = await VolunteerCollections.find({ "email": email }).toArray();
    res.send(VolunteerCollectionsData);
  })

  // ----------------------------------- get volunteer details --------------------------------
  app.get("/volunteer-details/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const VolunteerCollectionsData = await VolunteerCollections.findOne(query);
    res.send(VolunteerCollectionsData);
});

  

// ---------------------- post job request --------------------
app.post("/request-job", async (req, res) => {
  const request = req.body;
  const result = await jobRequestCollections.insertOne(request);
  res.send(result);
});


// --------------------- get all jobs request --------------------
app.get("/request-job", async (req, res) => {
  const jobRequestCollectionsData = await jobRequestCollections.find({}).toArray();
  res.send(jobRequestCollectionsData);
});

// --------------------- get job request by email --------------------
app.get("/request-job/:email", async (req, res) => {
  const email = req.params.email;
  const jobRequestCollectionsData = await jobRequestCollections.find({ email: email }).toArray();
  res.send(jobRequestCollectionsData);
});





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// ---------------------------------------------------------------

app.listen(port, () => {
    console.log(`VolunteerHub Server is running on port ${port}`);
})