const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1c1ekka.mongodb.net/?retryWrites=true&w=majority`;

const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const deliveryManCollection = client
  .db("parcel_managementDB")
  .collection("delivery_mans");
const userCollection = client.db("parcel_managementDB").collection("users");
async function run() {
  try {
    await client.connect();

    // Save or modify user email, status in DB
    app.put("/users", async (req, res) => {
      console.log(req.body);
      const user = req.body;
      const email = user.email;
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await userCollection.findOne(query);
      console.log("User found?----->", isExist);
      if (isExist) return res.send(isExist);
      const result = await userCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      );
      res.send(result);
    });

    app.get("/delivery-men", async (req, res) => {
      const result = await deliveryManCollection.find().toArray();
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", async (req, res) => {
  res.send("parcel management server is running");
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});
