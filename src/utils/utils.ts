import axios from "axios"

export const wait = (number: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, number))
}

const getMyIp = async (): Promise<string> => {
    try {
        const resp = await axios.get<{ ip: string }>(`https://api.ipify.org?format=json`)
        return resp.data.ip
    } catch {
        return await Promise.reject(new Error('Error to find IP'))
    }
}

export const getLocation = async (): Promise<string[]> => {
    try {
        const ip = await getMyIp()
        const { data } = await axios.get<{ loc: string }>(`https://ipinfo.io/${ip}/geo`)
        const point = data.loc.split(',')
        console.log(point)
        return point
    } catch (error) {
        console.error(error)
        return ["0", "0"    ]
    }
}