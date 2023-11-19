const functions = require("firebase-functions");
const cors = require("cors");
const express = require("express");
const app = express();
const APIRoutes = require("./routes/API-routes");

const corsOptions = {
  origin: "*", // Take domain-only related request later, for security.
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/", APIRoutes);

exports.app = functions.https.onRequest(app);
