import { TextClipFontOptions } from "../clips"

export type FontConfigOptions = {
    color?: string
    filePath?: string
}

export type PartialFontOptions = {
    size: number
    color?: string
}

export function fontConfig(options: FontConfigOptions) {
    return (partialOptions: PartialFontOptions): TextClipFontOptions => {
        const color = options.color ?? partialOptions.color
        const filePath = options.filePath
        const size = partialOptions.size

        if (!color) {
            throw new Error("Font color is required")
        }

        return {
            size: size,
            color: color,
            filePath: filePath,
        }
    }
}
