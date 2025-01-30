/* https://github.com/treehouse/ham-menu */

// <-- Hamburger Menu -- >
const hamMenu = document.querySelector(".ham-menu");
const offScreenMenu = document.querySelector(".off-screen-menu");

hamMenu.addEventListener("click", () => {
  hamMenu.classList.toggle("active");
  offScreenMenu.classList.toggle("active");
});

// Toggle dropDown onClick by ChatGPT

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".dropdown-toggle").forEach(button => {
      button.addEventListener("click", function (event) {
          event.stopPropagation(); // Prevents bubbling up
          const dropdown = this.parentElement;
          
          // Close other open dropdowns before opening the clicked one
          document.querySelectorAll(".dropdown").forEach(d => {
              if (d !== dropdown) d.classList.remove("active");
          });

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


