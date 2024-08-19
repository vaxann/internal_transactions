import { crc32 } from "./crc32";

export const opCodes = {
    deposit: crc32("deposit"),
    withdraw: crc32("withdraw"),
    withdrawWithBounce: crc32("withdraw_with_bounce"),
};