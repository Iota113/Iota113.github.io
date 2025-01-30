// Get all filter buttons and images
const filterButtons = document.querySelectorAll(".filter-btn");
const images = document.querySelectorAll(".image");

// Add click event listeners to filter buttons
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    // Add active class to the clicked button
    button.classList.add("active");

    // Get the filter category from the button's data-filter attribute
    const filter = button.dataset.filter;

    // Loop through all images and show/hide based on the filter
    images.forEach((image) => {
      const category = image.dataset.category;
      if (filter === "all" || category === filter) {
        image.style.display = "block"; // Show the image
      } else {
        image.style.display = "none"; // Hide the image
      }
    });
  });
});
