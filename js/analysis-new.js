const analysis = {
    extIdDevelop: 'iflkknjnoociemphgnbobbjgkghanofl',
    extIdMarket: '', // TODO

    listens() {
        /**
         * Слушатель запросов из popup.js
         */
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            // console.log(this);


            if (sender.id == this.idMarket || sender.id == this.extIdDevelop) {
                // if (request.popup == "request_analysis") {
                //     sendResponse(analysisApp.reply);
                // }

                // if (request.popup == 'scroll_el') {

                //     if (!analysisApp.styles) {
                //         let styles = document.createElement('style');
                //         styles.textContent = '.analysis_page_error{border:solid 4px red !important}.analysis_page_error__links{padding:2px 8px;background:#ffdead;border:solid 4px red!important}';
                //         document.querySelector('body').appendChild(styles);

                //         analysisApp.styles = true;
                //     }

                //     document.querySelector('.analysis_page_error') ? document.querySelector('.analysis_page_error').classList.remove('analysis_page_error') : 0;
                //     document.querySelector('.analysis_page_error__links') ? document.querySelector('.analysis_page_error__links').classList.remove('analysis_page_error__links') : 0;

                //     let el_id = request.el;

                //     if (request.el == 'notAlt' || request.el == 'emptyAlt' || request.el == 'exceedingSize' || request.el == 'imgSearchFormats') {
                //         analysisApp.img[el_id][request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                //         analysisApp.img[el_id][request.index].classList.add('analysis_page_error');
                //     }


                //     if (request.el == 'emptylink') {
                //         analysisApp.links.empty[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                //         analysisApp.links.empty[request.index].classList.add('analysis_page_error__links');
                //     }
                //     if (request.el == 'outerlink') {
                //         analysisApp.links.outer[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                //         analysisApp.links.outer[request.index].classList.add('analysis_page_error__links');
                //     }

                // }

                // if (request.popup == 'updates') {
                //     analysisApp.update();
                // }

                if (request.popup == 'getHostname') {
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
            }
        });
    },

    /**
     * Анализ изображений на странице
     *
     * Анализирует:
     * - наличие атрибута src
     * - пустой атрибут src
     * - наличие атрибута alt
     * - закрывающий тэг со слэшем
     *
     * Не анализирует есть ли указанное изображение на сервере.
     */
    getImages() {
        let images = [];

        document.querySelectorAll('img').forEach(img => {
            let error = false;

            // console.dir(img);

            // let imgData = {
            //     path: '',
            //     src: '', // false, 'empty' или ''
            //     srcEmpty: '',
            //     alt: '',
            //     altEmpty: '',
            //     searchExt: true,
            // }

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

                /**
                 * Слэш в закрывающем теге
                 * Браузер удаляет слэш и поэтому его не видно???
                 */
                // img.outerHTML.substring(img.outerHTML.length - 2);
                // console.log(img.outerHTML.substring(img.outerHTML.length - 2));
                
            }


            if (!img.hasAttribute('alt')) {
                // у изображения отсутствует alt-атрибут
                imgData.alt = false;
            }
            else if (img.getAttribute('alt') == '') {
                imgData.alt = 'empty';
            }


            /**
             * Отображаемый (clientWidth, clientHeight) и фактический (naturalWidth, naturalHeight) размер
             */
            if ((img.clientWidth < img.naturalWidth) || (img.clientHeight < img.naturalHeight)) {

            }





            if (error) {
                images.push(imgLogs);
            }

            // console.dir(img);
            // console.log(imgData);

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
     * 
     */
    title() {
        if (document.querySelectorAll('head title').length === 1) {

        }
        else {

        }
    },

    /**
     * 
     */
    tags() {

    },

    linksAnalysis() {
        let links = [];

        document.querySelectorAll('a').forEach(link => {
            /**
             * @namespace
             * @property {object} data - Данные с анализом ссылки
             * @property {boolean} data.empty - Отсутствует атрибут href
             * @property {boolean} data.external - Внешняя ссылка
             */
            let data = {};

            if (link.hasAttribute('href')) {
                data.empty = false;

                if (link.getAttribute('href') === '') {

                }

                if (link.hostname && link.hostname !== window.location.hostname) {
                    data.external = true;
                }
            }
            else {
                data.empty = true;
            }
        });
    },

    /**
     * Проверка длины текста на заданный диапазон (от .. до ..)
     *
     * @param {string} txt
     * @returns {boolean}
     */
    checkLengthInGivenRange(txt) {
        if (txt.length >= this.settings.metadesc.min && txt.length <= this.settings.metadesc.max) {
            return true;
        }

        return false;
    },

    /**
     * Анализ meta
     *
     * Длина Meta Description
     * Meta Keywords
     */
    metaAnalysis() {

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
        // this.metaAnalysis();
        // this.headlineAnalysis();


        this.getImages();



        this.listens();
        // console.log();
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
            // Анализ выключен в настройках
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

addEventListener('load', analysis.setSettings.bind(analysis));

console.log('analysis-new');
