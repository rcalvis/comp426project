const express = require("express");
const session = require("express-session");
const axios = require("axios");
// const cors = require("cors");
const db = require("./db");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "../frontend")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("etag", false);

// app.use(
//   cors({
//     origin: "http://127.0.0.1:5501",
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

app.use(
  session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: "None", httpOnly: true },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

app.post("/save-theme", (req, res) => {
  const { username, theme } = req.body;

  if (!username || !theme) {
    return res.status(400).json({ error: "Username and theme are required" });
  }

  if (!["light", "dark"].includes(theme)) {
    return res.status(400).json({ error: "Invalid theme value" });
  }

  db[username] = theme;
  console.log(`Saved theme preference for user ${username}: ${theme}`);

  return res
    .status(200)
    .json({ message: "Theme preference saved successfully" });
});

// Get user's saved theme preference
app.get("/get-theme/:username", (req, res) => {
  const { username } = req.params;
  const theme = db[username];

  if (!username || !theme) {
    console.log("Returning default theme bc user not found");
    return res.status(200).json({ theme: "light" });
  }

  console.log(`Retrieved theme preference for user ${username}: ${theme}`);

  return res.status(200).json({ theme });
});

app.post("/update-theme", (req, res) => {
  try {
    const { username, theme } = req.body; // Expecting { username, theme } in the request body
    console.log("Username:", username);
    console.log("Theme:", theme);

    if (!username || !theme) {
      return res
        .status(400)
        .json({ message: "Username and/or theme missing." });
    }

    db.run(
      `UPDATE users SET theme = ? WHERE username = ?`,
      [theme, username],
      function (err) {
        if (err) {
          return res.status(500).json("Error updating theme");
        }

        res.status(200).json({ message: "Successfully changed theme" });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal server error");
  }
});

app.get("/get-user-theme", (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username required" });
  }

  db.get(
    `SELECT theme FROM users WHERE username = ?`,
    [username],
    function (err, row) {
      if (err) {
        return res.status(500).json("Internal server error");
      }

      if (row) {
        return res.status(200).json({ theme: row.theme });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    }
  );
});

// app.post("/user-login", (req, res) => {
//   console.log("/user-login started");
//   const { username, password } = req.body;

//   db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
//     if (err) {
//       return res.status(500).json({ message: "Error logging in." });
//     }

//     if (user) {
//       if (user.password == password) {
//         console.log("Logged back in");
//         console.log("User list:", user.list);
//         return res.status(200).json({ message: "Successfully logged in" });
//       } else {
//         console.log(
//           "Unsuccessful login. Password incorrect. Finished /user-login unsuccessfully"
//         );
//         return res.status(401).json({ message: "Incorrect password" });
//       }
//     } else {
//       db.run(
//         `INSERT INTO users (username, password, theme, list) VALUES(?,?,?,?)`,
//         [username, password, "light", "[]"],
//         (err) => {
//           if (err) {
//             console.log(
//               "New user not added. /user-login completed unsuccessfully"
//             );
//             return res.status(500).json("Internal server error");
//           }
//           console.log("New user added. /user-login complete successfully");
//           return res.status(201).json({ message: "User successfully created" });
//         }
//       );
//     }
//   });
// });

app.post("/user-login", (req, res) => {
  const { username, password } = req.body;

  // Check if the username exists in the database
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return res.status(500).json({ message: "Error logging in." });
    }

    // If the user exists, check if the password matches
    if (user) {
      if (user.password === password) {
        console.log("Logged back in");
        console.log("User list:", user.list);
        return res.status(200).json({ message: `Welcome back, ${username}!` });
      } else {
        console.log("Unsuccessful login. Password incorrect.");
        return res.status(401).json({ message: "Incorrect password" });
      }
    } else {
      // If the user does not exist, prompt for account creation
      console.log(`No account found for username ${username}.`);

      // Prompt to create a new account with the given password
      db.run(
        `INSERT INTO users (username, password, theme, list) VALUES(?,?,?,?)`,
        [username, password, "light", "[]"],
        (err) => {
          if (err) {
            console.log("Error creating new user.");
            return res.status(500).json({ message: "Internal server error" });
          }

          console.log("New user created successfully.");
          return res.status(201).json({
            message: `No account found with the username "${username}". A new account has been created for you.`,
          });
        }
      );
    }
  });
});

