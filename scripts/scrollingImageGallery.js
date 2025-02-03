function showLargeImage(imgElement) {
    // Get the source of the clicked image
    var imgSrc = imgElement.src;

    // Set the source of the large image container
    var largeImageContainer = document.getElementById("largeImage");
    largeImageContainer.src = imgSrc;
}
