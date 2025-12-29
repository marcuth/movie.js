import { Clip } from "./clip"

export type ImageClipOptions = {
    path: string
    x: number
    y: number
    width?: number
    height?: number
    duration: number
    fadeIn?: number
    fadeOut?: number
}

export class ImageClip extends Clip {
    readonly x: number
    readonly y: number
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
    }: ImageClipOptions) {
        super()

        this.x = x
        this.y = y
        this.duration = duration
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.width = width
        this.height = height

        if (width !== undefined || height !== undefined) {
            this.videoFilters.push(`scale=${width ?? -1}:${height ?? -1}`)
        }

        if (fadeIn !== undefined) {
            this.videoFilters.push(`fade=t=in:st=0:d=${fadeIn}`)
        }

        if (fadeOut !== undefined) {
            this.videoFilters.push(`fade=t=out:st=${duration - fadeOut}:d=${fadeOut}`)
        }
    }
}