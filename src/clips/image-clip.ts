import { Axis, resolveAxis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type ImageClipOptions<RenderData> = {
    path: string
    x: Axis<RenderData>
    y: Axis<RenderData>
    width?: number
    height?: number
    duration: number
    fadeIn?: number
    fadeOut?: number
}

export class ImageClip<RenderData> extends Clip<RenderData> {
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly duration: number
    readonly path: string
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly width?: number
    readonly height?: number
    readonly videoFilters: string[] = []
    readonly audioFilters: string[] = []

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

    getInputs(inputIndex: number) {
        return [
            {
                path: this.path,
                alias: `[i${inputIndex}:v]`,
                type: "image",
                options: ["-loop 1"]
            }
        ]
    }

    getFilters(inputIndex: number, data: RenderData): string[] {
        const filters: string[] = []

        const imageIn = `[i${inputIndex}:v]`
        const imageStream = `[img${inputIndex}]`
        const baseStream = `[base${inputIndex}]`
        const outStream = `[layer${inputIndex}]`

        if (this.width || this.height) {
            filters.push(
                `${imageIn}scale=${this.width ?? -1}:${this.height ?? -1}${imageStream}`
            )
        } else {
            filters.push(
                `${imageIn}null${imageStream}`
            )
        }

        if (this.fadeIn) {
            filters.push(
                `${imageStream}fade=t=in:st=0:d=${this.fadeIn}:alpha=1${imageStream}`
            )
        }

        if (this.fadeOut) {
            const start = this.duration - this.fadeOut
            filters.push(
                `${imageStream}fade=t=out:st=${start}:d=${this.fadeOut}:alpha=1${imageStream}`
            )
        }

        const x = resolveAxis({ axis: this.x, data, index: inputIndex })
        const y = resolveAxis({ axis: this.y, data, index: inputIndex })

        filters.push(
            `${baseStream}${imageStream}overlay=${x}:${y}:enable='between(t,0,${this.duration})'${outStream}`
        )

        return filters
    }
}