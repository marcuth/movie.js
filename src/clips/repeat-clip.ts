import { RenderContext } from "../render-context"
import { Axis, resolveAxis } from "../utils/resolve-axis"
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
    x: Axis<RenderData>
    y: Axis<RenderData>
    clip: ClipFunction<RenderData, Item>
}

export type EachFunction<Data, Item> = (options: EachOptions<Data>) => Item[]

export class RepeatClip<RenderData, Item> extends Clip<RenderData> {
    readonly each: EachFunction<RenderData, Item>
    readonly clip: ClipFunction<RenderData, Item>
    readonly x: Axis<RenderData>
    readonly y: Axis<RenderData>

    constructor({
        each,
        x,
        y,
        clip,
    }: RepeatClipOptions<RenderData, Item>) {
        super()

        this.each = each
        this.clip = clip
        this.x =  x
        this.y = y
    }

    getFilters(
        inputIndex: number,
        data: RenderData,
        context: RenderContext
    ): string[] {
        const filters: string[] = []

        const items = this.each({ data, index: inputIndex })
        if (!items || items.length === 0) return filters

        let currentIndex = inputIndex

        for (let i = 0; i < items.length; i++) {
            const item = items[i]

            const dx = resolveAxis({
                axis: this.x,
                data,
                index: i,
            })

            const dy = resolveAxis({
                axis: this.y,
                data,
                index: i,
            })

            const nextContext = {
                offsetX: context.offsetX + dx,
                offsetY: context.offsetY + dy,
            }

            const clip = this.clip(item, { index: i, length: items.length })

            const childFilters = clip.getFilters(
                currentIndex,
                data,
                nextContext
            )

            filters.push(...childFilters)
            currentIndex++
        }

        return filters
    }
}