import { RenderContext } from "../render-context"
import { Clip } from "./clip"

export type CompositionClipOptions<RenderData> = {
    clips: Clip<RenderData>[]
}

export class CompositionClip<RenderData> extends Clip<RenderData> {
    readonly clips: Clip<RenderData>[]

    constructor({ clips }: CompositionClipOptions<RenderData>) {
        super()

        if (clips.length === 0) {
            throw new Error("CompositionClip: at least one clip is required")
        }

        this.clips = clips
    }

    getFilters(inputIndex: number, data: RenderData, context: RenderContext): string[] {
        const filters: string[] = []

        let currentBase = `[base${inputIndex}]`
        let layerIndex = 0

        for (const clip of this.clips) {
            const clipFilters = clip.getFilters(layerIndex, data, context)
            filters.push(...clipFilters)

            const clipOutput = `[layer${layerIndex}]`

            currentBase = clipOutput
            layerIndex++
        }

        return filters
    }
}
