const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userDitails = require("./models/UserDitails");
const videoDitails = require("./models/VideoDitails");
var app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtAuth = require("./middleware/jwtAuth");
const middleWare = require("./middleware/jwtAuth");

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

mongoose
  .connect(
    `mongodb+srv://skjainoddin39854:hngmFxWB8ZLTHpwW@cluster0.lbfgvl4.mongodb.net/SampleExpress?retryWrites=true&w=majority
 JWT_SECRET=tUao3/fmx20gO0uLwpnlJ6t2qzMeOEWAxsIz/OG+3y4=`
  )
  .then(() => {
    console.log("Connected to MongoDB successfully!");
  })
  .catch((err) => {
    console.error(err);
  });

app.post("/signup", async (req, res) => {
  try {
    const emailUse = await userDitails.findOne({ email: req.body.email });
    if (emailUse) {
      return res.status(400).send("already email is used");
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).send("The password does not match");
    }
    const hashedpassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = hashedpassword;
    const hashedcpassword = await bcrypt.hash(req.body.confirmPassword, 10);
    req.body.confirmPassword = hashedcpassword;

    const userData = new userDitails(req.body);
    const saveDate = await userData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});

app.post("/sendvideo", async (req, res) => {
  try {
    const video_url = await videoDitails.findOne({
      video_url: req.body.video_url,
    });
    if (video_url) {
      return res.status(400).send("already video is in  database");
    }

    //const hashedpassword = await bcrypt.hash(req.body.Password, 10);
    //req.body.Password = hashedpassword;

    const videoData = new videoDitails(req.body);
    const saveDate = await videoData.save();
    res.status(201).send(saveDate);
  } catch (err) {
    console.log(err);
  }
});
app.get("/individualvideo/:id", async (req, res) => {
  try {
    // const id = req.params.id;
    const { id } = req.params;
    const video = await videoDitails.findById({ _id: id });
    res.status(200).json(video);
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await userDitails.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("Invalid User");
    }
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(400).send("invalid Password");
    }
    const token = jwt.sign({ email: user.email }, "secretToken", {
      expiresIn: "1m",
    });

    res.status(200).json({ token, message: "Login successfully" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/alldata", middleWare, async (req, res) => {
  try {
    const userData = await userDitails.find();
    res.json(userData);
  } catch (err) {
    console.log(err);
  }
});
app.get("/get-video-details", async (req, res) => {
  try {
    const videos = await videoDitails.find({});
    res.status(200).json(videos);
  } catch (error) {
    console.log(error);
  }
});



app.put("/updatevideo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = await videoDitails.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const saved = req.query.saved; // Extract the saved value from the request query

    if (saved === "true") {
      video.saved = true;
    } else if (saved === "false") {
      video.saved = false;
    } else {
      return res.status(400).json({ message: "Invalid saved value" });
    }

    await video.save();

    res.json({ message: "Video updated", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get-video-detail", async (req, res) => {
  const category = req.query.category;
  console.log(`Category: ${category}`);
  try {
    const videos = await videoDitails.find({ category: category });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/get-video-savedetail", async (req, res) => {
  const saved = req.query.saved;
  try {
    const videos = await videoDitails.find({ saved: saved });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.put("/updatelikevideo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const video = await videoDitails.findById(id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const liked = req.query.liked; // Extract the saved value from the request query

    if (liked === "true") {
      video.liked = true;
    } else if (liked === "false") {
      video.liked = false;
    } else {
      return res.status(400).json({ message: "Invalid saved value" });
    }

    await video.save();

    res.json({ message: "Video updated", video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/videos/:id/save", async (req, res) => {

  const { id } = req.params;
  console.log(id);
  const { saved } = req.body;
  console.log(saved);
  try {
    const updatedVideo = await videoDitails.findByIdAndUpdate(
      id,
      { saved },
      { new: true }
    );
    if (!updatedVideo) {
      return res.status(404).json("video not found");
    }

    res.json(updatedVideo);
  } catch (error) {
    console.log(error);
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
