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

    build(data: RenderData, context: RenderContext): void {
        
    }
}
