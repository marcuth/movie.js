import ffmpeg from "fluent-ffmpeg"

export type ToStreamOptions = {
    format?: string
}

export type ToFileOptions = {
    format?: string
}

export type ToBufferOptions = {
    format?: string
}

export class TemplateResult {
    constructor(private readonly command: ffmpeg.FfmpegCommand) { }

    toStream({ format = "mp4" }: ToStreamOptions = {}) {
        return this.command.format(format).pipe()
    }

    async toBuffer({ format = "mp4" }: ToBufferOptions = {}): Promise<Buffer> {
        const chunks: Buffer[] = []
        const stream = this.toStream({ format: format })

        return new Promise((resolve, reject) => {
            stream.on("data", chunk => chunks.push(chunk))
            stream.on("end", () => resolve(Buffer.concat(chunks)))
            stream.on("error", reject)
        })
    }

    async toFile(filePath: string, { format = "mp4" }: ToFileOptions = {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.command
                .format(format)
                .save(filePath)
                .on("end", () => resolve())
                .on("error", reject)
        })
    }
}