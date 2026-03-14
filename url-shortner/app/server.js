import express from "express";
import path from "path"
import { nanoid } from "nanoid";

import connectDB from "./db.js";
import redisClient from "./redis.js";
import Url from "./urlModel.js";


const app = express()
app.use(express.static("public"))
app.use(express.json())


const PORT = 3000;

await connectDB();

/*
Create short URL
*/
app.post("/shorten", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const shortCode = nanoid(6);

    const newUrl = await Url.create({
      originalUrl: url,
      shortCode
    });

    res.json({
      shortUrl: `http://localhost:${PORT}/${shortCode}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/*
Redirect using short code
*/
app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // 1️⃣ check Redis cache
    const cachedUrl = await redisClient.get(code);

    if (cachedUrl) {
      console.log("Cache hit");
      return res.redirect(cachedUrl);
    }

    // 2️⃣ query MongoDB
    const record = await Url.findOne({ shortCode: code });

    if (!record) {
      return res.status(404).send("URL not found");
    }

    // increase clicks
    record.clicks += 1;
    await record.save();

    // 3️⃣ store in Redis
    await redisClient.set(code, record.originalUrl, {
      EX: 60,
    });

    console.log("Cache miss → stored in Redis");

    res.redirect(record.originalUrl);

  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

/*
Analytics endpoint
*/
app.get("/analytics/:code", async (req, res) => {

  const record = await Url.findOne({
    shortCode: req.params.code
  });

  if (!record) {
    return res.status(404).json({
      error: "Not found"
    });
  }

  res.json(record);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
