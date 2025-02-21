document.querySelectorAll('[data-lang], [data-lang-html], [data-lang-title]').forEach(langEl => {
    if (langEl.hasAttribute('data-lang')) {
        langEl.textContent = chrome.i18n.getMessage(langEl.dataset.lang);
        langEl.removeAttribute('data-lang');
    }

    if (langEl.hasAttribute('data-lang-html')) {
        langEl.innerHTML = chrome.i18n.getMessage(langEl.dataset.langHtml);
        langEl.removeAttribute('data-lang-html');
    }

    if (langEl.hasAttribute('data-lang-title')) {
        langEl.setAttribute('title', chrome.i18n.getMessage(langEl.dataset.langTitle));
        langEl.removeAttribute('data-lang-title');
    }
});