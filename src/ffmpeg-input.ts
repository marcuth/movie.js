export type FFmpegInput = {
    path: string
    index: number
    alias: string
    type: "video" | "audio" | "image" | "rectangle"
    options?: string[]
}