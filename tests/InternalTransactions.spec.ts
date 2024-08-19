import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, fromNano, toNano } from '@ton/core';
import { InternalTransactions } from '../wrappers/InternalTransactions';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('InternalTransactions', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('InternalTransactions');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let internalTransactions: SandboxContract<InternalTransactions>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        internalTransactions = blockchain.openContract(InternalTransactions.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await internalTransactions.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: internalTransactions.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and internalTransactions are ready to use
    });

    it('should deposit', async () => {
        const sender = await blockchain.treasury('sender');

        const depositResult = await internalTransactions.sendDeposit(sender.getSender(), toNano('2'));
  
        expect(depositResult.transactions).toHaveTransaction({
          from: sender.address,
          to: internalTransactions.address,
          success: true,
        });
  
        const balance = await internalTransactions.getBalance();
  
        expect(balance).toBeGreaterThan(toNano('1.99'));
    });

    it('should withdraw', async () => {
        const sender = await blockchain.treasury('sender');
        const receiver = await blockchain.treasury('receiver');

        const depositResult = await internalTransactions.sendDeposit(sender.getSender(), toNano('2'));
  
        expect(depositResult.transactions).toHaveTransaction({
          from: sender.address,
          to: internalTransactions.address,
          success: true,
        });
        const balance1 = await internalTransactions.getBalance()
  
        const withdrawResult = await internalTransactions.sendWithdraw(sender.getSender(), {
          value: toNano('0.05'),
          amount: toNano('1'),
          targetAddress: receiver.address,
        });

        expect(withdrawResult.transactions.length).toBe(3);
        expect(withdrawResult.transactions).toHaveTransaction({
          from: internalTransactions.address,
          to: receiver.address,
          success: true,
        });
  
        const balance2 = await internalTransactions.getBalance();
  
        expect(balance2).toBeLessThan(toNano('2'));
        expect(balance2).toBeGreaterThan(toNano('1'));
    });

    it ('should not withdraw with wrong amount', async () => {
        const sender = await blockchain.treasury('sender');
        const receiver = await blockchain.treasury('receiver');

        const depositResult = await internalTransactions.sendDeposit(sender.getSender(), toNano('2'));
  
        expect(depositResult.transactions).toHaveTransaction({
          from: sender.address,
          to: internalTransactions.address,
          success: true,
        });
  
        const balance1 = await internalTransactions.getBalance();
  
        const withdrawResult = await internalTransactions.sendWithdraw(sender.getSender(), {
          value: toNano('0.05'),
          amount: toNano('3'),
          targetAddress: receiver.address,
        });

        expect(withdrawResult.transactions.length).toBe(3);
  
        const balance2 = await internalTransactions.getBalance();
  
        expect(balance2).toBe(balance1);
    })

    it ('should withdraw with bounce', async () => {
        const sender = await blockchain.treasury('sender');
        const receiver = await blockchain.treasury('receiver', {predeploy: true, balance: toNano('1.1')});

        const depositResult = await internalTransactions.sendDeposit(sender.getSender(), toNano('2'));
  
        expect(depositResult.transactions).toHaveTransaction({
          from: sender.address,
          to: internalTransactions.address,
          success: true,
        });
  
        const balance1 = await internalTransactions.getBalance();
  
        const withdrawResult = await internalTransactions.sendWithdrawWithBounce(sender.getSender(), {
            value: toNano('0.05'),
            amount: toNano('1'),
            targetAddress: receiver.address,
          });
  
          expect(withdrawResult.transactions.length).toBe(3);
          expect(withdrawResult.transactions).toHaveTransaction({
            from: internalTransactions.address,
            to: receiver.address,
            success: true,
          });
    
          const balance2 = await internalTransactions.getBalance();
    
          expect(balance2).toBeLessThan(toNano('2'));
          expect(balance2).toBeGreaterThan(toNano('1'));
    });

    it ('should not withdraw with bounce to non activated account', async () => {
        const sender = await blockchain.treasury('sender');
        const receiver = await blockchain.treasury('receiver', {predeploy: false});

        const depositResult = await internalTransactions.sendDeposit(sender.getSender(), toNano('2'));
  
        expect(depositResult.transactions).toHaveTransaction({
          from: sender.address,
          to: internalTransactions.address,
          success: true,
        });
  
        const balance1 = await internalTransactions.getBalance();
  
        const withdrawResult = await internalTransactions.sendWithdrawWithBounce(sender.getSender(), {
            value: toNano('0.05'),
            amount: toNano('1'),
            targetAddress: receiver.address,
          });
  
          expect(withdrawResult.transactions.length).toBe(4);
    
          const balance2 = await internalTransactions.getBalance();
    
          const expectedBalance = balance1 + toNano('0.05');
          expect(balance2).toBeLessThan(expectedBalance);
          expect(balance2).toBeGreaterThan(balance1);
    });
});
