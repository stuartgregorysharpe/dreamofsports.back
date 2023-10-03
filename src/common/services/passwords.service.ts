import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class CPasswordsService {
    public compareHash(password, hash): Promise<boolean> {
        return new Promise((resolve, reject) => bcrypt.compare(password, hash, (err, result) => err ? reject(err) : resolve(result)));
    }

    public buildHash(password: string): string {
        return bcrypt.hashSync(password, 10);
    }
}
