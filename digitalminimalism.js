// ==UserScript==
// @name         digitalminimalism script by lis355
// @match        https://vk.com/*
// @match		 https://www.instagram.com/*
// @match		 https://www.youtube.com/*
// ==/UserScript==

(function () {
	"use strict";

	const OPTIONS = {
		grayscale: true
	};

	console.log("[digitalminimalism]", "script by lis355", OPTIONS);

	function querySelector(element, selector) {
		return element && element.querySelector ? element.querySelector(selector) : null;
	}

	function querySelectorAll(element, selector) {
		return element && element.querySelectorAll ? element.querySelectorAll(selector) : [];
	}

	function getElementTextContentInLowerCase(element) {
		return element && element.textContent ? element.textContent.toLowerCase() : "";
	}

	function findElementBySelector(element, selector) {
		if (!element) return null;

		// проверим а не является САМ element искомым 
		if (element.parentElement) {
			const child = querySelector(element.parentElement, selector);
			if (child === element) return child;
		}

		const child = querySelector(element, selector);
		if (child) return child;

		return null;
	}

	function getElementClassName(element) {
		return element &&
			element.className &&
			typeof element.className === "string"
			? element.className
			: "";
	}

	function show(element, reason) {
		if (element) {
			if (element.digitalminimalismHided) {
				element.style.display = "";

				element.digitalminimalismHided = false;

				console.log("[digitalminimalism]", "element shown", element, reason);
			}

			return true;
		}

		return false;
	}

	function showIf(element, condition, reason) {
		if (element &&
			condition &&
			condition(element)) return show(element, reason);

		return false;
	}

	function showBySelector(element, selector, reason) {
		return show(querySelector(element, selector), reason);
	}

	function hide(element, reason) {
		if (element) {
			if (!element.digitalminimalismHided) {
				element.style.display = "none";

				element.digitalminimalismHided = true;

				console.log("[digitalminimalism]", "element hided", element, reason);
			}

			return true;
		}

		return false;
	}

	function hideIf(element, condition, reason) {
		if (element &&
			condition &&
			condition(element)) return hide(element, reason);

		return false;
	}

	function hideBySelector(element, selector, reason) {
		return hide(querySelector(element, selector), reason);
	}

	class SiteProcessor {
		initialize() { }
		processContentLoaded() { }
		processNavigation(url) { }
		processAddedElement(element) { }
		processRemovedElement(element) { }
		processMutatedElement(element) { }
	}

	class YouTubeSiteProcessor extends SiteProcessor {
		initialize() {
			if (OPTIONS.grayscale) document.body.style.filter = "grayscale(1)";

			this.processUrl();
		}

		processContentLoaded() {
			this.processUrl();
		}

		processNavigation(url) {
			this.processUrl(new URL(url));
		}

		processAddedElement(element) {
		}

		processRemovedElement(element) {
		}

		processMutatedElement(element) {
			// console.log(element.id, getElementClassName(element), element);

			const mainSuggestionsGridElement = findElementBySelector(element, ".style-scope.ytd-browse.grid[page-subtype=home]");
			if (mainSuggestionsGridElement &&
				!mainSuggestionsGridElement.digitalminimalismHided) {
				this.processPage();
			}

			const leftPanelElement = findElementBySelector(element, "#secondary.style-scope.ytd-watch-flexy");
			if (leftPanelElement &&
				!leftPanelElement.digitalminimalismHided) {
				this.processPage();
			}
		}

		processUrl(url = null) {
			url = url || new URL(location.href);
			if (this.lastUrl &&
				this.lastUrl.href === url.href) return;

			console.log("[digitalminimalism]", "url changed", this.lastUrl && this.lastUrl.href, "-->", url.href);

			this.lastUrl = url;

			this.processPage();
		}

		processPage() {
			hideBySelector(document.body, "#home-page-skeleton", "skeleton");
			hideBySelector(document.body, ".style-scope.ytd-browse.grid[page-subtype=home]");

			if (this.lastUrl.pathname === "/") {
				// home - hide all suggestions

				this.setUpMainPage();
			} else {
				// show all except right suggestions panel

				this.setUpWatchVideoPage();
			}
		}

		setUpMainPage() {
			// hideBySelector(document.body, "#page-manager", "main");
		}

		setUpWatchVideoPage() {
			// showBySelector(document.body, "#page-manager", "main");

			hideBySelector(document.body, "#secondary.style-scope.ytd-watch-flexy", "left panel");

			const videoElement = querySelector(document.body, "video.video-stream.html5-main-video");
			if (videoElement) {
				videoElement.style.width = "";
				videoElement.style.height = "auto";
			}
		}
	}

	function createSiteProcessor() {
		// if (location.host.includes("vk.com")) return new VkSiteProcessor();
		// else if (location.host.includes("instagram.com")) return new InstagramSiteProcessor();
		// else
		if (location.host.includes("youtube.com")) return new YouTubeSiteProcessor();
		else return null;
	}

	const siteProcessor = createSiteProcessor();
	if (siteProcessor) {
		document.addEventListener("DOMContentLoaded", () => siteProcessor.processContentLoaded());
		window.navigation.addEventListener("navigate", event => siteProcessor.processNavigation(new URL(event.destination.url)));

		const observer = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					for (const element of mutation.addedNodes) siteProcessor.processAddedElement(element);
					for (const element of mutation.removedNodes) siteProcessor.processRemovedElement(element);

					siteProcessor.processMutatedElement(mutation.target);
				} else if (mutation.type === "attributes") {
					siteProcessor.processMutatedElement(mutation.target);
				} else if (mutation.type === "characterData") {
					siteProcessor.processMutatedElement(mutation.target);
				}
			}
		});

		observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

		siteProcessor.initialize();
	}

	// function processNewElementByDomain(element) {
	// 	if (location.host.includes("vk.com")) processVkNewElement(element);
	// 	else if (location.host.includes("instagram.com")) processInstagramNewElement(element);
	// 	else if (location.host.includes("youtube.com")) processYoutubeNewElement(element);
	// }

	// function pprocessNavigationByDomain(url) {
	// 	if (location.host.includes("vk.com")) processVkNavigation(url);
	// 	else if (location.host.includes("instagram.com")) processInstagramNavigation(url);
	// 	else if (location.host.includes("youtube.com")) processYoutubeNavigation(url);
	// }

	// function checkElementTextContentByWords(element, words) {
	// 	if (!element) return false;

	// 	// Чтобы скрипты не скрывали рекламу по ключевым словам, вк сделало хитрость: вставляет в слова "Реклама" невидимые буквы типа "Реклu8qxh7ама0+"
	// 	function advancedWordSearch(str, word) {
	// 		str = str.toLowerCase();
	// 		word = word.toLowerCase();

	// 		let strLetterIndex = 0;
	// 		let wordLetterIndex = 0;

	// 		while (strLetterIndex < str.length &&
	// 			wordLetterIndex < word.length) {
	// 			const strLetter = str[strLetterIndex];
	// 			const wordLetter = word[wordLetterIndex];
	// 			if (strLetter === wordLetter) {
	// 				strLetterIndex++;
	// 				wordLetterIndex++;
	// 			} else {
	// 				strLetterIndex++;
	// 			}
	// 		}

	// 		return wordLetterIndex === word.length;
	// 	}

	// 	const textContent = element.textContent;

	// 	return words.some(word => advancedWordSearch(textContent, word));
	// }

	// function checkElementTextContentByAds(element) {
	// 	return checkElementTextContentByWords(element, ["Реклама", "Ad"]);
	// }

	// function processVkNewElement(element) {
	// 	// total grayscale
	// 	document.body.style.filter = "grayscale(1)";

	// 	// stories
	// 	if (hideBySelector(element, "[class*=stories_feed]", "stories feed")) return;
	// 	if (hideBySelector(element, "[class*=FeedSkeleton__storyList]", "stories feed skeleton")) return;

	// 	// feed
	// 	let wasFeedElement = false;
	// 	if (processVkFeedRow(element)) {
	// 		wasFeedElement = true;
	// 	} else {
	// 		querySelectorAll(element.parentElement, ".feed_row")
	// 			.forEach(element => {
	// 				if (processVkFeedRow(element)) wasFeedElement = true;
	// 			});
	// 	}

	// 	if (wasFeedElement) {
	// 		// надо сделать сортировку чтобы пустые записи были снизу, а потом их удалить
	// 		const feedRowsElement = querySelector(document, "#feed_rows");
	// 		const feedRowElements = Array.from(feedRowsElement);

	// 		feedRowElements.sort((elementA, elementB) => {
	// 			const aHided = elementA.digitalminimalismHided
	// 			const bHided = elementB.digitalminimalismHided

	// 			if (aHided && !bHided) return 1;
	// 			if (!aHided && bHided) return -1;
	// 			return 0;
	// 		});

	// 		// Переставляем элементы в отсортированном порядке
	// 		feedRowElements.forEach(element => feedRowsElement.appendChild(element));
	// 	}
	// }

	// function processVkFeedRow(element) {
	// 	if (element.minimaled) return true;

	// 	if (getElementClassName(element).includes("vkitButton")
	// 		&& getElementTextContentInLowerCase(element).includes("follow")) {
	// 		let parentElement = element.parentElement;
	// 		while (parentElement &&
	// 			!getElementClassName(parentElement).includes("feed_row")) parentElement = parentElement.parentElement;

	// 		if (parentElement) return hideVkFeedRow(parentElement, "feed suggestions");
	// 	}

	// 	if (checkElementTextContentByAds(querySelector(element, ".PostHeaderSubtitle"))) return hide(element, "feed ads");

	// 	if (getElementTextContentInLowerCase(element).includes("follow")) return hideVkFeedRow(element, "feed suggestions");

	// 	if (querySelector(element, "[class*=Recommendation]")) return hide(element, "feed recommendations");

	// 	return false;
	// }

	// function hideVkFeedRow(element, reason) {
	// 	element.style.height = `${element.clientWidth}px`;
	// 	element.innerHTML = "";
	// 	element.digitalminimalismHided = true;

	// 	console.log("[digitalminimalism]", "element hided", element, reason);

	// 	return true;
	// }

	// function processInstagramNewElement(element) {
	// 	// total grayscale
	// 	document.body.style.filter = "grayscale(1)";

	// }
})();
