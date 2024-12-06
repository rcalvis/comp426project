const express = require("express");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const usersFile = "./backend/users.json";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://127.0.0.1:5501",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: "None", httpOnly: true,},
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the movie app.");
});

let users = [];

if (fs.existsSync(usersFile)) {
  const usersData = fs.readFileSync(usersFile, 'utf8');
  users = JSON.parse(usersData);
};

const saveUsers = () => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
    console.log("saveUsers() success");
  } catch (err) {
    console.log("saveUsers() failed", err);
  }
};

app.post("/user-login", (req, res) => {
  const { username, password } = req.body;

  let user = users.find(u => u.username.toLowerCase() == username.toLowerCase());

  if (user) {
    if (user.password == password) {
      console.log("User logged in successfully. Session data:", req.session);
      console.log("Logged back in");
      req.session.user = { username, list: user.list };
      console.log("User list:", user.list);
      return res.status(200).json({ message : "Successfully logged in"});
    } else {
      return res.status(401).json({message: "Incorrect password"});
    }
  } else {
    const newUser = {username, password, list: []};
    users.push(newUser);
    saveUsers();
    req.session.user = {username, list: []};
    console.log("Users saved to file:", users);
    return res.status(201).json({message: "Account created"});
  }
});

app.get("/get-list", (req, res) => {
  console.log("Session on /get-list:", req.session);
  if (!req.session.user) {
    return res.status(401).json({ message: "Session expired or user not logged in"});
  }
  console.log("User list:", req.session.user.list);

  if (!req.session.user.list) {
    return res.status(400).json({message: "No movie list available."});
  }

  res.json({ list : req.session.user.list });
  console.log("Session after /get-list:", req.session);
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
  console.log("Session data on create-list:", req.session);

  if (!req.session.user) {
    return res.status(401).json({ message: "User must be logged in" });
  }

  if (Array.isArray(req.session.user.list) && req.session.user.list.length > 0) {
    return res.status(400).json({ message: "You already have a list" });
  }

  req.session.user.list = [];
  res.status(200).json({ message: "User list created" });
});

app.get("/popular", (req, res) => {

})

app.post("/add-movie", (req, res) => {
  console.log("Session before adding movie:", req.session);
  console.log("Users before saving:", users);

  if (!req.session.user || !req.session.user.list) {
    return res.status(400).json({ message: "No list found for this user" });
  }

  const movie = req.body.movie;

  if (!movie || !movie.id) {
    return res.status(400).json({ message: "Movie not found" });
  }

  let movieOnList = req.session.user.list.some(item => String(item.id) == String(movie.id));

  console.log(`Checking if movie with ID ${movie.id} is already in list: ${movieOnList}`);

  if (movieOnList) {
    return res.status(409).json({message: "Movie already in list"});
  }

  req.session.user.list.push(movie);

  const userIndex = users.findIndex(u => u.username.toLowerCase() == req.session.user.username.toLowerCase());
  users[userIndex].list.push(movie);
  saveUsers();
  res.status(200).json({ message: "Movie added to user list", list: req.session.user.list });
});

app.post("/toggle-watched", (req, res) => {
  console.log("Received a request for /toggle-watched");
  console.log("Movie id received:");
  console.log(req.body);
  if (!req.session.user || !req.session.user.list) {
    return res.status(404).json({message: "No list found for user."});
  }

  const {id, watched} = req.body;

  const movie = req.session.user.list.find(movie => movie.id == id);

  if (!movie || !movie.id) {
    return res.status(400).json(movie);
  }

  movie.watched = watched;

  res.status(200).json({id: movie.id, title: movie.title, watched: movie.watched});
});

app.post("/logout", (req, res) => {
  console.log("Logging out");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({message: "Error logging out"});
    }
    res.clearCookie("connect.sid");
    res.status(200).json({message: "Successfully logged out"});
  })
})

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});