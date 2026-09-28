// Practice section helpers for the notes pages.
// Cards opt in to topic tags with attributes: <div class='example' data-topic="Velocity" data-hard>
//
// Pages written in the final layout already have the menu in their HTML:
//   <details class="practice-menu"> <summary>practice problems (17)</summary> ...
//   <label class="practice-tag-toggle"><input type="checkbox"> ...</label> ... cards ... </details>
// For those pages this script only adds the topic tags and wires up the checkbox.
// Older pages (with an <h1>Practice</h1> heading) get the menu and checkbox built here.
(function () {
	function addTags(cards) {
		for (const card of cards) {
			const tags = document.createElement("div");
			tags.className = "practice-tags";
			const topic = document.createElement("span");
			topic.className = "practice-tag";
			topic.textContent = card.dataset.topic;
			tags.appendChild(topic);
			if (card.hasAttribute("data-hard")) {
				const hard = document.createElement("span");
				hard.className = "practice-tag practice-tag-hard";
				hard.textContent = "harder";
				tags.appendChild(hard);
			}
			// keep a card's opening diagram above the tags
			const first = card.firstElementChild;
			const after = first && first.tagName.toLowerCase() === "svg" ? first.nextSibling : card.firstChild;
			card.insertBefore(tags, after);
		}
	}

	function wireCheckbox(box, scope) {
		const key = "show-practice-tags";
		const show = (on) => {
			scope.classList.toggle("show-practice-tags", on);
			box.checked = on;
		};
		try {
			show(localStorage.getItem(key) === "1");
		} catch (e) {
			show(false);
		}
		box.addEventListener("change", () => {
			show(box.checked);
			try {
				localStorage.setItem(key, box.checked ? "1" : "0");
			} catch (e) {}
		});
	}

	function setup() {
		// final layout: the menu is already in the HTML
		const staticMenu = document.querySelector("details.practice-menu");
		if (staticMenu) {
			addTags([...staticMenu.querySelectorAll(".example[data-topic]")]);
			const box = staticMenu.querySelector(".practice-tag-toggle input");
			if (box) wireCheckbox(box, staticMenu);
			return;
		}

		// older layout: build the menu around the cards under the Practice heading
		const heading = [...document.querySelectorAll("h1")].find((h) => /^\s*Practice\b/.test(h.textContent));
		if (!heading) return;
		const article = heading.closest("article");
		const cards = [...article.querySelectorAll(".example[data-topic]")];
		if (!cards.length) return;
		addTags(cards);

		const menu = document.createElement("details");
		menu.className = "practice-menu";
		const summary = document.createElement("summary");
		summary.textContent = `practice problems (${cards.length})`;
		menu.appendChild(summary);
		cards[0].parentNode.insertBefore(menu, cards[0]);

		const label = document.createElement("label");
		label.className = "practice-tag-toggle";
		const box = document.createElement("input");
		box.type = "checkbox";
		label.appendChild(box);
		label.appendChild(document.createTextNode(" show topics and mark harder problems"));
		menu.appendChild(label);
		for (const card of cards) menu.appendChild(card);
		wireCheckbox(box, article);
	}

	if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
	else setup();
})();
