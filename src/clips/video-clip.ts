import { Clip } from "./clip"

export type VideoClipOptions = {
    path: string
}

export class VideoClip extends Clip<VideoClipOptions> {
    private videoFilters: string[] = []
    private audioFilters: string[] = []

    subclip(start: number, duration?: number) {
        this.start = start
        this.duration = duration
        return this
    }

    resize(width: number, height: number) {
        this.videoFilters.push(`scale=${width}:${height}`)
        return this
    }

    fadeIn(seconds: number) {
        this.videoFilters.push(`fade=t=in:st=0:d=${seconds}`)
        return this
    }

    getVideoFilters() {
        return this.videoFilters
    }

    getAudioFilters() {
        return this.audioFilters
    }
}