import { Clip } from "./clip"

export type ClipFuncionOptions = {
    index: number
    length: number
}

export type ClipFuncion<RenderData, Item> = (item: Item, options: ClipFuncionOptions) => Clip<RenderData>

export type RepeatClipOptions<RenderData, Item> = {
    each: (data: RenderData) => Item[]
    clip: ClipFuncion<RenderData, Item>
}

export class RepeatClip<RenderData, Item> extends Clip<RepeatClipOptions<RenderData, Item>> {
    constructor(options: RepeatClipOptions<RenderData, Item>) {
        super(options)
    }

    getVideoFilters(): string[] {
        return []
    }

    getAudioFilters(): string[] {
        return []
    }
}