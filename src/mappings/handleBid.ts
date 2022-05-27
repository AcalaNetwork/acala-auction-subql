import { forceToCurrencyName } from '@acala-network/sdk-core';
import { SubstrateEvent } from '@subql/types';
import { AuctionStatus } from '../types';
import { getBid, getCollateralAuction } from '../utils/records'
import type { Balance } from '@polkadot/types/interfaces/runtime';

export async function handleBid (event: SubstrateEvent) {
    /**
        /// A bid is placed
		Bid {
			auction_id: T::AuctionId,
			bidder: T::AccountId,
			amount: T::Balance,
		}
     */
    const eventData = event.event.data;
    const auctionId = eventData[0].toString();
    const bidder = eventData[1].toString();
    const amount = (eventData[2] as Balance).toBigInt();
    const blockNumber = event.block.block.header.number.toBigInt();
    const blockHash = event.block.hash.toString();
    const extrinsic = event.extrinsic ? event.extrinsic.extrinsic.hash.toString() : '';
    const timestamp = event.block.timestamp;
    const eventId = `${event.block.hash}-${event.idx.toString()}`;

    const auction = await getCollateralAuction(auctionId);
    const bid = await getBid(eventId);

    auction.status = AuctionStatus.IN_PROGRESS;

    bid.auctionId = auction.id;
    bid.bidder = bidder;
    bid.amount = amount;
    bid.timestamp = timestamp;
    bid.blockNumber = blockNumber;
    bid.blockHash = blockHash;

    if (extrinsic) {
        bid.extrinsic = extrinsic;
    }

    await auction.save();
    await bid.save();
}
