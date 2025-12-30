import { Clip } from "./clip"

export type AudioClipOptions = {
    path: string
    volume?: number
    loop?: boolean
    subClip?: [number, number]
    fadeIn?: number
    fadeOut?: number
}

export class AudioClip<RenderData> extends Clip<RenderData> {
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

    getInputs(inputIndex: number) {
        const inputOptions: string[] = []

        if (this.loop) {
            inputOptions.push("-stream_loop", "-1")
        }

        if (this.subClip) {
            const [start, end] = this.subClip
            inputOptions.push("-ss", `${start}`)
            inputOptions.push("-to", `${end}`)
        }

        return [
            {
                path: this.path,
                alias: `[a${inputIndex}:a]`,
                type: "audio",
                options: inputOptions
            }
        ]
    }

    getFilters(inputIndex: number): string[] {
        const filters: string[] = []

        const inStream = `[a${inputIndex}:a]`
        const outStream = `[audio${inputIndex}]`

        let current = inStream

        if (this.volume !== undefined) {
            filters.push(
                `${current}volume=${this.volume}${outStream}`
            )
            current = outStream
        }

        if (this.fadeIn) {
            filters.push(
                `${current}afade=t=in:st=0:d=${this.fadeIn}${outStream}`
            )
            current = outStream
        }

        if (this.fadeOut) {
            filters.push(
                `${current}afade=t=out:st=${this.fadeOut}:d=${this.fadeOut}${outStream}`
            )
            current = outStream
        }

        if (filters.length === 0) {
            filters.push(
                `${inStream}anull${outStream}`
            )
        }

        return filters
    }
}