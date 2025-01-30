/* https://github.com/treehouse/ham-menu */

// <-- Hamburger Menu -- >
const hamMenu = document.querySelector(".ham-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".dropdown-toggle").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation(); // Prevents bubbling up

            const dropdown = this.parentElement;

            // Close other dropdowns before opening the clicked one
            document.querySelectorAll(".dropdown").forEach(d => {
                if (d !== dropdown) d.classList.remove("active");
            });

            // Toggle the active class to show/hide the dropdown
            dropdown.classList.toggle("active");
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function () {
        document.querySelectorAll(".dropdown").forEach(dropdown => {
            dropdown.classList.remove("active");
        });
    });
});

// Create an intersection observer instance
const items = document.querySelectorAll('.scroll-item');
let lastScrollTime = Date.now(); // Track the last scroll event time
let scrolling = false; // Track if the user is scrolling actively
let isIdle = true; // Track if the user is idle

// Function to check if items are in view
function checkVisibility() {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastScrollTime;

    items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();

        // Check if any part of the item is within the viewport
        const isPartiallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        // If the item is partially visible and not yet animated
        if (isPartiallyVisible && !item.classList.contains('visible')) {
            item.classList.add('visible'); // Make the item visible

            // Apply staggered delay when actively scrolling
            if (scrolling) {
                setTimeout(() => {
                    item.classList.add('animate');
                }, index * 300); // Add delay for staggered animation
            } else {
                // No delay if idle, apply animation immediately
                item.classList.add('animate');
            }
        }
    });

    lastScrollTime = currentTime;
}

// Listen for scroll events
window.addEventListener('scroll', () => {
    scrolling = true;
    isIdle = false;
    checkVisibility();
});

// Check if the user is idle (no scroll event)
setInterval(() => {
    if (!scrolling) {
        isIdle = true; // User is idle if no scroll event occurred recently
    }
    scrolling = false;
}, 200); // Check every 200ms for idle state

// Trigger visibility check on page load (when the page is first loaded or refreshed)
window.addEventListener('load', checkVisibility);



