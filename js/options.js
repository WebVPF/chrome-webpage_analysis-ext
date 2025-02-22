const optionsApp = {
    btnSave: document.getElementById('save'),

    switchInputs: document.querySelectorAll('[name="settings"]'),

    event() {
        this.btnSave.addEventListener('click', this.saveOptions.bind(this));

        // Блоковые пункты настроек - скрыть-показать блок при переключении (scrollHeight)
        // this.keyId[1].forEach(el => {
        //     document.querySelectorAll(`[name="${ el }"]`).forEach(item => {
        //         item.addEventListener('input', () => {
        //             let block = document.querySelector('.block_' + el);

        //             if (el == 'metadesc_repeat') {
        //                 item.dataset.item == 'on' ? block.classList.add('active') : block.classList.remove('active')
        //             }
        //             else {
        //                 let blockHeight = block.scrollHeight;
        //                 item.dataset.item == 'on' ? block.style.height = (blockHeight + 20) + 'px' : block.style.height = 0;
        //             }
        //         })
        //     })
        // });

        /**
         * Переключение основных выключателей
         */
        this.switchInputs.forEach(switchEl => {
            switchEl.addEventListener('input', () => {
                let subSettingsBlock = switchEl.parentElement.parentElement.nextElementSibling;

                if (subSettingsBlock !== null && subSettingsBlock.classList.contains('sub-settings')) {
                    if (switchEl.checked) {
                        subSettingsBlock.classList.add('active');
                    } else {
                        subSettingsBlock.classList.remove('active');
                    }
                }
            });
        });

        document.getElementById('add_metadesc_repeat_item').addEventListener('click', () => {
            this.createTrForMetadescRepeat();
        });

        document.addEventListener('change', e => {
            this.btnSave.removeAttribute('disabled');
        });
    },

    // activeBtnSave() {
    //     if (this.btnSave.hasAttribute('disabled')) {
    //         this.btnSave.removeAttribute('disabled');

    //         window.addEventListener('beforeunload', this.warningUnsavedSettings);
    //     }
    // },

    // disableBtnSave() {
    //     this.btnSave.setAttribute('disabled', true);

    //     window.removeEventListener('beforeunload', this.warningUnsavedSettings);
    // },

    // /**
    //  * Предупреждение о несохраненных настройках
    //  */
    // warningUnsavedSettings(event) {
    //     event.preventDefault();
    // },

    createTrForMetadescRepeat(domen, metaDesc) {
        let elTr = document.createElement('tr');

        let inputText = document.createElement('input');
        inputText.setAttribute('type', 'text');
        if (domen) inputText.value = domen;

        let elTextarea = document.createElement('textarea');
        if (metaDesc) elTextarea.value = metaDesc;

        let btnDeleteTr = document.createElement('button');
        btnDeleteTr.classList.add('btn', 'btn-danger');
        btnDeleteTr.setAttribute('title', chrome.i18n.getMessage('delete'));
        btnDeleteTr.textContent = '×';

        btnDeleteTr.addEventListener('click', () => elTr.remove());

        [inputText, elTextarea, btnDeleteTr].forEach(el => {
            let elTd = document.createElement('td');
            elTd.appendChild(el);
            elTr.appendChild(elTd);
        });

        document.querySelector('tbody').appendChild(elTr);
    },

    install() {
        chrome.storage.sync.get('settings', params => {
            if (params.hasOwnProperty('settings')) {
                let settings = params.settings;

                this.switchInputs.forEach(switchEl => {
                    let idEl = switchEl.id;

                    if (settings.hasOwnProperty(idEl)) {
                        if (typeof settings[idEl] === 'boolean') {
                            if (settings[idEl]) {
                                switchEl.checked = true;
                            }
                        }
                        else {
                            let subSettingsBlock = switchEl.parentElement.parentElement.nextElementSibling;

                            if (settings[idEl].hasOwnProperty('active') && settings[idEl].active) {
                                switchEl.checked = true;

                                if (subSettingsBlock !== null && subSettingsBlock.classList.contains('sub-settings')) {
                                    subSettingsBlock.classList.add('active');
                                }
                            }

                            if (subSettingsBlock !== null && subSettingsBlock.classList.contains('sub-settings')) {
                                let elementsForm = subSettingsBlock.querySelectorAll('input, textarea');

                                if (switchEl.id === 'metadesc_repeat') {
                                    if (settings[idEl].hasOwnProperty('list')) {
                                        settings[idEl].list.forEach(itemList => {
                                            this.createTrForMetadescRepeat(itemList[0], itemList[1]);
                                        });
                                    }
                                }
                                else if (elementsForm.length === 1) {
                                    if (settings[idEl].hasOwnProperty('list')) {
                                        elementsForm[0].value = settings[idEl].list;
                                    }
                                }
                                else {
                                    elementsForm.forEach(elForm => {
                                        if (elForm.hasAttribute('data-property')) {
                                            if (elForm.tagName === 'INPUT' && elForm.type === 'checkbox') {
                                                elForm.checked = settings[idEl][elForm.dataset.property];
                                            }
                                            else {
                                                elForm.value = settings[idEl][elForm.dataset.property];
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        });
    },

    saveOptions() {
        let params = {};

        this.switchInputs.forEach(switchEl => {
            let subSettingsBlock = switchEl.parentElement.parentElement.nextElementSibling;

            if (subSettingsBlock !== null && subSettingsBlock.classList.contains('sub-settings')) {
                let itemOptions = {};

                itemOptions['active'] = switchEl.checked;


                let elementsForm = subSettingsBlock.querySelectorAll('input, textarea');

                if (switchEl.id === 'metadesc_repeat') {
                    if (elementsForm.length >= 2) {
                        itemOptions['list'] = [];

                        for (let indexElForm = 0; indexElForm < elementsForm.length; indexElForm++) {
                            if (indexElForm % 2 !== 0) {
                                // пушится как массив с двумя значениями!!!
                                itemOptions['list'].push([elementsForm[indexElForm - 1].value, elementsForm[indexElForm].value]);
                            }
                        }
                    }
                }
                /**
                 * Если в субнастройках пункта один элемент формы (input или textarea), то его
                 * значение сохраняется под ключом 'list'
                 */
                else if (elementsForm.length === 1) {
                    itemOptions['list'] = elementsForm[0].value;
                }
                /**
                 * Для каждого элемента формы сохраняется значение под ключом из значения
                 * атрибута data-property. Если элемент формы это checkbox, то значение сохраняется
                 * как булево (true или false).
                 */
                else {
                    elementsForm.forEach(elForm => {
                        if (elForm.hasAttribute('data-property')) {
                            if (elForm.tagName === 'INPUT' && elForm.type === 'checkbox') {
                                itemOptions[elForm.dataset.property] = elForm.checked;
                            }
                            else {
                                itemOptions[elForm.dataset.property] = elForm.value;
                            }
                        }
                    });
                }

                params[switchEl.id] = itemOptions;
            }
            else {
                params[switchEl.id] = switchEl.checked;
            }
        });

        /**
         * Сохранение настроек под ключом 'settings'
         */
        chrome.storage.sync.set({settings: params}, function() {
            let status = document.querySelector('#status');
            status.textContent = chrome.i18n.getMessage('settingsSaveStatus');
            status.style.display = 'block';

            window.setTimeout(function() {status.style.display = 'none'}, 750);
        });
    },

    init() {
        this.install();
        this.event();
    }
}

// chrome.storage.sync.clear();

optionsApp.init();
