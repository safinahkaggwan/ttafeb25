const db = require('../db');
const Game = require('./games');
const Player = require('./player');
const GamePlayer = require('./gamePlayer');
const Grp = require('./groups');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function syncWithRetry(action, retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            return await action();
        } catch (error) {
            if (error.parent?.number === 1205 && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                continue;
            }
            throw error;
        }
    }
}

async function syncDatabase() {
    const t = await db.transaction();
    try {
        await syncWithRetry(() => Grp.sync({ transaction: t }));
        await syncWithRetry(() => Game.sync({ transaction: t }));
        await syncWithRetry(() => Player.sync({ transaction: t }));
        await syncWithRetry(() => GamePlayer.sync({ transaction: t }));
        
        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error;
    }
}

module.exports = { syncDatabase };