// ==UserScript==
// @name         digitalminimalism script by lis355
// @match        https://vk.com/*
// @match		 https://www.instagram.com/*
// @match		 https://www.youtube.com/*
// @run-at       document-start
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
		return element && element.querySelectorAll ? Array.from(element.querySelectorAll(selector)) : [];
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

	function checkElementBySelector(element, selector) {
		if (element.parentElement) {
			const childs = querySelectorAll(element.parentElement, selector);
			if (childs.some(child => child === element)) return true;
		}

		return false;
	}

	function findElementByXPath(path) {
		return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}

	function findParentByCondition(element, condition) {
		if (!element) return null;

		let parentElement = element;
		while (parentElement) {
			if (condition(parentElement)) return parentElement;

			parentElement = parentElement.parentElement;
		}

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

				// console.log("[digitalminimalism]", "element shown", element, reason);
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
			if (!element.digitalminimalismHided ||
				element.style.display !== "none") {
				element.style.display = "none";

				element.digitalminimalismHided = true;

				// console.log("[digitalminimalism]", "element hided", element, reason);
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
		processMutatedBody() { }
		processAddedElement(element) { }
		processRemovedElement(element) { }
		processMutatedElement(element) { }
		processMutatedElementAttributes(element) { }
		processMutatedElementCharacterData(element) { }
	}

	class YouTubeSiteProcessor extends SiteProcessor {
		initialize() {
			this.processUrl();
		}

		processContentLoaded() {
			this.processUrl();
		}

		processNavigation(url) {
			this.processUrl(new URL(url));
		}

		processMutatedBody() {
			if (OPTIONS.grayscale) document.body.style.filter = "grayscale(1)";

			this.processUrl();
		}

		processAddedElement(element) {
		}

		processRemovedElement(element) {
		}

		processMutatedElement(element) {
			const homePageSkeletonElement = findElementBySelector(element, "#home-page-skeleton");
			if (homePageSkeletonElement &&
				!homePageSkeletonElement.digitalminimalismHided) {
				this.processPage();
			}

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

			hide(findElementBySelector(element, ".ytp-fullscreen-grid"), "suggestions on video end");
		}

		processUrl(url = null) {
			url = url || new URL(location.href);
			if (this.lastUrl &&
				this.lastUrl.href === url.href) return;

			// console.log("[digitalminimalism]", "url changed", this.lastUrl && this.lastUrl.href, "-->", url.href);

			this.lastUrl = url;

			this.processPage();
		}

		processPage() {
			hideBySelector(document, "#home-page-skeleton", "skeleton");
			hideBySelector(document, ".style-scope.ytd-browse.grid[page-subtype=home]");

			if (this.lastUrl.pathname === "/") {
				// home - hide all suggestions

				this.setUpMainPage();
			} else {
				// show all except right suggestions panel

				this.setUpWatchVideoPage();
			}
		}

		setUpMainPage() {
		}

		setUpWatchVideoPage() {
			hideBySelector(document, "#secondary.style-scope.ytd-watch-flexy", "left panel");

			const videoElement = querySelector(document, "video.video-stream.html5-main-video");
			if (videoElement) {
				videoElement.style.width = "";
				videoElement.style.height = "auto";
			}
		}
	}

	class InstagramSiteProcessor extends SiteProcessor {
		initialize() {
			this.processUrl();
		}

		processContentLoaded() {
			this.processUrl();
		}

		processNavigation(url) {
			this.processUrl(new URL(url));
		}

		processMutatedBody() {
			if (OPTIONS.grayscale) document.body.style.filter = "grayscale(1)";

			this.processUrl();
		}

		processAddedElement(element) {
			if (element.tagName === "DIV") this.processPage();
			else if (element.tagName === "ARTICLE") this.processFeed();
		}

		processRemovedElement(element) {
		}

		processMutatedElement(element) {
			if (element.tagName === "VIDEO") {
				const parentElement = findParentByCondition(element, parentElement => parentElement.tagName === "ARTICLE");
				if (parentElement &&
					parentElement.digitalminimalismHided) {
					element.volume = 0;
				}
			}
		}

		processUrl(url = null) {
			url = url || new URL(location.href);
			if (this.lastUrl &&
				this.lastUrl.href === url.href) return;

			// console.log("[digitalminimalism]", "url changed", this.lastUrl && this.lastUrl.href, "-->", url.href);

			this.lastUrl = url;

			this.processPage();
		}

		processPage() {
			hide(findElementByXPath("/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div[1]/div[1]/div/div[1]"), "stories");
			hide(findElementByXPath("/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div[1]/div[2]/div/div[2]"), "suggested profiles");

			this.processFeed();
		}

		processFeed() {
			querySelectorAll(document, "div div article")
				.filter(element => getElementTextContentInLowerCase(element).includes("suggested for you"))
				.forEach(element => {
					if (!element.digitalminimalismHided) {
						element.style.filter = "blur(30px)";
						element.style.opacity = "0.25";
						element.style.pointerEvents = "none";

						element.digitalminimalismHided = true;

						// console.log("[digitalminimalism]", "element hided", element, "suggested for you");
					}
				});
		}
	}

	class VkSiteProcessor extends SiteProcessor {
		// Чтобы скрипты не скрывали рекламу по ключевым словам, вк сделало хитрость: вставляет в слова "Реклама" невидимые буквы типа "Реклu8qxh7ама0+"
		static advancedWordSearch(str, word) {
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

		static checkElementTextContentByWords(element, words) {
			if (!element) return false;

			const textContent = element.textContent;

			return words.some(word => VkSiteProcessor.advancedWordSearch(textContent, word));
		}

		static checkElementTextContentByAds(element) {
			return VkSiteProcessor.checkElementTextContentByWords(element, ["Реклама", "Ad"]);
		}

		initialize() {
			this.processUrl();
		}

		processContentLoaded() {
			this.processUrl();
		}

		processNavigation(url) {
			this.processUrl(new URL(url));
		}

		processMutatedBody() {
			if (OPTIONS.grayscale) document.body.style.filter = "grayscale(1)";

			this.processUrl();
		}

		processAddedElement(element) {
		}

		processRemovedElement(element) {
		}

		processMutatedElement(element) {
			// console.log("[digitalminimalism]", "element mutated", getElementClassName(element), element);

			if (checkElementBySelector(element, "#ads_leftmenu")) {
				hide(element, "ads");
			} else if (checkElementBySelector(element, "[class*=LeftMenu__root]")) {
				hide(querySelector(element, "#ads_leftmenu"), "ads");
			} else if (checkElementBySelector(element, "div.stories_feed_wrap.StoryFeedBlockWrapper")) {
				this.processStoryFeed();
			} else if (checkElementBySelector(element, "div.FeedSkeleton__storyList")) {
				this.processStoryFeed();
			} else if (checkElementBySelector(element, "#main_feed, #spa_legacy_content, #feed_rows")) {
				this.processFeed();
				// know all elements, witch contains .feed_row
				// } else if (querySelector(element, ".feed_row")) {
				// 	debugger
			} else if (checkElementBySelector(element, ".feed_row")) {
				this.processFeedRow(element);
			} else if (checkElementBySelector(element, "[class*=PostHeaderActions]") &&
				getElementTextContentInLowerCase(element).includes("follow")) {
				const parentElement = findParentByCondition(element, parentElement => getElementClassName(parentElement).includes("feed_row"));
				if (parentElement) this.hideVkFeedRow(parentElement);
			}
		}

		processUrl(url = null) {
			url = url || new URL(location.href);
			if (this.lastUrl &&
				this.lastUrl.href === url.href) return;

			// console.log("[digitalminimalism]", "url changed", this.lastUrl && this.lastUrl.href, "-->", url.href);

			this.lastUrl = url;

			this.processPage();
		}

		processPage() {
			hide(querySelector(document, "#ads_leftmenu"), "ads");

			this.processStoryFeed();
			this.processFeed();
		}

		processStoryFeed() {
			let element = querySelector(document, ".stories_feed_wrap.StoryFeedBlockWrapper");
			if (element &&
				hide(element.childNodes[0], "stories feed")) {
				element.style.marginBottom = "0px";

				element.digitalminimalismHided = true;

				// console.log("[digitalminimalism]", "element hided", element, "stories feed");
			}

			element = querySelector(document, ".FeedSkeleton__storyList");
			if (element &&
				hide(element, "stories feed skeleton")) {
				element.nextElementSibling.style.marginTop = "0px";

				element.digitalminimalismHided = true;

				// console.log("[digitalminimalism]", "element hided", element, "stories feed");
			}
		}

		processFeed() {
			querySelectorAll(document, ".feed_row")
				.forEach(element => {
					this.processFeedRow(element);
				});
		}

		processFeedRow(element) {
			if (element.digitalminimalismHided) return;

			// на новой feed row сделаем 3х секундный тайм аут, чтобы все прогрузилось, т.к. кнопка follow появляется не сразу
			if (!element.loadingProcessed &&
				!element.loadingTimeout) {
				element.loadingTimeout = setTimeout(() => {
					element.loadingTimeout = clearTimeout(element.loadingTimeout);
					element.loadingProcessed = true;

					// revert if not blocked
					if (!element.digitalminimalismHided) {
						element.style.filter = "";
						element.style.opacity = "1";
						element.style.pointerEvents = "";
					}
				}, 1500);

				element.style.filter = "blur(30px)";
				element.style.opacity = "0.25";
				element.style.pointerEvents = "none";
			}

			if (querySelector(element, "[class*=PostHeaderActions]") &&
				getElementTextContentInLowerCase(element).includes("follow")) {
				const parentElement = findParentByCondition(element, parentElement => getElementClassName(parentElement).includes("feed_row"));
				if (parentElement) return this.hideVkFeedRow(parentElement, "feed suggestions");
			}

			if (VkSiteProcessor.checkElementTextContentByAds(querySelector(element, ".PostHeaderSubtitle"))) return this.hideVkFeedRow(element, "feed ads");

			if (getElementTextContentInLowerCase(element).includes("follow")) return this.hideVkFeedRow(element, "feed suggestions");

			if (querySelector(element, "[class*=Recommendation]")) return this.hideVkFeedRow(element, "feed recommendations");
		}

		hideVkFeedRow(element, reason) {
			element.loadingTimeout = clearTimeout(element.loadingTimeout);
			element.loadingProcessed = true;

			if (!element.digitalminimalismHided) {
				element.style.filter = "blur(30px)";
				element.style.opacity = "0.25";
				element.style.pointerEvents = "none";

				element.digitalminimalismHided = true;
			}
		}
	}

	function createSiteProcessor() {
		if (location.host.includes("vk.com")) return new VkSiteProcessor();
		else if (location.host.includes("instagram.com")) return new InstagramSiteProcessor();
		else if (location.host.includes("youtube.com")) return new YouTubeSiteProcessor();
		else return null;
	}

	const siteProcessor = createSiteProcessor();
	if (siteProcessor) {
		document.addEventListener("DOMContentLoaded", () => siteProcessor.processContentLoaded());

		window.navigation.addEventListener("navigate", event => siteProcessor.processNavigation(new URL(event.destination.url)));

		const observer = new MutationObserver((mutationsList, observer) => {
			if (!document.body) return;

			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					if (mutation.target.tagName === "BODY") siteProcessor.processMutatedBody();
					else siteProcessor.processMutatedElement(mutation.target);

					for (const element of mutation.addedNodes) siteProcessor.processAddedElement(element);
					for (const element of mutation.removedNodes) siteProcessor.processRemovedElement(element);
				} else if (mutation.type === "attributes") {
					siteProcessor.processMutatedElementAttributes(mutation.target);
				} else if (mutation.type === "characterData") {
					siteProcessor.processMutatedElementCharacterData(mutation.target);
				}
			}
		});

		observer.observe(document, { childList: true, subtree: true, attributes: true, characterData: true });

		siteProcessor.initialize();
	}
})();
