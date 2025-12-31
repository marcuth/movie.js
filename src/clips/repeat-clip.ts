import { RenderContext } from "../render-context"
import { Axis } from "../utils/resolve-axis"
import { Clip } from "./clip"

export type EachOptions<Data> = {
    data: Data
    index: number
}

export type ClipFunctionOptions = {
    index: number
    length: number
}

export type ClipFunction<RenderData, Item> = (item: Item, options: ClipFunctionOptions) => Clip<RenderData>

export type RepeatClipOptions<RenderData, Item> = {
    each: EachFunction<RenderData, Item>
    x?: Axis<RenderData>
    y?: Axis<RenderData>
    clip: ClipFunction<RenderData, Item>
}

export type EachFunction<Data, Item> = (options: EachOptions<Data>) => Item[]

export class RepeatClip<RenderData, Item> extends Clip<RenderData> {
    readonly each: EachFunction<RenderData, Item>
    readonly clip: ClipFunction<RenderData, Item>
    readonly x?: Axis<RenderData>
    readonly y?: Axis<RenderData>

    constructor({
        each,
        x,
        y,
        clip,
    }: RepeatClipOptions<RenderData, Item>) {
        super()
        this.each = each
        this.clip = clip
        this.x = x
        this.y = y
    }

    build(data: RenderData, context: RenderContext): void {
        const items = this.each({ data: data, index: 0 })
        const length = items.length

        for (let i = 0; i < length; i++) {
            const item = items[i]
            const clip = this.clip(item, { index: i, length: length })
            clip.build(data, context)
        }
    }
}
