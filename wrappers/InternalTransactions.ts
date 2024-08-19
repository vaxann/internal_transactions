import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
import { opCodes } from '../helpers/opcodes';

export type InternalTransactionsConfig = {};

export function internalTransactionsConfigToCell(config: InternalTransactionsConfig): Cell {
    return beginCell().endCell();
}

export class InternalTransactions implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new InternalTransactions(address);
    }

    static createFromConfig(config: InternalTransactionsConfig, code: Cell, workchain = 0) {
        const data = internalTransactionsConfigToCell(config);
        const init = { code, data };
        return new InternalTransactions(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendDeposit(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(opCodes.deposit, 32)
            .endCell(),
        });
    }

    async sendWithdraw(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint,
            amount: bigint,
            targetAddress: Address,
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(opCodes.withdraw, 32)
                .storeCoins(opts.amount)
                .storeAddress(opts.targetAddress)
            .endCell(),
        });
    }

    async sendWithdrawWithBounce(provider: ContractProvider, via: Sender, 
        opts: {
            value: bigint,
            amount: bigint,
            targetAddress: Address,
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(opCodes.withdrawWithBounce, 32)
                .storeCoins(opts.amount)
                .storeAddress(opts.targetAddress)
            .endCell(),
        });
    }

    async getBalance(provider: ContractProvider) : Promise<bigint> {
        const result = await provider.get('get_smc_balance', []);
        return result.stack.readBigNumber();
    }
}
