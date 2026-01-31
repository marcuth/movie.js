export type ComputePropertyOptions<RenderData> = {
    data: RenderData
    index: number
}

export type ComputeProperty<RenderData, T> = (options: ComputePropertyOptions<RenderData>) => T

export type Property<RenderData, T> = ComputeProperty<RenderData, T> | T

export type ResolvePropertyOptions<RenderData, T> = {
    property: Property<RenderData, T>
    data: RenderData
    index: number
}

export function resolveProperty<RenderData, T>({ property, ...params }: ResolvePropertyOptions<RenderData, T>): T {
    if (typeof property === "function") {
        return (property as ComputeProperty<RenderData, T>)(params)
    }

    return property
}
