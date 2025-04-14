// Game state variables
let currentImageIndex = 0;
let totalScore = 0;
const wellData = [
  { image: 'img/placeholder.jpg', location: { lat: 40.7128, lng: -74.0060 }, population: 500 },
  { image: 'img/placeholder.jpg', location: { lat: 34.0522, lng: -118.2437 }, population: 300 },
  // ...add more well data...
];

// Initialize Apple Maps
mapkit.init({
  authorizationCallback: function(done) {
    // Replace 'YOUR_MAPKIT_JS_TOKEN' with your actual MapKit JS token
    done("YOUR_MAPKIT_JS_TOKEN");
  }
});

// Create the map and set default properties
const map = new mapkit.Map("map", {
  center: new mapkit.Coordinate(0, 0),
  zoomRange: new mapkit.ZoomRange(2, 10),
  showsUserLocationControl: false,
  isRotationEnabled: false,
  isZoomEnabled: true,
  showsCompass: mapkit.FeatureVisibility.Hidden
});

let userGuessMarker = null; // Marker for the user's guess

// Allow the user to place a marker on the map
map.addEventListener("singletap", (event) => {
  const coordinate = event.coordinate;

  // Remove the previous marker if it exists
  if (userGuessMarker) {
    map.removeAnnotation(userGuessMarker);
  }

  // Add a new marker at the clicked location
  userGuessMarker = new mapkit.MarkerAnnotation(coordinate, {
    title: "Your Guess",
    color: "#2E9DF7"
  });

  map.addAnnotation(userGuessMarker);
});

// Initialize the game
function startGame() {
  currentImageIndex = 0;
  totalScore = 0;
  loadWellImage();
  document.getElementById('play-again').style.display = 'none';
  document.getElementById('feedback-text').textContent = '';
}

// Load the current well image
function loadWellImage() {
  const well = wellData[currentImageIndex];
  document.getElementById('well-image').src = well.image;
}

// Handle the guess button click
function makeGuess() {
  const guessedPopulation = parseInt(document.getElementById("population-slider").value, 10);

  // Ensure the guessed population is within the updated range
  if (guessedPopulation < 10 || guessedPopulation > 2000) {
    alert("Please select a population within the range of 10 to 2000.");
    return;
  }

  // Ensure the user has placed a marker
  if (!userGuessMarker) {
    alert("Please place a marker on the map for your guess.");
    return;
  }

  const guessedLocation = {
    lat: userGuessMarker.coordinate.latitude,
    lng: userGuessMarker.coordinate.longitude
  };

  const well = wellData[currentImageIndex];
  const distance = calculateDistance(well.location, guessedLocation);
  const populationDifference = Math.abs(well.population - guessedPopulation);
  const score = calculateScore(distance, populationDifference);

  totalScore += score;
  showFeedback(distance, populationDifference, score);

  currentImageIndex++;
  if (currentImageIndex < wellData.length) {
    loadWellImage();
  } else {
    endGame();
  }
}

// Calculate distance between two coordinates (simplified)
function calculateDistance(loc1, loc2) {
  return Math.sqrt(Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2));
}

// Calculate score based on distance and population difference
function calculateScore(distance, populationDifference) {
  return Math.max(0, 1000 - distance * 100 - populationDifference * 10);
}

// Show feedback to the player
function showFeedback(distance, populationDifference, score) {
  const feedback = `Distance: ${distance.toFixed(2)} units, Population Difference: ${populationDifference}, Score: ${score}`;
  document.getElementById('feedback-text').textContent = feedback;
}

// End the game
function endGame() {
  document.getElementById('feedback-text').textContent = `Game Over! Total Score: ${totalScore}`;
  document.getElementById('play-again').style.display = 'block';
}

// Event listeners
document.getElementById('guess-button').addEventListener('click', makeGuess);
document.getElementById('play-again').addEventListener('click', startGame);

// Update the slider value display dynamically
document.getElementById("population-slider").addEventListener("input", (event) => {
  document.getElementById("slider-value").textContent = event.target.value;
});

// Initialize the game on page load
startGame();
