import ffmpeg from "fluent-ffmpeg"

import { Path, resolvePath } from "../utils/resolve-path"
import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"
import { Clip } from "./clip"

export type AudioClipOptions<RenderData> = {
    path: Path<RenderData>
    volume?: number
    loop?: boolean
    subClip?: [number, number]
    fadeIn?: number
    fadeOut?: number
}

export class AudioClip<RenderData> extends Clip<RenderData> {
    readonly path: Path<RenderData>
    readonly volume?: number
    readonly loop?: boolean
    readonly subClip?: [number, number]
    readonly fadeIn?: number
    readonly fadeOut?: number

    constructor({
        path,
        volume,
        loop,
        subClip,
        fadeIn,
        fadeOut,
    }: AudioClipOptions<RenderData>) {
        super()

        this.path = path
        this.volume = volume
        this.loop = loop
        this.subClip = subClip
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    protected getInput(path: string, inputIndex: number): FFmpegInput {
        const inputOptions: string[] = []

        if (this.loop) {
            inputOptions.push("-stream_loop", "-1")
        }

        if (this.subClip) {
            const [start, end] = this.subClip
            inputOptions.push("-ss", `${start}`)
            inputOptions.push("-to", `${end}`)
        }

        return {
            path: path,
            aliases: {
                audio: `[${inputIndex}:a]`,
            },
            type: "audio",
            options: inputOptions,
            index: inputIndex
        }
    }

    async getDuration(path: string): Promise<number> {
        try {
            const metadata = await new Promise<ffmpeg.FfprobeData>((resolve, reject) => {
                ffmpeg.ffprobe(path, (err, data) => err ? reject(err) : resolve(data))
            })

            return Math.floor(metadata?.format?.duration ?? 0)
        } catch (err) {
            return 0
        }
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const path = resolvePath({ path: this.path, data: data, index: context.clipIndex })
        const input = this.getInput(path, context.inputIndex)

        context.command.input(input.path)

        if (input.options && input.options.length > 0) {
            context.command.inputOptions(input.options)
        }

        let duration = await this.getDuration(path)

        if (this.subClip) {
            const [start, end] = this.subClip
            duration = Math.max(end - start, 0)
        }

        let currentAudioOutput = input.aliases.audio

        if (duration > 0 && !this.loop) {
            const trimOutput = `[trimAudio${context.inputIndex}]`

            context.filters.push({
                filter: "atrim",
                options: { end: duration },
                inputs: currentAudioOutput,
                outputs: trimOutput,
            })

            currentAudioOutput = trimOutput
        }

        if (this.fadeIn && this.fadeIn > 0) {
            const fadeInOutput = `[fadeInAudio${context.inputIndex}]`

            context.filters.push({
                filter: "afade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentAudioOutput,
                outputs: fadeInOutput
            })

            currentAudioOutput = fadeInOutput
        }

        if (this.fadeOut && this.fadeOut > 0) {
            const start = Math.max((duration || 0) - this.fadeOut, 0)
            const fadeOutOutput = `[fadeOutAudio${context.inputIndex}]`

            context.filters.push({
                filter: "afade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentAudioOutput,
                outputs: fadeOutOutput
            })

            currentAudioOutput = fadeOutOutput
        }


        if (this.volume !== undefined) {
            const volumeOutput = `[volAudio${context.inputIndex}]`

            context.filters.push({
                filter: "volume",
                options: `${this.volume}`,
                inputs: currentAudioOutput,
                outputs: volumeOutput
            })

            currentAudioOutput = volumeOutput
        }

        context.labels.mixAudio.push(currentAudioOutput)
        
        context.inputIndex++
    }
}