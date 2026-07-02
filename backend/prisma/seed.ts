import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = '12345678';

async function upsertUser(input: {
  email: string;
  role: 'CLIENT' | 'FREELANCER' | 'ARBITER';
  displayName: string;
  name: string;
  bio?: string;
  skills?: string[];
}) {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      displayName: input.displayName,
      name: input.name,
      bio: input.bio,
      skills: input.skills ?? [],
    },
    create: {
      email: input.email,
      passwordHash,
      role: input.role,
      displayName: input.displayName,
      name: input.name,
      bio: input.bio,
      skills: input.skills ?? [],
    },
  });
}

async function main() {
  console.log('Seeding demo data…');

  const client = await upsertUser({
    email: 'client@example.com',
    role: 'CLIENT',
    displayName: 'client.eth',
    name: 'Demo Client',
    bio: 'Building Web3 products with milestone-based delivery.',
  });

  const freelancer = await upsertUser({
    email: 'freelancer@example.com',
    role: 'FREELANCER',
    displayName: 'freelancer.eth',
    name: 'Demo Freelancer',
    bio: 'Full-stack and Solidity freelancer.',
    skills: ['Frontend', 'Solidity'],
  });

  const freelancer2 = await upsertUser({
    email: 'freelancer2@example.com',
    role: 'FREELANCER',
    displayName: 'dev.sage',
    name: 'Second Freelancer',
    bio: 'Available for public job board work.',
    skills: ['Design', 'Frontend'],
  });

  await upsertUser({
    email: 'arbiter@example.com',
    role: 'ARBITER',
    displayName: 'arbiter.eth',
    name: 'Demo Arbiter',
    bio: 'Resolves escrow disputes on the platform.',
  });

  const publicProject = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {
      title: 'Public DeFi Dashboard',
      description:
        'Build a React dashboard with wallet connect and milestone-based escrow.',
      isPublic: true,
      skills: ['Frontend', 'Solidity'],
    },
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      title: 'Public DeFi Dashboard',
      description:
        'Build a React dashboard with wallet connect and milestone-based escrow.',
      totalBudget: 2000,
      currency: 'USDC',
      isPublic: true,
      skills: ['Frontend', 'Solidity'],
      clientId: client.id,
      milestones: {
        create: [
          {
            orderIndex: 0,
            title: 'Design',
            description: 'Figma mockups and component spec',
            amount: 1000,
            deadline: new Date('2026-09-01'),
          },
          {
            orderIndex: 1,
            title: 'Build',
            description: 'React implementation and wallet connect',
            amount: 1000,
            deadline: new Date('2026-10-01'),
          },
        ],
      },
    },
    include: { milestones: true },
  });

  await prisma.application.deleteMany({ where: { projectId: publicProject.id } });
  await prisma.milestone.updateMany({
    where: { projectId: publicProject.id },
    data: { status: 'PENDING', paidAt: null, completedAt: null },
  });
  await prisma.project.update({
    where: { id: publicProject.id },
    data: {
      freelancerId: null,
      invitedFreelancerId: null,
      status: 'DRAFT',
      escrowStatus: 'NOT_FUNDED',
      fundedAt: null,
      completedAt: null,
    },
  });

  const privateProjectId = '00000000-0000-4000-8000-000000000002';

  await prisma.project.upsert({
    where: { id: privateProjectId },
    update: {
      title: 'Private API Integration',
      description: 'Invite-only backend integration work.',
      isPublic: false,
      invitedFreelancerId: freelancer.id,
      freelancerId: null,
      skills: ['Solidity'],
    },
    create: {
      id: privateProjectId,
      title: 'Private API Integration',
      description: 'Invite-only backend integration work.',
      totalBudget: 1500,
      currency: 'USDC',
      isPublic: false,
      skills: ['Solidity'],
      clientId: client.id,
      invitedFreelancerId: freelancer.id,
      milestones: {
        create: [
          {
            orderIndex: 0,
            title: 'API design',
            description: 'OpenAPI specification',
            amount: 750,
            deadline: new Date('2026-09-15'),
          },
          {
            orderIndex: 1,
            title: 'Implementation',
            description: 'Express routes and tests',
            amount: 750,
            deadline: new Date('2026-10-15'),
          },
        ],
      },
    },
  });

  await prisma.milestone.updateMany({
    where: { projectId: privateProjectId },
    data: { status: 'PENDING', paidAt: null, completedAt: null },
  });
  await prisma.project.update({
    where: { id: privateProjectId },
    data: {
      freelancerId: null,
      invitedFreelancerId: freelancer.id,
      status: 'DRAFT',
      escrowStatus: 'NOT_FUNDED',
      fundedAt: null,
      completedAt: null,
    },
  });

  await prisma.application.upsert({
    where: {
      projectId_freelancerId: {
        projectId: publicProject.id,
        freelancerId: freelancer2.id,
      },
    },
    update: {
      pitch:
        'Built 3 DeFi dashboards — happy to deliver design-first, milestone by milestone.',
      status: 'PENDING',
    },
    create: {
      projectId: publicProject.id,
      freelancerId: freelancer2.id,
      pitch:
        'Built 3 DeFi dashboards — happy to deliver design-first, milestone by milestone.',
      status: 'PENDING',
    },
  });

  console.log('Seed complete.');
  console.log('');
  console.log('Demo logins (password for all: 12345678)');
  console.log('  client@example.com      — CLIENT');
  console.log('  freelancer@example.com  — FREELANCER (pending invite)');
  console.log('  freelancer2@example.com — FREELANCER (pending application)');
  console.log('  arbiter@example.com     — ARBITER');
  console.log('');
  console.log(`Public job board project: ${publicProject.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
