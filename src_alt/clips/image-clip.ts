import { Clip } from "./clip"

export type ImageClipOptions = {
    path: string
    x: number | string
    y: number | string
    duration: number
    fadeIn?: number
    fadeOut?: number
}

export class ImageClip extends Clip {
    readonly x: number | string
    readonly y: number | string
    readonly duration: number
    readonly path: string
    readonly fadeIn?: number
    readonly fadeOut?: number

    constructor({
        x,
        y,
        duration,
        path,
        fadeIn,
        fadeOut
    }: ImageClipOptions) {
        super()

        this.x = x
        this.y = y
        this.duration = duration
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    get audioFilters(): string[] {
        return []
    }

    get videoFilters(): string[] {
        return []
    }
}