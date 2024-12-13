document.addEventListener("DOMContentLoaded", function() {
    // For sliding content 
    const images = [
        'ARTESANO_IMG/IMG_4977.jpg',
        'ARTESANO_IMG/IMG_4978.jpg',
        'ARTESANO_IMG/IMG_4979.jpg'
        // Add more image paths as needed
    ];

    let currentImageIndex = 0;
    const contentDiv = document.querySelector('.content');

    if (contentDiv) { // Check if the element exists
        function changeBackgroundImage() {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            contentDiv.style.backgroundImage = `url(${images[currentImageIndex]})`;
            contentDiv.classList.add('fade'); // Add the fade animation
            setTimeout(() => {
                contentDiv.classList.remove('fade'); // Remove the fade animation after it completes
            }, 1000); // Match the duration of the CSS animation
        }

        setInterval(changeBackgroundImage, 5000); // Change image every 5 seconds
        contentDiv.style.backgroundImage = `url(${images[currentImageIndex]})`; // Set initial image
    } else {
        console.error("Element with class 'content' not found.");
    }
});
