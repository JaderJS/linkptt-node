import {z} from "zod"

const schema = z.object({
    URL: z.string().url(),
    TOKEN: z.string().min(0)
})

const config = schema.parse({
    URL: process.env.URL|| "http://localhost:5050",
    TOKEN: process.env.TOKEN 
})

export {config}