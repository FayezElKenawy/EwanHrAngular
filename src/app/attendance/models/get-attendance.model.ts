export interface GetAttendance {
    employeeCode: string;
    date: string;
    Day: string;
    deviceName: string;
    clockIn: string;
    clockOut: string;
    startPunchTime: string;
    endPunchTime: string;
    isAttendance: number;
    areaName: string;
    employeeName: string;
    totalTime: number;
    absentTime: number;
    overTime: number;
    changeTime: number;
    month: string;
    day: string;
}
