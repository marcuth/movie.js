import ffmpeg from "fluent-ffmpeg"

export class RenderResult {
    constructor(private readonly format: string, private readonly command: ffmpeg.FfmpegCommand) {}

    toStream() {
        return this.command.format(this.format).pipe()
    }

    async toBuffer(): Promise<Buffer> {
        const chunks: Buffer[] = []
        const stream = this.toStream()

        return new Promise((resolve, reject) => {
            stream.on("data", chunk => chunks.push(chunk))
            stream.on("end", () => resolve(Buffer.concat(chunks)))
            stream.on("error", reject)
        })
    }

    async toFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.command
                .format(this.format)
                .save(filePath)
                .on("end", () => resolve())
                .on("error", reject)
        })
    }
}