app.get("/get-list/:username", (req, res) => {
  const { username } = req.params;
  console.log("Starting get-list");

  db.get(
    `SELECT list FROM users WHERE username = ?`,
    [username],
    (err, row) => {
      if (err) return console.error(err.message);
      if (row) {
        console.log(row);
        console.log(row.list);
<<<<<<< HEAD
        const userList = row.list || "[]";
=======
        // const userList = JSON.parse(row.list || "[]");
        const userList = { row };
>>>>>>> fb6c8e1ee4c5a1e12a79b1619b8dc5301e5415ae
        res.json({ list: userList });
      } else {
        return res.status(404).json("User not found");
      }
    }
  );
});

// app.get("/get-list/:username", (req, res) => {
//   const { username } = req.params;
//   console.log("Starting get-list");

//   db.get(
//     `SELECT list FROM users WHERE username = ?`,
//     [username],
//     (err, row) => {
//       if (err) return console.error(err.message);
//       if (row) {
//         console.log(row);
//         res.json({ list: JSON.parse(row.list) });
//       } else {
//         return res.status(404).json("User not found");
//       }
//     }
//   );
// });

app.get("/search", async (req, res) => {
  console.log("Starting search");
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const response = await axios.get(
      `https://imdb.iamidiotareyoutoo.com/search?q=${searchQuery}`
    );
    console.log("Finished search - success");
    return res.json(response.data);
  } catch (error) {
    console.log("Error fetching movie data: ", error.message);
    res.status(500).json({ message: "Error searching for movie" });
  }
});

app.post("/add-movie", (req, res) => {
  console.log("Starting add-movie");
  console.log("Session before adding movie:", req.session);

  const { movie, username } = req.body;

  console.log(movie);
  console.log(username);

  let userList = [];

  db.get(
    `SELECT list FROM users WHERE username = ?`,
    [username],
    function (err, row) {
      if (err) {
        return res.status(500).json({ message: "Error retrieving user list" });
      }

      if (row && row.list) {
        userList = JSON.parse(row.list);
      }

      let movieOnList = userList.some(
        (item) => String(item.id) == String(movie.id)
      );

      if (movieOnList) {
        return res.status(400).json({ message: "Movie already in list" });
      }

      userList.push(movie);

      db.run(
        `UPDATE users SET list = ? WHERE username = ?`,
        [JSON.stringify(userList), username],
        function (err) {
          if (err) {
            res.status(500).json("Error updating movie list");
          }
          console.log("add-movie done - success");
          return res
            .status(200)
            .json({ message: "Movie added to user list", list: userList });
        }
      );
    }
  );
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

app.post("/create-list", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  db.get(
    "SELECT list FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error checking user list." });
      }

      if (!row) {
        return res.status(404).json({ message: "User not found." });
      }

<<<<<<< HEAD
      const userList = row.list || "[]";
=======
      const userList = row;
>>>>>>> fb6c8e1ee4c5a1e12a79b1619b8dc5301e5415ae

      if (userList.length > 0) {
        return res.status(400).json({
          message:
            "User already has a watchlist. Feel free to add more movies to your watchlist using the search bar!",
        });
      }

      // Create an empty list
      db.run(
        "UPDATE users SET list = ? WHERE username = ?",
        [JSON.stringify([]), username],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error creating list for the user." });
          }
          return res
            .status(201)
            .json({ message: "List created successfully." });
        }
      );
    }
  );
});

app.delete("/delete-list", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  db.get(
    "SELECT list FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error checking user list." });
      }

      if (!row) {
        return res.status(404).json({ message: "User not found." });
      }

      const userList = row.list || "[]";

      if (userList.length === 0) {
        return res
          .status(400)
          .json({ message: "No list to delete for this user." });
      }

      // Delete the list
      db.run(
        "UPDATE users SET list = ? WHERE username = ?",
        [JSON.stringify([]), username],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error deleting list for the user." });
          }
          return res
            .status(200)
            .json({ message: "List deleted successfully." });
        }
      );
    }
  );
});

app.delete("/delete-movie", (req, res) => {
  const { username, movieId } = req.body;

  if (!username || !movieId) {
    return res
      .status(400)
      .json({ message: "Username and movie ID are required." });
  }

  db.get(
    "SELECT list FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ message: "Error retrieving user list." });
      }

      if (!row) {
        return res.status(404).json({ message: "User not found." });
      }

      const userList = row;
      const updatedList = userList.filter(
        (movie) => String(movie.id) !== String(movieId)
      );

      if (userList.length === updatedList.length) {
        return res
          .status(404)
          .json({ message: "Movie not found in the list." });
      }

      db.run(
        "UPDATE users SET list = ? WHERE username = ?",
        [JSON.stringify(updatedList), username],
        (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Error updating movie list." });
          }

          return res.status(200).json({
            message: "Movie removed successfully.",
            list: updatedList,
          });
        }
      );
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
