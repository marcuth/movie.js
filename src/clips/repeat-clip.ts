import { RenderContext } from "../render-context"
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
    clip: ClipFunction<RenderData, Item>
}

export type EachFunction<Data, Item> = (options: EachOptions<Data>) => Item[]

export class RepeatClip<RenderData, Item> extends Clip<RenderData> {
    readonly each: EachFunction<RenderData, Item>
    readonly clip: ClipFunction<RenderData, Item>

    constructor({
        each,
        clip,
    }: RepeatClipOptions<RenderData, Item>) {
        super()
        this.each = each
        this.clip = clip
    }

    async build(data: RenderData, context: RenderContext): Promise<void> {
        const items = this.each({ data: data, index: 0 })
        const length = items.length

        for (let i = 0; i < length; i++) {
            const item = items[i]
            const clip = this.clip(item, { index: i, length: length })

            const oldClipIndex = context.clipIndex
            context.clipIndex = i
            await clip.build(data, context)
            context.clipIndex = oldClipIndex
        }
    }
}
