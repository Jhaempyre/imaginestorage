import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '@/schemas/user.schema';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userModel;
    private logger;
    constructor(configService: ConfigService, userModel: Model<UserDocument>);
    validate(payload: any): Promise<UserDocument>;
}
export {};
