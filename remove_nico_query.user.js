// ==UserScript==
// @name        remove nico query
// @namespace   https://github.com/u38d/remove_nico_query
// @description remove niconico's link query
// @include     https://*.nicovideo.jp/*
// @include     http://*.nicovideo.jp/*
// @version     3.01
// ==/UserScript==

(() => {
"use strict";

/**
 * URI文字列中の許可されていないQueryを削除。
 */
const uriRe = /(.*)(watch|seiga|user|article|comic|community)(\/[A-Za-z]*\d+)\?([^#]*)(.*)$/;
const allowedQuerySet = new Set(['comments_page']);
const removeQueryString = (s) => {
	const result = s.match(uriRe);
	if (!result) {
		//目標のURIではない
		return s;
	}

	let newQueryList = [];
	const queryPairList = result[4].split('&');
	queryPairList.forEach(
		e => {
			const pair = e.split('=');
			if (allowedQuerySet.has(pair[0])) {
				newQueryList.push(e);
			} 
		}
	);

	let newQuery = '';
	if (newQueryList.length > 0) {
		newQuery = '?';
		newQuery += newQueryList.join('&');
	}
	return result[1] + result[2] + result[3] + newQuery + result[5];
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
 * https://profile.hatena.ne.jp/alunko/ 一行紹介 記事、コードは全てライセンスフリーです
 */

