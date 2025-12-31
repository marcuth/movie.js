import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import path from 'node:path';
import fs from 'node:fs';

const DURACAO = 10; // segundos
const FADE = 1;    // segundos

async function main() {
    const filesDir = path.join(__dirname, '..', 'heroic_races_134_br');
    const dragonsDir = path.join(filesDir, 'dragons');
    const lapsDir = path.join(filesDir, 'laps');

    const dragonFiles = (await fs.promises.readdir(dragonsDir))
        .map(file => path.join(dragonsDir, file));

    const lapFiles = (await fs.promises.readdir(lapsDir))
        .map(file => path.join(lapsDir, file));

    const imagens: string[] = [...dragonFiles, ...lapFiles];

    const command: FfmpegCommand = ffmpeg();

    // adiciona os inputs
    imagens.forEach((img) => {
        command.input(img).inputOptions([
            '-loop 1',
            `-t ${DURACAO}`,
        ]);
    });

    /**
     * Para cada imagem:
     * - fade in  (0 → 1s)
     * - fade out (DURACAO - 1 → DURACAO)
     */
    const filters: string[] = imagens.map((_, i) => {
        return (
            `[${i}:v]` +
            `fade=t=in:st=0:d=${FADE},` +
            `fade=t=out:st=${DURACAO - FADE}:d=${FADE}` +
            `[v${i}]`
        );
    });

    // concatenação final
    const concatFilter =
        imagens.map((_, i) => `[v${i}]`).join('') +
        `concat=n=${imagens.length}:v=1:a=0[outv]`;

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
