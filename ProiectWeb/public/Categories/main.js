let categories = [];
let renameCount = 0;

new FinisherHeader({
    count: 10,
    size: { min: 1300, max: 1500, pulse: 0 },
    speed: { x: { min: 0, max: 0.1 }, y: { min: 0, max: 0.1 } },
    colors: {
        background: "#e7e5e2",
        particles: ["#777a7f", "#d6d9d6", "#c9ae30", "#9fb6b4", "#b1b2ac"]
    },
    blending: "overlay",
    opacity: { center: 0.5, edge: 0.05 },
    skew: 0,
    shapes: ["c"]
});

// Cursor effect
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', function (e) {
    cursor.style.left = (e.clientX - 15) + "px";
    cursor.style.top = (e.clientY - 15) + "px";
});



init();