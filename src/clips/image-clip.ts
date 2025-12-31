import { FFmpegInput } from "../ffmpeg-input"
import { RenderContext } from "../render-context"
import { Axis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type ImageClipOptions<RenderData> = {
    path: string
    x?: Axis<RenderData>
    y?: Axis<RenderData>
    width?: number
    height?: number
    duration: number
    fadeIn?: number
    fadeOut?: number
}

export class ImageClip<RenderData> extends Clip<RenderData> {
    readonly x?: Axis<RenderData>
    readonly y?: Axis<RenderData>
    readonly duration: number
    readonly path: string
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly width?: number
    readonly height?: number

    constructor({
        x,
        y,
        duration,
        path,
        width,
        height,
        fadeIn,
        fadeOut
    }: ImageClipOptions<RenderData>) {
        super()
        this.x = x
        this.y = y
        this.duration = duration
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.width = width
        this.height = height
    }

    protected getInput(inputIndex: number, fps: number): FFmpegInput {
        return {
            path: this.path,
            index: Number(inputIndex),
            alias: `[${inputIndex}:v]`,
            type: "image" as const,
            options: [
                "-loop 1",
                `-t ${this.duration}`,
                `-framerate ${fps}`
            ]
        }

    }

    build(data: RenderData, context: RenderContext): void {
        const input = this.getInput(context.inputIndex, context.fps)
        const inputAlias = input.alias
        let currentOutput = inputAlias

        context.command
            .input(input.path)
            .inputOptions(input.options!)

        if (this.width !== undefined || this.height !== undefined) {
            const scaleOutput = `scale${context.inputIndex}`

            context.filters.push({
                filter: "scale",
                options: { w: this.width ?? -1, h: this.height ?? -1 },
                inputs: currentOutput,
                outputs: scaleOutput,
            })

            currentOutput = scaleOutput
        }

        if (this.fadeIn && this.fadeIn > 0) {
            const fadeInOutput = `fadeIn${context.inputIndex}`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentOutput,
                outputs: fadeInOutput
            })

            currentOutput = fadeInOutput
        }

        if (this.fadeOut && this.fadeOut > 0) {
            const start = Math.max(this.duration - this.fadeOut, 0)
            const fadeOutOutput = `[v${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentOutput,
                outputs: fadeOutOutput
            })

            currentOutput = fadeOutOutput
        }

        if (!this.fadeOut || this.fadeOut <= 0) {
            context.filters.push({
                filter: "null",
                inputs: currentOutput,
                outputs: `[v${context.inputIndex}]`
            })
        }

        context.labels.push(`[v${context.inputIndex}]`)
        context.inputIndex++
    }
}
