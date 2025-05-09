const popupApp = {
    settings: {
        updates: false // Уже обновлялся? Чтоб не дублировать вызов event() в init()
    },

    request_analysis() {

        /**
         * Запрос в analysis_page.js → analysisApp → event
         */
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {popup: 'request_analysis'}, logs => {
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

                                // console.log(log.links);

                                log.links.forEach(link => {
                                    let a = document.createElement('div');
                                    a.classList.add('link');
                                    a.innerHTML = '<svg class="icon"><use xlink:href="#icon-link"></use></svg>';
                                    // a.setAttribute('title', );
                                    // a.addEventListener('click', () => scrollToElement(link));

                                    blockListLinks.append(a);
                                });

                                div.append(blockListLinks);
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

    scrollItems(el, i) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { popup: "scroll_el", el: el, index: i })
        })
    },

    scroll(e) {
        let el = e.target;

        if (el.classList == 'notAlt' || el.classList == 'emptyAlt' || el.classList == 'exceedingSize' || el.classList == 'imgSortFormat') {
            let index = (function () {
                let images = el.parentNode.parentNode.querySelectorAll('img');
                for (let i = 0; i < images.length; i++) {
                    if (images[i] === el) return i;
                }
            })();

            popupApp.scrollItems(el.getAttribute('class'), index);
        }

        if (el.classList == 'btn__empty_link') {
            popupApp.scrollItems('emptylink', el.textContent - 1)
        }
        if (el.classList == 'btn__outer_link') {
            popupApp.scrollItems('outerlink', el.textContent - 1)
        }

    },

    update() {
        popupApp.settings.updates = true;

        let containers = ['header', 'block__error', 'block__warning', 'block__success'];

        containers.forEach(blok => {
            let elPopup = document.querySelector('.' + blok);
            while (elPopup.firstChild) {
                elPopup.removeChild(elPopup.firstChild);
            }
        })

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { popup: "updates" });
        });

        this.init();
    },

    event() {
        if (!popupApp.settings.updates) {
            document.querySelector('.block__error').addEventListener('click', e => popupApp.scroll(e));
            document.querySelector('.block__warning').addEventListener('click', e => popupApp.scroll(e));
            document.querySelector('.update').addEventListener('click', () => this.update());

            document.querySelector('.block__error').addEventListener('click', e => popupApp.imgSave(e));
            document.querySelector('.block__warning').addEventListener('click', e => popupApp.imgSave(e));
        }
    },

    imgSave(e) {
        let el = e.target;
        let idImg;

        if (el.classList == 'btn-img-download') {
            idImg = el.getAttribute('id').split('_')[1];

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { popup: "download_img", id: idImg })
            })
        }
    },

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
                        chrome.tabs.sendMessage(tabs[0].id, {popup: 'getHostname'}, response => {
                            if (popupApp.settings.domens_list.includes(response.hostname)) {
                                popupApp.event();
                                popupApp.request_analysis();
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
                    popupApp.request_analysis();
                    popupApp.event();
                }
            }
            else {
                let messageNotAnalysis = document.createElement('div');
                messageNotAnalysis.innerHTML = `<div class="messageNotAnalysis">${chrome.i18n.getMessage("popup_analysis_disabled_settings")}</div>`;//Анализ выключен в настройках расширения.
                document.querySelector('.header').append(messageNotAnalysis);

                // chrome.browserAction.setIcon({}, function callback)
            }
        });
    }
}

popupApp.init();

document.getElementById('btn_open_options').addEventListener('click', () => chrome.runtime.openOptionsPage());
