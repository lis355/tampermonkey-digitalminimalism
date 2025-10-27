// ==UserScript==
// @name         digitalminimalism script by lis355
// @match        https://vk.com/*
// @match		 https://www.instagram.com/*
// @match		 https://www.youtube.com/*
// ==/UserScript==

(function () {
	"use strict";

	console.log("digitalminimalism", location.host);

	function querySelector(element, selector) {
		return element && element.querySelector ? element.querySelector(selector) : null;
	}

	function querySelectorAll(element, selector) {
		return element && element.querySelectorAll ? element.querySelectorAll(selector) : [];
	}

	function getElementTextContentInLowerCase(element) {
		return element && element.textContent ? element.textContent.toLowerCase() : "";
	}

	function getElementClassName(element) {
		return element &&
			element.className &&
			typeof element.className === "string"
			? element.className
			: "";
	}

	function doWith(element, action) {
		if (element &&
			action) return action(element);

		return false;
	}

	function hide(element, reason) {
		doWith(element, element => {
			element.style.display = "none";

			element.digitalminimalismHided = true;

			console.log("[digitalminimalism]", "element hided", element, reason);

			return true;
		});

		return false;
	}

	function hideIf(element, condition, reason) {
		if (element &&
			condition &&
			condition(element)) return hide(element, reason);

		return false;
	}

	function hideBySelector(element, selector, reason) {
		if (element instanceof HTMLElement) return hide(element.querySelector(selector), reason);

		return false;
	}

	function processNewElement(element) {
		processNewElementByDomain(element);
	}

	const observer = new MutationObserver((mutationsList, observer) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList") {
				for (const node of mutation.addedNodes) processNewElement(node);
			}
		}
	});

	observer.observe(document.body, { childList: true, subtree: true });

	document.addEventListener("DOMContentLoaded", () => processNewElement(document));

	processNewElement(document);

	/////////////////////////////////////////////////////////////////////////////////////////

	function processNewElementByDomain(element) {
		if (location.host.includes("vk.com")) processVkNewElement(element);
		else if (location.host.includes("instagram.com")) processInstagramNewElement(element);
		else if (location.host.includes("youtube.com")) processYoutubeNewElement(element);
	}

	function checkElementTextContentByWords(element, words) {
		if (!element) return false;

		// Чтобы скрипты не скрывали рекламу по ключевым словам, вк сделало хитрость: вставляет в слова "Реклама" невидимые буквы типа "Реклu8qxh7ама0+"
		function advancedWordSearch(str, word) {
			str = str.toLowerCase();
			word = word.toLowerCase();

			let strLetterIndex = 0;
			let wordLetterIndex = 0;

			while (strLetterIndex < str.length &&
				wordLetterIndex < word.length) {
				const strLetter = str[strLetterIndex];
				const wordLetter = word[wordLetterIndex];
				if (strLetter === wordLetter) {
					strLetterIndex++;
					wordLetterIndex++;
				} else {
					strLetterIndex++;
				}
			}

			return wordLetterIndex === word.length;
		}

		const textContent = element.textContent;

		return words.some(word => advancedWordSearch(textContent, word));
	}

	function checkElementTextContentByAds(element) {
		return checkElementTextContentByWords(element, ["Реклама", "Ad"]);
	}

	function processVkNewElement(element) {
		// total grayscale
		document.body.style.filter = "grayscale(1)";

		// stories
		if (hideBySelector(element, "[class*=stories_feed]", "stories feed")) return;
		if (hideBySelector(element, "[class*=FeedSkeleton__storyList]", "stories feed skeleton")) return;

		// feed
		let wasFeedElement = false;
		if (processVkFeedRow(element)) {
			wasFeedElement = true;
		} else {
			querySelectorAll(element.parentElement, ".feed_row")
				.forEach(element => {
					if (processVkFeedRow(element)) wasFeedElement = true;
				});
		}

		if (wasFeedElement) {
			// надо сделать сортировку чтобы пустые записи были снизу, а потом их удалить
			const feedRowsElement = document.querySelector("#feed_rows");
			const feedRowElements = Array.from(feedRowsElement);

			feedRowElements.sort((elementA, elementB) => {
				const aHided = elementA.digitalminimalismHided
				const bHided = elementB.digitalminimalismHided

				if (aHided && !bHided) return 1;
				if (!aHided && bHided) return -1;
				return 0;
			});

			// Переставляем элементы в отсортированном порядке
			feedRowElements.forEach(element => feedRowsElement.appendChild(element));
		}
	}

	function processVkFeedRow(element) {
		if (element.minimaled) return true;

		if (getElementClassName(element).includes("vkitButton")
			&& getElementTextContentInLowerCase(element).includes("follow")) {
			let parentElement = element.parentElement;
			while (parentElement &&
				!getElementClassName(parentElement).includes("feed_row")) parentElement = parentElement.parentElement;

			if (parentElement) return hideVkFeedRow(parentElement, "feed suggestions");
		}

		if (checkElementTextContentByAds(querySelector(element, ".PostHeaderSubtitle"))) return hide(element, "feed ads");

		if (getElementTextContentInLowerCase(element).includes("follow")) return hideVkFeedRow(element, "feed suggestions");

		if (querySelector(element, "[class*=Recommendation]")) return hide(element, "feed recommendations");

		return false;
	}

	function hideVkFeedRow(element, reason) {
		element.style.height = `${element.clientWidth}px`;
		element.innerHTML = "";
		element.digitalminimalismHided = true;

		console.log("[digitalminimalism]", "element hided", element, reason);

		return true;
	}

	function processInstagramNewElement(element) {
		// total grayscale
		document.body.style.filter = "grayscale(1)";
	}

	function processYoutubeNewElement(element) {
		// total grayscale
		document.body.style.filter = "grayscale(1)";
	}
})();
