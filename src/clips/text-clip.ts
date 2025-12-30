import { Axis, resolveAxis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type TextClipFontOptions = {
    size: number
    color: string
    filePath?: string
}

export type TextClipOptions<RenderData> = {
    text: string
    x: Axis<RenderData>
    y: Axis<RenderData>
    duration: number
    font: TextClipFontOptions
    fadeIn?: number
    fadeOut?: number
}

export class TextClip<RenderData> extends Clip<RenderData> {
    readonly text: string
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly duration: number
    readonly font: TextClipFontOptions
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly videoFilters: string[] = []
    readonly audioFilters: string[] = []

    constructor({
        text,
        x,
        y,
        duration,
        font,
        fadeIn,
        fadeOut
    }: TextClipOptions<RenderData>) {
        super()

        this.text = text
        this.x = x
        this.y = y
        this.duration = duration
        this.font = font
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    getFilters(inputIndex: number, data: RenderData): string[] {
        const filters: string[] = []

        const inStream = `[base${inputIndex}]`
        const outStream = `[text${inputIndex}]`

        const x = resolveAxis({ axis: this.x, data, index: inputIndex })
        const y = resolveAxis({ axis: this.y, data, index: inputIndex })

        const {
            size,
            color,
            filePath
        } = this.font

        const safeText = this.text
            .replace(/:/g, "\\:")
            .replace(/'/g, "\\'")
            .replace(/\n/g, "\\n")

        const drawTextParts = [
            `text='${safeText}'`,
            `x=${x}`,
            `y=${y}`,
            `fontsize=${size}`,
            `fontcolor=${color}`,
            `enable='between(t,0,${this.duration})'`
        ]

        if (filePath) {
            drawTextParts.push(`fontfile='${filePath}'`)
        }

        filters.push(
            `${inStream}drawtext=${drawTextParts.join(":")}${outStream}`
        )

        if (this.fadeIn) {
            filters.push(
                `${outStream}fade=t=in:st=0:d=${this.fadeIn}:alpha=1${outStream}`
            )
        }

        if (this.fadeOut) {
            const start = this.duration - this.fadeOut
            filters.push(
                `${outStream}fade=t=out:st=${start}:d=${this.fadeOut}:alpha=1${outStream}`
            )
        }

        return filters
    }
}