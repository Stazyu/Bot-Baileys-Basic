import fs, { unlinkSync } from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import ffmpeg from 'fluent-ffmpeg';
import FormData from 'form-data';
import { exec } from 'child_process';
import { fromBuffer } from 'file-type';
import { default as axios } from 'axios';

import { randomString } from '../helpers/generate';
import Exif from './Exif';
import { Readable } from 'stream';

const exif = new Exif();

export const webp2gifFile = (path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const bodyForm = new FormData()
        bodyForm.append('new-image-url', '')
        bodyForm.append('new-image', fs.createReadStream(path))
        axios({
            method: 'post',
            url: 'https://s6.ezgif.com/webp-to-mp4',
            data: bodyForm,
            headers: {
                'Content-Type': `multipart/form-data; boundary=${bodyForm.getBoundary()}`
            }
        }).then(({
            data
        }) => {
            const bodyFormThen = new FormData();
            const $ = cheerio.load(data);
            const file = $('input[name="file"]').attr('value');
            const convert = $('input[name="convert"]').attr('value');
            const gotdata = {
                file: file,
                convert
            }
            bodyFormThen.append('file', gotdata.file);
            bodyFormThen.append('convert', gotdata.convert);
            axios({
                method: 'post',
                url: 'https://ezgif.com/webp-to-mp4/' + gotdata.file,
                data: bodyFormThen,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${bodyFormThen.getBoundary()}`
                }
            }).then(({
                data
            }) => {
                const $ = cheerio.load(data)
                const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
                resolve(result)
            }).catch(err => reject(err))
        }).catch(err => reject(err))
    })
}

export const upToTele = (buff: Buffer): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        const fileType = await fromBuffer(buff)
        const form = new FormData();
        form.append('file', buff, 'tmp' + fileType?.ext);
        axios({
            url: 'https://telegra.ph/upload',
            method: 'post',
            headers: {
                'content-type': 'multipart/form-data; boundary=' + form.getBoundary()
            },
            data: form
        })
            .then((res) => {
                const url = `https://telegra.ph${res.data[0].src}`;
                resolve(url);
            }).catch((err) => {
                reject(err);
            });
    })
}

export const pngToWebpFromUrl = (url: string, options?: { packname?: string, authorname?: string }): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        exif.create(options?.packname !== undefined ? options?.packname : 'Staz', options?.authorname !== undefined ? options.authorname : 'Yu');
        const filename = path.join(__dirname, '../temp', randomString(4, { extension: '.png' }));
        const webp = path.join(__dirname, '../temp', randomString(4, { extension: '.webp' }));
        const outputName = path.join(__dirname, '../temp', randomString(4, { extension: '.webp' }));
        const download = await axios.get(url, {
            responseType: 'stream',
        });
        download.data.pipe(fs.createWriteStream(filename).on('close', () => {
            // exec(`cwebp -q 60 ${filename} -o ${webp}`, (err) => {
            exec(`ffmpeg -i ${filename} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${webp}`, (err) => {
                if (err) return reject(err);
                exec(`webpmux -set exif ./src/temp/data.exif ${webp} -o ${outputName}`, (err) => {
                    if (err) return reject(err);
                    resolve(webp);
                    fs.unlinkSync(filename);
                    setTimeout(() => {
                        fs.unlinkSync(webp);
                    }, 10000);
                })
                resolve(webp);
                fs.unlinkSync(filename);
            })
        }))
    })
}

export const pngToWebpFromBuffer = (buffer: Buffer, options?: { packname?: string, authorname?: string }): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        exif.create(options?.packname !== undefined ? options?.packname : 'Staz', options?.authorname !== undefined ? options.authorname : 'Yu');
        const filename = path.join(__dirname, '../temp', randomString(4, { extension: '.png' }));
        const webp = path.join(__dirname, '../temp', randomString(4, { extension: '.webp' }));
        const outputName = path.join(__dirname, '../temp', randomString(4, { extension: '.webp' }));
        fs.writeFile(filename, buffer, (err) => {
            if (err) return reject(err);
            // exec(`cwebp -q 60 ${filename} -o ${webp}`, (err) => {
            exec(`ffmpeg -i ${filename} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${webp}`, (err) => {
                if (err) return reject(err);
                exec(`webpmux -set exif ./src/temp/data.exif ${webp} -o ${outputName}`, (err) => {
                    if (err) return reject(err);
                    resolve(webp);
                    fs.unlinkSync(filename);
                    setTimeout(() => {
                        fs.unlinkSync(webp);
                    }, 10000);
                })
            })
        })
    })
}

export const mp4ToWebp = (input: Buffer, options?: { packname?: string, authorname?: string }) => {
    return new Promise<string>((resolve, reject) => {
        exif.create(options?.packname !== undefined ? options?.packname : 'Staz', options?.authorname !== undefined ? options.authorname : 'Yu');
        const inputName = path.join(__dirname, '../temp', randomString(4) + '.webp')
        const outputName = path.join(__dirname, '../temp', randomString(4) + '.webp')
        const stream = Readable.from(input);
        ffmpeg(stream)
            // .inputFormat('webp')
            .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
            })
            .on('error', function (err) {
                console.log(`${err}`)
                // unlinkSync(path);
                // let tipe = path.endsWith('.mp4') ? 'video' : 'gif'
                reject(err);
            })
            .on('end', function () {
                console.log('Finish');
                exec(`webpmux -set exif ./src/temp/data.exif ${inputName} -o ${outputName}`, async (error) => {
                    if (error) return reject(error);
                    unlinkSync(inputName);
                    resolve(outputName);
                    setTimeout(() => {
                        unlinkSync(outputName);
                    }, 15000);
                })
            })
            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
            .toFormat('webp')
            .save(inputName)
    })
}