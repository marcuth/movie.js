import { Path, resolvePath } from "../utils/resolve-path"
import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"
import { Clip } from "./clip"
import { easingExpr } from "../utils/easing-expr"

export type ImageClipOptions<RenderData> = {
    path: Path<RenderData>
    width?: number
    height?: number
    duration: number
    fadeIn?: number
    fadeOut?: number
    scroll?: {
        axis?: "auto" | "x" | "y"
        direction?: "forward" | "backward"
        easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"
    }
}

export class ImageClip<RenderData> extends Clip<RenderData> {
    readonly duration: number
    readonly path: Path<RenderData>
    readonly fadeIn?: number
    readonly fadeOut?: number
    readonly width: number
    readonly height: number
    readonly scroll?: {
        axis?: "auto" | "x" | "y"
        direction?: "forward" | "backward"
        easing?: "linear" | "easeIn" | "easeOut" | "easeInOut"
    }

    constructor({
        duration,
        path,
        width,
        height,
        fadeIn,
        fadeOut,
        scroll
    }: ImageClipOptions<RenderData>) {
        super()

        this.duration = duration
        this.path = path
        this.fadeIn = fadeIn
        this.fadeOut = fadeOut
        this.width = width || -1
        this.height = height || -1
        this.scroll = scroll
    }

    protected getInput(path: string, inputIndex: number, fps: number): FFmpegInput {
        return {
            path: path,
            index: Number(inputIndex),
            aliases: {
                video: `[${inputIndex}:v]`,
                audio: `[a${inputIndex}]`
            },
            type: "image" as const,
            options: [
                "-loop 1",
                `-t ${this.duration}`,
                `-framerate ${fps}`
            ]
        }

    }

    build(data: RenderData, context: RenderContext): void {
        const path = resolvePath({ path: this.path, data: data, index: context.clipIndex })
        const input = this.getInput(path, context.inputIndex, context.fps)
        let currentVideoOutput = input.aliases.video
        const currentAudioOutput = input.aliases.audio

        context.command
            .input(input.path)
            .inputOptions(input.options!)

        const anullSrcLabel = `[anull${context.inputIndex}]`

        context.filters.push({
            filter: "anullsrc",
            options: { sample_rate: 44100, channel_layout: "stereo" },
            outputs: anullSrcLabel,
        })

        context.filters.push({
            filter: "atrim",
            options: { end: this.duration },
            inputs: anullSrcLabel,
            outputs: currentAudioOutput,
        })

        const hasCanvas = this.width !== -1 || this.height !== -1

        if (hasCanvas && this.scroll) {
            const scaleOutput = `scale${context.inputIndex}`

            const { axis = "auto" } = this.scroll

            let scaleOptions: Record<string, string | number> | null = null

            if (axis === "y" || axis === "auto") {
                scaleOptions = {
                    w: this.width,
                    h: -1,
                }
            } else if (axis === "x") {
                scaleOptions = {
                    w: -1,
                    h: this.height,
                }
            }

            if (!scaleOptions) {
                throw new Error("Invalid scale options")
            }

            context.filters.push({
                filter: "scale",
                options: scaleOptions,
                inputs: currentVideoOutput,
                outputs: scaleOutput,
            })

            currentVideoOutput = scaleOutput
        } else if (hasCanvas && !this.scroll) {
            const scaleOutput = `scale${context.inputIndex}`

            context.filters.push({
                filter: "scale",
                options: {
                    w: this.width,
                    h: this.height,
                    force_original_aspect_ratio: "increase",
                },
                inputs: currentVideoOutput,
                outputs: scaleOutput,
            })

            const fitOutput = `fit${context.inputIndex}`

            context.filters.push({
                filter: "crop",
                options: {
                    w: this.width,
                    h: this.height,
                    x: "(iw-ow)/2",
                    y: "(ih-oh)/2",
                },
                inputs: scaleOutput,
                outputs: fitOutput,
            })

            currentVideoOutput = fitOutput
        }

        if (this.scroll) {
            const {
                axis = "auto",
                direction = "forward",
                easing = "linear",
            } = this.scroll

            const cropOutput = `scroll${context.inputIndex}`

            const tNorm = `t/${this.duration}`
            const eased = easingExpr(easing, tNorm)
            const movement = direction === "backward" ? `1-(${eased})` : eased

            let cropOptions: Record<string, string | number> | null = null

            if (axis === "y" || axis === "auto") {
                cropOptions = {
                    w: this.width,
                    h: this.height,
                    x: 0,
                    y: `(ih-oh)*(${movement})`,
                }
            }

            if (axis === "x") {
                cropOptions = {
                    w: this.width,
                    h: this.height,
                    x: `(iw-ow)*(${movement})`,
                    y: 0,
                }
            }

            if (!cropOptions) {
                throw new Error("Invalid crop options")
            }

            context.filters.push({
                filter: "crop",
                options: cropOptions,
                inputs: currentVideoOutput,
                outputs: cropOutput,
            })

            currentVideoOutput = cropOutput
        }

        if (this.fadeIn && this.fadeIn > 0) {
            const fadeInOutput = `fadeIn${context.inputIndex}`

            context.filters.push({
                filter: "fade",
                options: { t: "in", st: 0, d: this.fadeIn },
                inputs: currentVideoOutput,
                outputs: fadeInOutput
            })

            currentVideoOutput = fadeInOutput
        }

        if (this.fadeOut && this.fadeOut > 0) {
            const start = Math.max(this.duration - this.fadeOut, 0)
            const fadeOutOutput = `[v${context.inputIndex}]`

            context.filters.push({
                filter: "fade",
                options: { t: "out", st: start, d: this.fadeOut },
                inputs: currentVideoOutput,
                outputs: fadeOutOutput
            })

            currentVideoOutput = fadeOutOutput
        }

        if (!this.fadeOut || this.fadeOut <= 0) {
            context.filters.push({
                filter: "null",
                inputs: currentVideoOutput,
                outputs: `[v${context.inputIndex}]`
            })
        }

        context.labels.video.push(`[v${context.inputIndex}]`)
        context.labels.structuralAudio.push(currentAudioOutput)

        context.inputIndex++
    }
}
