const express = require("express");
const session = require("express-session");
const cors = require("cors");
const axios = require("axios");
const db = require('./db');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('etag', false);

app.use(
  cors({
    origin: "http://127.0.0.1:5501",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: "None", httpOnly: true },
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the movie app.");
});

// Route to update theme preference
app.post("/update-theme", (req, res) => {
  try {
    const { username, theme } = req.body; // Expecting { username, theme } in the request body

    console.log("Username:", username);
    console.log("Theme:", theme);

    if (!username || !theme) {
      return res.status(400).json({message: "Username and/or theme missing."});
    }

    db.run(`UPDATE users SET theme = ? WHERE username = ?`, [theme, username], function(err) {
      if (err) {
        return res.status(500).json("Error updating theme");
      }

      res.status(200).json({ message: "Successfully changed theme"});
    })
  } catch(error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
});

app.post("/user-login", (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error logging in." });
    }

  if (user) {
    if (user.password == password) {
      console.log("Logged back in");
      req.session.user = { username, list: JSON.parse(user.list || '[]') };
      console.log("User list:", user.list);
      return res.status(200).json({ message: "Successfully logged in" });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } else {
    const newUser = { username, password, theme: 'light', list: '[]' };
    db.run(`INSERT INTO users (username, password, theme, list) VALUES (?, ?, ?, ?)`, [username, password, 'light', '[]'], function(err) {
      if (err) {
        return res.status(500).json("Internal servor error");
      }

      req.session.user = { username, list: [] };
      return res.status(201).json({message: "User successfully created"});
    });
  }
  })
});

app.get("/get-list", (req, res) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (!req.session.user) {
    return res.status(401).json({ message: "Session expired or user not logged in" });
  }
  console.log("User list:", req.session.user.list);

  if (!req.session.user.list) {
    return res.status(400).json({ message: "No movie list available." });
  }

  db.get(`SELECT list FROM users WHERE username = ?`, [req.session.user.username], function (err, row) {
    if (err) {
      return res.status(500).json("Error getting user list");
    }

    if (row) {
      req.session.user.list = JSON.parse(row.list);
      res.json({list: req.session.user.list});
    } else {
      return res.status(404).json("User not found");
    }
  })
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

  if (
    Array.isArray(req.session.user.list) &&
    req.session.user.list.length > 0
  ) {
    return res.status(400).json({ message: "You already have a list" });
  }

  req.session.user.list = [];
  res.status(200).json({ message: "User list created" });
});

app.get("/popular", (req, res) => {});

app.post("/add-movie", (req, res) => {
  console.log("Session before adding movie:", req.session);

  if (!req.session.user || !req.session.user.list) {
    return res.status(400).json({ message: "No list found for this user" });
  }

  const movie = req.body.movie;

  if (!movie || !movie.id) {
    return res.status(400).json({ message: "Movie not found" });
  }

  let movieOnList = req.session.user.list.some(
    (item) => String(item.id) == String(movie.id)
  );

  console.log(
    `Checking if movie with ID ${movie.id} is already in list: ${movieOnList}`
  );

  if (movieOnList) {
    return res.status(409).json({ message: "Movie already in list" });
  }

  req.session.user.list.push(movie);

  const updatedList = JSON.stringify(req.session.user.list);

  const {username} = req.session.user;

  db.run(`UPDATE users SET list = ? WHERE username = ?`, [updatedList, username], function(err) {
    if (err) {
      res.status(500).json("Error updating movie list");
    }
    res.status(200).json({ message: "Movie added to user list", list: req.session.user.list });
  })
});

app.post("/logout", (req, res) => {
  console.log("Logging out");
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Successfully logged out" });
  });
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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Route to get user's theme
app.get("/get-user-theme", (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({message: "Username required"});
  }

  db.get(`SELECT theme FROM users WHERE username = ?`, [username], function(err, row) {
    if (err) {
      return res.status(500).json("Internal server error");
    }

    if (row) {
      return res.status(200).json({theme: row.theme});
    } else {
      return res.status(404).json({message: "User not found"});
    }
  })
});
