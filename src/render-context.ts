import ffmpeg from "fluent-ffmpeg"

import { FFmpegFilterSpec } from "./ffmpeg-filter-spec"

export type RenderContext = {
    command: ffmpeg.FfmpegCommand
    fps: number
    inputIndex: number
    clipIndex: number
    filters: FFmpegFilterSpec[]
    labels: {
        video: string[]
        structuralAudio: string[]
        mixAudio: string[]
    }
}
