export type FFmpegFilterOptions =
    | string
    | string[]
    | Record<string, any>

export type FFmpegFilterSpec = {
    filter: string
    inputs?: string | string[]
    outputs?: string | string[]
    options?: FFmpegFilterOptions
}