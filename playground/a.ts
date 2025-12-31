import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import path from 'node:path';
import fs from 'node:fs';

const DURACAO = 10; // segundos por imagem
const FADE = 1;     // segundos para fade in/out

async function main() {
    const filesDir = path.join(__dirname, '..', 'heroic_races_134_br');
    const dragonsDir = path.join(filesDir, 'dragons');
    const lapsDir = path.join(filesDir, 'laps');
    const introFilePath = path.join(__dirname, "..", 'intro.mp4');
    const endOfVideoFilePath = path.join(__dirname, "..", 'end_of_video.mp4');

    const dragonFiles = (await fs.promises.readdir(dragonsDir))
        .map(file => path.join(dragonsDir, file));
    const lapFiles = (await fs.promises.readdir(lapsDir))
        .map(file => path.join(lapsDir, file));

    const imagens: string[] = [...dragonFiles, ...lapFiles];

    const command: FfmpegCommand = ffmpeg();

    // adiciona a intro
    command.input(introFilePath);

    // adiciona as imagens com loop
    imagens.forEach((img) => {
        command.input(img).inputOptions([
            '-loop 1',
            `-t ${DURACAO}`,
        ]);
    });

    // adiciona o final
    command.input(endOfVideoFilePath);

    // cria filtros para fade in/out das imagens (não aplica fade na intro/final)
    const filters: string[] = imagens.map((_, i) => {
        const inputIndex = i + 1; // 0 é intro
        return (
            `[${inputIndex}:v]fade=t=in:st=0:d=${FADE},` +
            `fade=t=out:st=${DURACAO - FADE}:d=${FADE}[v${i}]`
        );
    });

    // concatenação final: intro + imagens com fade + final
    const concatFilter =
        `[0:v]` + // intro
        imagens.map((_, i) => `[v${i}]`).join('') +
        `[${imagens.length + 1}:v]` + // final
        `concat=n=${imagens.length + 2}:v=1:a=0[outv]`;

    const filterComplex = [...filters, concatFilter];

    command
        .complexFilter(filterComplex)
        .outputOptions([
            '-map [outv]',
            '-c:v libx264',
            '-pix_fmt yuv420p',
        ])
        .output('video.mp4')
        .on('start', (cmd: string) => {
            console.log('FFmpeg:', cmd);
        })
        .on('end', () => {
            console.log('Vídeo gerado com sucesso!');
        })
        .on('error', (err: Error) => {
            console.error('Erro ao gerar vídeo:', err.message);
        })
        .run();
}

main();
