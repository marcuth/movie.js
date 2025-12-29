import { Clip } from "./clip"

export type AudioClipOptions = {
    path: string
    volume?: number
    loop?: boolean
    subClip?: [number, number]
    fadeIn?: number
    fadeOut?: number
}

export class AudioClip extends Clip {
    readonly path: string
    readonly volume?: number
    readonly loop?: boolean
    readonly subClip?: [number, number]
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly videoFilters: string[] = []
    readonly audioFilters: string[] = []

    constructor({
        path,
        volume,
        loop,
        subClip,
        fadeIn,
        fadeOut
    }: AudioClipOptions) {
        super()

        this.path = path
        this.volume = volume
        this.loop = loop
        this.subClip = subClip
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }
}