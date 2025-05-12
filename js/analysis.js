const analysisApp = {

    /**
     * @namespace {Array.<Object>} - Массив объектов, где каждый элемент это лог с результатом проверки.
     * @property {string} Object[].type - Тип результата проверки: 'success', 'warning' или 'error'
     * @property {string} Object[].msg - Сообщение о результате проверки
     * @property {number} Object[].count - Кол-во ошибок. Необязательно. Если нет, то например для бейджа выводится 1
     */
    logs: [],

    links: {
        /**
         * Ссылки без содержимого (нет текста, картинки или какого либо контента)
         */
        empty: document.querySelectorAll('a:empty'),

        /**
         * Внешние ссылки
         */
        outer: [],

        /**
         * @namespace {Array.<Object>} - Данные внешних ссылок
         * @property {string} Object[].href - Url внешней ссылки для вывода в всплывающей подсказке через атрибут title
         */
        outerLinksData: []
    },

    images: {

        /**
         * Изображения без атрибута alt
         */
        noAlt: document.querySelectorAll('img:not([alt])'),

        /**
         * Изображения с пустым атрибутом alt
         */
        emptyAlt: document.querySelectorAll('img[alt=""]'),

        /**
         * Изображения у которых фактический размер которых больше отображаемого
         */
        sizes: []
    },

    extIdDevelop: 'iflkknjnoociemphgnbobbjgkghanofl',
    extIdMarket: '', // TODO

    listens() {

        /**
         * Слушатель запросов из popup.js
         *
         * @param {object} request 
         * @property {string} request.action - Действие, которое активирует запрос
         * @property {string} request.target - 
         * @property {string} request.type - 
         * @property {number} request.index - 
         * @param {object} sender - Отправитель.
         * @property {string} sender.id
         * @property {string} sender.origin
         * @param {function} sendResponse - отправить ответ
         */
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // console.log(this);

            // TODO расскоментировать после присвоения ID
            // if (sender.id == this.extIdMarket || sender.id == this.extIdDevelop) {

                if (request.action == "request_analysis") {
                    sendResponse(analysisApp.logs);
                }

                /**
                 * Прокрутка к элементу
                 */
                else if (request.action == 'scroll_el') {
                    console.log(request); // {action: 'scroll_el', target: 'link', type: 'TODO', index: 2}

                    /**
                     * Иньекция стилей необходимых для стилизации (подсветки) элементов
                     */
                    if (!analysisApp.cssInjection) {
                        let styles = document.createElement('style');
                        styles.textContent = '.analysis_page_error{border:solid 4px red !important}.analysis_page_error__links{padding:2px 8px;background:#ffdead;border:solid 4px red!important}';
                        // document.querySelector('body').appendChild(styles);

                        if (document.querySelector('head')) {
                            document.querySelector('head').append(styles);
                        }
                        else {
                            document.querySelector('body').append(styles);
                        }

                        analysisApp.cssInjection = true;
                    }

                    /**
                     * Удаление классов analysis_page_error и analysis_page_error__links
                     */
                    document.querySelector('.analysis_page_error') ? document.querySelector('.analysis_page_error').classList.remove('analysis_page_error') : 0;
                    document.querySelector('.analysis_page_error__links') ? document.querySelector('.analysis_page_error__links').classList.remove('analysis_page_error__links') : 0;

                    // let el_id = request.el;

                    // if (request.el == 'notAlt' || request.el == 'emptyAlt' || request.el == 'exceedingSize' || request.el == 'imgSearchFormats') {
                    //     analysisApp.img[el_id][request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                    //     analysisApp.img[el_id][request.index].classList.add('analysis_page_error');
                    // }


                    // if (request.el == 'emptylink') {
                    //     analysisApp.links.empty[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                    //     analysisApp.links.empty[request.index].classList.add('analysis_page_error__links');
                    // }
                    // if (request.el == 'outerlink') {
                    //     analysisApp.links.outer[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                    //     analysisApp.links.outer[request.index].classList.add('analysis_page_error__links');
                    // }

                    let element = analysisApp[request.target][request.type][request.index];
                    element.classList.add('analysis_page_error__links');
                    element.scrollIntoView({block: "center", behavior: "smooth"});
                }

                // if (request.popup == 'updates') {
                //     analysisApp.update();
                // }

                else if (request.action == 'getHostname') {
                    sendResponse({hostname: window.location.hostname});
                }

                // if (request.popup == 'download_img') {
                //     if (request.id == 'imgSearchFormats' || request.id == 'exceedingSize') {
                //         let arr = analysisApp.img[request.id];

                //         for (let i = 0; i < arr.length; i++) {
                //             let imgPath = arr[i].currentSrc.split('/').pop() || arr[i];

                //             if (analysisApp.settings.suffixIMG) {
                //                 analysisApp.settings.suffixIMG.list.forEach(pref => imgPath = imgPath.split(pref)[0]);
                //             }

                //             let a = document.createElement('a');
                //             a.href = '';
                //             a.download = imgPath;
                //             a.style.display = 'none';
                //             document.body.appendChild(a);
                //             a.click();
                //             a.remove();
                //         }
                //     }
                // }
            // }
        });
    },

    /**
     * Склонение окончаний
     * @param {number} n - Число для которого склоняется слово.
     * @param {Array} txt - Вырианты склонений (слова или окончания). Пример: ['1-ошибка', '3-ошибки', '10-ошибок']
     * @returns {string} - Вариант склонения для указанного числа
     */
    sklonenie(n, txt) {
        let cases = [2, 0, 1, 1, 1, 2];
        return txt[(n % 100 > 4 && n % 100 < 20) ? 2 : cases[(n % 10 < 5) ? n % 10 : 5]];
    },

    getImages() {
        document.querySelectorAll('img').forEach(img => {

            /**
             * @namespace
             * @property {string|boolean} src - Атрибут src изображения: false - отсутствует, 'empty' - пустой, 'string' - 
             * @property {string} ext - Расширение изображения: png, gif и т.д.
             * @property {boolean} searchExt - Изображение с расширением которое задано в настройках в поиске изображений заданных форматов
             */
            let imgData = {};

            if (!img.hasAttribute('src')) {
                imgData.src = false;
            }
            else if (img.getAttribute('src') == '') {
                // imgData.srcEmpty = true;
                imgData.src = 'empty';
            }
            else {
                imgData.src = img.currentSrc;

                /**
                 * Искать форматы изображений
                 */
                if (this.settings.imgSearchFormats.active) {
                    let formats = this.stringListToArray(this.settings.imgSearchFormats.list);

                    let arr = img.currentSrc.split('.');

                    imgData.ext = arr[arr.length - 1];

                    if (formats.includes(imgData.ext)) {
                        imgData.searchExt = true;
                    }
                }
            }

        });
    },

    /**
     * Проверка заголовков
     */
    headers() {
        if (document.querySelectorAll('h1').length) {
            if (document.querySelectorAll('h1').length > 1 ) {
                // На странице больше одного заголовка H1 (не рекомендуется) https://developer.mozilla.org/ru/docs/Web/HTML/Element/Heading_Elements#%D0%B8%D0%B7%D0%B1%D0%B5%D0%B3%D0%B0%D0%B9%D1%82%D0%B5_%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BD%D0%B5%D1%81%D0%BA%D0%BE%D0%BB%D1%8C%D0%BA%D0%B8%D1%85_%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%BE%D0%B2_h1_%D0%BD%D0%B0_%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B5
            }
        }
        else {
            // на странице отсутствует заголовок H1
        }


        let allTagsH = document.querySelectorAll(':is(h1, h2, h3, h4, h5, h6)');


        let lavelsTagH = [];

        allTagsH.forEach(h => lavelsTagH.push(Number(h.tagName.split('')[1])));



        let currentLevel = 0;

        lavelsTagH.forEach(tagLavel => {
            if (tagLavel > currentLevel && tagLavel !== currentLevel + 1) {
                // Неправильная структура уровней заголовков.
                console.log('Неправильная структура уровней заголовков.');
            }

            currentLevel = tagLavel;
        });
    },

    /**
     * Проверка тэга <title></title>
     */
    titleAnalysis() {
        if (document.querySelectorAll('head title').length === 1) {
            if (document.querySelector('head title').textContent === '') {
                this.logs.push({
                    type: 'error',
                    msg: 'У страницы пустой тэг title.'
                });
            }
            else {
                this.logs.push({type: 'success', msg: 'У страницы есть тэг title.'});
            }
        }
        else {
            this.logs.push({
                type: 'error',
                msg: 'На странице отсутствует тэг title.'
            });
        }
    },

    /**
     * Анализ meta тэгов
     */
    metaAnalysis() {
        let metadesc = document.querySelector('meta[name="description"]');

        /**
         * Длина Meta Description
         */
        if (this.settings.metadesc.active) {
            if (metadesc === null) {
                this.logs.push({
                    type: 'error',
                    msg: 'У страницы нет Meta Description'
                });
            }
            else if (!metadesc.content.length) {
                this.logs.push({
                    type: 'error',
                    msg: 'Пустой Meta Description'
                });
            }
            else if (this.settings.metadesc.active) {
                if (metadesc.content.length < this.settings.metadesc.min) {
                    this.logs.push({
                        type: 'error',
                        msg: `Длина Meta Description меньше ${ this.settings.metadesc.min } символ${ this.sklonenie(metadesc.content.length, ['а', 'ов', 'ов']) }`
                    });
                }
                else if (metadesc.content.length > this.settings.metadesc.max) {
                    this.logs.push({
                        type: 'error',
                        msg: `Длина Meta Description больше ${ this.settings.metadesc.max } символ${ this.sklonenie(metadesc.content.length, ['а', 'ов', 'ов']) }`
                    });
                }
                else {
                    this.logs.push({
                        type: 'success',
                        msg: `Длина Meta Description ${ metadesc.content.length } символ${ this.sklonenie(metadesc.content.length, ['', 'а', 'ов']) }`
                    });
                }
            }
        }

        /**
         * Повторяющийся Meta Description
         */
        if (this.settings.metadesc_repeat.active) {
            let domensRepeat = this.settings.metadesc_repeat.list.filter(item => item[0] == window.location.hostname);

            domensRepeat.forEach(d => {
                if (d[1] === metadesc.content && metadesc.content.length) {
                    this.logs.push({
                        type: 'warning',
                        msg: 'Обнаружено повторяющийся Meta Description',
                        content: metadesc.content
                    });
                }
            });
        }

        /**
         * Meta Keywords
         */
        if (this.settings.metakey) {
            let metakey = document.querySelector('meta[name="keywords"]');

            if (metakey === null) {
                this.logs.push({
                    type: 'error',
                    msg: 'У страницы нет Meta Keywords'
                });
            }
            else if (!metakey.content.length) {
                this.logs.push({
                    type: 'error',
                    msg: 'Пустой Meta Keywords'
                });
            }
            else {
                let arrKeywords = metakey.content.split(',').map(str => str.trim());

                this.logs.push({
                    type: 'success',
                    msg: 'У страницы есть Meta Keywords',
                    tags: arrKeywords // TODO определить ключ согласно выводу. Вырианты: tags, keys, labels
                });
            }
        }
    },

    /**
     * Анализ изображений
     *
     * Анализирует:
     * - наличие атрибута src
     * - пустой атрибут src
     * - наличие атрибута alt
     * - закрывающий тэг со слэшем
     *
     * Не анализирует есть ли указанное изображение на сервере.
     */
    imagesAnalysis() {

        /**
         * Поиск изображений заданных форматов
         */
        if (this.settings.imgSearchFormats.active) {
            // document.querySelectorAll('[src$=".png"]');

            let formats = this.stringListToArray(this.settings.imgSearchFormats.list);

            // let imagesFormats = document.querySelectorAll('[src$=".png"]');
        }

        document.querySelectorAll('img').forEach(img => {

            /**
             * Проверка размеров изображения
             *    - отображаемые размеры (clientWidth, clientHeight)
             *    - фактические размеры (naturalWidth, naturalHeight)
             */
            if ((img.clientWidth < img.naturalWidth) || (img.clientHeight < img.naturalHeight)) {
                this.images.sizes.push(img);
            }


            /**
             * Поиск изображений заданных форматов
             */
            if (this.settings.imgSearchFormats.active) {
                
            }


            /**
             * Слэш в закрывающем теге
             * Браузер удаляет слэш и поэтому его не видно???
             */
            // img.outerHTML.substring(img.outerHTML.length - 2);
            // console.log(img.outerHTML.substring(img.outerHTML.length - 2));

        });


        // if (this.images.noAlt.length > 0 || this.images.emptyAlt.length > 0) {
        //     this.logs.push({
        //         type: 'error',
        //         msg: `Обнаружено ${ this.images.noAlt.length + this.images.emptyAlt.length } изображений у которых отсутствует или пустой атрибут alt.`,
        //         count: this.images.noAlt.length + this.images.emptyAlt.length,
        //         typeImages: '' // noAlt || emptyAlt
        //     });
        // }

        if (this.images.noAlt.length > 0) {
            this.logs.push({
                type: 'error',
                msg: `Обнаружено ${ this.images.noAlt.length } изображений у которых отсутствует атрибут alt.`,
                count: this.images.noAlt.length,
                typeImages: 'noAlt'
            });
        }

        if (this.images.emptyAlt.length > 0) {
            this.logs.push({
                type: 'error',
                msg: `Обнаружено ${ this.images.emptyAlt.length } изображений у которых пустой атрибут alt.`,
                count: this.images.emptyAlt.length,
                typeImages: 'emptyAlt'
            });
        }


        if (this.images.sizes.length > 0) {
            this.logs.push({
                type: 'error',
                msg: `Обнаружено ${ this.images.sizes.length } изображений фактический размер которых больше отображаемого. Эти изображения требуют отдельной оптимизации.`,
                count: this.images.sizes.length,
                typeImages: 'sizes'
            });
        }

    },

    /**
     * Анализ ссылок
     */
    linksAnalysis() {
        if (this.links.empty.length > 0) {
            this.logs.push({
                type: 'error',
                msg: `На странице обнаружено ${ this.links.empty.length } ${ this.sklonenie(this.links.empty.length, ['пустая ссылка', 'пустые ссылки', 'пустых ссылок']) } (без содержимого).`,
                count: this.links.empty.length,
                links: this.links.empty,
                typeLinks: 'empty'
            });
        }


        document.querySelectorAll('a').forEach(link => {
            if (link.hostname && link.hostname !== window.location.hostname) {
                this.links.outerLinksData.push({href: link.href});
                this.links.outer.push(link);
            }
        });

        if (this.links.outer.length > 0) {
            this.logs.push({
                type: 'warning',
                msg: `На странице обнаружено ${ this.links.outer.length } ${ this.sklonenie(this.links.outer.length, ['внешняя ссылка', 'внешних ссылки', 'внешних ссылок']) }.`,
                count: this.links.outer.length,
                links: this.links.outerLinksData,
                typeLinks: 'outer'
            });
        }
    },

    /**
     * 
     * @returns {Array}
     */
    getLinks() {
        let links = [];

        document.querySelectorAll('a').forEach(link => {
            /**
             * @namespace
             * @property {object} data - Данные с анализом ссылки
             * @property {boolean} data.missingHref - Отсутствует атрибут href
             * @property {boolean} data.emptyHref - Пустой атрибут href
             * @property {boolean} data.external - Это внешняя ссылка
             * @property {NodeElement} data.node - Сама ссылка как DOM-элемент
             */
            let data = {
                node: link
            }


            if (link.hasAttribute('href')) {
                data.missingHref = false;

                data.emptyHref = link.getAttribute('href') === '';

                if (data.emptyHref) {
                    data.external = link.hostname !== window.location.hostname;
                }
            }
            else {
                data.missingHref = true;
            }


            if (data.missingHref || data.emptyHref) {
                links.push(data);
            }
            else if (this.settings.outerLinks && data.external) {
                links.push(data);
            }
        });

        return links;
    },

    /**
     * Проверка длины текста на заданный диапазон (от .. до ..)
     *
     * @param {string} txt
     * @returns {boolean}
     */
    checkLengthInGivenRange(txt) {
        let min = this.settings.metadesc.min || 140;
        let max = this.settings.metadesc.max || 160;

        if (txt.length >= min && txt.length <= max) {
            return true;
        }
        // if (txt.length >= this.settings.metadesc.min && txt.length <= this.settings.metadesc.max) {
        //     return true;
        // }

        return false;
    },

    /**
     * Анализ заголовков
     */
    headlineAnalysis() {
        let headlines = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

        headlines.forEach(headline => {
            // let currentH = headline.tagName.replace('H', '');
        });
    },

    controlAnalysis() {
        console.log(this.settings);

        this.titleAnalysis();
        this.metaAnalysis();
        this.linksAnalysis();
        this.imagesAnalysis();

        // this.headlineAnalysis();
        // console.log(this.getLinks());



        this.listens();
        console.log(this.logs);

        /**
         * Отправка кол-ва ошибок и предупреждений в background.js для вывода их в бейдже на иконке расширения
         */
        let countWarningLogs = this.logs.filter(log => log.type == 'warning').length;
        let countErrorLogs = this.logs.filter(log => log.type == 'error').length;

        chrome.runtime.sendMessage({errors: countErrorLogs, warnings: countWarningLogs});
    },

    /**
     * Преобразовует строку в массив
     *
     * @param {string} string - Строка с перечисленными через запятую элементами
     * @returns {Array} - Массив из строк
     */
    stringListToArray(string) {
        if (typeof string === 'string') {
            return string.split(',').map(el => el.trim());
        }

        return [];
    },

    init() {
        if (this.settings.analysis) {
            if (this.settings.domens.active) {
                let domens = this.stringListToArray(this.settings.domens.list);

                if (domens.includes(window.location.hostname)) {
                    this.controlAnalysis();
                }
            }
            else {
                this.controlAnalysis();
            }
        }
        else {
            // Анализ выключен в настройках расширения
        }
    },

    /**
     * Устанавливает свойство settings - объект содержащий настройки расширения
     */
    setSettings() {
        chrome.storage.sync.get(['settings']).then((result) => {
            this.settings = result.settings;

            this.init();
        });
    }
}

addEventListener('load', analysisApp.setSettings.bind(analysisApp));
