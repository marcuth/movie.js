import ffmpeg from "fluent-ffmpeg"

import { FFmpegFilterSpec } from "./ffmpeg-filter-spec"

export type RenderContext = {
    command: ffmpeg.FfmpegCommand
    offsetX: number
    offsetY: number
    fps: number
    inputIndex: number
    audioIndex: number
    filters: FFmpegFilterSpec[]
    labels: {
        video: string[]
        structuralAudio: string[]
        mixAudio: string[]
    }
}