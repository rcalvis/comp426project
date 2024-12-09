console.log('Page Reloaded at:', new Date().toLocaleString());
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

document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Form submission detected at:', new Date().toLocaleString());
  });
});

window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  console.log('beforeunload event triggered at:', new Date().toLocaleString());
});

// login functionality
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

    console.log(response.status);

    if (response.ok) {
      console.log("Logged in");
      const data = await response.json();
      sessionStorage.setItem("username", username);
      loginSection.style.display = "none";
      mainSection.style.display = "block";

      fetchUserList();
      console.log("Login Done - success");
      return;
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

        div_card.addEventListener("click", async (e) => {
          console.log("DIV_CARD EVENT LISTENER");
          e.preventDefault();
          e.stopPropagation();
          console.log("Adding movie...");
          await addMovie(movie);
          console.log("Button clicked. Added movie", movie);
          fetchUserList();
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
  console.log("Search Done");
});

// Fetch user list
// Function to fetch the user's movie list from the backend
async function fetchUserList() {
  console.log("fetchUserList()");
  try {
    // Fetch the list of movies from the backend
    const response = await fetch(`${backendUrl}/get-list`, {
      method: "GET",
      credentials: "include", // Ensure cookies are sent with request
    });
    console.log("Got the response.");
    console.log("Response status for /get-list:",response.status);

    if (!response.ok) {
      console.warn("Error: Unable to fetch data. Status Code:", response.status);
      return;
    }

    // Parse the JSON response
    const data = await response.json();

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
    console.log("fetchUserList() done - success");
  } catch (error) {
    console.error("Error fetching user list:", error);
    console.log("fetchUserList() done - fail");
  }
}

// Render movie list
function renderMovieList(list) {
  console.log("renderMovieList()");
  movieList.innerHTML = ""; // Clear existing list

  if (!list) {
    console.warn("Invalid list given.");
    return;
  }

  // Ensure list is an array
  if (!Array.isArray(list)) {
    console.log("Wrapping the list");
    list = [list]; // Wrap the non-array list in an array
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

window.onerror = function(message, source, lineno, colno, error) {
  console.log(`Error: ${message} at ${source}:${lineno}:${colno}`);
  // prevent the default reload behavior
  return true;
};

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

    console.log("Response status for /create-list:", response.status);

    if (response.ok) {
      const data = await response.json();
    } else {
      console.error("Error creating list");
    }
    fetchUserList();
    const listButton = document.getElementById("create-list-button");
    listButton.style.display = "none";
    console.log("create List button success");
  } catch (error) {
    console.error("Error creating list:", error);
    console.log("Create list button fail");
  }
});

const themeToggle = document.getElementById("theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("change", toggleTheme);
}

// Function to toggle theme
async function toggleTheme(event) {
  console.log("toggleTheme()");
  event.preventDefault();

  console.log("Getting if theme light or dark");
  const theme = document.getElementById("theme-toggle").checked ? "dark" : "light";


  document.body.className = theme; // Apply the theme class to body
  console.log("Set className to theme");

  // Retrieve the logged-in username from sessionStorage
  const username = sessionStorage.getItem("username");
  console.log("Retrieved username");

  if (!username) {
    console.error("No logged-in username found.");
    return;
  }

  // TODO: BUG
  try {
    const response = await fetch(`${backendUrl}/update-theme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({username, theme}),
    });
    if (!response.ok) {
      console.log("Threw error");
      throw new Error(`${response.statusText}`);
    }
      //return response.json();
    console.log("Response status for update-theme:", response.status);
    const data = await response.json();
    console.log(data.message);
    console.log("toggleTheme done success");
  } catch(error) {
    console.error(error);
    console.log("toggleTheme done fail");
  }

  // Save the theme in local storage to persist across sessions
  // okay:
  localStorage.setItem("theme", theme);
}

// On page load, check localStorage or fetch theme from the backend
window.onload = async function () {
  // Check if theme is saved in localStorage
  let savedTheme = localStorage.getItem("theme");
  console.log("Got window onload savedTheme");

  if (!savedTheme) {
    // If no theme is saved, fetch it from the backend (after user login)
    const username = sessionStorage.getItem('username'); // Replace with your actual login logic
    console.log("Get username");

    if (!username) {
      console.error("No username found");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/get-user-theme?username=${username}`);
      if (response.ok) {
        const data = await response.json();
        savedTheme = data.theme || "light"; // Default to light theme if not set
        localStorage.setItem("theme", savedTheme); // Save to localStorage
        document.body.className = savedTheme;
        document.getElementById("theme-toggle").checked = savedTheme === "dark";
        console.log("changed theme");
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log("Changing theme bc no usernamen");
    document.body.className = savedTheme;
    document.getElementById("theme-toggle").checked = savedTheme === "dark";
  }
};

// Add movie to list
async function addMovie(movie) {
  console.log("addMovie()");
  try {
    const movieToAdd = {
      id: movie["#IMDB_ID"],
      title: movie["#TITLE"],
      poster: movie["#IMG_POSTER"],
      year: movie["#YEAR"],
      actors: movie["ACTORS"],
    };

    console.log("Adding movie:", movie);
    const response = await fetch(`${backendUrl}/add-movie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({movie: movieToAdd}),
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Error status:', response.status);
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
    } else {
      console.error("Error: ", data.message);
    } 
    console.log("addMovie() done - success");
  } catch(error) {
      console.error('Error adding movie:', error);
      console.log("addMovie() done - fail)");
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
    sessionStorage.clear();
  } catch (error) {
    console.error("Error logging out");
  }
});