import { Clip } from "./clip"

export type ImageClipOptions = {
    path: string
    width?: number
    height?: number
    x?: number | string
    y?: number | string
    start?: number
    duration?: number
}

export class ImageClip extends Clip<ImageClipOptions> {
    getVideoFilters(): string[] {
        return []
    }

    getAudioFilters(): string[] {
        return []
    }

    buildOverlayFilter(
        baseVideo: string,
        imageLabel: string,
        outputLabel: string
    ): string {
        const {
            width,
            height,
            x = "0",
            y = "0",
            start = 0,
            duration
        } = this.options

        const enable =
            duration !== undefined
                ? `:enable='between(t,${start},${start + duration})'`
                : start > 0
                    ? `:enable='gte(t,${start})'`
                    : ""

        const scale =
            width || height
                ? `[${imageLabel}]scale=${width ?? -1}:${height ?? -1}[${imageLabel}s];`
                : ""

        return (
            scale +
            `${baseVideo}[${imageLabel}]overlay=` +
            `x=${x}:y=${y}${enable}[${outputLabel}]`
        )
    }

    get inputOptions(): string[] {
        return [
            "-loop 1",
            `-t ${this.options.duration}`
        ]
    }
}
