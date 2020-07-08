# Yandex Dialoger (не окончательное название)
Ещё одна библиотека/фреймворк для разработки навыков Алисы.

Плюсы:
* Написан для запуска в Яндекс.Функциях (но можно запустить и на сервере и локально)
* Написан на TypeScript с акцентом на нормальную типизацию
* Поддерживает новые фичи протокола Диалогов
* Не требует сборки, можно писать сразу в web-редакторе Яндекс.Функций
* Готов к покрытию диалога юнит-тестами

Чат поддержки в Телеграм https://t.me/yandex_dialoger

## Пошаговое руководство (демо)
Давайте рассмотрим написание простого навыка игры-викторины. Чтобы не усложнять демонстрацию,
будем писать код сразу в редакторе Яндекс.Функции, не используя TypeScript и сборку.

### Приступая к работе
Перед тем, как начать писать код навыка, нужно сделать несколько простых шагов.
Если какой-то из них вызовет затруднения, напишите об этом в [чат поддержки](https://t.me/yandex_dialoger).
1. Создать новую Функцию.
2. В разделе Редактор выбрать Среду выполнения nodejs12-preview. В ней поддерживается установка зависимостей из package.json.
3. Там же создать файл package.json с таким содержимым
```json
{
    "dependencies": {
        "yandex-dialoger": "latest"
    }
}
```




## Тестирование диалога



## Запуск на сервере и локально
В библиотеку входит самый простой сервер – запускалка диалога. С его помошью можно потестировать навык локально, через тунелер или запустить на своём сервере.

```js
const { createDialog, startServer } = require('yandex-dialoger');

const dialog = createDialog(...);
startServer(dialog, 3000);
```

Сервер можно остановить сигналом `Ctrl-C`, как обычно.

## Для разработчиков
Давайте вести разработку на русском языке насколько это возможно. Комментарии, документация, **сообщения об ошибках** и issue должны быть на русском языке. Всё как для себя.
