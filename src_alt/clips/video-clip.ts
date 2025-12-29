import { Clip } from "./clip"

export type VideoClipOptions = {
    path: string
    x: number
    y: number
    subClip?: [number, number]
    width?: number // para redimensionar o vídeo
    height?: number // para redimensionar o vídeo
    fadeIn?: number
    fadeOut?: number
}

export class VideoClip extends Clip {
    readonly path: string
    readonly x: number
    readonly y: number
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
        height
    }: VideoClipOptions) {
        super()

        this.path = path
        this.x = x
        this.y = y
        this.subClip = subClip
        this.width = width
        this.height = height
    }
}