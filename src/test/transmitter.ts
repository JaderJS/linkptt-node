import { config } from "../../config"
import { LinkPTT } from "../main"

const link = new LinkPTT({ token: config.TX_TOKEN })

setTimeout(() => link.sender(`sports.wav`, { from: "cm0i8j0f10000fnvkfdh411tw", type: "channel" }), 2000)