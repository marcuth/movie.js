import { Property, resolveProperty } from "../utils/resolve-property"
import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"
import { Clip } from "./clip"

export type TextClipOptions<RenderData> = {
    text: Property<RenderData, string>
    duration: Property<RenderData, number>
    width?: number
    height?: number
    backgroundColor?: string
    fontSize?: number
    fontColor?: string
    fontPath?: string
    x?: string
    y?: string
    fadeIn?: number
    fadeOut?: number
}

export class TextClip<RenderData> extends Clip<RenderData> {
    readonly text: Property<RenderData, string>
    readonly duration: Property<RenderData, number>
    readonly width: number
    readonly height: number
    readonly backgroundColor: string
    readonly fontSize: number
    readonly fontColor: string
    readonly fontPath?: string
    readonly x: string
    readonly y: string
    readonly fadeIn?: number
    readonly fadeOut?: number

    constructor({
        text,
        duration,
        width = 1920,
        height = 1080,
        backgroundColor = "black",
        fontSize = 72,
        fontColor = "white",
        fontPath,
        x = "(w-text_w)/2",
        y = "(h-text_h)/2",
        fadeIn,
        fadeOut,
    }: TextClipOptions<RenderData>) {
        super()
        this.text = text
        this.duration = duration
        this.width = width
        this.height = height
        this.backgroundColor = backgroundColor
        this.fontSize = fontSize
        this.fontColor = fontColor
        this.fontPath = fontPath
        this.x = x
        this.y = y
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
    }

    protected getTextInput(inputIndex: number, duration: number): FFmpegInput {
        return {
            path: `color=c=${this.backgroundColor}:s=${this.width}x${this.height}:d=${duration}`,
            index: inputIndex,
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[a${inputIndex}]`,
            },
            type: "video",
            options: ["-f lavfi"],
        }
    }

    async build(data: RenderData, context: RenderContext): Promise<number> {
        const text = resolveProperty({ property: this.text, data, index: context.clipIndex })
        const duration = resolveProperty({ property: this.duration, data, index: context.clipIndex })

        const input = this.getTextInput(context.inputIndex, duration)
        let currentVideoOutput = input.aliases.video
        const currentAudioOutput = input.aliases.audio

        context.command.input(input.path).inputOptions(input.options!)

        const drawTextOutput = `drawtext${context.inputIndex}`
        const drawTextOptions: Record<string, string | number> = {
            text: text,
            fontsize: this.fontSize,
            fontcolor: this.fontColor,
            x: this.x,
            y: this.y,
        }

        if (this.fontPath) {
            drawTextOptions.fontfile = this.fontPath
        }

        context.filters.push({
            filter: "drawtext",
            options: drawTextOptions,
            inputs: currentVideoOutput,
            outputs: drawTextOutput,
        })

        currentVideoOutput = drawTextOutput

        const anullSrcLabel = `[anull${context.inputIndex}]`

        context.filters.push({
            filter: "anullsrc",
            options: { sample_rate: 44100, channel_layout: "stereo" },
            outputs: anullSrcLabel,
        })

        context.filters.push({
            filter: "atrim",
            options: { end: duration },
            inputs: anullSrcLabel,
            outputs: currentAudioOutput,
        })

        if (this.fadeIn && this.fadeIn > 0) {
            const fadeInOutput = `fadeIn${context.inputIndex}`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentVideoOutput,
                outputs: fadeInOutput,
            })

            currentVideoOutput = fadeInOutput
        }

        if (this.fadeOut && this.fadeOut > 0) {
            const start = Math.max(duration - this.fadeOut, 0)
            const fadeOutOutput = `[v${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentVideoOutput,
                outputs: fadeOutOutput,
            })

            currentVideoOutput = fadeOutOutput
        } else {
            context.filters.push({
                filter: "null",
                inputs: currentVideoOutput,
                outputs: `[v${context.inputIndex}]`,
            })
        }

        context.labels.video.push(`[v${context.inputIndex}]`)
        context.labels.structuralAudio.push(currentAudioOutput)

        context.inputIndex++

        return duration
    }
}
