import http from 'http';
import https from 'https';
import { parse } from 'url';

export interface ResponseDetails {
    statusCode?: number;
    data: string;
}

export const requestURL = (url: string): Promise<ResponseDetails> => new Promise((resolve, reject) => {
    const options = parse(url);

    let { request } = http;

    if (options.protocol === 'https:')
        request = https.request;

    const req = request(options, (res) => {
        let data = '';
        res.setEncoding('binary');

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            resolve({
                statusCode: res.statusCode,
                data
            });
        });

        res.on('error', (e) => {
            reject(e);
        });
    });

    req.on('error', (e) => {
        reject(e);
    });

    req.end();
});
