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
