import { LCDClient, MsgSend } from '@terra-money/terra.js';
import { SignMode } from '@terra-money/terra.proto/cosmos/tx/signing/v1beta1/signing';
//import { LedgerKey } from '@terra-money/ledger-terra-js';//"../../devel/ledger-terra-js';
import { LedgerKey } from "../src";
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid';

async function main() {
  const lk = await LedgerKey.create(await TransportNodeHid.create(60 * 1000));
  console.log(`accAddress: ${lk.accAddress} / publicKey: ${JSON.stringify(lk.publicKey)}`);

  const terra = new LCDClient({
    chainID: 'columbus-5',
    URL: 'https://lcd.terra.dev',
    isClassic: true
  });

  // a wallet can be created out of any key
  // wallets abstract transaction building
  const wallet = terra.wallet(lk);

  // create a simple message that moves coin balances
  const send = new MsgSend(
    'terra1mzv70x2avy4k95dujh9j3xh43nusxh8mh02cs5',
    'terra1av6ssz7k4xpc5nsjj2884nugakpp874ae0krx7',
    { uluna: 1 }
  );

  const tx = await wallet
    .createAndSignTx({
      msgs: [send],
      memo: 'ledgerkey test',
      signMode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
      gasPrices: {uluna:10}
    });

  const result = await terra.tx.broadcast(tx);
  console.log(`TX hash: ${result.txhash}  ${result.raw_log}`);
}

main().catch(console.error);

