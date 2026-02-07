import { RenderContext } from "../render-context"
import { FFmpegInput } from "../ffmpeg-input"

export type WhenOptions<Data> = {
    data: Data
    index: number
}

export type WhenFunction<RenderData> = (options: WhenOptions<RenderData>) => boolean

export abstract class Clip<RenderData> {
    constructor(protected readonly when?: WhenFunction<RenderData>) {}

    readonly videoFilters: string[] = []
    readonly audioFilters: string[] = []

    shouldRender(data: RenderData, index = 0): boolean {
        return this.when ? this.when({ data, index }) : true
    }

    protected getInput(path: string, inputIndex: number, fps?: number): FFmpegInput {
        throw new Error("Method not implemented.")
    }

    abstract build(data: RenderData, context: RenderContext): Promise<number>
}
