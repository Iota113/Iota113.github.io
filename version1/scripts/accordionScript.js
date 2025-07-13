document.addEventListener("DOMContentLoaded", function () {
    // Select all elements with class 'dynamic-accordion'
    document.querySelectorAll(".dynamic-accordion").forEach(container => {
        const topicsJson = container.getAttribute("data-topics");
        if (!topicsJson) return; // Skip if no topics defined

        let topics;
        try {
            topics = JSON.parse(topicsJson); // Parse JSON
        } catch (error) {
            console.error("Invalid JSON in data-topics:", error);
            return;
        }

        let html = "";
        topics.forEach((topic, index) => {
            const id = `${container.id}-${index}`;

            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header" id="panelsStayOpen-heading-${id}">
                        <button class="accordion-button collapsed" type="button" style="font-size: 2.5vh;" data-bs-toggle="collapse" 
                            data-bs-target="#panelsStayOpen-collapse-${id}" aria-expanded="false" aria-controls="panelsStayOpen-collapse-${id}">
                            ${topic.title}
                        </button>
                    </h2>
                    <div id="panelsStayOpen-collapse-${id}" class="accordion-collapse collapse" 
                        aria-labelledby="panelsStayOpen-heading-${id}" data-bs-parent="#${container.id}">
                        <div class="accordion-body">
                            ${topic.image ? `<img src="${topic.image}" style="display: block; margin: auto; width:40%;">` : ""}
                            <ul style="font-size: 1rem">
                                ${topic.content.map(item => `<li>${item}</li>`).join("")}
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html; // Inject the HTML into the accordion
    });
});