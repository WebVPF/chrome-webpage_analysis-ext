/**
 * Каждый из методов имеет настройку в настройках расширения
 */
const analysis = {

    /**
     * Анализ изображений на странице
     *
     * Анализирует:
     * - наличие атрибута src
     * - пустой атрибут src
     * - наличие атрибута alt
     *
     * Не анализирует есть ли указанное изображение на сервере.
     */
    getImages() {
        let images = [];

        document.querySelectorAll('img').forEach(img => {
            let error = false;

            // let imgLogs = {
            //     path: '',
            //     src: '',
            //     srcEmpty: '',
            //     alt: '',
            //     altEmpty: '',
            // }

            /**
             * Массив ошибок (string) у исследуемого изображения
             * - noSrc
             * - emptySrc
             * - noAlt
             * - emptyAlt
             */
            let imgErrors = [];


            if (!img.hasAttribute('src')) {
                // отсутствует урл-адресс изображения
                imgErrors.push('noSrc');
            }
            else if (img.getAttribute('src') == '') {
                imgErrors.push('emptySrc');
            }
            else {
                /**
                 * Искать форматы изображений
                 */
                if (settings.imgExt) {
                    // if (formats.includes(imgExtension)) {

                    // }
                }
            }


            if (!img.hasAttribute('alt')) {
                // у изображения отсутствует alt-атрибут
            }
            else if (img.getAttribute('alt') == '') {
                imgErrors.push('emptyAlt');
            }


            /**
             * Отображаемый (clientWidth, clientHeight) и фактический (naturalWidth, naturalHeight) размер
             */
            if ((img.clientWidth < img.naturalWidth) || (img.clientHeight < img.naturalHeight)) {

            }



            if (imgErrors.length > 0) {
                // images.push(img, imgErrors);
            }





            if (error) {
                images.push(imgLogs);
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

    links() {

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

        });
    },

    controlAnalysis() {
        this.metaAnalysis();
        this.headlineAnalysis();

        // this.;

        // this.getImages();


        // console.log();
    },

    init() {
        // console.log(this.settings);

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
            // chrome.runtime.sendMessage({
            //     errors: this.reply.errors,
            //     warnings: this.reply.warnings
            // });
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
