export function formatDate(date: Date, format: string) {
    const monthNameArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return format
        .replace('yyyy', year)
        .replace('MMM', monthNameArray[Number(month) - 1])
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds)
}

export function getAge(date: Date) {
    const birth = new Date(date)
    const today = new Date()

    let age = today.getFullYear() - birth.getFullYear()
    const monthDifference = today.getMonth() - birth.getMonth()
    const dayDifference = today.getDate() - birth.getDate()

    // Adjust age if the birth date has not occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--
    }

    return `${age}y`
}

export function getHour(date: Date) {
    return Number(date.getHours().toString().padStart(2, '0'))
}

export function msToTime(duration: number) {
    // const milliseconds = parseInt((duration + 1000) / 100);
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const hoursString = (hours < 10) ? "0" + hours : hours
    const minutesString = (minutes < 10) ? "0" + minutes : minutes
    const secondsString = (seconds < 10) ? "0" + seconds : seconds

    return hoursString + ":" + minutesString + ":" + secondsString
}