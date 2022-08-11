const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./src/routes/users");
const authRoute = require("./src/routes/auth");
const postRoute = require("./src/routes/posts");
const multer = require("multer");
const path = require("path");
dotenv.config();

mongoose.connect(process.env.DB_URL, () => {
  console.log("Connected to MongoDB!");
});
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

/* Creating a folder called uploads in the public folder and saving the file there. */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({
  storage: storage,
});
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(201).json("File uploaded successfully!");
  } catch (error) {}
});
app.use("/uploads", express.static(path.join(__dirname, "public/uploads/")));
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

app.listen(8080, () => {
  console.log("Server running at http://localhost:8080");
});
