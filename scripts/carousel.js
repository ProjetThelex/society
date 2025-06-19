import { etapes } from "../config.js";
import { slugify } from "./utils.js";

let slideIndex = 1;
let slideInterval;

function showSlides(n) {
	let i;
	const slides = document.getElementsByClassName("carousel-slide");
	if (slides.length === 0) return;

	if (n > slides.length) slideIndex = 1;
	if (n < 1) slideIndex = slides.length;

	for (i = 0; i < slides.length; i++) {
		slides[i].style.display = "none";
	}

	slides[slideIndex - 1].style.display = "block";
}

export function plusSlides(n) {
	showSlides((slideIndex += n));
	resetSlideInterval();
}

function resetSlideInterval() {
	clearInterval(slideInterval);
	slideInterval = setInterval(() => plusSlides(1), 5000);
}

function initializeCarousel() {
	showSlides(slideIndex);
	resetSlideInterval();
}

export function stopCarousel() {
	clearInterval(slideInterval);
}

export function createCarousel() {
	const carouselContainer = document.getElementById("carousel-container");
	if (!carouselContainer) return;

	carouselContainer.innerHTML = `
        ${etapes
			.map((etape) => {
				console.warn(`images/${etape.image.toLowerCase()}`);
				if (!etape.image) {
					console.warn("Étape sans image :", etape);
					return "";
				}
				return `
            <div class="carousel-slide">
                <a href="#" data-file="${etape.file}">
                    <img src="images/${etape.image.toLowerCase()}" alt="${etape.image}">
                </a>
            </div>
        `;
			})
			.join("")}
    `;

	initializeCarousel();
}
