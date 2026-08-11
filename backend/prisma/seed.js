import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    await prisma.ticket.deleteMany();
    await prisma.order.deleteMany();
    await prisma.seat.deleteMany();
    await prisma.event.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1 Organizador
    const organizer = await prisma.user.create({
        data: {
            name: 'Organizador Master',
            email: 'organizador@teste.com',
            passwordHash: hashedPassword,
            role: 'ORGANIZER',
        },
    });

    // 2 Clientes
    const client1 = await prisma.user.create({
        data: {
            name: 'Cliente Um',
            email: 'cliente1@teste.com',
            passwordHash: hashedPassword,
            role: 'CLIENT',
        },
    });

    const client2 = await prisma.user.create({
        data: {
            name: 'Cliente Dois',
            email: 'cliente2@teste.com',
            passwordHash: hashedPassword,
            role: 'CLIENT',
        },
    });

    // 1 Usuário de Portaria
    const checkinUser = await prisma.user.create({
        data: {
            name: 'Agente Portaria',
            email: 'portaria@teste.com',
            passwordHash: hashedPassword,
            role: 'CHECKIN',
        },
    });

    // 1 Evento publicado
    const event = await prisma.event.create({
        data: {
            title: 'Filhos do Éden: Paraíso Perdido',
            description: 'Uma batalha épica entre anjos, demônios e humanos pelo destino da criação, enquanto antigos conflitos chegam ao seu confronto final.',
            category: 'Peça Teatral | Fantasia Épica',
            location: 'Teatro Via Sul - Fortaleza/CE',
            dateTime: new Date('2026-10-15T20:00:00Z'),
            ticketType: 'GA',
            organizerId: organizer.id,
            seats: {
                create: [
                    { label: 'Assento Lote 1 - Ingresso 01', price: 150.0, isAvailable: true },
                    { label: 'Assento Lote 1 - Ingresso 02', price: 150.0, isAvailable: true },
                    { label: 'Assento Lote 1 - Ingresso 03', price: 150.0, isAvailable: true },
                ],
            },
        },
    });

    console.log('Seeds gerados com sucesso!');
    console.log({ organizer: organizer.email, client1: client1.email, client2: client2.email, checkin: checkinUser.email, event: event.title });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });