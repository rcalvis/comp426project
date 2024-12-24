// const backendUrl = "http://localhost:3000";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const main = document.getElementById("section");
const searchForm = document.getElementById("search-form");
const search = document.getElementById("search-bar");

// Select elements
const loginSection = document.getElementById("login-section");
const themeButton = document.getElementById("theme-button");
const mainSection = document.getElementById("main-section");
const loginForm = document.getElementById("login-button");
const movieList = document.getElementById("movie-list");
const createListButton = document.getElementById("create-list-button");
const logoutButton = document.getElementById("logout-button");
const loginError = document.getElementById("login-error");
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
const deleteListButton = document.getElementById("delete-list-button");

// Apply dark or light theme
document.body.classList.add(theme);

// login functionality
loginForm.addEventListener("click", async (e) => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`./get-theme/${username}`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent for user identification
    });

    if (response.ok) {
      const data = await response.json();
      const savedTheme = data.theme;

      // Apply the saved theme to the UI
      if (savedTheme === "dark") {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    } else {
      console.error("Failed to fetch saved theme. Using default.");
    }
  } catch (error) {
    console.error("Error fetching theme preference:", error);
  }

  try {
    const response = await fetch(`./user-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      main.innerHTML = "";
      main.textContent = data.message;

      sessionStorage.setItem("username", username);
      loginSection.style.display = "none";
      mainSection.style.display = "block";

      await renderMovieList();
    } else {
      const data = await response.json();
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
  }
});

function returnMovies(url) {
  console.log("returnMovies()");
  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log("Data received:", data);
      main.innerHTML = "";

      const movies = data.description;
      if (!Array.isArray(movies) || movies.length === 0) {
        main.innerHTML =
          '<p class="error">No movies found. Try another search term.</p>';
        return;
      }

      const moviesToShow = movies.slice(0, 4);
      moviesToShow.forEach((movie) => {
        console.log("Rendering movie:", movie); // Debug movie object

        const div_card = document.createElement("button");
        div_card.setAttribute("class", "card");
        div_card.setAttribute("type", "button");

        // Use IMG_POSTER for the movie image
        const image = document.createElement("img");
        image.setAttribute("class", "thumbnail");
        image.src =
          movie["#IMG_POSTER"] ||
          "https://via.placeholder.com/300x450?text=No+Image+Available";

        // Use #TITLE for the movie title
        const title = document.createElement("h3");
        title.textContent = movie["#TITLE"] || "No title available";

        div_card.addEventListener("click", async (e) => {
          console.log("DIV_CARD EVENT LISTENER");
          e.preventDefault();
          e.stopPropagation();
          console.log("Adding movie...");
          await addMovie(movie);
          console.log("Button clicked. Added movie", movie);
        });

        div_card.appendChild(image);
        div_card.appendChild(title);

        main.appendChild(div_card);
        console.log("returnMovies() Done - success");
      });
    })
    .catch((error) => {
      console.error("Error fetching movies:", error);
      console.log("returnMovies() Done - fail");
    });
}

// Search functionality
searchForm.addEventListener("submit", (e) => {
  console.log("SEARCH FORM EVENT LISTENER");
  e.preventDefault();
  e.stopPropagation();
  const searchItem = search.value.trim();
  main.innerHTML = "";

  if (searchItem) {
    returnMovies(`/search?q=${encodeURIComponent(searchItem)}`);
    search.value = "";
  } else {
    main.innerHTML = '<p class="error">Please enter a search term.</p>';
  }
  console.log("Search Done");
  return;
});

// Render movie list
// async function renderMovieList(list = null) {
//   if (!list) {
//     const username = sessionStorage.getItem("username");
//     const response = await fetch(`./get-list/${username}`, {
//       method: "GET",
//       credentials: "include", // Ensure cookies are sent with request
//     });

//     if (!response.ok) {
//       console.warn(
//         "Error: Unable to fetch data. Status Code:",
//         response.status
//       );
//       return;
//     }

//     const data = await response.json();

//     // Check if the response contains the list as an array
//     if (Array.isArray(data)) {
//       list = data;
//     } else if (data && Array.isArray(data.list)) {
//       // Check for nested structure
//       list = data.list;
//     } else {
//       console.error("No valid list found in the response");
//       movieList.innerHTML = "<li>No movies found.</li>";
//     }
//   }
//   movieList.innerHTML = "";

//   if (!list) {
//     console.warn("Invalid list given.");
//     return;
//   }

//   // Ensure list is an array
//   if (!Array.isArray(list)) {
//     list = [list];
//   }

//   // Proceed with rendering if list is now an array, make each movie have a delete button that removes it from watchlist and database
//   list.forEach((movie) => {
//     const li = document.createElement("li");
//     li.setAttribute("data-movie-id", movie.id);
//     li.style.justifyContent = "space-between";

//     const titleText = document.createElement("span");
//     titleText.textContent = `${movie.title}`;
//     li.appendChild(titleText);

//     if (movie.poster) {
//       const image = document.createElement("img");
//       image.src = movie.poster;
//       image.setAttribute("class", "thumbnail");
//       li.prepend(image);
//     }

//     const deleteMovieButton = document.createElement("button");
//     deleteMovieButton.textContent = "Delete";
//     deleteMovieButton.classList.add("delete-movie-button");
//     deleteMovieButton.style.marginLeft = "10px";

//     deleteMovieButton.addEventListener("click", async (e) => {
//       e.preventDefault();
//       e.stopPropagation();

//       const movieId = movie.id;
//       const username = sessionStorage.getItem("username");

//       const response = await fetch("http://localhost:3000/delete-movie", {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username,
//           movieId,
//         }),
//       });

//       if (response.ok) {
//         console.log("Movie removed successfully.");
//         // Remove the movie from the DOM
//         li.remove();
//       } else {
//         const data = await response.json();
//         console.error("Error removing movie:", data.message);
//       }
//     });

//     li.appendChild(deleteMovieButton);

//     movieList.appendChild(li);
//   });
// }
async function renderMovieList(list = null) {
  if (!list) {
    const username = sessionStorage.getItem("username");
    const response = await fetch(`./get-list/${username}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      console.warn(
        "Error: Unable to fetch data. Status Code:",
        response.status
      );
      return;
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      list = data;
    } else if (data && Array.isArray(data.list)) {
      list = data.list;
    } else {
      console.error("No valid list found in the response");
      document.querySelector("#movie-list").innerHTML = `
        <div class="placeholder-message">No movies found.</div>`;
      return;
    }
  }

  const movieListContainer = document.querySelector("#movie-list");
  movieListContainer.innerHTML = ""; // Clear existing content

  list.forEach((movie) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Movie Poster
    if (movie.poster) {
      const poster = document.createElement("img");
      poster.src = movie.poster;
      poster.alt = `${movie.title} Poster`;
      poster.classList.add("thumbnail");
      card.appendChild(poster);
    }

    // Movie Title
    const title = document.createElement("h3");
    title.textContent = movie.title;
    card.appendChild(title);

    // Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Remove";
    deleteButton.classList.add("delete-movie-button");

    deleteButton.addEventListener("click", async () => {
      const response = await fetch("http://localhost:3000/delete-movie", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: sessionStorage.getItem("username"),
          movieId: movie.id,
        }),
      });

      if (response.ok) {
        console.log("Movie removed successfully.");
        card.remove();
      } else {
        console.error("Failed to remove movie.");
      }
    });

    card.appendChild(deleteButton);
    movieListContainer.appendChild(card);
  });
}

