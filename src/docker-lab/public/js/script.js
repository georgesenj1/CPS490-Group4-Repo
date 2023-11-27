function createBubble() {
    const bubble = document.createElement("div");
    const size = Math.random() * 100 + 40 + "px";
    bubble.style.width = size;
    bubble.style.height = size;
    bubble.style.left = Math.random() * 100 + "vw";
    bubble.style.animationDuration = Math.random() * 2 + 3 + "s";

    bubble.classList.add("bubble");
    document.body.appendChild(bubble);

    // Remove the bubble after 5 seconds to prevent div overload
    setTimeout(() => {
        bubble.remove();
    }, 5000);
}

setInterval(createBubble, 300); // Create a bubble every 300ms
