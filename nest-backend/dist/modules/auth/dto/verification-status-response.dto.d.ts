export declare class VerificationStatusResponseDto {
    isEmailVerified: boolean;
    isTokenExpired: boolean;
    expirationTime: string;
    resendCooldown: number;
    constructor(data: VerificationStatusResponseDto);
}
