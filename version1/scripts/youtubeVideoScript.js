let player;

// Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {
  const currentPage = window.location.pathname;
  let autoplay = 0; // Autoplay enabled for page 1

  // Determine the default video ID based on the current page
  let defaultVideoId = "bOXCLR3Wric"; // Default video for page 1

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
  updateVideoTitle(); // Update video title when the player is ready
}

function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING || event.data == YT.PlayerState.ENDED) {
    updateVideoTitle(); // Update title when the video plays or ends
  }
}

// Function to update the video title (You can replace this with your title logic)
function updateVideoTitle() {
  console.log("Video is playing or ended.");
}

// Switch video when a thumbnail is clicked
const videoItems = document.querySelectorAll('.video-item');
videoItems.forEach(item => {
  item.addEventListener('click', function() {
    const videoId = item.getAttribute('data-video-id');
    player.loadVideoById(videoId); // Load the new video by ID
  });
});
