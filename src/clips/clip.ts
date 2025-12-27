import { RenderContext } from "../render-context"

export type WhenOptions<Data> = {
    data: Data
    index: number
}

export type WhenFunction<Data> = (options: WhenOptions<Data>) => boolean

export type RenderOptions<Data> = {
    context: RenderContext  
    data: Data
    index?: number
}

export abstract class Clip<ClipOptions, Data = any> {
    constructor(readonly options: ClipOptions, protected readonly when?: WhenFunction<Data>) {}

    abstract getVideoFilters(): string[]
    
    abstract getAudioFilters(): string[]
    
    shouldRender(data: Data, index = 0): boolean {
        return this.when ? this.when({ data, index }) : true
    }
}