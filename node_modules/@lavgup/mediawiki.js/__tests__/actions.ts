import { MediaWikiJS } from '../dist';
import { url, username, password } from './config.json';

const bot = new MediaWikiJS({ url });

describe('tests action functions', () => {
    beforeAll(() => bot.login(username, password));

    test('block function', async () => {
        expect(await bot.block({
            // dummy account to block for testing, will work only on Fandom
            // feel free to change user to anyone else
            user: 'SidemenXIX-bot',
            expiry: '1 minute',
            reason: 'Testing mediawiki.js library'
        })).toMatchObject({
            block: {
                user: expect.any(String),
                userID: expect.any(Number),
                expiry: expect.any(String),
                id: expect.any(Number),
                reason: expect.any(String),
                anononly: expect.any(Boolean),
                nocreate: expect.any(Boolean),
                autoblock: expect.any(Boolean),
                hidename: expect.any(Boolean),
                allowusertalk: expect.any(Boolean),
                watchuser: expect.any(Boolean)
            }
        });
    });

    test('edit function', async () => {
        expect(await bot.edit({
            title: 'Project:Sandbox/mw.js',
            content: 'Testing [https://github.com/lavgup/mediawiki.js mediawiki.js] library!',
            minor: false,
            summary: 'Testing mediawiki.js library'
        })).toMatchObject({
            edit: {
                result: expect.any(String),
                pageid: expect.any(Number),
                title: expect.any(String),
                contentmodel: expect.any(String)
            }
        });
    });

    test('delete function', async () => {
        expect(await bot.delete({
            title: 'Project:Sandbox/mw.js',
            reason: 'Testing mediawiki.js library'
        })).toMatchObject({
            delete: {
                title: expect.any(String),
                reason: expect.any(String),
                logid: expect.any(Number)
            }
        });
    });

    test('restore function', async () => {
        expect(await bot.restore({
            title: 'Project:Sandbox/mw.js',
            reason: 'Testing mediawiki.js library'
        })).toMatchObject({
            undelete: {
                fileversions: expect.any(Number),
                reason: expect.any(String),
                revisions: expect.any(Number),
                title: expect.any(String)
            }
        });
    });

    test('move function', async () => {
       expect(await bot.move({
           from: 'Project:Sandbox/mw.js',
           // create random page, so tests can be run multiple times without
           // the "page already exists" error
           to: `Project:Sandbox/${Math.random().toString(16).substr(2, 8)}`,
           reason: 'Testing mediawiki.js library'
       })).toMatchObject({
           move: {
               from: expect.any(String),
               to: expect.any(String),
               reason: expect.any(String)
           }
       });
    });

    test('protect function', async () => {
       expect(await bot.protect({
           title: 'Project:Sandbox/mediawiki.js',
           protections: {
               edit: 'autoconfirmed',
               move: 'sysop'
           },
           expiry: '1 minute',
           reason: 'Testing mediawiki.js library',
           cascade: false
       })).toMatchObject({
           protect: {
               title: expect.any(String),
               reason: expect.any(String),
               protections: expect.any(Array)
           }
       });
    });
});