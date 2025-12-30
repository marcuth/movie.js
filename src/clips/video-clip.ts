import { FFmpegFilterSpec } from "../ffmpeg-filter-spec"
import { Axis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type VideoClipOptions<RenderData> = {
    path: string
    x: Axis<RenderData>
    y: Axis<RenderData>
    subClip?: [number, number]
    width?: number // para redimensionar o vídeo
    height?: number // para redimensionar o vídeo
    fadeIn?: number
    fadeOut?: number
}

export class VideoClip<RenderData> extends Clip<RenderData> {
    readonly path: string
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly subClip?: [number, number]
    readonly width?: number
    readonly height?: number
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly videoFilters: string[] = []
    readonly audioFilters: string[] = []

    constructor({
        path,
        x,
        y,
        subClip,
        width,
        height,
        fadeIn,
        fadeOut
    }: VideoClipOptions<RenderData>) {
        super()

        this.path = path
        this.x = x
        this.y = y
        this.subClip = subClip
        this.width = width
        this.height = height
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    getInputs(inputIndex: number) {
        return [{ path: this.path, alias: `[v${inputIndex}:v]`, type: "video" }]
    }

    getFilters(inputIndex: number, data: RenderData): string[] {
        const filters: string[] = []

        const inStream = `[v${inputIndex}:v]`
        const outStream = `[video${inputIndex}]`

        if (this.width || this.height) {
            filters.push(
                `${inStream}scale=${this.width ?? -1}:${this.height ?? -1}${outStream}`
            )
        } else {
            filters.push(
                `${inStream}null${outStream}`
            )
        }

        if (this.fadeIn) {
            filters.push(
                `${outStream}fade=t=in:st=0:d=${this.fadeIn}${outStream}`
            )
        }

        if (this.fadeOut) {
            filters.push(
                `${outStream}fade=t=out:st=${this.fadeOut}:d=${this.fadeOut}${outStream}`
            )
        }

        return filters
    }
}