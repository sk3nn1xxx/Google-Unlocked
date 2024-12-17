// ==UserScript==
// @name         Google Unlocked
// @version      2.8
// @description  Displays a list of hidden URLs from Lumen Database links in Google search results.
// @author       sk3nn1x
// @license      MIT
// @include      *://www.google.*/*
// @grant        GM_xmlhttpRequest
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @noframes
// @namespace    https://github.com/sk3nn1xxx/Google-Unlocked
// @homepageURL  https://github.com/sk3nn1xxx/Google-Unlocked
// @supportURL   https://github.com/sk3nn1xxx/Google-Unlocked/issues
// ==/UserScript==

(function () {
    const domainCountMap = new Map(); // Deduplicated domain count tracker

    // Fetch and process Lumen links
    function processLumenLinks() {
        const lumenLinks = $('a[href*="lumendatabase.org"]');
        if (!lumenLinks.length) {
            console.log("[Google Unlocked] No Lumen links found on this page.");
            return;
        }

        lumenLinks.each((index, link) => {
            const url = link.href;

            GM_xmlhttpRequest({
                method: 'GET',
                url: url,
                onload: (response) => {
                    if (response.status === 200) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(response.responseText, 'text/html');
                        const infringingURLs = $(doc).find('li.infringing_url');

                        infringingURLs.each((i, el) => {
                            const urlText = $(el).text().trim();
                            const domain = urlText.split(' - ')[0];

                            domainCountMap.set(domain, (domainCountMap.get(domain) || 0) + 1);
                        });

                        addListToBottom();
                    }
                },
            });
        });
    }

    // Add the simple list of links to the bottom of the page
    function addListToBottom() {
        const $existingList = $('#unlocked-urls-list');
        if ($existingList.length) $existingList.remove(); // Remove previous list

        const listHTML = Array.from(domainCountMap.entries())
            .map(([domain]) => `<li><a href="http://${domain}" target="_blank">${domain}</a></li>`)
            .join('');

        $('body').append(`
            <div id="unlocked-urls-list" style="margin: 20px; padding: 10px;">
                <ul>${listHTML}</ul>
            </div>
        `);
    }

    // Initialize
    function init() {
        processLumenLinks();
    }

    init();
})();
