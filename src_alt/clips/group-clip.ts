import { Clip } from "./clip"

export type GroupClipOptions = {
    clips: Clip[]
}

export class GroupClip extends Clip {
    constructor(options: GroupClipOptions) {
        super()
    }
}
