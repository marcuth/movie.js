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

    build(data: RenderData, context: RenderContext): void {
        for (const clip of this.clips) {
            if (!clip.shouldRender(data, 0)) {
                continue
            }

            clip.build(data, context)
        }
    }
}
