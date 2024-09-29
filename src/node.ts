import config from "config"
import { LinkPTT } from "./main"

new LinkPTT({ token: config.RX_TOKEN })