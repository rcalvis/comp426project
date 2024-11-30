const cors = require("cors");
const express = require("express");
const axios = require("axios");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the movie app.");
});

app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const response = await axios.get(
      `https://imdb.iamidiotareyoutoo.com/search?q=${searchQuery}`
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching movie data: ", error.message);
    res.status(500).json({ message: "Error searching for movie" });
  }
});

app.post("/create-list", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "User must be logged in" });
  }

  req.session.user.list = [];
  res.status(200).json({ message: "User list created" });
});

app.get("/get-list", (req, res) => {
  if (!req.session.user || !Array.isArray(req.session.user.list)) {
    return res.status(404).json({ message: "No list found for this user" });
  }

  res.status(200).json(req.session.user.list);
});

app.post("/add-movie", (req, res) => {
  if (!req.session.user || !req.session.user.list) {
    return res.status(404).json({ message: "No list found for this user" });
  }

  const movie = req.body.movie;

  if (!movie) {
    return res.status(400).json({ message: "Movie not found" });
  }

  req.session.user.list.push(movie);
  res
    .status(200)
    .json({ message: "Movie added to user list", list: req.session.user.list });
});

app.delete("/delete-movie", (req, res) => {
  if (!req.session.user || !req.session.user.list) {
    return res.status(400).json({ message: "No list found for this user" });
  }

  const movieID = req.body.id;

  if (!movieID) {
    return res.status(400).json({ message: "Movie not found" });
  }

  req.session.user.list = req.session.user.list.filter(
    (movie) => movie.id != movieID
  );
  res.status(200).json({
    message: "Movie removed from user list",
    list: req.session.user.list,
  });
});

app.post("/user-login", (req, res) => {
  const { username, password } = req.body;

  if (username == "user" && password == "password") {
    req.session.user = { username, list: [] };
    return res.status(200).json({ message: "Successfully logged in" });
  }

  res.status(401).json({ message: "Error logging in" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Mock data to replace later
let movieLists = {
  user1: [
    { id: 1, title: "Inception", watched: false },
    { id: 2, title: "The Matrix", watched: true },
  ],
  user2: [{ id: 3, title: "Interstellar", watched: false }],
};
