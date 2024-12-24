# Movie App README
## Overview
This Movie App allows users to log in, save their theme preference (light or dark), create and manage a list of movies to watch, and search for movies using an external movie database API. It is structured using a backend server built with Node.js and Express, utilizing SQLite for session persistent storage. The frontend is a simple HTML, CSS, and JavaScript application that interacts with the backend to provide functionality.

## Requirements and Features
## 1. User Authentication and Management
### Login/Signup:

When a user attempts to login, the app sends a POST request to /user-login, which checks the credentials (username and password) against the data stored in the SQLite database.
If the username does not exist, the app creates a new username with the provided credentials with light mode as the default theme. This user can change their theme preference once they login, and this preference will persist across sessions.
If the user exists in the database, the app checks whether the password matches. If it does, the user is assigned a session, their watchlist and theme preference are retrieved from the database, and the DOM will display ths information accordingly. If the password does not match the username, the user will be prompted to enter another password until it matches. 
### Session Management:

The app uses express-session to maintain user sessions. Each user has a session that includes their username, movie list, and theme preference.
The session persists across requests and is used to track whether the user is logged in. When a user adds a movie to their watchlist, deletes a movie from their watchlist, deletes their list entirely, or changes the theme, this will persist even after the user logs out and then logs back in.
## 2. Theme Management
### Retrieving Theme Preferences:

The app allows the retrieval of a user's saved theme preference by sending a GET request to /get-theme/:username when the user logs in.
### Updating Theme Preferences:

Users can change their theme preference (light or dark) by pressing a button, which sends a POST request to /save-theme. This button is only available when a user is logged in.
## 3. Movie List Management
### Creating a Watchlist:

Users can create a watchlist by clicking the add button. When this button is clicked, a GET request is sent to /get-list/username. If a watchlist already exists for the user, they won't be able to create a watchlist. If a watchlist does not already exist, a POST request is sent to /create-list and a watchlist is created. They can then add movies to their watchlist by searching and clicking on movies.
### Deleting a Watchlist:

Users can delete their watchlist by clicking the delete button. When this button is clicked, a GET request is sent to /get-list/username. If a watchlist does not already exist for the user, they won't be able to delete one. If a watchlist does already exist, a DELETE request is sent to /delete-list and their watchlist is deleted. 
### Adding Movies to the Watchlist:

Movies can be added to the list by sending a POST request to the /add-movie endpoint. The movie data is validated before adding it to the list, and the movie is saved in the session and database.
Duplicate movies are prevented from being added to the list, ensuring that no movie appears multiple times.
### Deleting Movies from the Watchlist:

Users can remove movies from their list by clicking the "Remove" button, which sends a DELETE request to /delete-movie. The movie is removed from both the session and the database.
### Fetching the User’s Movie List:

The movie list is fetched from the database using the /get-list endpoint, which returns the list in the session for the logged-in user.
## 4. Movie Search Functionality
### Search for Movies:
Users can search for movies by using the search bar. This sends a GET request to the /search endpoint, which sends a search query to an external movie API (based on IMDb) to fetch relevant results. The search results are returned to the frontend, allowing users to add movies to their list by clicking on the movie they want to add.
## 5. User Logout
### Logging Out:
The logout functionality is implemented by sending a POST request to the /logout endpoint. This destroys the session, clears the session cookie, and redirects the user to the login page.
## Technologies Used
### Backend:

Node.js, Express, SQLite, express-session for session management, CORS for handling cross-origin requests, Axios for making requests to the external movie API
### Frontend:

HTML, CSS, Javascript, Fetch API for interacting with the backend

Presentation Video Link: [*INSERT PRESENTATION VIDEO LINK HERE*] 
