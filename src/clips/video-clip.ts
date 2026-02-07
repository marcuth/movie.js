import { ffprobe } from "fluent-ffmpeg"

import { Property, resolveProperty } from "../utils/resolve-property"
import { Path, resolvePath } from "../utils/resolve-path"
import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"
import { Clip } from "./clip"

export type SubClip<RenderData> = Property<RenderData, [number, number]>

export type VideoClipOptions<RenderData> = {
    path: Path<RenderData>
    fadeIn?: number
    fadeOut?: number
    subClip?: SubClip<RenderData>
    chromaKey?: {
        color: string
        similarity?: number
        blend?: number
    }
    width?: number
    height?: number
}

export class VideoClip<RenderData> extends Clip<RenderData> {
    readonly path: Path<RenderData>
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly subClip?: SubClip<RenderData>
    readonly chromaKey?: {
        color: string
        similarity?: number
        blend?: number
    }
    readonly width?: number
    readonly height?: number

    constructor({ path, fadeIn, fadeOut, subClip, chromaKey, width, height }: VideoClipOptions<RenderData>) {
        super()
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.subClip = subClip
        this.chromaKey = chromaKey
        this.width = width
        this.height = height
    }

    protected getInput(path: string, inputIndex: number): FFmpegInput {
        return {
            path: path,
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[${inputIndex}:a]`,
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

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const path = resolvePath({ path: this.path, data: data, index: context.clipIndex })
        const input = this.getInput(path, context.inputIndex)
        let currentVideoOutput = input.aliases.video
        let currentAudioOutput = input.aliases.audio
        let duration = await this.getDuration(path)

        context.command.input(path)

        if (this.subClip) {
            const subClip = resolveProperty({ property: this.subClip, data, index: context.clipIndex })
            const [start, subDuration] = subClip
            context.command.inputOptions([`-ss ${start}`, `-t ${subDuration}`])
            duration = subDuration
        }

        if (this.width || this.height) {
            const scaleOutput = `[scale${context.inputIndex}]`

            context.filters.push({
                filter: "scale",
                options: { width: this.width, height: this.height },
                inputs: currentVideoOutput,
                outputs: scaleOutput,
            })

            currentVideoOutput = scaleOutput
        }

        if (this.chromaKey) {
            const { color, similarity = 0.01, blend = 0.0 } = this.chromaKey
            const chromaKeyOutput = `[chromakey${context.inputIndex}]`

            context.filters.push({
                filter: "chromakey",
                options: { color, similarity, blend },
                inputs: currentVideoOutput,
                outputs: chromaKeyOutput,
            })

            currentVideoOutput = chromaKeyOutput
        }

        if (this.fadeIn !== undefined && this.fadeIn > 0) {
            const fadeInOutput = `[fadeIn${context.inputIndex}]`
            const fadeInAudioOutput = `[fadeInAudio${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentVideoOutput,
                outputs: fadeInOutput,
            })

            context.filters.push({
                filter: "afade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentAudioOutput,
                outputs: fadeInAudioOutput,
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
                outputs: fadeOutOutput,
            })

            context.filters.push({
                filter: "afade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentAudioOutput,
                outputs: fadeOutAudioOutput,
            })

            currentVideoOutput = fadeOutOutput
            currentAudioOutput = fadeOutAudioOutput
        } else {
            context.filters.push({
                filter: "null",
                inputs: currentVideoOutput,
                outputs: `[v${context.inputIndex}]`,
            })
        }

        context.labels.video.push(`[v${context.inputIndex}]`)
        context.labels.structuralAudio.push(currentAudioOutput)

        context.inputIndex++

        return duration
    }
}
