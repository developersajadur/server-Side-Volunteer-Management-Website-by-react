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

    // --------------------------- get all VolunteerCollections --------------------------
    app.get("/volunteers-post", async (req, res) => {
      const option = {
          projection: { thumbnail: 1, postTitle: 1, category: 1, volunteersNeeded: 1, deadline: 1, location: 1 }
      };
      const VolunteerCollectionsData = await VolunteerCollections.find({}, option).toArray();
      res.send(VolunteerCollectionsData);
  });

  // ----------------------------------- get volunteer details --------------------------------
  app.get("/volunteer-details/:id", async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const VolunteerCollectionsData = await VolunteerCollections.findOne(query);
    res.send(VolunteerCollectionsData);
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