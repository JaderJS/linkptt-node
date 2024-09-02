//@ts-expect-error
import Microphone from 'mic'
import Speaker from 'speaker'
import { OpusEncoder } from '@discordjs/opus'
import { spawn } from 'child_process'
import debug from "debug"

const log = debug("audio")

type Config = {
    sampleRate: number,
    channels: number,
    bitWidth: number
}

export class Audio {
    public opus: OpusEncoder
    private mic: Microphone
    private speak: Speaker
    private config: Config
    private ffmpeg: any

    public constructor(sampleRate?: number, bitWidth?: number, channels?: number) {
        this.config = {
            sampleRate: sampleRate || 48000,
            channels: channels || 1,
            bitWidth: bitWidth || 16
        }
        this.opus = new OpusEncoder(8000, 1)
        this.mic = new Microphone({
            rate: 8000,
            channels: 1,
            bitwidth: 16,
            device: "default"
        })
       

        this.speak = new Speaker({ sampleRate: 8000, channels: 1 })

        this.ffmpeg = spawn('ffmpeg', [
            '-f', 's16le',         // Formato de entrada (raw PCM 16-bit little-endian)
            '-ar', '8000',        // Taxa de amostragem de entrada
            '-ac', '1',            // Número de canais de entrada
            '-i', '-',             // Lê da entrada padrão (stdin)
            '-af', 'volume=0.1,  highpass=f=250, lowpass=f=860',
            '-ar', '8000',        // Taxa de amostragem de saída
            '-ac', '1',            // Número de canais de saída
            '-f', 's16le',         // Formato de saída (raw PCM 16-bit little-endian)
            '-'                    // Lê da saída padrão (stdout)
        ])

        const stream = this.mic.getAudioStream()
        stream.pipe(this.ffmpeg.stdin)
    }

    public start() {
        this.mic.start()
    }
    public stop() {
        this.mic.stop()
    }

    public emitAudio(chunk: Buffer) {
        try {
            const decoded = this.opus.decode(chunk)
            this.speak.write(decoded)
        } catch (error) {
            log(`[OPUS] - ${error}`)
        }
    }

    public onAudio(callback: (data: any) => void) {
        this.ffmpeg.stdout.on('data', (chunk: any) => {
            try {
                const encoded = this.opus.encode(chunk)
                callback(encoded)
            } catch (error) {
                // log(`[FFMPEG] - error processing audio `, error)
            }
        })
    }

}