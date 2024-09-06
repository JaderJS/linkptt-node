import { config } from "../../config"
import { LinkPTT } from "../main"

const link = new LinkPTT({ token: config.TX_TOKEN })

setTimeout(() => link.sender(`audios/television.wav`, { from: "cm0qn0qr500028z246g02bc1o", type: "channel" }), 2000)