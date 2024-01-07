import { Router } from 'express';
import { Service } from 'typedi';

@Service()
export class PasswordController {
    router: Router;
    constructor() {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
    }
}
