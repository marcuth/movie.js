import { Clip } from "./clip"

export type TextClipFontOptions = {
    size: number
    color: string
    filePath?: string
}

export type TextClipOptions = {
    text: string
    x: number
    y: number
    duration: number
    font: TextClipFontOptions
    fadeIn?: number
    fadeOut?: number
}

export class TextClip extends Clip {
    readonly text: string
    readonly x: number
    readonly y: number
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
    }: TextClipOptions) {
        super()

        this.text = text
        this.x = x
        this.y = y
        this.duration = duration
        this.font = font
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }
}