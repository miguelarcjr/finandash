import { PrismaClient } from "../generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando o seed do banco de dados (SQLite)...");

    // Verificar se já existe (idempotência básica)
    const existingUser = await prisma.user.findUnique({
        where: { email: "admin@finandash.com" }
    });

    if (existingUser) {
        console.log("Seed já foi executado. Usuário admin@finandash.com encontrado.");
        return;
    }

    const tenant = await prisma.tenant.create({
        data: {
            name: "Escritório Demo",
        },
    });

    const passwordHash = await bcrypt.hash("senha123", 10);

    const adminUser = await prisma.user.create({
        data: {
            email: "admin@finandash.com",
            name: "Administrador",
            passwordHash,
            role: "SOCIO", // role é string baseada no enum que tínhamos
            tenantId: tenant.id,
        },
    });

    console.log("Seed concluído com sucesso!");
    console.log("Tenant criado:", tenant.name, `(${tenant.id})`);
    console.log("Usuário criado:", adminUser.email, "(Senha: senha123)");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