// Add event listener for creating a list
createListButton.addEventListener("click", async (e) => {
  try {
    const username = sessionStorage.getItem("username");
    const response = await fetch(`./get-list/${username}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        main.innerHTML = "";
        main.textContent = "You already have a watchlist.";
      } else {
        // Call POST method to create a new list
        const createResponse = await fetch(`./create-list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        });

        if (createResponse.ok) {
          main.innerHTML = "";
          main.textContent =
            "Let's create your watchlist! All you have to do is search for movies using the search bar, and then click on the movie to add it to your watchlist!";
          await renderMovieList(); // Refresh the list
        } else {
          const errorData = await createResponse.json();
          main.innerHTML = "";
          main.textContent = `${errorData.message}`;
        }
      }
    } else {
      console.error("Error fetching list status:", response.status);
      main.innerHTML = "";
      main.textContent = "Unable to check watchlist status.";
    }
  } catch (error) {
    console.error("Error creating list:", error);
    main.innerHTML = "";
    main.textContent = "An error occurred while creating the list.";
  }
});

// Add event listener for deleting a list
deleteListButton.addEventListener("click", async (e) => {
  try {
    const username = sessionStorage.getItem("username");
    const response = await fetch(`./get-list/${username}`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length === 0) {
        main.innerHTML = "";
        main.textContent = "You do not have a watchlist to delete.";
      } else {
        // Call DELETE method to remove the list
        const deleteResponse = await fetch(`./delete-list`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username }),
        });

        if (deleteResponse.ok) {
          main.innerHTML = "";
          main.textContent = "Watchlist deleted successfully!";
          await renderMovieList(); // Refresh the list
        } else {
          const errorData = await deleteResponse.json();
          main.innerHTML = "";
          main.textContent = `${errorData.message}`;
        }
      }
    } else {
      console.error("Error fetching list status:", response.status);
      main.innerHTML = "";
      main.textContent = "Unable to check watchlist status.";
    }
  } catch (error) {
    console.error("Error deleting list:", error);
    main.innerHTML = "";
    main.textContent = "An error occurred while deleting the list.";
  }
});
window.onerror = function (message, source, lineno, colno, error) {
  console.log(`Error: ${message} at ${source}:${lineno}:${colno}`);
  // prevent the default reload behavior
  return true;
};

