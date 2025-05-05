const popupApp = {
    settings: {
        updates: false // Уже обновлялся? Чтоб не дублировать вызов event() в init()
    },

    request_analysis() {
        // Запрос в analysis_page.js → analysisApp → event
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {popup: 'request_analysis'}, function (response) {
                const popupHeader = document.querySelector('.header'),
                    blockErrors = document.querySelector('.block__errors'),
                    blockWarning = document.querySelector('.block__warning'),
                    blockSuccess = document.querySelector('.block__success');


                let errWarn = document.createElement('p');
                if (response.errors >= 1 || response.warnings >= 1) {
                    errWarn.innerHTML = `<span class="badge badge-danger">${response.errors}</span> - ${popupApp.sklonenie(response.errors, [chrome.i18n.getMessage("popup_error_1"), chrome.i18n.getMessage("popup_errors_3"), chrome.i18n.getMessage("popup_errors_10")/*'ошибка', 'ошибки', 'ошибок'*/])}, <span class="badge badge-warning">${response.warnings}</span> - ${popupApp.sklonenie(response.warnings, [chrome.i18n.getMessage("popup_warning_1"), chrome.i18n.getMessage("popup_warnings_3"), chrome.i18n.getMessage("popup_warnings_10")/*'предупреждение', 'предупреждения', 'предупреждений'*/])}`;

                    if (response.errors >= 1) {
                        let title = document.createElement('h2');
                        title.innerHTML = chrome.i18n.getMessage("popup_errors");// 'Ошибки';
                        blockErrors.append(title);
                    }
                    if (response.warnings >= 1) {
                        let title = document.createElement('h2');
                        title.textContent = chrome.i18n.getMessage("popup_warnings");// 'Предупреждения';
                        blockWarning.append(title);
                    }
                } else errWarn.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_not_errors");// 'Нет ошибок';

                popupHeader.append(errWarn);

                let titleBlockSuccess = document.createElement('h2');
                titleBlockSuccess.textContent = chrome.i18n.getMessage("popup_success_check");// 'Успешные проверки';
                blockSuccess.append(titleBlockSuccess);


                let errSemantic = document.createElement('p');
                if (response.semantic.tags) {
                    errSemantic.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_suc_semantik");// 'Есть семантическая разметка';
                    blockSuccess.append(errSemantic);

                } else {
                    errSemantic.innerHTML = '<span class="badge badge-danger">1</span>' + chrome.i18n.getMessage("popup_err_semantik");// 'На странице нет семантической разметки';
                    blockErrors.append(errSemantic);
                }


                let siteTitle = document.createElement('p');
                if (!response.title) {
                    siteTitle.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_title");// 'У страницы отсутствует Title';
                    blockErrors.append(siteTitle);
                } else {
                    siteTitle.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_suc_title");// 'У страницы есть Title';
                    blockSuccess.append(siteTitle);
                }


                if (response.meta) {
                    let metadesc = document.createElement('div'),
                        metatitle = document.createElement('p'),
                        metaText = document.createElement('div');

                    metaText.className = 'text__analysis';

                    if (popupApp.settings.metadesc) {
                        if (response.meta['desc']) {
                            if (response.meta['descSize'] < response.meta['min'] || response.meta['descSize'] > response.meta['max']) {
                                metatitle.innerHTML = `<span class="badge badge-danger">1</span> Длина Meta-Description ${response.meta.descSize} ${popupApp.sklonenie(response.meta.descSize, ['символ', 'символа', 'символов'])} (не входит в диапазон ${response.meta['min']}-${response.meta['max']} символов)`;
                                metaText.innerHTML = response.meta['desc'];
                                metadesc.append(metatitle);
                                metadesc.append(metaText);
                                blockErrors.append(metadesc);
                            }
                            else {
                                metatitle.innerHTML = `<span class="badge badge-success">✔</span> Длина Meta-Description ${response.meta.descSize} ${popupApp.sklonenie(response.meta.descSize, ['символ', 'символа', 'символов'])}`;
                                metaText.innerHTML = response.meta['desc'];
                                metadesc.append(metatitle);
                                metadesc.append(metaText);
                                blockSuccess.append(metadesc);
                            }
                        }
                        else { // Отсутствует Meta Description
                            metatitle.innerHTML = `<span class="badge badge-danger">1</span> ${chrome.i18n.getMessage("popup_err_metadesc")}`;
                            metadesc.append(metatitle);
                            blockErrors.append(metadesc);
                        }
                    }
                } else {
                    let metadescErr = document.createElement('p');
                    metadescErr.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_metadesc");// 'У страницы нет Meta Description';
                    blockErrors.append(metadescErr);
                }

                if (popupApp.settings.metadesc_repeat) {
                    if (response.meta.repeat) {
                        let metarepeat = document.createElement('p');
                        metarepeat.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_metadesc_repeat");// 'Meta-Description повторяется';
                        blockErrors.append(metarepeat);
                    }
                }

                if (popupApp.settings.metakey) {
                    let mtkey = document.createElement('div');
                    if ( response.meta.keywords && response.meta.keywords !== '' ) {
                        let metakey = response.meta.keywords.split(','),
                        tags = '';

                        for (let i = 0; i < metakey.length; i++) {
                            tags += `<label class="mtkey"><svg class="icon icon-settings"><use xlink:href="#icon-tag"></use></svg> ${metakey[i]}</label>`;
                        }
                        mtkey.innerHTML = `<p><span class="badge badge-success">✔</span> ${chrome.i18n.getMessage("popup_suc_metakey")}</p><div>${tags}</div>`;// 'У страницы есть Meta Keywords'
                        blockSuccess.append(mtkey); 
                    }
                    else {
                        mtkey.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_metakey");// 'У страницы нет Meta Keywords';
                        blockErrors.append(mtkey);
                    }
                }

                if (response.headlines) {
                    if (response.headlines.h1 !== 1) {
                        let h1 = document.createElement('p');
                        if (response.headlines.h1 < 1) {
                            h1.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_h1");// 'Отсутствует заголовок H1';
                            blockErrors.append(h1);
                        }
                        else if (response.headlines.h1 > 1) {
                            h1.innerHTML = `<span class="badge badge-danger">${response.headlines.h1}</span> На странице ${response.headlines.h1} ${popupApp.sklonenie(response.headlines.h1, ['заголовок', 'заголовка', 'заголовков'])} H1`;
                            blockErrors.append(h1);
                        }
                        else {
                            h1.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_suc_h1");// 'На странице есть заголовок H1';
                            blockSuccess.append(h1);
                        }
                    }
                } else {
                    let headlines = document.createElement('p');
                    headlines.innerHTML = '<span class="badge badge-danger">1</span> ' + chrome.i18n.getMessage("popup_err_not_headlines");// 'На странице отсутствуют заголовки';
                    blockErrors.append(headlines);
                }

                if (response.links.empty >= 1) {
                    let a = `<h3><span class="badge badge-danger">${response.links.empty}</span> На странице ${response.links.empty} ${popupApp.sklonenie(response.links.empty, ['пустая ссылка', 'пустых ссылки', 'пустых ссылок'])}:</h3>`;
                    let l = (function () {
                        for (let i = 0; i < response.links.empty; i++) {
                            a += `<div class="btn__empty_link">${i + 1}</div>`;
                        }
                        return a;
                    })();
                    let links = document.createElement('div');
                    links.classList = 'err_links';
                    links.innerHTML = l + '<hr>';
                    blockErrors.append(links);
                } else {
                    let emptyLinks = document.createElement('p');
                    emptyLinks.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_suc_emptyLinks");// 'Пустых ссылок нет';
                    blockSuccess.append(emptyLinks);
                }

                if (response.img.notAlt.length >= 1 || response.img.emptyAlt.length >= 1) {
                    if (response.img.notAlt.length >= 1) {
                        let title = `<h3><span class="badge badge-danger">${response.img.notAlt.length}</span> ${chrome.i18n.getMessage("popup_err_notAlt")}</h3>`;// Отсутствует атрибут alt:

                        popupApp.generatorImgItems('notAlt', response.img.notAlt, 'errors', title, response.img.prefix);
                    }

                    if (response.img.emptyAlt.length >= 1) {
                        let title = `<h3><span class="badge badge-danger">${response.img.emptyAlt.length}</span> ${chrome.i18n.getMessage("popup_err_emptyAlt")}</h3>`;// Пустой атрибут alt:

                        popupApp.generatorImgItems('emptyAlt', response.img.emptyAlt, 'errors', title, response.img.prefix);
                    }
                } else {
                    let imgAlt = document.createElement('p');
                    imgAlt.innerHTML = '<span class="badge badge-success">✔</span> ' + chrome.i18n.getMessage("popup_suc_alt");// 'Атрибут Alt заполнен у всех изображений';
                    blockSuccess.append(imgAlt);
                }

                if (response.img.exceedingSize.length >= 1) { // exceedingSizeProportions [clientWidth, clientHeight, naturalWidth, naturalHeight]
                    let title = `<h3><span class="badge badge-danger">${response.img.exceedingSize.length}</span> ${chrome.i18n.getMessage("popup_err_non_optimized_images")}</h3>
                    <p class="small">${chrome.i18n.getMessage("popup_err_non_optimized_images_desc")}</p>`;//у которых отображаемый размер меньше оригинального

                    popupApp.generatorImgItems('exceedingSize', response.img.exceedingSize, 'errors', title, response.img.prefix, response.img.exceedingSizeProportions);
                }

                if (response.img.imgSortFormat && response.img.imgSortFormat.length >= 1) { // Поиск изображений заданный форматов (png, gif)
                    let title = `<h3><span class="badge badge-warning">${response.img.imgSortFormat.length}</span> ${chrome.i18n.getMessage("popup_Images")} ${response.img.formats.join(', ')}:</h3>`;// Изображения

                    popupApp.generatorImgItems('imgSortFormat', response.img.imgSortFormat, 'warning', title, response.img.prefix);
                }

                if (response.links.outer >= 1) {
                    let outerLinks = document.createElement('div');
                    outerLinks.classList = 'outer_links';
                    let html = `<h3><span class="badge badge-warning">${response.links.outer}</span> ${chrome.i18n.getMessage("popup_outerLinks")}</h3><p>На странице ${response.links.outer} ${popupApp.sklonenie(response.links.outer, ['внешняя ссылка', 'внешние ссылки', 'внешних ссылок'])}:</p>`;// Внешние ссылки + 
                    let l = (function () {
                        for (let i = 0; i < response.links.outer; i++) {
                            html += `<div class="btn__outer_link">${i + 1}</div>`;
                        }
                        return html;
                    })();
                    outerLinks.innerHTML = l + '<hr>';
                    blockWarning.append(outerLinks);
                }

                if (response.errors >= 1) {
                    let hrE = document.createElement('hr');
                    blockErrors.append(hrE);
                }
                if (response.warnings >= 1) {
                    let hrW = document.createElement('hr');
                    blockWarning.append(hrW);
                }
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

        let containers = ['header', 'block__errors', 'block__warning', 'block__success'];

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
            document.querySelector('.block__errors').addEventListener('click', e => popupApp.scroll(e));
            document.querySelector('.block__warning').addEventListener('click', e => popupApp.scroll(e));
            document.querySelector('.update').addEventListener('click', () => this.update());

            document.querySelector('.block__errors').addEventListener('click', e => popupApp.imgSave(e));
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
