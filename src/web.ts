import { io, Socket } from "socket.io-client"

export class Web {
    private socket: Socket
    private url: string

    constructor(url: string, token: string) {
        this.url = url
        this.socket = io(this.url, { auth: { token: token } })
        this.start()
    }

    private start(): void {
        this.socket.on("connect", () => {
            console.log("Connected!")
        })
        this.socket.on("disconnect", () => {
            console.log("Disconnected!")
        })
    }

    public transmitter(event: string, data: Object | string) {
        this.socket.emit(event, data)
    }

    public transmission(msg: string): void {
        this.socket.emit("message", msg)
    }

    public receiver(event: string, callback: (data: any) => void): void {
        this.socket.on(event, callback)
    }

}