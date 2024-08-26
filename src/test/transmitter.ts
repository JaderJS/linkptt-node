import { config } from "../../config"
import {LinkPTT} from "../main"

const link = new LinkPTT({token:config.TOKEN})

link.start("cm034gz7g0001kujw5r528lzo")