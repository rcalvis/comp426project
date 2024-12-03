const backendUrl = "http://localhost:3000";
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';



const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");

// Select elements
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const loginForm = document.getElementById("login-form");
const movieList = document.getElementById("movie-list");
const createListButton = document.getElementById("create-list-button");
const logoutButton = document.getElementById("logout-button");
const loginError = document.getElementById("login-error");

// Login functionality
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${backendUrl}/user-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      loginSection.style.display = "none";
      mainSection.style.display = "block";
      fetchUserList();
    } else {
      loginError.textContent = data.message;
    }
  } catch (error) {
    console.error(error);
  }
});


returnMovies(`${backendUrl}/popular`); // Call backend for popular movies

function returnMovies(url) {
  fetch(url)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log("Data received:", data); 
      main.innerHTML = ""; 

      const movies = data.description; 
      if (!Array.isArray(movies) || movies.length === 0) {
        main.innerHTML = '<p class="error">No movies found. Try another search term.</p>';
        return;
      }

      const moviesToShow = movies.slice(0, 4); 
      moviesToShow.forEach((movie) => {
        console.log("Rendering movie:", movie); // Debug movie object

        const div_card = document.createElement("div");
        div_card.setAttribute("class", "card");

        // Use IMG_POSTER for the movie image
        const image = document.createElement("img");
        image.setAttribute("class", "thumbnail");
        image.src = movie["#IMG_POSTER"] || "https://via.placeholder.com/300x450?text=No+Image+Available";

        // Use #TITLE for the movie title
        const title = document.createElement("h3");
        title.textContent = movie["#TITLE"] || "No title available";

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
  e.preventDefault();
  const searchItem = search.value.trim(); 
  main.innerHTML = ''; 

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
    const response = await fetch("http://localhost:3000/get-list", {
      method: "GET",
      credentials: "same-origin", // Ensure cookies are sent with request
    });

    // Parse the JSON response
    const data = await response.json();

    console.log(data); // Log the raw response to inspect the structure

    // Check if the response contains the list as an array
    if (Array.isArray(data)) {
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
  movieList.innerHTML = ""; // Clear existing list

  // Ensure list is an array
  if (!Array.isArray(list)) {
    list = [list]; // Wrap the non-array list in an array
  }

  // Proceed with rendering if list is now an array
  list.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = `${movie.title} - ${
      movie.watched ? "Watched" : "Not Watched"
    }`;
    movieList.appendChild(li);
  });
}

// Create new list
createListButton.addEventListener("click", async () => {
  try {
    await fetch(`${backendUrl}/create-list`, { method: "POST" });
    fetchUserList();
  } catch (error) {
    console.error("Error creating list:", error);
  }
});

// Add movie to list
async function addMovie(movie) {
  try {
    await fetch(`${backendUrl}/add-movie`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie }),
    });
    fetchUserList();
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
    });
    fetchUserList();
  } catch (error) {
    console.error("Error removing movie:", error);
  }
}

// Logout functionality
logoutButton.addEventListener("click", () => {
  loginSection.style.display = "block";
  mainSection.style.display = "none";
});