window.onload = async function () {
  console.log("Page Reloaded at:", new Date().toLocaleString());

  const username = sessionStorage.getItem("username");

  // Retrieve saved theme preference from the backend
  try {
    const response = await fetch(`./get-theme/${username}`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent for user identification
    });

    if (response.ok) {
      const data = await response.json();
      const savedTheme = data.theme; // Assume the backend returns { theme: "light" or "dark" }

      // Apply the saved theme to the UI
      if (savedTheme === "dark") {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    } else {
      console.error("Failed to fetch saved theme. Using default.");
    }
  } catch (error) {
    console.error("Error fetching theme preference:", error);
  }
};

// Listen for theme toggle changes
themeButton.addEventListener("click", async (e) => {
  const username = sessionStorage.getItem("username"); // Assuming the user is logged in
  const response = await fetch(`./get-theme/${username}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  let savedTheme = "light"; // Default theme;
  if (response.ok) {
    const data = await response.json();
    savedTheme = data.theme;
  } else {
    console.log("No theme preference found for this user.");
  }

  let theme = savedTheme;

  if (theme === "dark") {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
    theme = "light";
  } else {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    theme = "dark";
  }

  try {
    const response = await fetch("./save-theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, theme }),
      credentials: "include",
    });

    if (response.ok) {
      console.log("Theme preference saved successfully");
      localStorage.setItem("theme", theme);
    } else {
      const data = await response.json();
      console.error("Error saving theme:", data.error);
    }
  } catch (error) {
    console.error("Error saving theme:", error);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM CONTENT LOADED EVENT LISTENER");
  const username = sessionStorage.getItem("username");

  if (username) {
    try {
      const response = await fetch(`./get-theme/${username}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const savedTheme = data.theme;

        document.body.classList.remove("light", "dark");
        document.body.classList.add(savedTheme);
      } else {
        console.log("No theme preference found for this user.");
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  }
});

// Add movie to list
async function addMovie(movie) {
  console.log("addMovie()");
  const username = sessionStorage.getItem("username");
  try {
    const movieToAdd = {
      id: movie["#IMDB_ID"],
      title: movie["#TITLE"],
      poster: movie["#IMG_POSTER"],
      year: movie["#YEAR"],
      actors: movie["ACTORS"],
    };

    console.log("Adding movie:", movie);
    const response = await fetch(`/add-movie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({ movie: movieToAdd, username }),
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Error status:", response.status);
    }
    console.log("Get movie response: ");
    console.log(response.status);
    if (response.status >= 300 && response.status < 400) {
      console.warn("Redirection detected:", response);
      return;
    }
    const data = await response.json();
    console.log("Add movie response", data);
    if (data.message == "Movie added to user list") {
      console.log("Movie added successfully");

      renderMovieList(data.list);

      main.innerHTML = "";
      main.textContent =
        "Movie added to watchlist. Search for more movies using the search bar.";
    } else {
      console.error("Error: ", data.message);
    }
  } catch (error) {
    console.error("Error adding movie:", error);
    console.log("addMovie() done - fail)");
  }
}

// Remove movie from list
async function removeMovie(movieId) {
  try {
    await fetch(`./delete-movie`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: movieId }),
      credentials: "include",
    });
    const username = sessionStorage.getItem("username");
    renderMovieList();
  } catch (error) {
    console.error("Error removing movie:", error);
  }
}

// Logout functionality
logoutButton.addEventListener("click", async (e) => {
  console.log("LOGOUT BUTTON EVENT LISTENER");
  e.preventDefault();
  e.stopPropagation();
  try {
    console.log("Logout button clicked");
    await fetch(`./logout`, {
      method: "POST",
      credentials: "include",
    });
    const usernameBox = document.querySelector("#username");
    const passwordBox = document.querySelector("#password");
    if (usernameBox && passwordBox) {
      usernameBox.value = "";
      passwordBox.value = "";
    }
    loginSection.style.display = "block";
    mainSection.style.display = "none";
    sessionStorage.clear();
  } catch (error) {
    console.error("Error logging out");
  }
  main.innerHTML = "";
  sessionStorage.clear();
  console.log(sessionStorage.getItem("username"));

  try {
    const response = await fetch(`./get-theme/${username}`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent for user identification
    });

    if (response.ok) {
      const data = await response.json();
      const savedTheme = data.theme; // Assume the backend returns { theme: "light" or "dark" }

      // Apply the saved theme to the UI
      if (savedTheme === "dark") {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
      }
    } else {
      console.error("Failed to fetch saved theme. Using default.");
    }
  } catch (error) {
    console.error("Error fetching theme preference:", error);
  }
});
