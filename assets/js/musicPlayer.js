let player;

// Load the YouTube IFrame API
function onYouTubeIframeAPIReady() {

  const currentPage = window.location.pathname;
  let autoplay = 0; // Autoplay disabled for page 1
  let defaultVideoId = "3kMbTzomh94"; // Default video for media
  // if (currentPage.includes("math")) {
  //   defaultVideoId = "bOXCLR3Wric"; // Default video for math
  //   autoplay = 0;
  // }

    player = new YT.Player("yt-player", {
      height: window.innerWidth < 768 ? "250" : "450",
      width: "100%",
      videoId: defaultVideoId,
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange, // Listen for state changes
      },
    });

    console.log("YouTube IFrame API is ready.");
    console.log("Default Video ID:", defaultVideoId);
}

function onPlayerReady(event) {
  // Autoplay the video when the player is ready
  // event.target.playVideo();
  updateVideoTitle();
  setupEventListeners(); // <- Add this here
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


function setupEventListeners() {
  const songs = document.querySelectorAll(".song");
  songs.forEach((song) => {
    song.addEventListener("click", () => {
      if (!player || typeof player.loadVideoById !== "function") {
        console.warn("Player not ready yet.");
        return;
      }

      const videoId = song.getAttribute("data-video-id");
      const startTime = song.getAttribute("data-start-time") || 0;

      player.loadVideoById({
        videoId: videoId,
        startSeconds: parseInt(startTime),
      });

      updateVideoTitle();
    });
  });

  const toggleBtn = document.getElementById("toggle-play");

  toggleBtn.addEventListener("click", () => {
    if (!player || typeof player.getPlayerState !== "function") {
      console.warn("Player not ready yet.");
      return;
    }

    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
      player.pauseVideo();
      toggleBtn.textContent = "▶ Play";
    } else {
      player.playVideo();
      toggleBtn.textContent = "⏸ Pause";
    }
  });
}
