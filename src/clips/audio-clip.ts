import { Clip } from "./clip"

export type AudioClipOptions = {
    path: string
    start?: number
    duration?: number
    volume?: number
    loop?: boolean
}

export class AudioClip extends Clip<AudioClipOptions> {
    getVideoFilters(): string[] {
        return []
    }

    getAudioFilters(): string[] {
        const filters: string[] = []

        if (this.options.volume !== undefined) {
            filters.push(`volume=${this.options.volume}`)
        }

        return filters
    }

    get startTime() {
        return this.options.start ?? 0
    }

    get durationTime() {
        return this.options.duration
    }

    get shouldLoop() {
        return this.options.loop ?? false
    }
}
