export type ComputeAxisOptions<RenderData> = {
    data: RenderData
    index: number
}

export type ComputeAxis<RenderData> = (options: ComputeAxisOptions<RenderData>) => number

export type Axis<RenderData> = ComputeAxis<RenderData> | number

export type ResolveAxisOptions<RenderData> = {
    axis: Axis<RenderData>
    data: RenderData
    index: number
}

export function resolveAxis<RenderData>({ axis, ...params }: ResolveAxisOptions<RenderData>): number {
    if (typeof axis === "function") {
        return axis(params)
    }

    return axis
}
