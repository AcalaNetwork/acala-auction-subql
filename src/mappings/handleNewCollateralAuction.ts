import { forceToCurrencyName } from '@acala-network/sdk-core';
import { SubstrateEvent } from '@subql/types';
import { AuctionStatus, BidType } from '../types';
import { getBid, getCollateralAuction, getNewCollateralAuction } from '../utils/records'
import type { Balance } from '@polkadot/types/interfaces/runtime';

export async function handleNewCollateralAuction (event: SubstrateEvent) {
    /**
     * 	NewCollateralAuction {
			auction_id: AuctionId,
			collateral_type: CurrencyId,
			collateral_amount: Balance,
			target_bid_price: Balance,
		}
     */
    const eventData = event.event.data;
    const auctionId = eventData[0].toString();
    const collateral = forceToCurrencyName(eventData[1]);
    const amount = (eventData[2] as Balance).toBigInt();
    const target = (eventData[3] as Balance).toBigInt();
    const blockNumber = event.block.block.header.number.toBigInt();
    const blockHash = event.block.hash.toString();
    const extrinsic = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : '';
    const timestamp = event.block.timestamp;
    const eventId = `${blockHash}-${event.idx.toString()}`;

    const auction = await getCollateralAuction(auctionId);
    const newCollateralAuction = await getNewCollateralAuction(eventId);
    const bid = await getBid(eventId);

    auction.collateral = collateral;
    auction.amount = amount;
    auction.target = target;
    auction.status = AuctionStatus.CREATE;
    auction.createAt = timestamp;
    auction.updateAt = timestamp;
    auction.createAtBlock = blockNumber;
    auction.updateAtBlock = blockNumber;


    newCollateralAuction.auctionId = auction.id;
    newCollateralAuction.collateral = collateral;
    newCollateralAuction.amount = amount;
    newCollateralAuction.target = target;
    newCollateralAuction.timestamp = timestamp;
    newCollateralAuction.blockNumber = blockNumber;
    newCollateralAuction.blockHash = blockHash;

    if (extrinsic) {
        newCollateralAuction.extrinsic = extrinsic;
    }

    bid.auctionId = auction.id;
    bid.type = BidType.KICK;
    bid.bidder = '';
    bid.amount = target;
    bid.timestamp = timestamp;
    bid.blockNumber = blockNumber;
    bid.blockHash = blockHash;

    await auction.save();
    await newCollateralAuction.save();
    await bid.save();
}
