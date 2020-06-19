/* eslint-disable @typescript-eslint/camelcase */
import BigNumber from 'bignumber.js';
import { ApiPromise, WsProvider } from '@polkadot/api';

export enum PlasmNetwork {
    Local,
    Dusty,
    Main,
}

export function femtoToPlm(femto: BigNumber) {
    const plmDenominator = new BigNumber(10).pow(-15);
    return femto.times(plmDenominator);
}

export async function createDustyPlasmInstance(network?: PlasmNetwork) {
    let endpoint = '';

    switch (network) {
        case PlasmNetwork.Local:
            endpoint = 'ws://127.0.0.1:9944';
            break;
        case PlasmNetwork.Dusty:
            endpoint = 'wss://rpc.dusty.plasmnet.io/';
            break;
        case PlasmNetwork.Main: // main net endpoint will be the default value
        default:
            endpoint = 'wss://rpc.plasmnet.io';
            break;
    }

    const wsProvider = new WsProvider(endpoint);

    return await ApiPromise.create({
        provider: wsProvider,
        // add custom types
        types: {
            ClaimId: 'H256',
            Lockdrop: {
                type: 'u8',
                transaction_hash: 'H256',
                public_key: '[u8; 33]',
                duration: 'u64',
                value: 'u128',
            },
            TickerRate: {
                authority: 'u16',
                btc: 'DollarRate',
                eth: 'DollarRate',
            },
            DollarRate: 'u128',
            AuthorityId: 'AccountId',
            AuthorityVote: 'u32',
            ClaimVote: {
                claim_id: 'ClaimId',
                approve: 'bool',
                authority: 'u16',
            },
            Claim: {
                params: 'Lockdrop',
                approve: 'AuthorityVote',
                decline: 'AuthorityVote',
                amount: 'u128',
                complete: 'bool',
            },
        },
        rpc: {
            plasmLockdrop: {
                request: {
                    description: 'Request authorities to check locking transaction',
                    params: [
                        {
                            name: 'type',
                            type: 'u8',
                        },
                        {
                            name: 'transaction_hash',
                            type: 'H256',
                        },
                        {
                            name: 'public_key',
                            type: '[u8;33]',
                        },
                        {
                            name: 'duration',
                            type: 'u64',
                        },
                        {
                            name: 'value',
                            type: 'u128',
                        },
                    ],
                    type: 'Balance',
                },
            },
        },
    });
}

export function lockDurationToRate(duration: number) {
    if (duration < 30) {
        return 0;
    } else if (duration < 100) {
        return 24;
    } else if (duration < 300) {
        return 100;
    } else if (duration < 1000) {
        return 360;
    } else {
        return 1600;
    }
}
