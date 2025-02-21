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
                if (switchEl.hasAttribute('data-view')) {
                    if (switchEl.checked) {
                        document.querySelector( switchEl.dataset.view ).classList.add('active');
                    } else {
                        document.querySelector( switchEl.dataset.view ).classList.remove('active');
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

    /**
     * Возвращает массив с id-шниками выключателей, которые являются ключами настроек в хранилище
     *
     * @returns {Array} - массив из строк
     */
    getKeysStorage() {
        let keys = [];

        this.switchInputs.forEach(elSwitch => keys.push(elSwitch.id));

        return keys;
    },

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

        document.querySelector('.block_metadesc_repeat tbody').appendChild(elTr);
    },

    install() {
        let keysStorage = this.getKeysStorage();

        chrome.storage.sync.get(keysStorage, params => {
            console.log(params);

            this.switchInputs.forEach(switchEl => {
                let idEl = switchEl.id;

                if (params.hasOwnProperty(idEl)) {
                    if (typeof params[idEl] === 'boolean') {
                        if (params[idEl]) {
                            switchEl.checked = true;
                        }
                    }
                    else {
                        if (params[idEl].hasOwnProperty('active') && params[idEl].active) {
                            switchEl.checked = true;

                            if (switchEl.hasAttribute('data-view')) {
                                document.querySelector( switchEl.dataset.view ).classList.add('active');
                            }
                        }

                        if (switchEl.hasAttribute('data-view')) {
                            let elementsForm = document.querySelector(switchEl.dataset.view).querySelectorAll('input, textarea');

                            if (switchEl.id === 'metadesc_repeat') {
                                if (params[idEl].hasOwnProperty('list')) {
                                    params[idEl].list.forEach(itemList => {
                                        this.createTrForMetadescRepeat(itemList[0], itemList[1]);
                                    });
                                }
                            }
                            else if (elementsForm.length === 1) {
                                if (params[idEl].hasOwnProperty('list')) {
                                    elementsForm[0].value = params[idEl].list;
                                }
                            }
                            else {
                                elementsForm.forEach(elForm => {
                                    if (elForm.hasAttribute('data-property')) {
                                        if (elForm.tagName === 'INPUT' && elForm.type === 'checkbox') {
                                            elForm.checked = params[idEl][elForm.dataset.property];
                                        }
                                        else {
                                            elForm.value = params[idEl][elForm.dataset.property];
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            });
        });
    },

    saveOptions() {
        let params = {};

        this.switchInputs.forEach(switchEl => {
            if (switchEl.hasAttribute('data-view')) {
                let itemOptions = {};

                itemOptions['active'] = switchEl.checked;

                let elementsForm = document.querySelector(switchEl.dataset.view).querySelectorAll('input, textarea');

                if (switchEl.id === 'metadesc_repeat') {
                    if (elementsForm.length >= 2) { // TODO убрать из HTML по умолчанию
                        itemOptions['list'] = [];

                        for (let indexElForm = 0; indexElForm < elementsForm.length; indexElForm++) {
                            if (indexElForm % 2 !== 0) {
                                // пушится как массив с двумя значениями!!!
                                itemOptions['list'].push([elementsForm[indexElForm - 1].value, elementsForm[indexElForm].value]);
                            }
                        }
                    }
                }
                else if (elementsForm.length === 1) {
                    itemOptions['list'] = elementsForm[0].value;
                }
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

        chrome.storage.sync.set(params, function() {
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

optionsApp.init();
