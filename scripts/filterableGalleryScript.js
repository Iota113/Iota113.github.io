document.querySelectorAll(".filter-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;

    document.querySelectorAll(".image").forEach((image) => {
      const category = image.dataset.category;
      if (filter === "all" || category === filter) {
        image.style.display = "block";
      } else {
        image.style.display = "none";
      }
    });
  });
});
