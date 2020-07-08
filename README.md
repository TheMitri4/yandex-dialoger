# Yandex Dialoger (не окончательное название)
Ещё одна библиотека/фреймворк для разработки навыков Алисы.

Плюсы:
* Написан для запуска в функциях в Яндекс.Облане (но можно запустить и на сервере и локально)
* Написан на TypeScript с акцентом на нормальную типизацию
* Поддерживает новые возможности протокола Диалогов
* Не требует сборки, можно писать сразу в web-редакторе функций
* Готов к покрытию навыка юнит-тестами

Чат поддержки в Телеграм https://t.me/yandex_dialoger

## Простейший пример
```javascript
const { createDialog } = require('yandex-dialoger');

exports.handler = createDialog({
    /**
     * Функция state вызывается для каждой новой сессии
     * и создаёт объекта-состояние для неё.
     * Не забудьте включить состояния в настройках навыка.
     *
     * Можно не передавать. Тогда состояние будет пустым объектом.
     */
    state() {
        return {
            count: 0
        }
    },
    /**
     * Диалог состоит из сцен и переходов. Каждая сцена определяет,
     * что будет выведено пользователю и как будет обработан ввод.
     *  - Сцена всегда ожидает ответа от пользователя.
     *  - Переход не ожидает ответа, но перемещает диалог к следующему переходу,
     *    пока не будет достигнута сцена. Когда диалог достигнет сцены,
     *    пользователю будет выведет ответ всех пройденных переходов
     *    и текущей сцены.
     *
     * Сцены и переходы отличаются наличием обработчиков:
     *  - onInput у сцены
     *  - onTransition у перехода
     */
    scenes: {
        /**
         * Диалог всегда начинается со сцены (или перехода) Start. Это соглашение.
         */
        Start: {
            /**
             * Ответ пользователю описывается в функции reply,
             * которая первым параметром принимает ReplyBuilder.
             */
            reply(reply) {
                reply.withText('Начнём считать.')
            },
            /**
             * Сцены и переходы возвращают название следующей сцены или перехода.
             */
            onTransition() {
                return 'ChangeCount';
            }
        },
        ChangeCount: {
            reply(reply) {
                /**
                 * В ReplyBuilder есть ещё несколько методов.
                 */
                reply.withText('Скажите «Плюс» или «Минус».');
                reply.withButton('Плюс');
                reply.withButton('Минус');
            },
            /**
             * onInput первым параметром принимает объект Input,
             * который содержит данные ввода пользователя в удобной форме
             * (также есть request в неизменном виде).
             *
             * Вторым и третьим параметрами onInput принимает состояние
             * и метод для его изменения.
             */
            onInput({ command }, state, setState) {
                if (command === 'плюс') {
                    setState({ count: state.count + 1 });

                    return 'SayCount';
                }

                if (command === 'минус') {
                    setState({ count: state.count - 1 });

                    return 'SayCount';
                }
            },
            /**
             * В сцене можно указать обработчик unrecognized.
             * Он отработает, если onInput вернёт undefined.
             * При этом диалог останется в на той же сцене.
             *
             * Если обработчик unrecognized не указан, будет выполнен
             * обработчик help текущей сцены или reply последней сцены.
             */
            unrecognized(reply) {
                reply.withText('Повторите, пожалуйста. Вы сказали «Плюс» или «Минус»?');
            },
            /**
             * В сцене можно указать обработчик help.
             * Он отработает, если будет получен интент YANDEX.HELP или команда «Помощь».
             * При этом диалог останется в на той же сцене.
             *
             * Если обработчик help не указан, будет выполнен
             * обработчик unrecognized текущей сцены или reply последней сцены.
             *
             * Каждая сцена содержит свой собственный обработчик help,
             * т.к. подсказки в диалоге должны быть привязаны к контексту.
             * Для рассказа о навыке вцелом служит обработчик whatCanYouDo (см. ниже).
             */
            help(reply) {
                reply.withText(
                    'Сейчас вы можете изменить счётчик.',
                    'Для этого скажите «Плюс» или «Минус».'
                );
            }
        },
        SayCount: {
            /**
             * Вторым параметром reply принимает состояние.
             * Изменение состояния в reply не предусмотрено.
             */
            reply(reply, state) {
                reply.withText(`Теперь у вас ${state.count}.`);
            },
            /**
             * onTransition, как и onInput, принимает состояние
             * и метод для его изменения. Менять состояние можно
             * только в onInput и onTransition.
             */
            onTransition(state) {
                if (state.count < 3 && state.count > -3) {
                    return 'ChangeCount';
                }

                return 'Quit'
            }
        },
        Quit: {
            reply(reply) {
                reply.withText('Этого достаточно. Пока!');

                /**
                 * Отправляем признак завершения сессии.
                 */
                reply.withEndSession();
            },
            onInput() {
                return 'Start';
            }
        }
    },
    /**
     * Отрабатывает на интент YANDEX.WHAT_CAN_YOU_DO или комаду
     * «Что ты умеешь». К этому ответу добавляется help текущей
     * сцены чтобы пользователь не потерял контекст.
     */
    whatCanYouDo(reply) {
        reply.withText(`Этот навык помогает считать.`);
    }
});
```

## Запуск в Яндекс.Облане
1. Нужно выбрать Среду выполнения функции nodejs12-preview. В ней поддерживается установка зависимостей из package.json.
2. Добавить в package.json зависимость
```json
{
    "dependencies": {
        "yandex-dialoger": "latest"
    }
}
```

## Тестирование диалога
TestClosure будет сохранять state и заполнять поля запроса к навыку.

```javascript
import { createDialog, createTestClosure } from '../src/index';

/**
 * Наш навык
 */
const dialog = createDialog({
    scenes: {
        Start: {
            reply: (reply) => reply.withText('Привет.'),
            onInput: () => 'Start',
        },
    },
});

/**
 * Тесты
 */
test('Hello world', async () => {
    const closure = createTestClosure(dialog);

    const { text } = await closure.handleCommand('');

    expect(text).toBe('Привет.');
});

```

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
