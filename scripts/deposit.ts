import { Address, toNano } from '@ton/core';
import { InternalTransactions } from '../wrappers/InternalTransactions';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('SC address'));

    const internalTransactions = provider.open(InternalTransactions.createFromAddress(address));

    const balanceBefore = await internalTransactions.getBalance();

    await internalTransactions.sendDeposit(provider.sender(), toNano(await ui.input('Amount to deposit')));

    let balanceAfter = await internalTransactions.getBalance();

    let attempt = 1;
    while (balanceAfter === balanceBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        balanceAfter = await internalTransactions.getBalance();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Balance increased successfully');
}