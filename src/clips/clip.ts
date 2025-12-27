
export abstract class Clip<ClipOptions> {
  constructor(readonly options: ClipOptions) {}

  start = 0
  duration?: number

  abstract getVideoFilters(): string[]
  
  abstract getAudioFilters(): string[]
}