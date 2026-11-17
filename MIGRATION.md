# Миграция сайта «Работа в Manac» — завершена

**Дата:** 17 ноября 2026

- **Исходный репозиторий:** `qexus/qexus.github.io` (ранее каталог `manac/`).
- **Новый независимый репозиторий:** https://github.com/qexus/manac
- **Публичный адрес (сохранён):** https://qexus.github.io/manac/
- **Источник публикации:** GitHub Actions в `qexus/manac`.
- **Проверка:** рабочий workflow https://github.com/qexus/manac/actions/runs/44085614995, HTML-метатег `site-repository=qexus/manac`, проверка ссылок и фотографий.
- **Старая копия:** удалена из `qexus/qexus.github.io` коммитом `77bd8e8db8ecad60da3ad993b2429c693dd61e98`.
- **Интеграция:** ссылка на Manac осталась в `work.html`, `site-map.html` и `sitemap.xml` главного сайта.

## Дальнейшие изменения

Редактировать **только `qexus/manac`**. Любой push в `main` выполняет `node tests/check.mjs` и при успехе публикует сайт. Не создавать заново папку `manac/` в репозитории `qexus/qexus.github.io`, иначе возникнет конкуренция за один URL.

## Контроль

После публикации открывать https://qexus.github.io/manac/ и проверять активность вакансий, ссылки на официальные источники, качество мобильной верстки и правильность зарплат. См. `AUDIT.md`.
