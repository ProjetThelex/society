import {
	menuButton,
	navMenu,
	contentDiv,
	contentContainer,
	pageNav,
	toggleMenu,
	navigateTo,
	updatePageNavHighlight,
} from "./main.js";

export function setupEventListeners() {
	menuButton.addEventListener("click", toggleMenu);

	navMenu.addEventListener("click", (event) => {
		const link = event.target.closest("a");
		const trigger = event.target.closest(".collapsible-trigger");

		if (link) {
			event.preventDefault();
			const file = link.dataset.file;
			if (file) navigateTo(file);
			if (window.innerWidth < 1024) toggleMenu();
		} else if (trigger) {
			trigger.classList.toggle("open");
			const content = trigger.nextElementSibling;
			if (content && content.classList.contains("collapsible-content")) content.classList.toggle("open");
		}
	});

	contentDiv.addEventListener("click", (event) => {
		const row = event.target.closest("tr");
		const link = event.target.closest("a");

		if (row && row.querySelector("a[data-file]")) {
			const linkInRow = row.querySelector("a[data-file]");
			event.preventDefault();
			navigateTo(linkInRow.dataset.file);
		} else if (link && link.dataset.file) {
			event.preventDefault();
			navigateTo(link.dataset.file);
		}
	});

	pageNav.addEventListener("click", (event) => {
		const link = event.target.closest("a");
		if (link && link.hash) {
			event.preventDefault();
			const targetId = link.hash.substring(1);
			const targetElement = document.getElementById(targetId);
			if (targetElement) targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	});

	let scrollTimeout;
	contentContainer.addEventListener("scroll", () => {
		if (scrollTimeout) window.clearTimeout(scrollTimeout);
		scrollTimeout = window.setTimeout(updatePageNavHighlight, 50);
	});
}
