import { FFmpegInput } from "../ffmpeg-input"
import { RenderContext } from "../render-context"
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

    protected getInputs(inputIndex: number): FFmpegInput[] {
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
                options: inputOptions,
                index: inputIndex
            }
        ]
    }

    build(data: RenderData, context: RenderContext): void {

    }
}