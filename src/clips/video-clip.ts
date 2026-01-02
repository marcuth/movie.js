import { ffprobe } from "fluent-ffmpeg"

import { FFmpegInput } from "../ffmpeg-input"
import { RenderContext } from "../render-context"
import { Clip } from "./clip"
import { Path, resolvePath } from "../utils/resolve-path"

export type VideoClipOptions<RenderData> = {
    path: Path<RenderData>
    fadeIn?: number
    fadeOut?: number
}

export class VideoClip<RenderData> extends Clip<RenderData> {
    readonly path: Path<RenderData>
    readonly fadeIn?: number
    readonly fadeOut?: number

    constructor({ path, fadeIn, fadeOut }: VideoClipOptions<RenderData>) {
        super()
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    protected getInput(path: string, inputIndex: number): FFmpegInput {
        return {
            path: path,
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[${inputIndex}:a]`
            },
            type: "video",
            index: inputIndex,
        }
    }

    async getDuration(path: string): Promise<number> {
        return await new Promise<number>((resolve, reject) => {
            ffprobe(path, (error, data) => {
                if (error) {
                    reject(error)
                }

                resolve(data.format.duration || 0)
            })
        })
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const path = resolvePath({ path: this.path, data: data, index: context.clipIndex })
        const input = this.getInput(path, context.inputIndex)
        let currentVideoOutput = input.aliases.video
        let currentAudioOutput = input.aliases.audio
        const duration = await this.getDuration(path)
        
        context.command.input(path)

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
    }
}
