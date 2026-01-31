# Movie.js

**Movie.js** is a library built on top of `fluent-ffmpeg` designed to create templates for generating standardized videos with data—which can be static or dynamic. It simplifies the process of sequencing video, image, and audio clips into a final composition.

## 📦 Installation

Installation is straightforward; just use your preferred package manager. Here is an example using NPM:

```bash
npm i @marcuth/movie.js
```

> **Note:** You must have FFMPEG installed on your system for this library to work.

## 🚀 Usage

<a href="https://www.buymeacoffee.com/marcuth">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="200">
</a>

### Template

The foundation for creating videos in Movie.js is the `Template`. This is where you define your clips and configuration.

```ts
import movie from "@marcuth/movie.js"

type RenderData = {
    heroImage: string
    backgroundVideo: string
} 

const template = movie.template<RenderData>({
    config: {
        format: "mp4",
        fps: 30,
        outputOptions: ["-preset ultrafast"] // optional ffmpeg output options
    },
    clips: [
        // ... your clips here
    ]
})

// Render the template with data
const result = await template.render({
    heroImage: "/path/to/image.png",
    backgroundVideo: "/path/to/video.mp4"
})

// Save the result
result.save("output.mp4")
```

---

### Clips

Clips are the building blocks of your video. They represent individual media segments like videos, images, or audio tracks.

Most file paths in clips support dynamic resolution:
```ts
path: ({ data, index }) => data.myPath
```

#### VideoClip

To insert a video segment:

```ts
movie.video({
    path: "assets/intro.mp4",
    fadeIn: 1, // seconds
    fadeOut: 1, // seconds
    subClip: [0, 5] // [start, duration] - Clip from 0s to 5s
})
```

#### ImageClip

To insert an image with optional scrolling/Ken Burns effect:

```ts
movie.image({
    path: ({ data }) => data.heroImage,
    duration: 5, // seconds
    width: 1920, // force resize width
    height: 1080, // force resize height
    scroll: {
        axis: "y", // "x", "y", or "auto"
        direction: "forward",
        easing: "easeInOut"
    },
    fadeIn: 0.5
})
```

#### AudioClip

To add audio (background music, sound effects):

```ts
movie.audio({
    path: "assets/music.mp3",
    volume: 0.5,
    fadeIn: 2,
    fadeOut: 2
})
```

---

### Structural Clips

#### RepeatClip

If you need to loop over an array of data to generate clips:

```ts
movie.repeat({
    each: ({ data }) => data.items, // Array of items
    clip: (item, index) => movie.video({
        path: item.videoPath
    })
})
```

#### CompositionClip

Group multiple clips together. Useful for organizing sequences:

```ts
movie.composition({
    clips: [
        movie.video({ ... }),
        movie.video({ ... })
    ]
})
```

#### ConcatenationClip

Explicitly concatenate a list of clips:

```ts
movie.concatenation({
    clips: [ ... ]
})
```

---

## 🤝 Contributing

Want to contribute? Follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-new`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-new`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License.
