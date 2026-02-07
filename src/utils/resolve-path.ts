export type ComputePathOptions<RenderData> = {
    data: RenderData
    index: number
}

export type ComputePath<RenderData> = (options: ComputePathOptions<RenderData>) => string

export type Path<RenderData> = ComputePath<RenderData> | string

export type ResolvePathOptions<RenderData> = {
    path: Path<RenderData>
    data: RenderData
    index: number
}

export function resolvePath<RenderData>({ path, ...params }: ResolvePathOptions<RenderData>): string {
    if (typeof path === "function") {
        return path(params)
    }

    return path
}
