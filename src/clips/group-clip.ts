import { Clip } from "./clip"

export type GroupClipOptions = {
    clips: Clip<any>[]
}

export class GroupClip extends Clip<GroupClipOptions> {
    constructor(options: GroupClipOptions) {
        super(options)
    }

    getVideoFilters(): string[] {
        return []
    }

    getAudioFilters(): string[] {
        return []
    }
}