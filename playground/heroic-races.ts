import path from "node:path"
import fs from "node:fs"
import movie from "../src"

async function main() {
    const filesDir = path.join(__dirname, "..", "heroic_races_134_br")
    const dragonsDir = path.join(filesDir, "dragons")
    const lapsDir = path.join(filesDir, "laps")
    const dragonFiles = await fs.promises.readdir(dragonsDir).then(files => files.map(file => path.join(dragonsDir, file)))
    const lapFiles = await fs.promises.readdir(lapsDir).then(files => files.map(file => path.join(lapsDir, file)))
    const introFilePath = path.join(__dirname, "..", "intro.mp4")
    const endOfVideoFilePath = path.join(__dirname, "..", "end_of_video.mp4")

    const template = movie.template({
        config: {
            format: "mp4",
            fps: 30,
            //outputOptions: ["-c:v h264_amf"],///["-c:v libx264", "-preset ultrafast"],
        },
        debug: true,
        clips: [
            movie.video({
                path: introFilePath,
                x: 0,
                y: 0,
                fadeIn: .5,
                fadeOut: .5,
            }),
            movie.group({
                clips: [
                    movie.repeat({
                        each: () => dragonFiles,
                        clip: (file) => movie.image({
                            path: file,
                            duration: 5,
                            fadeIn: 1,
                            fadeOut: 1,
                        })
                    }),
                    movie.repeat({
                        each: () => lapFiles.slice(0, 1),
                        clip: (file) => movie.image({
                            path: file,
                            duration: 10,
                            fadeIn: 1,
                            fadeOut: 1,
                        })
                    }),
                    movie.audio({
                        path: path.join(__dirname, "better_days.mp3"),
                        startAt: 5,
                        endAt: 5 + dragonFiles.length * 5 + lapFiles.slice(0, 1).length * 10,
                    })
                ],
            }),
            movie.video({
                path: endOfVideoFilePath,
                x: 0,
                y: 0,
                fadeIn: .5,
                fadeOut: .5,
            }),
        ]
    })

    const result = await template.render({})

    result.toFile(path.join(__dirname, "heroic-races1.mp4"))
}

main()