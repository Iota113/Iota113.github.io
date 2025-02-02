function changeSlide(n, button) {
    let container = button.parentElement;
    let slides = container.querySelectorAll(".slides");
    let index = parseInt(container.getAttribute("data-index"));
    
    let currentSlide = slides[index];
    index += n;
    if (index < 0 || index >= slides.length) return;
    
    let nextSlide = slides[index];
    container.setAttribute("data-index", index);
    
    currentSlide.style.opacity = "0";
    setTimeout(() => {
        currentSlide.classList.remove("active");
        nextSlide.classList.add("active");
        nextSlide.style.opacity = "1";
    }, 300);
    
    container.querySelector(".prev").classList.toggle("hidden", index === 0);
    container.querySelector(".next").classList.toggle("hidden", index === slides.length - 1);
}