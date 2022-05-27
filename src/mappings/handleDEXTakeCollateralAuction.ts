import { forceToCurrencyName } from '@acala-network/sdk-core';
import { SubstrateEvent } from '@subql/types';
import { AuctionStatus } from '../types';
import { getCollateralAuction, getDEXTakeCollateralAuction } from '../utils/records'
import type { Balance } from '@polkadot/types/interfaces/runtime';

export async function handleDEXTakeCollateralAuction (event: SubstrateEvent) {
    /**
  		/// Dex take collateral auction.
		DEXTakeCollateralAuction {
			auction_id: AuctionId,
			collateral_type: CurrencyId,
			collateral_amount: Balance,
			supply_collateral_amount: Balance,
			target_stable_amount: Balance,
		},
     */
    const eventData = event.event.data;
    const auctionId = eventData[0].toString();
    const collateral = forceToCurrencyName(eventData[1]);
    const amount = (eventData[2] as Balance).toBigInt();
    const supplyCollateralAmount = (eventData[3] as Balance).toBigInt();
    const targetStableAmount = (eventData[4] as Balance).toBigInt();
    const blockNumber = event.block.block.header.number.toBigInt();
    const blockHash = event.block.hash.toString();
    const extrinsic = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : '';
    const timestamp = event.block.timestamp;
    const eventId = `${event.block.hash}-${event.idx.toString()}`;

    const auction = await getCollateralAuction(auctionId);
    const dexTakeCollateralAuction = await getDEXTakeCollateralAuction(eventId);

    auction.status = AuctionStatus.DEX_TAKE;
    auction.updateAt = timestamp;
    auction.updateAtBlock = blockNumber;

    dexTakeCollateralAuction.auctionId = auction.id;
    dexTakeCollateralAuction.collateral = collateral;
    dexTakeCollateralAuction.amount = amount;
    dexTakeCollateralAuction.supplyCollateralAmount = supplyCollateralAmount;
    dexTakeCollateralAuction.targetStableAmount = targetStableAmount;
    dexTakeCollateralAuction.timestamp = timestamp;
    dexTakeCollateralAuction.blockNumber = blockNumber;
    dexTakeCollateralAuction.blockHash = blockHash;

    if (extrinsic) {
        dexTakeCollateralAuction.extrinsic = extrinsic;
    }

    await auction.save();
    await dexTakeCollateralAuction.save();
}
