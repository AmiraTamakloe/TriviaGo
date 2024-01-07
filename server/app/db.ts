import * as dotenv from 'dotenv';
import { connect, disconnect } from 'mongoose';
dotenv.config();

export class EstablishConnection {
    static async switchToTestDB() {
        await disconnect();
        await connect('mongodb+srv://logdeuxneufneufzeroequipedeuxc:PiO7RQY7f0CgMZyW@cluster0.pyafsnl.mongodb.net/?retryWrites=true&w=majority');
    }
    async connectionToDB() {
        await connect(process.env.DB_URL);
    }
}
