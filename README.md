#Movie App README
##Overview
This Movie App allows users to log in, save their theme preference (light or dark), create and manage a list of movies to watch, and search for movies using an external movie database API. It is structured using a backend server built with Node.js and Express, utilizing SQLite for session persistent storage. The frontend is a simple HTML, CSS, and JavaScript application that interacts with the backend to provide functionality.

##Requirements and Features
##1. User Authentication and Management
###Login/Signup:

When a user logs in, the app checks the credentials (username and password) against the data stored in the SQLite database.
If the user does not exist, the app creates a new user with the provided credentials and a default theme (light) and an empty movie list ([]).
On successful login, the user is assigned a session, and their movie list is retrieved from the database.
###Session Management:

The app uses express-session to maintain user sessions. Each user has a session that includes their username and a movie list.
The session persists across requests and is used to track whether the user is logged in.
##2. Theme Management
###Saving Theme Preferences:

Users can save their theme preference (light or dark) by sending a POST request to /save-theme.
The theme preference is validated before being saved in the database. If the theme is invalid, the user receives an error message.
###Retrieving Theme Preferences:

The app allows the retrieval of a user's saved theme preference by sending a GET request to /get-theme/:username.
###Updating Theme Preferences:

Users can update their theme preference by sending a POST request to /update-theme, where the new theme is updated in the database.
##3. Movie List Management
###Creating a Movie List:

Users can create a new movie list by sending a POST request to /create-list. If a list already exists for the user, an error message is shown.
Adding Movies to the List:

Movies can be added to the list using the /add-movie endpoint. The movie data is validated before adding it to the list, and the movie is saved in the session and database.
Duplicate movies are prevented from being added to the list, ensuring that no movie appears multiple times.
Fetching the User’s Movie List:

The movie list is fetched from the database using the /get-list endpoint, which returns the list in the session for the logged-in user.
##4. Movie Search Functionality
###Search for Movies:
Users can search for movies using the /search endpoint, which sends a search query to an external movie API (based on IMDb) to fetch relevant results.
The search results are returned to the frontend, allowing users to add movies to their list.
##5. User Logout
###Logging Out:
The logout functionality is implemented using the /logout endpoint, which destroys the session, clears the session cookie, and redirects the user to the login page.
##Technologies Used
###Backend:

Node.js
Express
SQLite
express-session for session management
CORS for handling cross-origin requests
Axios for making requests to the external movie API
###Frontend:

HTML, CSS, and JavaScript
Fetch API for interacting with the backend

Presentation Video Link: [*INSERT PRESENTATION VIDEO LINK HERE*] 
