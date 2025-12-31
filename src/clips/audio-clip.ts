import ffmpeg from "fluent-ffmpeg"
import { FFmpegInput } from "../ffmpeg-input"
import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type AudioClipOptions = {
    path: string
    volume?: number
    loop?: boolean
    subClip?: [number, number]
    fadeIn?: number
    fadeOut?: number
    startAt?: number
    endAt?: number
}

export class AudioClip<RenderData> extends Clip<RenderData> {
    readonly path: string
    readonly volume?: number
    readonly loop?: boolean
    readonly subClip?: [number, number]
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly startAt?: number
    readonly endAt?: number

    constructor({
        path,
        volume,
        loop,
        subClip,
        fadeIn,
        fadeOut,
        startAt,
        endAt
    }: AudioClipOptions) {
        super()

        this.path = path
        this.volume = volume
        this.loop = loop
        this.subClip = subClip
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.startAt = startAt
        this.endAt = endAt
    }

    protected getInput(inputIndex: number): FFmpegInput {
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
            path: this.path,
            aliases: {
                video: "",
                audio: `[${inputIndex}:a]`
            },
            type: "audio",
            options: inputOptions,
            index: inputIndex
        }
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const input = this.getInput(context.inputIndex)

        context.command.input(input.path)

        if (input.options && input.options.length > 0) {
            context.command.inputOptions(input.options)
        }

        let duration = 0

        if (this.subClip) {
            const [start, end] = this.subClip
            duration = Math.max(end - start, 0)
        } else {
            try {
                const metadata: any = await new Promise((resolve, reject) => {
                    ffmpeg.ffprobe(this.path, (err, data) => err ? reject(err) : resolve(data))
                })
                duration = Math.floor(metadata?.format?.duration ?? 0)
            } catch (err) {
                duration = 0
            }
        }

        let currentAudioOutput = input.aliases.audio

        if (duration > 0) {
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

        if (this.startAt && this.startAt > 0) {
            const delayMs = Math.floor(this.startAt * 1000)
            const delayOutput = `[delayAudio${context.inputIndex}]`

            context.filters.push({
                filter: "adelay",
                options: `${delayMs}|${delayMs}`,
                inputs: currentAudioOutput,
                outputs: delayOutput
            })

            currentAudioOutput = delayOutput
        }

        if (this.endAt && this.endAt > 0) {
            const trimOutput = `[endTrimAudio${context.inputIndex}]`

            context.filters.push({
                filter: "atrim",
                options: {
                    start: 0,
                    end: this.endAt
                },
                inputs: currentAudioOutput,
                outputs: trimOutput
            })

            currentAudioOutput = trimOutput
        }

        context.labels.mixAudio.push(currentAudioOutput)

        context.audioIndex++
        context.inputIndex++
    }
}