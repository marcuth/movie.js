import { Path, resolvePath } from "../utils/resolve-path"
import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"
import { Clip } from "./clip"

export type ImageClipOptions<RenderData> = {
    path: Path<RenderData>
    width?: number
    height?: number
    duration: number
    fadeIn?: number
    fadeOut?: number
}

export class ImageClip<RenderData> extends Clip<RenderData> {
    readonly duration: number
    readonly path: Path<RenderData>
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly width?: number
    readonly height?: number

    constructor({
        duration,
        path,
        width,
        height,
        fadeIn,
        fadeOut
    }: ImageClipOptions<RenderData>) {
        super()

        this.duration = duration
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.width = width
        this.height = height
    }

    protected getInput(path: string, inputIndex: number, fps: number): FFmpegInput {
        return {
            path: path,
            index: Number(inputIndex),
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[a${inputIndex}]`
            },
            type: "image" as const,
            options: [
                "-loop 1",
                `-t ${this.duration}`,
                `-framerate ${fps}`
            ]
        }

    }

    build(data: RenderData, context: RenderContext): void {
        const path = resolvePath({ path: this.path, data: data, index: context.clipIndex })
        const input = this.getInput(path, context.inputIndex, context.fps)
        let currentVideoOutput = input.aliases.video
        const currentAudioOutput = input.aliases.audio

        context.command
            .input(input.path)
            .inputOptions(input.options!)

        const anullSrcLabel = `[anull${context.inputIndex}]`

        context.filters.push({
            filter: "anullsrc",
            options: { sample_rate: 44100, channel_layout: "stereo" },
            outputs: anullSrcLabel,
        })

        context.filters.push({
            filter: "atrim",
            options: { end: this.duration },
            inputs: anullSrcLabel,
            outputs: currentAudioOutput,
        })

        if (this.width !== undefined || this.height !== undefined) {
            const scaleOutput = `scale${context.inputIndex}`

            context.filters.push({
                filter: "scale",
                options: { w: this.width ?? -1, h: this.height ?? -1 },
                inputs: currentVideoOutput,
                outputs: scaleOutput,
            })

            currentVideoOutput = scaleOutput
        }

        if (this.fadeIn && this.fadeIn > 0) {
            const fadeInOutput = `fadeIn${context.inputIndex}`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentVideoOutput,
                outputs: fadeInOutput
            })

            currentVideoOutput = fadeInOutput
        }

        if (this.fadeOut && this.fadeOut > 0) {
            const start = Math.max(this.duration - this.fadeOut, 0)
            const fadeOutOutput = `[v${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentVideoOutput,
                outputs: fadeOutOutput
            })

            currentVideoOutput = fadeOutOutput
        }

        if (!this.fadeOut || this.fadeOut <= 0) {
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
