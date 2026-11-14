import { Prisma } from '../generated/prisma/client.js';

/** Half to the freelancer, remainder to the client. Extra cent stays with the client. */
export function splitSimulatedPayout(amount: Prisma.Decimal) {
  const total = new Prisma.Decimal(amount.toString());
  const freelancerShare = total
    .div(2)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_DOWN);
  const clientShare = total.minus(freelancerShare);
  return { freelancerShare, clientShare };
}

/** SPLIT needs a non-zero freelancer share (0.01 rounds down to 0.00). */
export function canSplitSimulatedPayout(amount: Prisma.Decimal) {
  return splitSimulatedPayout(amount).freelancerShare.gt(0);
}
