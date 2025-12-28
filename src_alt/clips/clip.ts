export abstract class Clip {
    abstract get videoFilters(): string[]
    abstract get audioFilters(): string[]
}