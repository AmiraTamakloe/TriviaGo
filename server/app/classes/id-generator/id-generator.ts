import { NUMBER_OF_DIGITS, BASE } from '@common/constants';
export default class IdGenerator {
    static randomCode(): string {
        return Math.floor(Math.random() * Math.pow(BASE, NUMBER_OF_DIGITS))
            .toString()
            .padStart(NUMBER_OF_DIGITS, '0');
    }
}
