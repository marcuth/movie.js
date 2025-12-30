import { RenderContext } from "../render-context"
import { Axis, resolveAxis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type GroupClipOptions<RenderData> = {
    x: Axis<RenderData>
    y: Axis<RenderData>
    clips: Clip<RenderData>[]
}

export class GroupClip<RenderData> extends Clip<RenderData> {
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>
    readonly clips: Clip<RenderData>[]

    constructor(options: GroupClipOptions<RenderData>) {
        super()

        this.x = options.x
        this.y = options.y
        this.clips = options.clips
    }

    getFilters(
        inputIndex: number,
        data: RenderData,
        context: RenderContext
    ): string[] {
        const filters: string[] = []

        const dx = resolveAxis({ axis: this.x, data, index: inputIndex })
        const dy = resolveAxis({ axis: this.y, data, index: inputIndex })

        const nextContext = {
            offsetX: context.offsetX + dx,
            offsetY: context.offsetY + dy
        }

        let childIndex = inputIndex

        for (const clip of this.clips) {
            const clipFilters = clip.getFilters(childIndex, data, nextContext)
            filters.push(...clipFilters)
            childIndex++
        }

        return filters
    }
}
