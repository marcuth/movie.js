import { RenderContext } from "../render-context"

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

    getFilters(inputIndex: number, data: RenderData, context: RenderContext): string[] {
        return []
    }

    getInputs(inputIndex: number) {
        throw new Error("Method not implemented.")
    }
}