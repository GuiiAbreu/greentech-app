import "dotenv/config"; 
import { PrismaPg } from "@prisma/adapter-pg"; 
import Prisma from "@prisma/client"; 

const { PrismaClient } = Prisma; 

const connectionString = process.env.DATABASE_URL; 
    if (!connectionString) throw new Error("DATABASE_URL is missing"); 

    const adapter = new PrismaPg({ connectionString }); 
    
export const prisma = new PrismaClient({ adapter });