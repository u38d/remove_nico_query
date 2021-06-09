// ==UserScript==
// @name        remove nico query
// @namespace   http://localhost/
// @description remove niconico's link query
// @include     https://*.nicovideo.jp/*
// @include     http://*.nicovideo.jp/*
// @version     3.00
// ==/UserScript==

(() => {
"use strict";

/**
 * URI文字列中のQueryを削除。
 */
const removeQueryString = (s) => {
	if (s.indexOf('?') === -1) {
		// '?'を含まないときは終了
		return s;
	}
	return s.replace(/(watch|seiga|user|article|comic|community)\/([A-Za-z]*\d+)\?[^#]*(.*)$/, "$1/$2$3");
}

/**
 * Link Anchorであるか。
 */
const isLinkAnchor = (n) => {
	return n.nodeType === Node.ELEMENT_NODE && (n.nodeName === "a" || n.nodeName === "A") && n.hasAttribute("href");
}

/**
 * NodeTreeに含まれるアンカーからQueryを削除。
 */
const removeQueryInNodeTree = (node) => {
	Array.from(node.childNodes).forEach(removeQueryInNodeTree);

	if (!isLinkAnchor(node)) {
		return;
	}

	const oldHref = node.getAttribute("href");
	const newHref = removeQueryString(oldHref);
	if (newHref !== oldHref) {
		node.setAttribute("href", newHref);
	}
}

/* 読み込み時の処理 */
removeQueryInNodeTree(document);

/* href属性が変更されたときにQueryを削除 */
const hrefObserver = new MutationObserver(
	(mutations) => {
		mutations.forEach(
			(m) => removeQueryInNodeTree(m.target)
		);
	}
);
const hrefChangedConfig = { subtree: true, attributes: true, attributeFilter: ["href"] };
hrefObserver.observe(document, hrefChangedConfig);

/* リンクが追加されたときにQueryを削除 */
const childListObserver = new MutationObserver(
	(mutations) => {
		mutations.forEach(
			(m) => Array.from(m.addedNodes).forEach(removeQueryInNodeTree)
		);
	}
);
const childListConfig = { subtree: true, childList: true};
childListObserver.observe(document, childListConfig);

})();

/*
 * 参考
 * ニコニコ動画 リンクに付与されるrefパラメータ削除
 * http://d.hatena.ne.jp/alunko/20130922/1379797016
 */

