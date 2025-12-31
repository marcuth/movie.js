import { RenderContext } from "../render-context"
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

    build(data: RenderData, context: RenderContext): void {
        
    }
}