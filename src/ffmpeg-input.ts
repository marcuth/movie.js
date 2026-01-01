export type FFmpegInput = {
    path: string
    index: number
    aliases: {
        video?: string
        audio: string
    }
    type: "video" | "audio" | "image" | "rectangle"
    options?: string[]
}