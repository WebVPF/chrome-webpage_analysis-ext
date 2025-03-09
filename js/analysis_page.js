/**
 * Анализ страницы
 *
 * В event закомментировать тестовое id расширения
 *
 * ⍻ - не реализовано; ✓ - в разработке; ✔ - реализовано; ⚡
 *
 * ⍻ - Проверка симантических тэгов
 * ✔ - Проверка title
 * ✔ - Проверка Meta Description
 * ✔ - Проверка Мета-тег Keywords
 * ✔ - Проверка повторяющегося Meta Description сайта !== страницы
 * ⍻ - Проверка заголовков (h1, h2, h3, h4, h5, h6)
 * ✔ - Проверка наличия alt для img
 * ✔ - Поиск изображений устаревших форматов: .png
 * ✓ - Проверка номинальных и фактических размеров изображений
 * ✔ - Проверка пустых ссылок
 * ✔ - Поиск внешних ссылок
 *
 * analysisApp.settings['analysis'] - Настройки
 */

const analysisApp = {
    counter_errors  : 0,
    counter_warnings: 0,

    idMarket: 'fmfleoecibhnakeklbfnaeobghmgnfja', // TODO id расширения в Chrome-маркете
    idDevelop: 'iflkknjnoociemphgnbobbjgkghanofl',

    metadesc     : document.querySelector('meta[name="description"]'),
    metakeywords : document.querySelector('meta[name="keywords"]') || document.querySelector('meta[name="news_keywords"]'),

    styles       : false,

    reply: { // Ответ для запроса на ошибки
        errors  : 0,
        warnings: 0,
        semantic: {},
        title   : document.querySelector('title'),
        meta: {
            repeat  : false,
            twitter : false,
            og      : false
        },
        img: {
            notAlt        : [],
            emptyAlt      : [],
            exceedingSize : [],
            exceedingSizeProportions : []
            // + добавлены в analysisApp.init(): ['formats'] - string; ['imgSearchFormats'] - array; ['suffix'] - string;
        },
        links: {
            empty: document.querySelectorAll('a:empty').length, // Ссылки без содержимого (нет текста или картинки)
            // outer - number
        }
    },

    semantic: {
        all: document.querySelectorAll(':-webkit-any(header, nav, main, footer)').length,

        control() {
            if (this.all >= 1) {
                analysisApp.reply.semantic['tags'] = true;
                analysisApp.reply.semantic['header'] = document.querySelectorAll('header').length;
                analysisApp.reply.semantic['nav'] = document.querySelectorAll('nav').length;
                analysisApp.reply.semantic['aside'] = document.querySelectorAll('aside').length;
                analysisApp.reply.semantic['section'] = document.querySelectorAll('section').length;
                analysisApp.reply.semantic['main'] = document.querySelectorAll('main').length;
                analysisApp.reply.semantic['footer'] = document.querySelectorAll('footer').length;
                analysisApp.reply.semantic['article'] = document.querySelectorAll('article').length;
            }
            else analysisApp.reply.semantic['tags'] = false;
        }
    },

    headlines: {
        all: document.querySelectorAll(':-webkit-any(h1, h2, h3, h4, h5, h6)').length,
        control() {
            if (this.all >= 1) {
                analysisApp.reply.headlines = new Object();

                this.h1 = document.querySelectorAll('h1');
                analysisApp.reply.headlines.h1 = document.querySelectorAll('h1').length;

                this.h2 = document.querySelectorAll('h2');
                analysisApp.reply.headlines.h2 = this.h2.length;

                this.h3 = document.querySelectorAll('h3');
                analysisApp.reply.headlines.h3 = this.h3.length;

                this.h4 = document.querySelectorAll('h4');
                analysisApp.reply.headlines.h4 = this.h4.length;

                this.h5 = document.querySelectorAll('h5');
                analysisApp.reply.headlines.h5 = this.h5.length;

                this.h6 = document.querySelectorAll('h6');
                analysisApp.reply.headlines.h6 = this.h6.length;
            }
        }
    },

    img: {
        notAlt        : [],
        emptyAlt      : [], // пустой alt - alt=""
        imgSearchFormats : [], // Устаревший формат
        exceedingSize : [],
        // currentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

        filtrImg() {
            document.querySelectorAll('img').forEach(img => {

                if (img.currentSrc.split('/')[2] === window.location.hostname) {

                    let split = img.currentSrc.split('.'),
                        format = split[split.length - 1],
                        //format = img.currentSrc.split('.').pop(),
                        url;

                    img.hasAttribute('data-src') ? url = img.getAttribute('data-src') : url = img.currentSrc;

                    if (!img.hasAttribute('alt')) {
                        analysisApp.reply.img['notAlt'].push(url);
                        this.notAlt.push(img);
                    } else if (img.alt == '') {
                        analysisApp.reply.img['emptyAlt'].push(url);
                        this.emptyAlt.push(img);
                    }

                    // Размеры отображаемый (clientWidth, clientHeight) и фактический (naturalWidth, naturalHeight)
                    if ((img.clientWidth < img.naturalWidth) || (img.clientHeight < img.naturalHeight)) {
                        // console.log(img, img.clientWidth < img.naturalWidth, img.clientHeight < img.naturalHeight);

                        analysisApp.reply.img['exceedingSize'].push(url);
                        analysisApp.reply.img['exceedingSizeProportions'].push([img.clientWidth, img.clientHeight, img.naturalWidth, img.naturalHeight]);
                        this.exceedingSize.push(img);
                    }

                    if (analysisApp.settings.imgSearchFormats.active) {
                        !analysisApp.reply.img.imgSearchFormats ? analysisApp.reply.img['imgSearchFormats'] = new Array() : 0;

                        let arrFormats = analysisApp.stringListToArray(analysisApp.settings.imgSearchFormats.list);

                        if (arrFormats.includes(format)) {
                            analysisApp.reply.img['imgSearchFormats'].push(url);
                            this.imgSearchFormats.push(img);
                        }
                    }

                }
            })
        }
    },

    links: {
        empty: document.querySelectorAll('a:empty'), // Ссылки без содержимого (нет текста или картинки)
        outer: []
    },

    // settings: {
    //     analysis: true,
    //     domens: {
    //         active: false,
    //         list: 'example.com, google.com'
    //     },
    //     headlines: {
    //         active: true,
    //         h2: false, h3: true, h4: true, h5: false, h6: false
    //     },
    //     imgSearchFormats: {
    //         active: true,
    //         list: 'gif, png, bmp'
    //     },
    //     metadesc: {
    //         active: true,
    //         max: "159",
    //         min: "141"
    //     },
    //     metadesc_repeat: {
    //         active: true,
    //         list: [
    //             ['test1', 'Lorem ipson ddd ddds sss s s s s ssssss'],
    //             ['test2', 'Lorem ipson ddd ddds sss s s s s ssssss'],
    //         ]
    //     },
    //     metakey: true,
    //     outerLinks: true,
    //     suffixIMG: {
    //         active: false,
    //         list: '.pagespeed, .lazyload'
    //     }
    // },

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

    metainfo() {
        if ( this.metadesc ) {
            this.reply.meta.desc = this.metadesc.content;
            this.reply.meta.descSize = this.metadesc.content.length;
        }

        if ( this.metakeywords ) {
            this.reply.meta.keywords = this.metakeywords.content;
        }
    },

    /**
     * TODO проверить все настройки
     */
    analysis() {
        if (this.semantic.all < 1) this.reply.errors++;

        if (this.reply.meta.desc) {
            if (this.settings.metadesc.active) {
                this.reply.meta.descSize <= this.settings.metadesc.min || this.reply.meta.descSize >= this.settings.metadesc.max ? this.reply.errors++ : 0;
            }
            if (this.settings.metadesc_repeat.active && window.location.pathname !== '/') {
                let control = this.metadescRepeat(this.settings.metadesc_repeat.list, this.reply.meta.desc);
                control ? this.reply.errors++ : 0;
                this.reply.meta.repeat = control;
            }
        } else {
            // metadescription отсутствует
            this.reply.errors++
        }

        if (this.settings.metakey) {
            if ( this.reply.meta.keywords ) {
                this.reply.meta.keywords.split(',').length >= 1 ? 0 : this.reply.errors++;
            }
            else this.reply.errors++;
        }

        if (this.headlines.all == 0) this.reply.errors++;
        else if (this.reply.headlines.h1 !== 1) this.reply.headlines.h1 < 1 ? this.reply.errors++ : this.reply.errors += this.reply.headlines.h1;

        if (this.img.notAlt.length >= 1) this.reply.errors += this.img.notAlt.length;
        if (this.img.emptyAlt.length >= 1) this.reply.errors += this.img.emptyAlt.length;
        if (this.img.exceedingSize.length >= 1) this.reply.errors += this.img.exceedingSize.length;
        if (this.settings.imgSearchFormats.active) {
            if (this.img.imgSearchFormats.length >= 1) this.reply.warnings += this.img.imgSearchFormats.length;
        }

        if (this.reply.links.empty.length >= 1) this.reply.errors += this.reply.links.empty.length;
        if (this.settings['outerLinks'] && this.outerLinks().length >= 1) {
            this.reply.warnings++;
            this.reply.links.outer = this.outerLinks().length;
        }


        // Отправка кол-ва ошибок и предупреждений в background.js для вывода их в бейдже на иконке расширения
        chrome.runtime.sendMessage({
            errors: this.reply.errors,
            warnings: this.reply.warnings
        })
    },

    event() {
        /**
         * Слушатель запросов из popup.js
         */
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (sender.id == analysisApp.idMarket || sender.id == analysisApp.idDevelop) {
                if (request.popup == "request_analysis") {
                    sendResponse(analysisApp.reply);
                }

                if (request.popup == "scroll_el") {

                    if (!analysisApp.styles) {
                        let styles = document.createElement('style');
                        styles.textContent = '.analysis_page_error{border:solid 4px red !important}.analysis_page_error__links{padding:2px 8px;background:#ffdead;border:solid 4px red!important}';
                        document.querySelector('body').appendChild(styles);

                        analysisApp.styles = true;
                    }

                    document.querySelector('.analysis_page_error') ? document.querySelector('.analysis_page_error').classList.remove('analysis_page_error') : 0;
                    document.querySelector('.analysis_page_error__links') ? document.querySelector('.analysis_page_error__links').classList.remove('analysis_page_error__links') : 0;

                    let el_id = request.el;

                    if (request.el == 'notAlt' || request.el == 'emptyAlt' || request.el == 'exceedingSize' || request.el == 'imgSearchFormats') {
                        analysisApp.img[el_id][request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                        analysisApp.img[el_id][request.index].classList.add('analysis_page_error');
                    }


                    if (request.el == 'emptylink') {
                        analysisApp.links.empty[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                        analysisApp.links.empty[request.index].classList.add('analysis_page_error__links');
                    }
                    if (request.el == 'outerlink') {
                        analysisApp.links.outer[request.index].scrollIntoView({ block: "center", behavior: "smooth" });
                        analysisApp.links.outer[request.index].classList.add('analysis_page_error__links');
                    }

                }

                if (request.popup == "updates") {
                    analysisApp.update();
                }

                // if (request.popup == 'request_host') {
                //     sendResponse({ request_host: window.location.hostname });
                // }

                if (request.popup == 'download_img') {
                    if (request.id == 'imgSearchFormats' || request.id == 'exceedingSize') {
                        let arr = analysisApp.img[request.id];

                        for (let i = 0; i < arr.length; i++) {
                            let imgPath = arr[i].currentSrc.split('/').pop() || arr[i];

                            if (analysisApp.settings.suffixIMG) {
                                analysisApp.settings.suffixIMG.list.forEach(pref => imgPath = imgPath.split(pref)[0]);
                            }

                            let a = document.createElement('a');
                            a.href = '';
                            a.download = imgPath;
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                        }
                    }
                }
            }
        });
    },

    scrollLazyload() {
        let x = window.pageXOffset,
            y = window.pageYOffset;
        let body = document.querySelector('body');

        window.scroll(0, 0);
        window.scroll(body.scrollWidth, body.scrollHeight);
        window.scroll(x, y);
    },

    metadescRepeat(params, metaTxt) {
        console.log(params);

        for (let i = 0; i < params.length; i++) {
            if (params[i][0] == window.location.hostname) {
                return params[i][1] == metaTxt;
            }
            else return false;
        }
    },

    outerLinks() {
        let outers = [];

        document.querySelectorAll('a').forEach(link => {
            if (link.hostname && link.hostname !== window.location.hostname) {
                outers.push(link);
                this.links.outer.push(link);
            }
        });

        return outers;
    },

    update() {
        this.reply.errors = 0;
        this.reply.warnings = 0;

        this.reply.img.notAlt = [];
        this.reply.img.emptyAlt = [];
        this.reply.img.imgSearchFormats = [];
        this.reply.img.exceedingSize = [];
        this.reply.img.exceedingSizeProportions = [];

        this.img.notAlt = [];
        this.img.emptyAlt = [];
        this.img.imgSearchFormats = [];
        this.img.exceedingSize = [];

        this.links.outer = [];

        this.img.filtrImg();

        this.analysis();
    },

    updateOptions() {

    },

    controlAnalysis() {
        this.reply.meta.min = this.settings.metadesc.min;
        this.reply.meta.max = this.settings.metadesc.max;
        this.reply.img.formats = this.settings.imgSearchFormats.list;
        this.reply.img.suffix = this.settings.suffixIMG.list;

        this.metainfo();

        this.img.filtrImg();
        this.semantic.control();
        this.headlines.control();
        this.analysis();
        this.event();
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
    settingsInit() {
        chrome.storage.sync.get(['settings']).then((result) => {
            this.settings = result.settings;

            this.init();
        });
    }
}

analysisApp.settingsInit();

console.log('analysis_page.js');


// Слушатель изменения настроек
// chrome.storage.onChanged.addListener(() => { console.log('Настройки приложения были изменены') });
