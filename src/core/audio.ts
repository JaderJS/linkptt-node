import { AudioContext, OscillatorNode, GainNode } from "node-web-audio-api"
import { createWriteStream, WriteStream, createReadStream } from "node:fs"
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process"
import EventEmitter from "node:events"
import os from "node:os"
import Speaker from "speaker"

export class Audio extends EventEmitter {

    private mic?: ChildProcessWithoutNullStreams
    private speaker_: Speaker
    private speaker: ChildProcessWithoutNullStreams
    private writeStreams: WriteStream
    private path: string
    private system: "win" | "darwin" | "linux"

    constructor() {
        super()
        this.path = `audio.wav`
        this.system = os.type() == "Darwin" ? "darwin" : os.type().indexOf('Windows') > -1 ? "win" : "linux"
        this.writeStreams = createWriteStream(this.path)

        const speakerOptions = [
            '-r', '48000',    // Taxa de amostragem de 48 kHz
            '-b', '16',       // Profundidade de bits
            '-c', '1'         // 1 canal (mono)
        ];

        this.speaker = spawn('sox', ['-', '-d', ...speakerOptions]);
        this.speaker_ = new Speaker({ channels: 1, bitDepth: 16, sampleRate: 48000 })
    }

    start() {

        if (this.system === "linux") {

            const options = [
                '-c', '1',
                '-f', 'dat',
                '-r', '48000'
            ]

            this.mic = spawn(`arecord`, options)

            this.mic.stdout.on("data", (chunk) => {
                this.emit('mic-chunk', chunk)
            })

            this.mic.stdout.pipe(this.writeStreams)
            this.mic.stdout.on("data", (data) => { console.log(data) })
            this.mic.stdout.on("error", (error) => { console.error(error) })
        }
    }

    stop() {
        this.mic?.kill('SIGINT')
    }

    getMicStream() {
        return this.mic?.stdout
    }

    getSpeakerStream() {
        return this.speaker_
    }

}