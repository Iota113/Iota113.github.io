let player;

  // Load the YouTube IFrame API
  function onYouTubeIframeAPIReady() {
    player = new YT.Player("yt-player", {
      height: "450",
      width: "100%",
      videoId: "dQw4w9WgXcQ", // Default video
      events: {
        onReady: onPlayerReady,
      },
    });
  }

function onPlayerReady(event) {
  const songs = document.querySelectorAll(".song");
  songs.forEach((song) => {
    song.addEventListener("click", () => {
      const videoId = song.getAttribute("data-video-id");
      player.loadVideoById(videoId);
    });
  });
}