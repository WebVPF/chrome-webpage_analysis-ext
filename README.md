# Анализ веб-страниц

Расширение выполняет беглый анализ просматриваемых в браузере веб-страниц.

## Установка

В настоящее время расширение находится в процессе разработки и не выложено в Chrome Web Store. Но вы его можете установить как распакованное расширение, включив в расширениях браузера Режим разработчика и скачав данный репозиторий.

## Проверка

- Изображения
    + наличие атрибута `src`
    + пустой атрибут `src`
    + наличие атрибута `alt`
    + пустой атрибут `alt`
    + поиск изображений с указанными расширениями (например для обнаружения усаревших форматов)
- Заголовки
    + наличие тэга `title` внутри секции `<head></head>`
    + заголовок `h1` [не более одного заголовка h1](https://developer.mozilla.org/ru/docs/Web/HTML/Element/Heading_Elements#%D0%B8%D0%B7%D0%B1%D0%B5%D0%B3%D0%B0%D0%B9%D1%82%D0%B5_%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F_%D0%BD%D0%B5%D1%81%D0%BA%D0%BE%D0%BB%D1%8C%D0%BA%D0%B8%D1%85_%D1%8D%D0%BB%D0%B5%D0%BC%D0%B5%D0%BD%D1%82%D0%BE%D0%B2_h1_%D0%BD%D0%B0_%D0%BE%D0%B4%D0%BD%D0%BE%D0%B9_%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B5)
    + проверка правильности структуры уровней заголовков. [title](https://developer.mozilla.org/ru/docs/Web/HTML/Element/Heading_Elements#%D0%BD%D0%B0%D0%B2%D0%B8%D0%B3%D0%B0%D1%86%D0%B8%D1%8F)
- Ссылки на внешние сайты
- SEO
    + `meta-title`
    + `meta-desc`
    + `meta-keys`
