import * as http from 'http';
import { RequestHandler } from './RequestHandler';

export function startServer(requestHandler: RequestHandler, port: number) {
    const server = http.createServer((request, response) => {
        if (request.method !== 'POST') {
            response.writeHead(200);
            response.end('200 OK');
            return;
        }

        let body = '';

        request.on('data', (data) => {
            body += data.toString();
        });

        request.on('end', async () => {
            try {
                const reply = await requestHandler(JSON.parse(body));

                response.setHeader('Content-Type', 'application/json');
                response.writeHead(200);
                response.end(JSON.stringify(reply));
            } catch (error) {
                console.error(`${new Date().toISOString()} Ошибка при обработке запроса.`, error);
                response.writeHead(400);
                response.end('400 Bad request');
            }
        });
    });

    server.listen(port, () => {
        console.log(`Сервер навыка запущен и слушает порт ${port}`);
    });

    server.on('close', () => {
        console.log(`Сервер навыка закрывается...`);
    });

    process.on('SIGINT', () => server.close());

    return server;
}
