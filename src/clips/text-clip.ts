import { Clip } from "./clip"

export type TextClipOptions = {
    text: string
    duration: number
    x: number | string
    y: number | string
    font: {
        filePath?: string
        size: number
        color: string
    }
}

export class TextClip extends Clip<TextClipOptions> {
    getVideoFilters(): string[] {
        const {
            x = "(w-text_w)/2",
            y = "(h-text_h)/2",
            duration,
            font,
            text
        } = this.options

        const escapedText = text
            .replace(/:/g, "\\:")
            .replace(/'/g, "\\'")
            .replace(/\n/g, "\\n")

        const drawtextParts = [
            `text='${escapedText}'`,
            `fontsize=${font.size}`,
            `fontcolor=${font.color}`,
            `x=${x}`,
            `y=${y}`,
            `enable='between(t,0,${duration})'`
        ]

        if (font.filePath) {
            drawtextParts.push(`fontfile=${font.filePath}`)
        }

        return [`drawtext=${drawtextParts.join(":")}`]
    }

    getAudioFilters(): string[] {
        return []
    }
}