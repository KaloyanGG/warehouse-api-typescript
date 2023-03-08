export default function transformJwtTimeToSeconds(jwtTime: string): number {
    const time = jwtTime.match(/\d+/g);
    if (!time) return 0;
    const unit = jwtTime.match(/[a-zA-Z]+/g);
    if (!unit) return 0;
    const seconds = time.reduce((acc, curr, index) => {
        switch (unit[index]) {
            case 's':
                return acc + Number(curr);
            case 'm':
                return acc + Number(curr) * 60;
            case 'h':
                return acc + Number(curr) * 60 * 60;
            case 'd':
                return acc + Number(curr) * 60 * 60 * 24;
            case 'w':
                return acc + Number(curr) * 60 * 60 * 24 * 7;
            default:
                return acc;
        }
    }, 0);
    return seconds * 1000;
}