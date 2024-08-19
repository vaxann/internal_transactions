import { Address, fromNano } from '@ton/core';
import { InternalTransactions } from '../wrappers/InternalTransactions';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SC address'));

    const internalTransactions = provider.open(InternalTransactions.createFromAddress(address));

    const balance = await internalTransactions.getBalance();

    ui.write(`Balance ${fromNano(balance)}`);
}