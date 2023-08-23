export interface PayRoll {
    id: number;
    employeeCode: string;
    employeeName: string;
    idType: string;
    idNumber: string;
    bankName: string;
    ibanNumber: string;
    workDate: string;
    monthDays: number;
    directAbsent: number;
    absentWithPermission: number;
    absentWithouPermission: number;
    medicalAbsent: number;
    delayWithPermission: number;
    delayWithoutPermission: number;
    delayWithoutCutting: number;
}
