let player;

// Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {

  const currentPage = window.location.pathname;
  let autoplay = 1; // Autoplay enabled for page 1

  // Determine the default video ID based on the current page
  let defaultVideoId = "nC3Dd3eqZy8"; // Default video for page 1
  if (currentPage.includes("math")) {
    defaultVideoId = "bOXCLR3Wric"; // Default video for page 2
    autoplay = 0;
  }

    player = new YT.Player("yt-player", {
      height: "450",
      width: "100%",
      videoId: defaultVideoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange, // Listen for state changes
      },
    });
}

function onPlayerReady(event) {
  // Autoplay the video when the player is ready
  event.target.playVideo();
  updateVideoTitle();
}

function onPlayerStateChange(event) {
  // If video ends or starts playing, update the title
  if (event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.ENDED) {
    updateVideoTitle();
  }
}

function updateVideoTitle() {
  const videoData = player.getVideoData();
  const currentVideoId = videoData.video_id; // Get the video ID of the currently playing video

  // Find the song element that corresponds to the current video
  const songElement = document.querySelector(`[data-video-id="${currentVideoId}"]`);
  const customTitle = songElement ? songElement.getAttribute("data-custom-title") : "Unknown Song"; // Fallback if no custom title is found

  // Display the custom title in the HTML element
  const titleElement = document.getElementById("current-video-title");
  const containerElement = document.getElementById("current-video-title-container");

  // Add animation class (fading effect)
  containerElement.style.animation = 'none';  // Reset animation
  containerElement.offsetHeight; // Trigger reflow to reset animation
  containerElement.style.animation = 'fadeInTitle 1s forwards';  // Apply animation again

  titleElement.textContent = `Now Playing: ${customTitle}`;

  // Highlight the currently playing song
  document.querySelectorAll(".song").forEach((song) => {
    song.classList.remove("playing"); // Remove the 'playing' class from all songs
  });

  if (songElement) {
    songElement.classList.add("playing"); // Add 'playing' class to the currently playing song
  }
}

const songs = document.querySelectorAll(".song");
songs.forEach((song) => {
  song.addEventListener("click", () => {
    const videoId = song.getAttribute("data-video-id");
    const startTime = song.getAttribute("data-start-time") || 0;  // Default to 0 if no start time is provided

    // Load the video by ID and start at the specified time
    player.loadVideoById({
      videoId: videoId,
      startSeconds: parseInt(startTime),  // Pass the start time to the player
    });

    // Update the title with the custom title whenever a new video is played
    updateVideoTitle();
  });
});
