const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const ShortURL = require("./models/shortUrl");
const mongoConfig = require("./config/mongo");

const jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", async (req, res) => {
  res.send({
    success: true,
    message: "Rajat's Url Shortener service running successfully.",
  });
});

app.get("/api/shortid/get", async (req, res) => {
  const allShortUrls = await ShortURL.find();
  res.send({ success: true, data: allShortUrls || [] });
});

app.post("/api/shortid/add", async (req, res) => {
  try {
    const full = req.body.full;
    const short = req.body.short;
    let doc = {
      full: full,
    };
    if (short) {
      doc["short"] = short;
    }
    const record = new ShortURL(doc);
    await record.save();
    res.send({
      success: true,
      message: "Added successfully.",
      data: { record },
    });
  } catch (e) {
    res.send({
      success: false,
      message: "Could not add.",
    });
  }
});

app.get("/:shortid", async (req, res) => {
  const shortid = req.params.shortid;
  const rec = await ShortURL.findOne({ short: shortid });
  if (!rec) {
    res.send({
      success: false,
      data: null,
      error: { message: "Url Not found, Please verify." },
    });
  }
  rec._doc.clicks++;
  await rec.save();
  res.send({
    success: true,
    message: "Url found.",
    data: { ...rec._doc },
  });
});
app.get("/*", async (req, res) => {
  res.send({
    success: false,
    message: "Resource not found.",
  });
});
mongoose.connect(process.env.MONGO_URI || mongoConfig.production.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("open", async () => {
  app.listen(process.env.PORT || 8001, () => {
    console.log(`Server started at ${process.env.PORT}`);
  });
});
