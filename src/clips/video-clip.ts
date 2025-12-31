import { ffprobe } from "fluent-ffmpeg"

import { FFmpegInput } from "../ffmpeg-input"
import { RenderContext } from "../render-context"
import { Axis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type VideoClipOptions<RenderData> = {
    path: string
    x: Axis<RenderData>
    y: Axis<RenderData>
    fadeIn?: number
    fadeOut?: number
}

export class VideoClip<RenderData> extends Clip<RenderData> {
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly path: string
    readonly fadeIn?: number
    readonly fadeOut?: number

    constructor({ path, x, y, fadeIn, fadeOut }: VideoClipOptions<RenderData>) {
        super()
        this.path = path
        this.x = x
        this.y = y
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    protected getInputs(inputIndex: number, audioIndex: number): FFmpegInput {
        return {
            path: this.path,
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[${inputIndex}:a]`
            },
            type: "video",
            index: inputIndex,
        }
    }

    async getDuration(): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            ffprobe(this.path, (error, data) => {
                if (error) {
                    reject(error)
                }

                resolve(data.format.duration || 0)
            })
        })
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const input = this.getInputs(context.inputIndex, context.audioIndex)
        let currentVideoOutput = input.aliases.video
        let currentAudioOutput = input.aliases.audio
        const duration = await this.getDuration()

        context.command
            .input(input.path)

        if (this.fadeIn !== undefined && this.fadeIn > 0) {
            const fadeInOutput = `[fadeIn${context.inputIndex}]`
            const fadeInAudioOutput = `[fadeInAudio${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentVideoOutput,
                outputs: fadeInOutput
            })

            context.filters.push({
                filter: "afade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentAudioOutput,
                outputs: fadeInAudioOutput
            })

            currentVideoOutput = fadeInOutput
            currentAudioOutput = fadeInAudioOutput
        }

        if (this.fadeOut !== undefined && this.fadeOut > 0) {
            const start = Math.max(duration - this.fadeOut, 0)
            const fadeOutOutput = `[v${context.inputIndex}]`
            const fadeOutAudioOutput = `[fadeOutAudio${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentVideoOutput,
                outputs: fadeOutOutput
            })

            context.filters.push({
                filter: "afade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentAudioOutput,
                outputs: fadeOutAudioOutput
            })

            currentVideoOutput = fadeOutOutput
            currentAudioOutput = fadeOutAudioOutput
        } else {
            context.filters.push({
                filter: "null",
                inputs: currentVideoOutput,
                outputs: `[v${context.inputIndex}]`
            })
        }

        context.labels.video.push(`[v${context.inputIndex}]`)
        context.labels.structuralAudio.push(currentAudioOutput)

        context.inputIndex++
        context.audioIndex++
    }
}
