import { toNano } from '@ton/core';
import { InternalTransactions } from '../wrappers/InternalTransactions';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const internalTransactions = provider.open(InternalTransactions.createFromConfig({}, await compile('InternalTransactions')));

    await internalTransactions.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(internalTransactions.address);

    // run methods on `internalTransactions`
}
