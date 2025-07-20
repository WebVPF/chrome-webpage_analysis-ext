const popupApp = {

    /**
     * Запрос в analysis_page.js → analysisApp → event
     */
    getAnalysis() {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'request_analysis'}, logs => {
                console.log(logs);

                ['error', 'warning', 'success'].forEach(typeTxt => {
                    let typeLogs = logs.filter(log => log.type == typeTxt);

                    if (typeLogs.length >= 1) {
                        const blockLogs = document.querySelector(`.block__${ typeTxt }`);

                        let titleBlock = document.createElement('h2');
                        titleBlock.textContent = chrome.i18n.getMessage(`heading_${ typeTxt }`);
                        blockLogs.append(titleBlock);

                        typeLogs.forEach(log => {
                            let wrap = document.createElement('div');

                            let badge = document.createElement('span');
                            badge.classList.add('badge', `badge-${ typeTxt }`);
                            badge.textContent = log.hasOwnProperty('count') ? log.count : 1;

                            let div = document.createElement('div');
                            div.insertAdjacentText('beforeend', log.msg);

                            wrap.append(badge, div);

                            if (log.hasOwnProperty('quote')) {
                                const quote = document.createElement('blockquote');
                                quote.textContent = log.quote;

                                div.append(quote);
                            }

                            if (log.hasOwnProperty('tags')) {
                                let blockListTags = document.createElement('div');
                                blockListTags.classList.add('flex-mtkey');

                                log.tags.forEach(tag => {
                                    let label = document.createElement('div');
                                    label.classList.add('mtkey');
                                    // label.innerHTML = `<svg class="icon"><use xlink:href="#icon-key"></use></svg> ${ tag }`;
                                    label.innerHTML = tag;

                                    blockListTags.append(label);
                                });

                                div.append(blockListTags);
                            }

                            if (log.hasOwnProperty('content')) {
                                let contentDiv = document.createElement('blockquote');
                                contentDiv.textContent = log.content;
                                div.append(contentDiv);
                            }

                            if (log.hasOwnProperty('links')) {
                                let blockListLinks = document.createElement('div');
                                blockListLinks.classList.add('flex-links');

                                for (let i = 0; i < log.count; i++) {
                                    let a = document.createElement('div');
                                    a.classList.add('link');
                                    a.innerHTML = '<svg class="icon"><use xlink:href="#icon-link"></use></svg>';

                                    if (log.links[i].hasOwnProperty('href')) {
                                        a.setAttribute('title', log.links[i].href);
                                    }

                                    a.addEventListener('click', () => popupApp.scrollToElement({
                                        target: 'links',
                                        type: log.typeLinks,
                                        index: i
                                    }));

                                    blockListLinks.append(a);
                                }

                                div.append(blockListLinks);
                            }

                            if (log.hasOwnProperty('typeImages')) {
                                let blockListImages = document.createElement('div');
                                blockListImages.classList.add('flex-links');

                                for (let i = 0; i < log.count; i++) {
                                    let imgEl = document.createElement('div');
                                    imgEl.classList.add('img-el');
                                    imgEl.innerHTML = '<svg class="icon"><use xlink:href="#icon-image"></use></svg>';

                                    imgEl.addEventListener('click', () => popupApp.scrollToElement({
                                        target: 'images',
                                        type: log.typeImages,
                                        index: i
                                    }));

                                    blockListImages.append(imgEl);
                                }

                                div.append(blockListImages);
                            }

                            /**
                             * Повторяющиеся ID
                             */
                            if (log.hasOwnProperty('listID')) {
                                const blockListAnchors = document.createElement('div');
                                blockListAnchors.classList.add('anchors');

                                log.listID.forEach(anchor => {
                                    const anchorElement = document.createElement('div');
                                    anchorElement.classList.add('anchor');

                                    const iconElement = document.createElement('div');
                                    iconElement.innerHTML = '<svg class="icon"><use xlink:href="#icon-anchor"></use></svg>';

                                    const textAnchorElement = document.createElement('div');
                                    textAnchorElement.textContent = anchor;

                                    anchorElement.append(iconElement, textAnchorElement);

                                    blockListAnchors.append(anchorElement);
                                });

                                div.append(blockListAnchors);
                            }

                            blockLogs.append(wrap);
                        });
                    }
                });

                // let p = document.createElement('p');
                // if (errorLogs.length >= 1 || warningLogs.length >= 1) {
                //     p.innerHTML = `<span class="badge badge-danger">${ errorLogs.length }</span> - ${popupApp.sklonenie(errorLogs.length, [chrome.i18n.getMessage("popup_error_1"), chrome.i18n.getMessage("popup_errors_3"), chrome.i18n.getMessage("popup_errors_10")/*'ошибка', 'ошибки', 'ошибок'*/])}, <span class="badge badge-warning">${warningLogs.length}</span> - ${popupApp.sklonenie(warningLogs.length, [chrome.i18n.getMessage("popup_warning_1"), chrome.i18n.getMessage("popup_warnings_3"), chrome.i18n.getMessage("popup_warnings_10")/*'предупреждение', 'предупреждения', 'предупреждений'*/])}`;
                // }
                // else {
                //     // Нет ошибок
                //     p.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_not_errors");
                // }

                // popupHeader.append(p);
            });
        });
    },

    generatorImgItems(id, arrImg, typeError, title, prefixes, proportions) {
        let img ='';

        arrImg.forEach((el, i) => {
            let imgPath = el.replace(/https?\:\/\/([^\/]+)/, '');
            prefixes[0].length !== 0 ? prefixes.forEach(pref => imgPath = imgPath.split(pref)[0]) : 0;

            if (id == 'exceedingSize') {
                imgPath = `Выводится в размере: ${proportions[i][0]}×${proportions[i][1]}px<br>Оригинальный размер: ${proportions[i][2]}×${proportions[i][3]}px<br>`  + imgPath;
            }

            img += `<div><img class="${id}" src="${el}"><div class="path_faile">${imgPath}</div></div>`;
        });

        let imgBlock = document.createElement('div');
        imgBlock.classList = 'err-images';
        imgBlock.innerHTML = title + img + `<button id="save_${id}" class="btn-img-download"><svg class="icon icon-download"><use xlink:href="#icon-download"></use></svg> ${chrome.i18n.getMessage("popup_downloadAll")}</button>`;// Скачать все
        document.querySelector('.block__' + typeError).append(imgBlock);
    },

    /**
     * @namespace
     * @param {object} params 
     * @property {string} params.target - 'link', 'img'
     * @property {string} params.type 
     * @property {number} params.index - порядковый номер элемента
     */
    scrollToElement(params) {
        chrome.tabs.query({active: true, currentWindow: true}, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, Object.assign({action: 'scroll_el'}, params));
        });
    },

    /**
     * Обновить/выполнить заново анализ страницы
     */
    update() {
        ['header', 'block__error', 'block__warning', 'block__success'].forEach(selector => {
            let elPopup = document.querySelector(`.${ selector }`);
            while (elPopup.firstChild) {
                elPopup.removeChild(elPopup.firstChild);
            }
        })

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'updates'});
        });

        this.getAnalysis();
    },

    event() {
        document.getElementById('btn_update').addEventListener('click', () => this.update());
        document.getElementById('btn_open_options').addEventListener('click', () => chrome.runtime.openOptionsPage());

        // document.querySelector('.block__error').addEventListener('click', e => popupApp.imgSave(e));
        // document.querySelector('.block__warning').addEventListener('click', e => popupApp.imgSave(e));
    },

    // imgSave(e) {
    //     let el = e.target;
    //     let idImg;

    //     if (el.classList == 'btn-img-download') {
    //         idImg = el.getAttribute('id').split('_')[1];

    //         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //             chrome.tabs.sendMessage(tabs[0].id, { popup: "download_img", id: idImg })
    //         })
    //     }
    // },

    sklonenie(num, txt) {
        let cases = [2, 0, 1, 1, 1, 2];
        return txt[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];

        //popupApp.sklonenie(number, ['1-ошибка', '3-ошибки', '10-ошибок']);
    },

    init() {
        // document.querySelector('button.update').innerHTML = '<svg class="icon icon-update"><use xlink:href="#icon-update"></use></svg> ' + chrome.i18n.getMessage("popup_update");
        // document.querySelector('button#settings_page').innerHTML = '<svg class="icon icon-settings"><use xlink:href="#icon-settings"></use></svg> ' + chrome.i18n.getMessage("popup_settings");

        /**
         * Получение и установка настроек, запрос анализа
         */
        chrome.storage.sync.get(['settings']).then((result) => {
            this.settings = result.settings;

            if (result.settings.analysis) {
                if (result.settings.domens.active) {
                    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                        /**
                         * Запрос анализируемого домена
                         */
                        chrome.tabs.sendMessage(tabs[0].id, {action: 'getHostname'}, response => {
                            if (popupApp.settings.domens_list.includes(response.hostname)) {
                                popupApp.event();
                                popupApp.getAnalysis();
                            }
                            else {
                                let messageNotAnalysis = document.createElement('div');
                                messageNotAnalysis.innerHTML = `<div class="messageNotAnalysis">${chrome.i18n.getMessage("popup_analysis_site_disabled")} ${response.request_host}</div>`;// Анализ выключен для сайта
                                document.querySelector('.header').append(messageNotAnalysis);
                            }
                        })
                    });
                }
                else {
                    popupApp.getAnalysis();
                    popupApp.event();
                }
            }
            else {
                let messageNotAnalysis = document.createElement('div');
                messageNotAnalysis.innerHTML = `<div class="messageNotAnalysis">${chrome.i18n.getMessage("popup_analysis_disabled_settings")}</div>`;//Анализ выключен в настройках расширения.
                document.querySelector('.header').append(messageNotAnalysis);

                // chrome.browserAction.setIcon({}, function callback);
            }
        });
    }
}

popupApp.init();
