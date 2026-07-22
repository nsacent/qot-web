export const UGANDA_COUNTRY_CODE = "+256";

export function getUgandanNationalNumber(value: string) {
    const digits = String(value || "").replace(/\D/g, "");
    const nationalNumber = digits.startsWith("256")
        ? digits.slice(3)
        : digits.startsWith("0")
            ? digits.slice(1)
            : digits;

    return nationalNumber.slice(0, 9);
}

export function toUgandanPhone(value: string) {
    const nationalNumber = getUgandanNationalNumber(value);
    return nationalNumber ? `${UGANDA_COUNTRY_CODE}${nationalNumber}` : "";
}

export function isValidUgandanMobile(value: string) {
    return /^7\d{8}$/.test(getUgandanNationalNumber(value));
}
