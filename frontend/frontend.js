// const backendUrl = "http://localhost:3000";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const main = document.getElementById("section");
const searchForm = document.getElementById("search-form");
const search = document.getElementById("search-bar");

// Select elements
const loginSection = document.getElementById("login-section");
const themeCheckbox = document.getElementById("theme-toggle");
const mainSection = document.getElementById("main-section");
const loginForm = document.getElementById("login-button");
const movieList = document.getElementById("movie-list");
const createListButton = document.getElementById("create-list-button");
const logoutButton = document.getElementById("logout-button");
const loginError = document.getElementById("login-error");
const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

// Apply dark or light theme
document.body.classList.add(theme);

window.onbeforeunload = function() {
  window.onbeforeunload = false;
}

window.addEventListener("beforeunload", (e) => {
  return null;
  console.log("beforeunload event triggered at:", new Date().toLocaleString());
});

// login functionality
loginForm.addEventListener("click", async (e) => {
  console.log("LOGIN FORM EVENT LISTENER");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Login form submitted");

  try {
    const response = await fetch(`./user-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    console.log(response.status);

    if (response.ok) {
      console.log("Logged in");
      const data = await response.json();
      sessionStorage.setItem("username", username);
      loginSection.style.display = "none";
      mainSection.style.display = "block";

      await renderMovieList();
      console.log("Login Done - success");
    } else {
      const data = await response.json();
      alert(data.message);
      console.log("Login Done - fail");
    }
  } catch (error) {
    console.error(error);
    console.log("Login Done - caught error");
  }
});

function returnMovies(url) {
  console.log("returnMovies()");
  fetch(url, {method: "GET", headers: { "Content-Type": "application/json" }, credentials: "include",})
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
async function renderMovieList(list = null) {
  if (!list) {
    const username = sessionStorage.getItem("username");
    console.log("List was null, no list given. Retrieving user list from /get-list.")
    const response = await fetch(`./get-list/${username}`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent with request
    });

    console.log("Got the response.");
    console.log("Response status for /get-list:", response.status);

    if (!response.ok) {
      console.warn("Error: Unable to fetch data. Status Code:", response.status);
      return;
    }

    const data = await response.json();

    console.log("Render movie got list:",data);

    // Check if the response contains the list as an array
    if (Array.isArray(data)) {
      console.log("Got list");
      list = data; 
    } else if (data && Array.isArray(data.list)) {
      // Check for nested structure
      list = data.list;
    } else {
      console.error("No valid list found in the response");
      movieList.innerHTML = "<li>No movies found.</li>";
    }
  }
  console.log("renderMovieList()");
  movieList.innerHTML = ""; 

  if (!list) {
    console.warn("Invalid list given.");
    return;
  }

  // Ensure list is an array
  if (!Array.isArray(list)) {
    console.log("Wrapping the list");
    list = [list]; 
  }

  // Proceed with rendering if list is now an array
  list.forEach((movie) => {
    console.log(movie);
    console.log("Listing another movie.");
    const li = document.createElement("li");
    li.setAttribute("data-movie-id", movie.id);
    li.style.justifyContent = "space-between";

    const titleText = document.createElement("span");
    titleText.textContent = `${movie.title}`;
    li.appendChild(titleText);

    if (movie.poster) {
      const image = document.createElement("img");
      image.src = movie.poster;
      image.setAttribute("class", "thumbnail");
      li.prepend(image);
    }
    movieList.appendChild(li);
  });
  console.log("renderMovieList() done - success");
}

window.onerror = function (message, source, lineno, colno, error) {
  console.log(`Error: ${message} at ${source}:${lineno}:${colno}`);
  // prevent the default reload behavior
  return true;
};

// Create new list
createListButton.addEventListener("click", async (e) => {
  console.log("CREATE LIST EVENT BUTTON");
});

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
        themeCheckbox.checked = true; // Check the toggle for dark mode
      } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
        themeCheckbox.checked = false; // Uncheck the toggle for light mode
      }
    } else {
      console.error("Failed to fetch saved theme. Using default.");
    }
  } catch (error) {
    console.error("Error fetching theme preference:", error);
  }

  // Listen for theme toggle changes
  themeCheckbox.addEventListener("change", async (e) => {
    const username = sessionStorage.getItem("username"); // Assuming the user is logged in
    const theme = e.target.checked ? "dark" : "light"; // Checked = dark mode
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);

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
};

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM CONTENT LOADED EVENT LISTENER")
  const username = sessionStorage.getItem("username");

  if (username) {
    try {
      const response = await fetch(
        `./get-theme/${username}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        const savedTheme = data.theme;

        document.body.classList.remove("light", "dark");
        document.body.classList.add(savedTheme);
        themeCheckbox.checked = savedTheme === "dark";
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
      main.textContent = "Movie added to list. Search for a movie using the search bar.";
      
      console.log("addMovie() done - success");
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
});