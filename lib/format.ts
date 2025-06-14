import { format, toZonedTime } from "date-fns-tz";

// 上海时区
const SHANGHAI_TIMEZONE = 'Asia/Shanghai';

// 格式化时间为 yyyy-mm-dd HH:MM:SS (上海时区)
export function formatDate(isoString: string) {
    // 将UTC时间转换为上海时区时间
    const shanghaiDate = toZonedTime(new Date(isoString), SHANGHAI_TIMEZONE);
    
    return format(shanghaiDate, 'yyyy-MM-dd', { timeZone: SHANGHAI_TIMEZONE });
}

export function formatDateShort(isoString: string) {
    // 将UTC时间转换为上海时区时间
    const shanghaiDate = toZonedTime(new Date(isoString), SHANGHAI_TIMEZONE);
    
    return format(shanghaiDate, 'MMMM dd, yyyy', { timeZone: SHANGHAI_TIMEZONE });
}