import { MediaWikiJS, ErrorMessages } from '../dist';
import config from './config.json';

const bot = new MediaWikiJS({
    url: config.url
});

describe('login function', () => {
    test('should throw an error if no credentials passed', async () => {
        await expect(bot.login()).rejects.toThrow(ErrorMessages.NO_CREDENTIALS);
    });

    test('should throw an error if incorrect credentials passed', async () => {
        await expect(bot.login('john', 'doe')).rejects.toThrow(ErrorMessages.FAILED_LOGIN(''));
    });

    test('should return success object if correct credentials passed', async () => {
        expect(await bot.login(config.username, config.password)).toMatchObject({
            login: {
                result: 'Success',
                lguserid: expect.any(Number),
                lgusername: expect.any(String)
            }
        });
    });
});