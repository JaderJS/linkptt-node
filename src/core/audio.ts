import { createWriteStream, WriteStream, createReadStream } from "node:fs"
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import EventEmitter from "node:events"
import os from "node:os"
import Speaker from "speaker"
import ffmpeg from 'fluent-ffmpeg'
import { PassThrough } from "node:stream"

export class Audio extends EventEmitter {

    private mic?: ChildProcessWithoutNullStreams
    private speaker_: Speaker
    private writeStreams: WriteStream
    private path: string
    private system: "win" | "darwin" | "linux"
    private passThrough: PassThrough
    private buffer: Buffer
    private bufferSize: number

    constructor() {
        super()
        this.path = `audio.mp3`
        this.system = os.type() == "Darwin" ? "darwin" : os.type().indexOf('Windows') > -1 ? "win" : "linux"
        this.writeStreams = createWriteStream(this.path)
        this.passThrough = new PassThrough()
        this.speaker_ = new Speaker({ channels: 1, bitDepth: 16, sampleRate: 48000 })
        this.buffer = Buffer.alloc(0)
        this.bufferSize = 1024 * 10
    }

    start() {

        if (this.system === "linux") {

            const options = [
                '-c', '1',
                '-f', 'S16_LE',
                '-r', '48000',
            ]

            this.mic = spawn(`arecord`, options)

            const passThrough = new PassThrough()

            ffmpeg(this.mic.stdout)
                .inputFormat('s16le')
                .audioChannels(1)
                .audioFrequency(48000)
                .audioCodec("libmp3lame")
                .format("mp3")
                .pipe(passThrough)

            passThrough.on('data', (chunk) => {
                this.buffer = Buffer.concat([this.buffer, chunk]);

                if (this.buffer.length >= this.bufferSize) {
                    this.emit("mic:chunk", this.buffer)
                    this.buffer = Buffer.alloc(0)
                }

            })

            passThrough.on("end", () => {
                if (this.buffer.length > 0) {
                    this.emit("mic:chunk", this.buffer)
                    this.buffer = Buffer.alloc(0)
                }
            })

        }
    }

    stop() {
        this.mic?.kill('SIGINT')
    }

    getSpeakerStream() {
        const speaker = new Speaker({ channels: 1, bitDepth: 16, sampleRate: 48000 })
        
        const passThroughStream = new PassThrough()

        ffmpeg(passThroughStream)
            .inputFormat('mp3')
            .audioCodec('pcm_s16le')
            .audioChannels(1)
            .audioFrequency(48000)
            .format('wav')
            .pipe(speaker, { end: true })
            
        return passThroughStream
    }

}