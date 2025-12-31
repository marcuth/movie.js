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

    protected getInputs(inputIndex: number): FFmpegInput {
        return {
            path: this.path,
            alias: `[${inputIndex}:v]`,
            type: "video",
            index: inputIndex,
        }
    }

    build(data: RenderData, context: RenderContext): void {
        const input = this.getInputs(context.inputIndex)
        const inputAlias = input.alias
        let currentOutput = inputAlias

        context.command
            .input(input.path)

        if (this.fadeIn !== undefined && this.fadeIn > 0) {
            const fadeInOutput = `fadeIn${context.inputIndex}`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentOutput,
                outputs: fadeInOutput
            })

            currentOutput = fadeInOutput
        }

        if (this.fadeOut !== undefined && this.fadeOut > 0) {
            const fadeOutOutput = `[v${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: `0`, d: this.fadeOut },
                inputs: currentOutput,
                outputs: fadeOutOutput
            })

            currentOutput = fadeOutOutput
        } else {
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
