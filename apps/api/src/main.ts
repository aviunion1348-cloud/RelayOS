import 'dotenv/config';
import 'reflect-metadata';
import { BadRequestException, Body, Controller, ForbiddenException, Get, HttpException, Module, Param, Patch, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, desc, eq, gt } from 'drizzle-orm';
import { Pool } from 'pg';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { ZodSchema } from 'zod';
import { prospectSchema, projectSchema, taskSchema, taskUpdateSchema, consultationSchema, requirementSchema } from './domain';
import { users, prospects, projects, tasks, audits, userSessions, consultations, requirements } from './schema';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const db = drizzle(new Pool({connectionString:process.env.DATABASE_URL}));
type Identity = { sub: string; org: string };
function input<T>(schema: ZodSchema<T>, data: unknown): T { const result = schema.safeParse(data); if (!result.success) throw new BadRequestException('Invalid input'); return result.data; }
function tokenHash(token: string) { return createHash('sha256').update(token).digest('hex'); }
async function identity(req: Request): Promise<Identity> {
 const token = req.cookies?.relay_session;
 if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) throw new UnauthorizedException();
 const [active] = await db.select({sub:users.id,org:users.organizationId,role:users.role}).from(userSessions).innerJoin(users,and(eq(users.id,userSessions.userId),eq(users.organizationId,userSessions.organizationId))).where(and(eq(userSessions.tokenHash,tokenHash(token)),gt(userSessions.expiresAt,new Date())));
 if (!active) throw new UnauthorizedException();
 // Restrict this early slice to admins until resource-level policies are implemented.
 if (active.role !== 'admin') throw new ForbiddenException('Access not configured for this role');
 return active;
}
function verifyPassword(password: string, stored: string): boolean { try { const [salt, hash] = stored.split(':'); const expected = Buffer.from(hash, 'hex'); const actual = scryptSync(password, salt, 64); return expected.length === actual.length && timingSafeEqual(expected, actual); } catch { return false; } }
@Controller('api') class Api {
 @Post('login') async login(@Body() body: unknown, @Res({passthrough:true}) res: Response) {
  const b = body as {email?:unknown;password?:unknown};
  if(typeof b?.email !== 'string' || typeof b?.password !== 'string' || b.email.length>254 || b.password.length>256) throw new UnauthorizedException('Invalid credentials');
  const [user] = await db.select().from(users).where(eq(users.email,b.email.trim().toLowerCase()));
  if (!user || !verifyPassword(b.password,user.passwordHash)) throw new UnauthorizedException('Invalid credentials');
  const token = randomBytes(32).toString('hex');
  await db.insert(userSessions).values({tokenHash:tokenHash(token),userId:user.id,organizationId:user.organizationId,expiresAt:new Date(Date.now()+8*3600000)});
  res.cookie('relay_session',token,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:8*3600000}); return {email:user.email};
 }
 @Post('logout') async logout(@Req() req:Request,@Res({passthrough:true}) res:Response) {
  const token=req.cookies?.relay_session;
  if(typeof token==='string' && /^[a-f0-9]{64}$/.test(token)) await db.delete(userSessions).where(eq(userSessions.tokenHash,tokenHash(token)));
  res.clearCookie('relay_session',{path:'/'});return {ok:true};
 }
 @Get('overview') async overview(@Req() req:Request) { const u=await identity(req); const [user,p,pr,t,a]=await Promise.all([db.select({email:users.email}).from(users).where(and(eq(users.id,u.sub),eq(users.organizationId,u.org))),db.select().from(prospects).where(eq(prospects.organizationId,u.org)).orderBy(desc(prospects.createdAt)).limit(100),db.select().from(projects).where(eq(projects.organizationId,u.org)).orderBy(desc(projects.createdAt)).limit(100),db.select().from(tasks).where(eq(tasks.organizationId,u.org)).orderBy(desc(tasks.createdAt)).limit(200),db.select().from(audits).where(eq(audits.organizationId,u.org)).orderBy(desc(audits.createdAt)).limit(8)]); if(!user.length) throw new UnauthorizedException(); return {user:user[0],prospects:p,projects:pr,tasks:t,audits:a}; }
 @Post('prospects') async prospect(@Req() req:Request,@Body() body:unknown) {const u=await identity(req),data=input(prospectSchema,body),id=randomUUID(); try {return await db.transaction(async tx=>{const [p]=await tx.insert(prospects).values({...data,id,organizationId:u.org}).returning(); await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:'prospect.created',resourceId:id});return p;});} catch(e:any){if ((e.code === '23505' && e.constraint === 'prospects_organization_id_email_key') || (e.cause?.code === '23505' && e.cause?.constraint === 'prospects_organization_id_email_key')) throw new HttpException('A prospect with this email already exists',409);throw e;} }
 @Get('consultations') async listConsultations(@Req() req:Request) {const u=await identity(req);return db.select().from(consultations).where(eq(consultations.organizationId,u.org)).orderBy(desc(consultations.createdAt)).limit(100);}
 @Post('consultations') async createConsultation(@Req() req:Request,@Body() body:unknown) {const u=await identity(req),data=input(consultationSchema,body),id=randomUUID();return db.transaction(async tx=>{const owner=await tx.select({id:prospects.id}).from(prospects).where(and(eq(prospects.id,data.prospectId),eq(prospects.organizationId,u.org)));if(!owner.length)throw new BadRequestException('Prospect not found');const [record]=await tx.insert(consultations).values({...data,id,organizationId:u.org,createdBy:u.sub}).returning();await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:'consultation.created',resourceId:id});return record;});}
 @Get('requirements') async listRequirements(@Req() req:Request) {const u=await identity(req);return db.select().from(requirements).where(eq(requirements.organizationId,u.org)).orderBy(desc(requirements.createdAt)).limit(200);}
 @Post('requirements') async createRequirement(@Req() req:Request,@Body() body:unknown) {const u=await identity(req),data=input(requirementSchema,body),id=randomUUID();return db.transaction(async tx=>{const parent=await tx.select({id:consultations.id}).from(consultations).where(and(eq(consultations.id,data.consultationId),eq(consultations.organizationId,u.org)));if(!parent.length)throw new BadRequestException('Consultation not found');const [record]=await tx.insert(requirements).values({...data,id,organizationId:u.org,createdBy:u.sub}).returning();await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:'requirement.created',resourceId:id});return record;});}
 @Post('projects') async project(@Req() req:Request,@Body() body:unknown) {const u=await identity(req),data=input(projectSchema,body),id=randomUUID();return db.transaction(async tx=>{const [p]=await tx.insert(projects).values({...data,id,organizationId:u.org}).returning();await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:'project.created',resourceId:id});return p;});}
 @Post('tasks') async task(@Req() req:Request,@Body() body:unknown) {const u=await identity(req),data=input(taskSchema,body),id=randomUUID();return db.transaction(async tx=>{const p=await tx.select({id:projects.id}).from(projects).where(and(eq(projects.id,data.projectId),eq(projects.organizationId,u.org)));if(!p.length) throw new BadRequestException('Project not found');const [t]=await tx.insert(tasks).values({...data,id,organizationId:u.org}).returning();await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:'task.created',resourceId:id});return t;});}
 @Patch('tasks/:id') async updateTask(@Req() req:Request,@Param('id') id:string,@Body() body:unknown) {const u=await identity(req),data=input(taskUpdateSchema,body);return db.transaction(async tx=>{const updated=await tx.update(tasks).set(data).where(and(eq(tasks.id,id),eq(tasks.organizationId,u.org))).returning({id:tasks.id});if(!updated.length) throw new BadRequestException('Task not found');await tx.insert(audits).values({id:randomUUID(),organizationId:u.org,actorId:u.sub,action:`task.status.${data.status}`,resourceId:id});return {ok:true};});}
}
@Module({controllers:[Api]}) class AppModule {}
async function bootstrap(){const app=await NestFactory.create(AppModule);app.use(cookieParser());app.use((req:Request,res:Response,next:()=>void)=>{res.setHeader('Cache-Control','private, no-store');res.setHeader('X-Content-Type-Options','nosniff');if(!['GET','HEAD','OPTIONS'].includes(req.method)){const origin=req.headers.origin,host=req.headers['x-forwarded-host']||req.headers.host;if(origin){try{if(new URL(origin).host!==host)return res.status(403).json({message:'Origin rejected'});}catch{return res.status(403).json({message:'Origin rejected'});}}}next();});const port=Number(process.env.API_PORT || 3001); if(!Number.isInteger(port)||port<1||port>65535) throw new Error('Invalid API_PORT'); await app.listen(port,'127.0.0.1');}
bootstrap().catch(()=>{console.error('API startup failed');process.exit(1);});
