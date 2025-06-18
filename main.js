import { setupEventListeners } from "./listeners.js";
import { branches, etapes, projets } from "./config.js";
import { generateBudgetTable } from "./scripts/budget.js";

export const menuButton = document.getElementById("menu-button");
export const navMenu = document.getElementById("nav-menu");
export const contentDiv = document.getElementById("content");
export const contentContainer = document.getElementById("content-container");
export const pageNav = document.getElementById("page-nav");

function slugify(text) {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function toggleMenu() {
	navMenu.classList.toggle("open");
}

function renderCheckboxes(markdown) {
	return markdown
		.replace(/\[ \]/g, '<input type="checkbox" disabled>')
		.replace(/\[x\]/gi, '<input type="checkbox" checked disabled>')
		.replace(/\[-\]/g, '<input type="checkbox" indeterminate disabled>');
}

async function loadContent(file) {
	try {
		const filePath = `documents/${file}`;
		const response = await fetch(`${filePath}?v=${new Date().getTime()}`);
		if (!response.ok) throw new Error(`Fichier non trouvé: ${file}`);

		const lastModified = response.headers.get("Last-Modified");
		const lastUpdatedDiv = document.getElementById("last-updated");

		if (lastModified && lastUpdatedDiv) {
			const date = new Date(lastModified);
			const options = {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			};
			const formattedDate = date.toLocaleDateString("fr-FR", options);
			lastUpdatedDiv.innerHTML = `Dernière mise à jour le ${formattedDate}`;
		} else if (lastUpdatedDiv) lastUpdatedDiv.innerHTML = "";

		let text = await response.text();
		text = renderCheckboxes(text);

		contentDiv.innerHTML = marked.parse(text);

		if (file === "summary.md") {
			const placeholder = document.getElementById("budget-table-placeholder");
			if (placeholder) {
				placeholder.innerHTML = await generateBudgetTable();
			}
		}

		pageNav.innerHTML = "";
		pageNav.classList.remove("visible");
		const usedSlugs = new Set();

		if (file.startsWith("branches/")) {
			const headings = contentDiv.querySelectorAll("h2, h3");
			if (headings.length > 1) {
				const navList = document.createElement("ul");
				const navTitle = document.createElement("h3");
				pageNav.appendChild(navTitle);

				headings.forEach((heading) => {
					const li = document.createElement("li");
					const a = document.createElement("a");

					let baseSlug = slugify(heading.textContent);
					let slug = baseSlug;
					let counter = 2;
					while (usedSlugs.has(slug)) {
						slug = `${baseSlug}-${counter}`;
						counter++;
					}
					usedSlugs.add(slug);

					heading.id = slug;
					a.href = `#${slug}`;

					a.textContent = heading.textContent;
					if (heading.tagName === "H3") {
						a.style.paddingLeft = "15px";
					}
					li.appendChild(a);
					navList.appendChild(li);
				});
				pageNav.appendChild(navList);
				pageNav.classList.add("visible");
			}
		}

		const firstHeading = contentDiv.querySelector("h1");
		document.title = firstHeading ? firstHeading.textContent : "Projet Thelex";

		contentContainer.scrollTop = 0;
	} catch (error) {
		pageNav.innerHTML = "";
		pageNav.classList.remove("visible");
		contentDiv.innerHTML = `<p style="color: red;"><strong>Erreur :</strong> ${error.message}</p>`;
	}
}

function populateBranchesMenu() {
	const branchesMenuList = document.getElementById("branches-menu-list");
	if (!branchesMenuList) return;

	branches.forEach((branche) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href = "#";
		a.dataset.file = branche.file;
		a.innerHTML = `<i class="${branche.icon}"></i> ${branche.name}`;
		li.appendChild(a);
		branchesMenuList.appendChild(li);
	});
}

function populateEtapesMenu() {
	const etapesMenuList = document.getElementById("etapes-menu-list");
	if (!etapesMenuList) return;

	etapes.forEach((etape, index) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href = "#";
		a.dataset.file = etape.file;
		a.innerHTML = `${index + 1}. ${etape.name}`;
		li.appendChild(a);
		etapesMenuList.appendChild(li);
	});
}

function populateProjetsMenu() {
	const projetsMenuList = document.getElementById("projets-menu-list");
	if (!projetsMenuList) return;

	projets.forEach((projet) => {
		const li = document.createElement("li");
		const a = document.createElement("a");
		a.href = "#";
		a.dataset.file = projet.file;
		a.innerHTML = `<i class="${projet.icon}"></i> ${projet.name}`;
		li.appendChild(a);
		projetsMenuList.appendChild(li);
	});
}

export function updatePageNavHighlight() {
	const headings = contentDiv.querySelectorAll("h2[id], h3[id]");
	if (headings.length === 0) return;

	let activeHeadingId = null;

	for (const heading of headings) {
		if (heading.offsetTop - 100 <= contentContainer.scrollTop) {
			activeHeadingId = heading.id;
		} else {
			break;
		}
	}

	pageNav.querySelectorAll("a").forEach((link) => {
		link.classList.remove("active");
		if (link.href.endsWith(`#${activeHeadingId}`)) {
			link.classList.add("active");
		}
	});
}

export function navigateTo(file) {
	loadContent(file);
	navMenu.querySelectorAll("a").forEach((link) => link.classList.remove("active"));
	const correspondingMenuLink = navMenu.querySelector(`a[data-file="${file}"]`);
	if (correspondingMenuLink) {
		correspondingMenuLink.classList.add("active");
	}
}

document.addEventListener("DOMContentLoaded", () => {
	navigateTo("summary.md");
	setupEventListeners();
	populateBranchesMenu();
	populateProjetsMenu();
	populateEtapesMenu();
});
