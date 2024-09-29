import { Web } from "@/web"
import { Audio } from "@/core/audio"
import { server } from "@/core/axios"
import { OpusEncoder } from '@discordjs/opus'
import { createWriteStream, WriteStream, createReadStream } from "node:fs"
import config from "config"

type TransmissionProps = {
    from: string,
    type: "channel" | "user"
}

type ReceiverProps = {
    to: string
}

type User = {
    cuid: string
    email: string
    name: string | null
    password: string
    avatarUrl: string
}

type Token = {
    token: string
}

export class LinkPTT {
    private audio: Audio
    private web: Web
    private opus: OpusEncoder

    constructor({ token }: { token: string }) {
        this.audio = new Audio()
        this.web = new Web(config.URL, token)
        this.opus = new OpusEncoder(48000, 1)
        this.setup()
    }

    private locationHandlers(ms: number) {
        setInterval(() => {
            const location = {
                latitude: "-10.8134",
                longitude: "-55.4554",
                rssi: 0.0
            }
            this.web.transmitter("msg:location", location)
        }, ms)
    }

    private setup() {
        setTimeout(() => {
            this.web.receiver("audio:chunk:web", (chunk: Buffer) => {
                try {
                    // const decoded = this.opus.decode(chunk)
                    this.audio.getSpeakerStream().write(chunk)
                } catch (error) {
                    console.error(error)
                }
            })

            this.web.receiver('ping:node', callback => {
                callback()
            })

            this.locationHandlers(60000)
        }, 1000)
    }

    public sender(path: string, props: TransmissionProps) {

        this.start(props)
        //  const stream = createReadStream(path, { highWaterMark: 8 * 160 })
        const stream = createReadStream(path)
        stream.on("data", (chunk: Buffer) => {
            try {
                this.web.transmitter('audio:chunk:wav', chunk)
                // const encoded = this.opus.encode(chunk)
                // this.web.transmitter('audio:chunk', encoded)
            } catch (error) {
                console.error(`Error opus`, error)
            }
        })
        stream.on("end", () => {
            this.stop(props)
        })

    }

    async login({ email, password }: { email: string, password: string }): Promise<User> {
        return server.post(`/user/login`, { email, password }).then((res) => {
            const { email, token } = res.data as User & Token
            return { email, token }
        }).catch((error) => {
            return error
        })

    }


    public start(props: TransmissionProps) {
        this.web.transmitter("audio:start", props)
    }

    public stop(props: TransmissionProps) {
        this.web.transmitter("audio:stop", props)
    }
}


