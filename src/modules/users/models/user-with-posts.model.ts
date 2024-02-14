import { Prisma } from '@prisma/client';

const userWithAccounts = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: { accounts: true },
});
export type UserWithAccounts = Prisma.UserGetPayload<typeof userWithAccounts>;
