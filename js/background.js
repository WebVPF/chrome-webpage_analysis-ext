/**
 * Событие при установке или обновлении расширения
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#type-OnInstalledReason
 *
 * @param {string} OnInstalledReason ["install", "update", "chrome_update" или "shared_module_update"]
 * @param {string} id - id расширения
 * @param {string} previousVersion - предыдущая версия
 * 
 */
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.id == 'okeomfaginahmfbjiingcephfdimljef' || details.id == 'hkfgimjifffojdedmjpjmoefnelgpfmk') {

        if (details.OnInstalledReason == 'install') {
            const params = {
                settings_analysis: true,
                settings_domens: false,
                settings_domens_list: [],

                settings_metadesc: false,
                settings_metadesc_max: 200,
                settings_metadesc_min: 140,
                settings_metadesc_repeat: false,
                settings_metadesc_repeat_params: [],

                settings_metakey: false,

                settings_headlines: false,
                settings_headlines_checkbox: [false, false, false, false, false],

                settings_imgSortFormat: false,
                settings_imgSortFormat_list: [],
                settings_prefixIMG: false,
                settings_prefixIMG_list: [],

                settings_outerLinks: false
            }

            chrome.storage.sync.set(params);
        }
    }
});



/**
 * Слушатель на получение данных из analysis_page
 * Принимает ошибки
 */
chrome.runtime.onMessage.addListener(
    function (request, sender) {

        function sklonenie(num, txt) {
            let cases = [2, 0, 1, 1, 1, 2];
            return txt[(num % 100 > 4 && num % 100 < 20) ? 2 : cases[(num % 10 < 5) ? num % 10 : 5]];
            //popupApp.sklonenie(number, ['1-ошибка', '3-ошибки', '10-ошибок']);
        }

        let color, txt, title;

        if (request.errors >= 1) {
            txt = '' + request.errors;
            color = '#dc3545';
            // title = 'На странице ' + request.errors + ' ошибок и ' + request.warnings + ' предупреждений';
            title = `На странице ${request.errors} ${sklonenie(request.errors, [chrome.i18n.getMessage("popup_error_1"), chrome.i18n.getMessage("popup_errors_3"), chrome.i18n.getMessage("popup_errors_10")])} и ${request.warnings} ${sklonenie(request.warnings, [chrome.i18n.getMessage("popup_warning_1"), chrome.i18n.getMessage("popup_warnings_3"), chrome.i18n.getMessage("popup_warnings_10")])}`;
        }
        else if (request.warnings >= 1) {
            txt = '' + request.warnings;
            color = '#ffc107';
            // title = 'На странице ' + request.warnings + ' предупреждений';
            title = `На странице ${request.warnings} ${sklonenie(request.warnings, [chrome.i18n.getMessage("popup_warning_1"), chrome.i18n.getMessage("popup_warnings_3"), chrome.i18n.getMessage("popup_warnings_10")])}`;
        }
        else {
            txt = '✔';
            color = '#28a745';
            // title = 'На странице ошибок не обнаружено'
            title = chrome.i18n.getMessage("bg_not_errors_txt")
        }

        // Установка кол-ва ошибок на иконке в панеле браузера, цвета и текста подсказки
        chrome.action.setBadgeText({ text: txt, tabId: sender.tab.id });
        chrome.action.setBadgeBackgroundColor({ color: color, tabId: sender.tab.id });
        chrome.action.setTitle({ title: title, tabId: sender.tab.id });
    }
);

// Получение настроек:
// let settings = ['settings_analis', 'settings_favorit_sites', 'settings_favorit_domens', 'settings_metadesc', 'settings_metaMin', 'settings_metaMax'];
// chrome.storage.sync.get(settings, function (result) {
//     settings.forEach(item => console.log('Ответ из хранилища: ' + item + ': ' + result[item]));
// });


// chrome.runtime.getBackgroundPage(function() {
//     console.log();
// });
