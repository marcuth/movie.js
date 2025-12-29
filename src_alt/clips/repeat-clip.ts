import { Clip } from "./clip"

export type RepeatClipOptions<RenderData, Item> = {
    each: (data: RenderData) => Item[]
    x: number
    y: number
    width?: number
    height?: number
}

export class RepeatClip<RenderData, Item> extends Clip {
    constructor(options: RepeatClipOptions<RenderData, Item>) {
        super()
    }
}