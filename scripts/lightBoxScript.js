// ChatGPT: closes hamburger when lightbox is opened

// Select elements
const nav = document.querySelector("nav");
const lightboxLinks = document.querySelectorAll(".thumbs a"); // All the links to lightboxes
const closeLinks = document.querySelectorAll(".close"); // Close buttons inside the lightbox

// Function to hide nav and ham-menu when any lightbox target is opened
function openLightbox() {
    nav.style.display = "none";  // Hide the nav
    hamMenu.style.display = "none";  // Hide the ham-menu
}

// Function to show nav and ham-menu when lightbox is closed
function closeLightbox() {
    nav.style.display = "flex";  // Show the nav again
    hamMenu.style.display = "block";  // Show the ham-menu again
}

// Add event listeners to the lightbox open links
lightboxLinks.forEach(link => {
    link.addEventListener('click', openLightbox);  // When any target link is clicked, hide nav and ham-menu
});

// Add event listeners to the close buttons (assuming each lightbox has a close button with class "close")
closeLinks.forEach(button => {
    button.addEventListener('click', closeLightbox);  // When close button is clicked, show nav and ham-menu
});

// Optionally, handle the case where the user clicks the background or outside to close the lightbox
document.querySelectorAll('.lightbox').forEach(lightbox => {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();  // Close lightbox when clicking outside the content
        }
    });
});
