import { expect } from 'chai';
import IdGenerator from './id-generator';

describe('IdGenerator', () => {
    it('should generate a 4-digit random code', () => {
        const code = IdGenerator.randomCode();
        expect(code).to.match(/^\d{4}$/);
    });
});
