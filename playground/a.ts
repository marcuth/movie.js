import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import path from 'node:path';
import fs from 'node:fs';

const DURACAO = 10; // segundos por imagem
const FADE = 1;     // segundos de fade in/out

async function main() {
    const filesDir = path.join(__dirname, '..', 'heroic_races_134_br');
    const dragonsDir = path.join(filesDir, 'dragons');
    const lapsDir = path.join(filesDir, 'laps');

    const introFilePath = path.join(__dirname, '..', 'intro.mp4');
    const endOfVideoFilePath = path.join(__dirname, '..', 'end_of_video.mp4');
    const musicFilePath = path.join(__dirname, 'better_days.mp3');

    const dragonFiles = (await fs.promises.readdir(dragonsDir))
        .map(file => path.join(dragonsDir, file));

    const lapFiles = (await fs.promises.readdir(lapsDir))
        .map(file => path.join(lapsDir, file));

    const imagens: string[] = [...dragonFiles, ...lapFiles];

    const command: FfmpegCommand = ffmpeg();

    // INTRO
    command.input(introFilePath);

    // IMAGENS COM LOOP
    imagens.forEach((img) => {
        command.input(img).inputOptions([
            '-loop 1',
            `-t ${DURACAO}`,
        ]);
    });

    // MÚSICA EM LOOP
    command
        .inputOptions(['-stream_loop -1'])
        .input(musicFilePath);

    // FINAL
    command.input(endOfVideoFilePath);

    const musicIndex = imagens.length + 1;
    const finalIndex = imagens.length + 2;

    // FADE NAS IMAGENS
    const videoFilters: string[] = imagens.map((_, i) => {
        const inputIndex = i + 1; // 0 é intro
        return (
            `[${inputIndex}:v]` +
            `fade=t=in:st=0:d=${FADE},` +
            `fade=t=out:st=${DURACAO - FADE}:d=${FADE}` +
            `[v${i}]`
        );
    });

    // CONCATENAÇÃO DE VÍDEO
    const concatFilter =
        `[0:v]` +
        imagens.map((_, i) => `[v${i}]`).join('') +
        `[${finalIndex}:v]` +
        `concat=n=${imagens.length + 2}:v=1:a=0[outv]`;

    // DURAÇÃO TOTAL DAS IMAGENS
    const duracaoImagens = imagens.length * DURACAO;

    // ÁUDIO (loop + fade in/out)
    const audioFilter =
        `[${musicIndex}:a]` +
        `atrim=0:${duracaoImagens},` +
        `afade=t=in:d=1,` +
        `afade=t=out:d=1` +
        `[aud]`;

    const filterComplex = [
        ...videoFilters,
        concatFilter,
        audioFilter,
    ];

    command
        .complexFilter(filterComplex)
        .outputOptions([
            '-map [outv]',
            '-map [aud]',
            '-c:v libx264',
            '-c:a aac',
            '-pix_fmt yuv420p',
            '-shortest',
        ])
        .output('video.mp4')
        .on('start', (cmd: string) => {
            console.log('FFmpeg:', cmd);
        })
        .on('end', () => {
            console.log('✅ Vídeo gerado com sucesso!');
        })
        .on('error', (err: Error) => {
            console.error('❌ Erro ao gerar vídeo:', err.message);
        })
        .run();
}

main();
