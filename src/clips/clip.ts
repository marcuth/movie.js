export abstract class Clip<ClipOptions> {
    constructor(readonly options: ClipOptions) {}

    abstract getVideoFilters(): string[]
    
    abstract getAudioFilters(): string[]
}