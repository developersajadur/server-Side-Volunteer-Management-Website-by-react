require('dotenv').config()
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// ------------------- Middleware ------------------------
const corsOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ------------- Verify Token Middleware --------------------
const verifyToken = async (req, res, next) => {
  const token = req?.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Access denied" });
  }
  jwt.verify(token, `${process.env.JWT_TOKEN_SECRET}`, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized Access denied" });
    }
    req.user = decoded;
    next();
  });
};

// ---------------------- Routes ---------------------------

app.get("/", (req, res) => {
  res.send("VolunteerHub Server Is Running");
});

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@volunteerhub.pjcv7iq.mongodb.net/?retryWrites=true&w=majority&appName=VolunteerHub`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const VolunteerCollections = client
      .db("VolunteerHub")
      .collection("VolunteerCollections");
    const jobRequestCollections = client
      .db("VolunteerHub")
      .collection("JobRequestCollections");

    // ------------------- JWT Token Generation ----------------
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, "Sojib@123", {
        expiresIn: "7d",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // -------------------------- Logout Route --------------------------
    app.post("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 0,
        })
        .send({ success: true });
    });

    // --------------------------------- Post Volunteer Collections ---------------------------------
    app.post("/volunteers-post", async (req, res) => {
      const VolunteerCollectionsData = req.body;
      const result = await VolunteerCollections.insertOne(
        VolunteerCollectionsData
      );
      res.send(result);
    });

    // ----------------------------- Get all Volunteer Collections -----------------------------
    app.get("/volunteers-post", async (req, res) => {
      const option = {
        projection: {
          thumbnail: 1,
          postTitle: 1,
          category: 1,
          volunteersNeeded: 1,
          deadline: 1,
          location: 1,
        },
      };
      const VolunteerCollectionsData = await VolunteerCollections.find(
        {},
        option
      ).toArray();
      res.send(VolunteerCollectionsData);
    });

    // --------------------------------- Update Post ---------------------------------
    app.put("/volunteers-post/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatePost = req.body;
      const post = {
        $set: {
          thumbnail: updatePost.thumbnail,
          postTitle: updatePost.postTitle,
          category: updatePost.category,
          volunteersNeeded: updatePost.volunteersNeeded,
          deadline: updatePost.deadline,
          location: updatePost.location,
          description: updatePost.description,
        },
      };
      const result = await VolunteerCollections.updateOne(
        filter,
        post,
        options
      );
      res.send(result);
    });

    // -------------------------- Get Single Post ------------------------------
    app.get("/volunteers-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const VolunteerCollectionsData = await VolunteerCollections.findOne(
        query
      );
      res.send(VolunteerCollectionsData);
    });

    // -------------------------- Delete a Volunteer Post ------------------------------
    app.delete("/volunteers-post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await VolunteerCollections.deleteOne(query);
      res.send(result);
    });

    // ------------------------- Get all Volunteer Collections by email -------------------------
    app.get("/volunteers-post/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const tokenEmail = req.user.email;
      if (tokenEmail !== email) {
        return res.status(403).send({ message: "Forbidden Access denied" });
      }
      const VolunteerCollectionsData = await VolunteerCollections.find({
        email: email,
      }).toArray();
      res.send(VolunteerCollectionsData);
    });

    // -------------------------------- Get Volunteer Details --------------------------------
    app.get("/volunteer-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const VolunteerCollectionsData = await VolunteerCollections.findOne(
        query
      );
      res.send(VolunteerCollectionsData);
    });

    // --------------------------- Post Job Request ---------------------------
    app.post("/my-request-job", async (req, res) => {
      const request = req.body;
      const result = await jobRequestCollections.insertOne(request);
      res.send(result);
    });

    // ------------------------- Get all Jobs Request -------------------------
    app.get("/my-request-job", async (req, res) => {
      const jobRequestCollectionsData = await jobRequestCollections
        .find({})
        .toArray();
      res.send(jobRequestCollectionsData);
    });

    // ------------------------- Get Job Request by email -------------------------
    app.get("/my-request-job/:email", async (req, res) => {
      const email = req.params.email;
      // }
      const jobRequestCollectionsData = await jobRequestCollections
        .find({ email: email })
        .toArray();
      res.send(jobRequestCollectionsData);
    });

    // ------------------------- Get Job Request by email for post admin -------------------------
    app.get("/request-job/:email", async (req, res) => {
      const email = req.params.email;
      const jobRequestCollectionsData = await jobRequestCollections
        .find({ postAdminEmail: email })
        .toArray();
      res.send(jobRequestCollectionsData);
    });

    // -------------------- Get all Volunteer Collections for pagination ---------------------
    app.get("/all-volunteers-post", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const search = req.query.search;
    
      let query = {};
      if (search) {
        query = {
          postTitle: { $regex: search, $options: "i" }
        };
      }
    
      try {
        const VolunteerCollectionsData = await VolunteerCollections.find(query)
          .skip(size * page)
          .limit(size)
          .toArray();
        res.send(VolunteerCollectionsData);
      } catch (error) {
        console.error("Error fetching volunteer posts:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    

    // ----------------------------- Get all Volunteer Collections -----------------------------
    app.get("/all-volunteers-post-count", async (req, res) => {
      const count = await VolunteerCollections.countDocuments();
      res.send({ count });
    });

    // ------------------------- Job Request Status Change -------------------------
    app.patch("/job/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const status = req.body;
      const updateStatus = {
        $set: status,
      };
      const result = await jobRequestCollections.updateOne(
        filter,
        updateStatus
      );
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

// Start the server
app.listen(port, () => {
  console.log(`VolunteerHub Server is running on port ${port}`);
});
