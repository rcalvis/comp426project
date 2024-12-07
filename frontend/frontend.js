const backendUrl = "http://localhost:3000";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const main = document.getElementById("section");
const form = document.getElementById("search-form");
const search = document.getElementById("search-bar");

// Select elements
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const loginForm = document.getElementById("login-form");
const movieList = document.getElementById("movie-list");
const createListButton = document.getElementById("create-list-button");
const logoutButton = document.getElementById("logout-button");
const loginError = document.getElementById("login-error");
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

// Apply dark or light theme
document.body.classList.add(theme);

// Login functionality
loginForm.addEventListener("submit", async (e) => {
  console.log("LOGIN FORM EVENT LISTENER");
  e.preventDefault();
  e.stopPropagation();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Login form submitted");

  try {
    const response = await fetch(`${backendUrl}/user-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (response.ok) {
      console.log("Logged in");
      const data = await response.json();
      sessionStorage.setItem("username", username);
      loginSection.style.display = "none";
      mainSection.style.display = "block";

      await fetchUserList();
    } else {
      const data = await response.json();
      alert(data.message);
    }
  } catch (error) {
    console.error(error);
  }
});

// returnMovies(`${backendUrl}/popular`); //Call backend for popular movies

function returnMovies(url) {
  console.log("Hello return movies");
  fetch(url)
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

        const div_card = document.createElement("div");
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

        div_card.addEventListener("click", (e) => {
          console.log("DIV_CARD EVENT LISTENER");
          e.preventDefault();
          e.stopPropagation();
          addMovie(movie);
          console.log("Button clicked. Added movie", movie);
        });

        div_card.appendChild(image);
        div_card.appendChild(title);
        main.appendChild(div_card);
      });
    })
    .catch((error) => {
      console.error("Error fetching movies:", error);
    });
}

// Search functionality
form.addEventListener("submit", (e) => {
  console.log("SEARCH FORM EVENT LISTENER");
  e.preventDefault();
  e.stopPropagation();
  const searchItem = search.value.trim();
  main.innerHTML = "";

  if (searchItem) {
    returnMovies(`${backendUrl}/search?q=${encodeURIComponent(searchItem)}`);
    search.value = "";
  } else {
    main.innerHTML = '<p class="error">Please enter a search term.</p>';
  }
});

// Fetch user list
// Function to fetch the user's movie list from the backend
async function fetchUserList() {
  try {
    // Fetch the list of movies from the backend
    const response = await fetch(`${backendUrl}/get-list`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent with request
    });
    console.log("Got the response.");

    if (response.status !== 200) {
      console.warn(
        "Error: Unable to fetch data. Status Code:",
        response.status
      );
      return;
    }

    // Parse the JSON response

    if (!response.ok) {
      console.warn(
        "Error: Unable to fetch data. Status Code:",
        response.status
      );
      return;
    }

    const data = await response.json();

    // Log the raw response to inspect the structure
    console.log("Fetched data:", data);

    // Check if the response contains the list as an array
    if (Array.isArray(data)) {
      console.log("Rendering movie list");
      renderMovieList(data); // Render the list if it's an array
    } else if (data && Array.isArray(data.list)) {
      // Check for nested structure
      renderMovieList(data.list); // Render the nested list
    } else {
      console.error("No valid list found in the response");
      movieList.innerHTML = "<li>No movies found.</li>"; // Show fallback message
    }
  } catch (error) {
    console.error("Error fetching user list:", error);
  }
}

// Render movie list
function renderMovieList(list) {
  console.log("Now beginning to render list");
  movieList.innerHTML = ""; // Clear existing list

  // Ensure list is an array
  if (!Array.isArray(list)) {
    console.log("Wrapping the list");
    list = [list]; // Wrap the non-array list in an array
  }

  // Proceed with rendering if list is now an array
  list.forEach((movie) => {
    console.log("Listing another movie.");
    const li = document.createElement("li");
    li.setAttribute("data-movie-id", movie.id);
    li.style.justifyContent = "space-between";

    const status = document.createElement("span");
    status.classList.add("status");
    status.textContent = movie.watched ? "Watched" : "Not Watched";

    const titleText = document.createElement("span");
    titleText.textContent = `${movie.title} - `;
    li.appendChild(titleText);
    li.appendChild(status);

    const toggleButton = document.createElement("button");
    toggleButton.textContent = movie.watched
      ? "Mark as not watched"
      : "Mark as watched";
    toggleButton.addEventListener("click", async (e) => {
      console.log("TOGGLE BUTTON EVENT LISTENER");
      try {
        e.preventDefault();
        e.stopPropagation();
        const newWatchedStatus = !movie.watched;
        movie.watched = newWatchedStatus;

        console.log("Sending request to backend");

        console.log({ id: movie.id, watched: newWatchedStatus });

        const response = await fetch(`${backendUrl}/toggle-watched`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: movie.id, watched: newWatchedStatus }),
          credentials: "include", // Ensure cookies are sent with request
        });
        if (response.ok) {
          const updatedMovie = await response.json();
          const movieElement = document.querySelector(
            `[data-movie-id="${movie.id}"]`
          );
          const statusText = movieElement.querySelector("span.status");
          console.log(statusText);
          const button = movieElement.querySelector("button");
          console.log(button);

          statusText.textContent = updatedMovie.watched
            ? "Watched"
            : "Not Watched";
          button.textContent = updatedMovie.watched
            ? "Mark as not watched"
            : "Mark as watched";
        } else {
          console.error("Failed to update movie status");
        }
      } catch (error) {
        console.error("Error switching watch status:", error);
      }
    });

    li.append(toggleButton);

    if (movie.poster) {
      const image = document.createElement("img");
      image.src = movie.poster;
      image.setAttribute("class", "thumbnail");
      li.prepend(image);
    }
    movieList.appendChild(li);
  });
  console.log("Finished rendering movie list");
}

// Create new list
createListButton.addEventListener("click", async (e) => {
  console.log("CREATE LIST EVENT BUTTON");
  try {
    e.preventDefault();
    e.stopPropagation();
    const response = await fetch(`${backendUrl}/create-list`, {
      method: "POST",
      credentials: "include",
    });
    const data = await response.json();

    if (response.ok) {
      showNotification("List created. Search for movies to add to your list.");
    } else {
      console.error("Error creating list");
    }
    fetchUserList();
    const listButton = document.getElementById("create-list-button");
    listButton.style.display = "none";
  } catch (error) {
    console.error("Error creating list:", error);
  }
});

// Function to toggle theme
function toggleTheme() {
  const theme = document.getElementById("theme-toggle").checked
    ? "dark"
    : "light";
  document.body.className = theme; // Apply the theme class to body

  // Retrieve the logged-in username from sessionStorage
  const username = sessionStorage.getItem("username");

  if (!username) {
    console.error("No logged-in username found.");
    return;
  }

  // Send the updated theme to the backend
  fetch("/update-theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      theme: theme,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data.message); // Successfully updated theme
    })
    .catch((error) => {
      console.error("Error updating theme:", error);
    });

  // Save the theme in local storage to persist across sessions
  localStorage.setItem("theme", theme);
}

// On page load, check localStorage or fetch theme from the backend
window.onload = function () {
  // Check if theme is saved in localStorage
  let savedTheme = localStorage.getItem("theme");

  if (!savedTheme) {
    // If no theme is saved, fetch it from the backend (after user login)
    const username = getLoggedInUsername(); // Replace with your actual login logic

    fetch(`/get-user-theme?username=${username}`)
      .then((response) => response.json())
      .then((data) => {
        savedTheme = data.theme || "light"; // Default to light theme if not set
        localStorage.setItem("theme", savedTheme); // Save to localStorage
        document.body.className = savedTheme;
        document.getElementById("theme-toggle").checked = savedTheme === "dark";
      });
  } else {
    document.body.className = savedTheme;
    document.getElementById("theme-toggle").checked = savedTheme === "dark";
  }
};

// Add movie to list
async function addMovie(movie) {
  const movieToAdd = {
    id: movie["#IMDB_ID"],
    title: movie["#TITLE"],
    poster: movie["IMG_#POSTER"],
    year: movie["#YEAR"],
    actors: movie["ACTORS"],
  };
  console.log("Adding movie:", movie);
  try {
    const response = await fetch(`${backendUrl}/add-movie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie: movieToAdd }),
      credentials: "include",
    });
    const data = response.json();
    if (response.ok) {
      console.log("Fetching user list now");
      hideNotification();
      //fetchUserList();
    } else if (response.status == 409) {
      showNotification("This movie is already in your list.");
    } else {
      console.error("Error adding movie.");
    }
  } catch (error) {
    console.error("Error adding movie:", error);
  }
}

// Remove movie from list
async function removeMovie(movieId) {
  try {
    await fetch(`${backendUrl}/delete-movie`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: movieId }),
      credentials: "include",
    });
    fetchUserList();
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
    await fetch(`${backendUrl}/logout`, {
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
  } catch (error) {
    console.error("Error logging out");
  }
});

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
}

function hideNotification() {
  const notification = document.getElementById("notification");
  notification.textContent = "";
  notification.classList.add("hidden");
}
