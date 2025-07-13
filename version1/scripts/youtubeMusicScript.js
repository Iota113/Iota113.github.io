let player;

// Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {

  const currentPage = window.location.pathname;
  let autoplay = 1; // Autoplay enabled for page 1

  // Determine the default video ID based on the current page
  let defaultVideoId = "r2iKZ1NWTU"; // Default video for page 1
  if (currentPage.includes("math")) {
    defaultVideoId = "bOXCLR3Wric"; // Default video for page 2
    autoplay = 0;
  }

    player = new YT.Player("yt-player", {
      height: window.innerWidth < 768 ? "250" : "450",
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
  const toggleBtn = document.getElementById("toggle-play");

  if (event.data === YT.PlayerState.PLAYING) {
    toggleBtn.textContent = "⏸ Pause";
    setTimeout(updateVideoTitle, 500); // Give YouTube time to populate metadata
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    toggleBtn.textContent = "▶ Play";
  }

  updateVideoTitle();
}

function updateVideoTitle() {
  if (!player || typeof player.getVideoData !== "function") {
    console.warn("Player or getVideoData not ready.");
    return;
  }

  const videoData = player.getVideoData();
  if (!videoData || !videoData.video_id) {
    console.warn("Invalid or missing video data:", videoData);
    return;
  }

  const currentVideoId = videoData.video_id;
  const songElement = document.querySelector(`[data-video-id="${currentVideoId}"]`);
  const customTitle = songElement ? songElement.getAttribute("data-custom-title") : "Unknown Song";

  const titleElement = document.getElementById("current-video-title");
  const containerElement = document.getElementById("current-video-title-container");

  if (containerElement && titleElement) {
    containerElement.style.animation = 'none';
    containerElement.offsetHeight;
    containerElement.style.animation = 'fadeInTitle 1s forwards';
    titleElement.textContent = `Now Playing: ${customTitle}`;
  }

  document.querySelectorAll(".song").forEach((song) => {
    song.classList.remove("playing");
  });

  if (songElement) {
    songElement.classList.add("playing");
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

// Play / Pause Buttons

const toggleBtn = document.getElementById("toggle-play");

toggleBtn.addEventListener("click", () => {
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    player.pauseVideo();
    toggleBtn.textContent = "▶ Play";
  } else {
    player.playVideo();
    toggleBtn.textContent = "⏸ Pause";
  }
});
