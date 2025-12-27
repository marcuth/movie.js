import ffmpeg from "fluent-ffmpeg"

import { TextClip, ImageClip, AudioClip, VideoClip } from "./clips"
import { Pellicula } from "./pellicula"

export function render(movie: Pellicula, output: string): Promise<void> {
    const command = ffmpeg()

    // ─────────────────────────────────────────────
    // Separação lógica
    // ─────────────────────────────────────────────
    const videoTimelineClips = movie.clips.filter(
        clip => clip instanceof VideoClip || clip instanceof ImageClip
    ) as (VideoClip | ImageClip)[]

    const textClips = movie.clips.filter(
        clip => clip instanceof TextClip
    ) as TextClip[]

    const audioClips = movie.clips.filter(
        clip => clip instanceof AudioClip
    ) as AudioClip[]

    // ─────────────────────────────────────────────
    // Inputs (ORDEM IMPORTA)
    // 1️⃣ vídeos + imagens (timeline)
    // 2️⃣ áudios extras
    // ─────────────────────────────────────────────
    videoTimelineClips.forEach(clip => {
        if (clip instanceof ImageClip) {
            command.inputOptions(clip.inputOptions)
        }

        command.input(clip.options.path)

        if (clip instanceof ImageClip && clip.options.start !== undefined) {
            command.inputOptions([`-ss ${clip.options.start}`])
        }

        if (
            clip.options.duration !== undefined &&
            !clip.inputOptions
        ) {
            command.inputOptions([`-t ${clip.options.duration}`])
        }
    })

    audioClips.forEach(clip => {
        if (clip.options.loop) {
            command.inputOptions(["-stream_loop -1"])
        }

        command.input(clip.options.path)
    })

    // ─────────────────────────────────────────────
    // Filters
    // ─────────────────────────────────────────────
    const filters: string[] = []

    // 2️⃣ Processamento de cada clipe da timeline
    videoTimelineClips.forEach((clip, i) => {
        filters.push(
            `[${i}:v]${
                clip.getVideoFilters().length
                    ? clip.getVideoFilters().join(",")
                    : "null"
            }[v${i}]`
        )

        filters.push(
            `[${i}:a]${
                clip.getAudioFilters().length
                    ? clip.getAudioFilters().join(",")
                    : "anull"
            }[a${i}]`
        )
    })

    // 3️⃣ Concat da timeline
    let concatInputs = ""

    for (let i = 0; i < videoTimelineClips.length; i++) {
        concatInputs += `[v${i}][a${i}]`
    }

    filters.push(
        `${concatInputs}concat=n=${videoTimelineClips.length}:v=1:a=1[vcat][acat]`
    )

    // ─────────────────────────────────────────────
    // TextClip = overlay (pós-concat)
    // ─────────────────────────────────────────────
    let currentVideo = "[vcat]"

    textClips.forEach((clip, i) => {
        const out = `vtext${i}`
        filters.push(
            `${currentVideo}${clip.getVideoFilters()[0]}[${out}]`
        )
        currentVideo = `[${out}]`
    })

    // ─────────────────────────────────────────────
    // AudioClip = mix
    // ─────────────────────────────────────────────
    const audioLabels: string[] = ["[acat]"]

    audioClips.forEach((clip, i) => {
        const inputIndex = videoTimelineClips.length + i

        let chain = `[${inputIndex}:a]`

        if (clip.startTime > 0) {
            const delay = clip.startTime * 1000
            chain += `adelay=${delay}|${delay},`
        }

        const filtersA = clip.getAudioFilters()
        chain += filtersA.length ? filtersA.join(",") : "anull"

        const label = `amix${i}`
        chain += `[${label}]`

        filters.push(chain)
        audioLabels.push(`[${label}]`)
    })

    if (audioLabels.length > 1) {
        filters.push(
            `${audioLabels.join("")}amix=inputs=${audioLabels.length}:dropout_transition=0[aout]`
        )
    } else {
        filters.push("[acat]anull[aout]")
    }

    // ─────────────────────────────────────────────
    // Finalização
    // ─────────────────────────────────────────────
    command
        .complexFilter(filters)
        .outputOptions([
            `-map ${currentVideo}`,
            "-map [aout]"
        ])

    return new Promise((resolve, reject) => {
        command
            .output(output)
            .on("start", cmd => {
                console.log("\nFFmpeg command:\n", cmd, "\n")
            })
            .on("end", () => resolve())
            .on("error", reject)
            .run()
    })
}
