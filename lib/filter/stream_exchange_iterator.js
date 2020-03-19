"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_shard_iterator_1 = __importDefault(require("./stream_shard_iterator"));
class StreamExchangeIterator {
    constructor(clientSetting, exchange, channels, start, end, bufferSize) {
        this.shardIterator = new stream_shard_iterator_1.default(clientSetting, exchange, channels, start, end, bufferSize);
        this.itrNext = null;
        this.position = 0;
    }
    async next() {
        if (this.itrNext === null) {
            // get very first shard
            this.itrNext = await this.shardIterator.next();
            // there must be at least one shard
        }
        // skip shards which is read until the end, including empty ones as long as available
        while (!this.itrNext.done && this.itrNext.value.length <= this.position) {
            this.itrNext = await this.shardIterator.next();
            // set position back to zero for the new shard
            this.position = 0;
        }
        if (this.itrNext.done) {
            // reached the last line, done
            return {
                done: true,
                value: null,
            };
        }
        // return the line
        const line = this.itrNext.value[this.position];
        this.position += 1;
        return {
            done: false,
            value: line,
        };
    }
}
exports.default = StreamExchangeIterator;