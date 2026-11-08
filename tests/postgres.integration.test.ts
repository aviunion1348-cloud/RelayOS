import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { Pool } from 'pg';

// Only run on a deliberately designated disposable database; never create, drop or reset databases here.
const url = process.env.TEST_DATABASE_URL;
if (!url || process.env.RELAYOS_DISPOSABLE_TEST_DB !== 'yes') throw new Error('Set TEST_DATABASE_URL and RELAYOS_DISPOSABLE_TEST_DB=yes for an isolated migrated test database');

async function freePort(): Promise<number> { return new Promise((resolve,reject)=>{const server=createServer();server.on('error',reject);server.listen(0,'127.0.0.1',()=>{const port=(server.address() as {port:number}).port;server.close(()=>resolve(port));});}); }
const hash = (password:string) => {const salt=randomBytes(16).toString('hex');return `${salt}:${scryptSync(password,salt,64).toString('hex')}`;};

test('PostgreSQL API: persistence, tenant boundaries, audit, and session revocation', {timeout:30000}, async () => {
 const pool = new Pool({connectionString:url}); const suffix=randomUUID();
 const orgA=randomUUID(),orgB=randomUUID(),userA=randomUUID(),userB=randomUUID(),viewer=randomUUID();
 const emailA=`a-${suffix}@example.test`,emailB=`b-${suffix}@example.test`,password='test-password-unique';
 const port=await freePort();
 let process: ReturnType<typeof spawn>|undefined;
 try {
  await pool.query('INSERT INTO organizations(id,name) VALUES($1,$2),($3,$4)',[orgA,'Test A',orgB,'Test B']);
  await pool.query('INSERT INTO users(id,email,password_hash,organization_id) VALUES($1,$2,$3,$4),($5,$6,$7,$8)',[userA,emailA,hash(password),orgA,userB,emailB,hash(password),orgB]);
  process=spawn('./node_modules/.bin/tsx',['--tsconfig','apps/api/tsconfig.json','apps/api/src/main.ts'],{env:{...globalThis.process.env,DATABASE_URL:url,API_PORT:String(port)},stdio:['ignore','pipe','pipe']});
  await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('API startup timed out')),12000);process!.stdout!.on('data',d=>{if(String(d).includes('successfully started')){clearTimeout(timer);resolve();}});process!.once('exit',code=>{clearTimeout(timer);reject(new Error(`API exited (${code})`));});});
  const base=`http://127.0.0.1:${port}/api`;
  async function req(path:string,method='GET',data?:unknown,cookie?:string) {return fetch(base+path,{method,headers:{...(data?{'content-type':'application/json'}:{}),...(cookie?{cookie}:{}),origin:`http://127.0.0.1:${port}`},...(data?{body:JSON.stringify(data)}:{})});}
  async function login(email:string){const r=await req('/login','POST',{email,password});assert.equal(r.status,201);const c=r.headers.get('set-cookie');assert.ok(c?.includes('HttpOnly'));return c!.split(';')[0];}
  const unauth=await req('/overview');assert.equal(unauth.status,401);assert.equal(unauth.headers.get('cache-control'),'private, no-store');
  const badOrigin=await fetch(base+'/login',{method:'POST',headers:{'content-type':'application/json',origin:'https://attacker.example'},body:JSON.stringify({email:emailA,password})});assert.equal(badOrigin.status,403);
  const viewerEmail=`viewer-${suffix}@example.test`;await pool.query('INSERT INTO users(id,email,password_hash,organization_id,role) VALUES($1,$2,$3,$4,$5)',[viewer,viewerEmail,hash(password),orgA,'viewer']);
  const a=await login(emailA),b=await login(emailB),v=await login(viewerEmail);
  assert.equal((await req('/overview','GET',undefined,v)).status,403);assert.equal((await req('/projects','POST',{name:'Forbidden',client:'Client'},v)).status,403);assert.equal((await req('/consultations','GET',undefined,v)).status,403);
  const projectRes=await req('/projects','POST',{name:'Test project',client:'Test client'},a);assert.equal(projectRes.status,201);const project=await projectRes.json() as {id:string};
  assert.equal((await req('/project-view/'+project.id,'GET',undefined,v)).status,403);
  assert.equal((await req('/projects/'+project.id+'/view-members','POST',{userId:viewer},v)).status,403);
  assert.equal((await req('/projects/'+project.id+'/view-members','POST',{userId:viewer},b)).status,400);
  assert.equal((await req('/projects/'+project.id+'/view-members','POST',{userId:userB},a)).status,400);
  assert.equal((await req('/projects/'+project.id+'/view-members','POST',{userId:viewer},a)).status,201);
  assert.equal((await req('/projects/'+project.id+'/view-members','POST',{userId:viewer},a)).status,409);
  assert.equal((await req('/project-view/'+project.id,'GET',undefined,v)).status,200);
  assert.equal((await req('/project-view/'+project.id,'GET',undefined,b)).status,403);
  assert.equal((await req('/overview','GET',undefined,v)).status,403);
  assert.equal((await req('/projects/'+project.id+'/view-members/'+viewer,'DELETE',undefined,v)).status,403);
  assert.equal((await req('/projects/'+project.id+'/view-members/'+viewer,'DELETE',undefined,a)).status,200);
  assert.equal((await req('/project-view/'+project.id,'GET',undefined,v)).status,403);
  const membershipAudit=await pool.query("SELECT action,actor_id,target_user_id FROM audits WHERE resource_id=$1 AND action LIKE 'project.view.%' ORDER BY created_at",[project.id]);assert.deepEqual(membershipAudit.rows,[{action:'project.view.granted',actor_id:userA,target_user_id:viewer},{action:'project.view.revoked',actor_id:userA,target_user_id:viewer}]);
  await assert.rejects(pool.query('INSERT INTO project_view_memberships(organization_id,project_id,user_id,granted_by) VALUES($1,$2,$3,$4)',[orgA,project.id,userB,userA]),(e:any)=>e.code==='23503');
  assert.equal((await req('/tasks','POST',{title:'Cross-tenant attempt',projectId:project.id,priority:'High'},b)).status,400);
  const mile=await req('/milestones','POST',{projectId:project.id,title:'Milestone 1',description:'Delivery'},a);assert.equal(mile.status,201);const milestone=await mile.json() as {id:string};
  assert.equal((await req('/milestones','POST',{projectId:project.id,title:'Cross tenant'},b)).status,400);
  const other=await req('/projects','POST',{name:'Other',client:'Test'},a);const otherProject=await other.json() as {id:string};
  assert.equal((await req('/modules','POST',{projectId:otherProject.id,milestoneId:milestone.id,title:'Wrong project'},a)).status,400);
  const module=await req('/modules','POST',{projectId:project.id,milestoneId:milestone.id,title:'Module 1'},a);assert.equal(module.status,201);const moduleRecord=await module.json() as {id:string};
  await assert.rejects(pool.query('INSERT INTO delivery_modules(id,organization_id,project_id,milestone_id,title,created_by) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),orgA,otherProject.id,milestone.id,'Invalid milestone',userA]),(e:any)=>e.code==='23503');
  assert.equal(((await (await req('/milestones','GET',undefined,b)).json()) as unknown[]).length,0);assert.equal(((await (await req('/modules','GET',undefined,b)).json()) as unknown[]).length,0);
  const taskRes=await req('/tasks','POST',{title:'A task',projectId:project.id,priority:'High'},a);assert.equal(taskRes.status,201);const task=await taskRes.json() as {id:string};
  assert.equal((await req('/tasks/'+task.id,'PATCH',{status:'Done',version:0},b)).status,400);
  assert.equal((await req('/tasks/'+task.id,'PATCH',{status:'Done',version:0},a)).status,200);
  assert.equal((await req('/tasks/'+task.id+'/assignment','PATCH',{ownerId:userB,reviewerId:null,version:1},a)).status,400);
  assert.equal((await req('/tasks/'+task.id+'/assignment','PATCH',{ownerId:userA,reviewerId:viewer,version:1},a)).status,200);
  assert.equal((await req('/tasks/'+task.id+'/assignment','PATCH',{ownerId:null,reviewerId:null,version:1},a)).status,409);
  assert.equal((await req('/tasks/'+task.id,'PATCH',{status:'Done',version:1},a)).status,409);
  await assert.rejects(pool.query('UPDATE tasks SET owner_id=$1 WHERE id=$2',[userB,task.id]),(e:any)=>e.code==='23503');
  const assignment=await pool.query('SELECT owner_id,reviewer_id FROM tasks WHERE id=$1',[task.id]);assert.equal(assignment.rows[0].owner_id,userA);assert.equal(assignment.rows[0].reviewer_id,viewer);

  const resultB=await (await req('/overview','GET',undefined,b)).json() as {projects:unknown[];tasks:unknown[]};assert.deepEqual(resultB.projects,[]);assert.deepEqual(resultB.tasks,[]);
  await assert.rejects(pool.query('INSERT INTO tasks(id,organization_id,project_id,title) VALUES($1,$2,$3,$4)',[randomUUID(),orgB,project.id,'Invalid cross-tenant FK']), (e: any)=>e.code==='23503');
  const stored=await pool.query('SELECT status FROM tasks WHERE id=$1 AND organization_id=$2',[task.id,orgA]);assert.equal(stored.rows[0].status,'Done');
  const audit=await pool.query('SELECT action FROM audits WHERE organization_id=$1 ORDER BY created_at',[orgA]);assert.deepEqual(audit.rows.map(r=>r.action),['project.created','project.view.granted','project.view.revoked','milestone.created','project.created','module.created','task.created','task.status.Done','task.assignment.updated']);
  const qaCase={projectId:project.id,moduleId:moduleRecord.id,title:'Authorization boundary',category:'Security',risk:'Exposure',preconditions:'Two organizations',input:'Request record',expectedResult:'Access denied'};
  assert.equal((await req('/qa/cases','POST',qaCase,b)).status,400);
  const qa=await req('/qa/cases','POST',qaCase,a);assert.equal(qa.status,201);const caseRecord=await qa.json() as {id:string};
  assert.equal((await req('/qa/cases','POST',{...qaCase,title:' authorization boundary '},a)).status,409);
  const result={caseId:caseRecord.id,outcome:'Pass',actualResult:'Request denied',evidenceReference:'Manual test reference',buildVersion:'test-build',environment:'isolated test'};
  assert.equal((await req('/qa/results','POST',result,b)).status,400);
  assert.equal((await req('/qa/results','POST',result,a)).status,201);assert.equal((await req('/qa/results','POST',{...result,outcome:'Fail',actualResult:'Regression'},a)).status,201);
  assert.equal(((await (await req('/qa/results','GET',undefined,a)).json()) as unknown[]).length,2);assert.equal(((await (await req('/qa/results','GET',undefined,b)).json()) as unknown[]).length,0);
  const preResponse=await req('/tasks','POST',{title:'Prerequisite',projectId:project.id,priority:'Medium'},a);const pre=await preResponse.json() as {id:string};
  const dependentResponse=await req('/tasks','POST',{title:'Dependent',projectId:project.id,priority:'Medium'},a);const dependent=await dependentResponse.json() as {id:string};
  assert.equal((await req('/tasks/'+dependent.id+'/dependencies','POST',{dependsOnId:pre.id},a)).status,201);
  assert.equal((await req('/tasks/'+dependent.id+'/dependencies','POST',{dependsOnId:pre.id},a)).status,409);
  assert.equal((await req('/tasks/'+pre.id+'/dependencies','POST',{dependsOnId:dependent.id},a)).status,400);
  assert.equal((await req('/tasks/'+dependent.id,'PATCH',{status:'Done',version:0},a)).status,400);
  assert.equal((await req('/tasks/'+pre.id,'PATCH',{status:'Done',version:0},a)).status,200);
  assert.equal((await req('/tasks/'+dependent.id,'PATCH',{status:'Done',version:0},a)).status,200);
  assert.equal((await req('/tasks/'+pre.id,'PATCH',{status:'In progress',version:1},a)).status,400);
  assert.equal((await req('/tasks/'+dependent.id+'/dependencies','POST',{dependsOnId:pre.id},b)).status,400);
  const concurrentTask=await (await req('/tasks','POST',{title:'Concurrent edits',projectId:project.id,priority:'Medium'},a)).json() as {id:string};
  const edits=await Promise.all([req('/tasks/'+concurrentTask.id+'/assignment','PATCH',{ownerId:userA,reviewerId:null,version:0},a),req('/tasks/'+concurrentTask.id+'/assignment','PATCH',{ownerId:viewer,reviewerId:null,version:0},a)]);
  assert.deepEqual(edits.map(r=>r.status).sort(),[200,409]);
  const x=await (await req('/tasks','POST',{title:'Concurrent X',projectId:project.id,priority:'Medium'},a)).json() as {id:string};
  const y=await (await req('/tasks','POST',{title:'Concurrent Y',projectId:project.id,priority:'Medium'},a)).json() as {id:string};
  const concurrent=await Promise.all([req('/tasks/'+x.id+'/dependencies','POST',{dependsOnId:y.id},a),req('/tasks/'+y.id+'/dependencies','POST',{dependsOnId:x.id},a)]);
  assert.deepEqual(concurrent.map(r=>r.status).sort(),[201,400]);

  const prospect={name:'Test person',company:'Test company',email:`${suffix}@example.test`};const createdProspect=await req('/prospects','POST',prospect,a);assert.equal(createdProspect.status,201);const prospectRecord=await createdProspect.json() as {id:string};assert.equal((await req('/prospects','POST',prospect,a)).status,409);
  assert.equal((await req('/consultations','POST',{prospectId:prospectRecord.id,title:'Forbidden'},b)).status,400);
  const consult=await req('/consultations','POST',{prospectId:prospectRecord.id,title:'Discovery',infrastructure:'Existing cloud',businessRequirements:'Reliable service'},a);assert.equal(consult.status,201);const consultation=await consult.json() as {id:string};
  assert.equal((await req('/requirements','POST',{consultationId:consultation.id,title:'Cross tenant',description:'Forbidden'},b)).status,400);
  const requirement=await req('/requirements','POST',{consultationId:consultation.id,title:'Availability',description:'Define recovery objective'},a);assert.equal(requirement.status,201);assert.equal((await requirement.json() as {status:string}).status,'Draft');
  assert.equal(((await (await req('/consultations','GET',undefined,b)).json()) as unknown[]).length,0);assert.equal(((await (await req('/requirements','GET',undefined,b)).json()) as unknown[]).length,0);
  const persisted=await pool.query('SELECT c.infrastructure,r.description FROM consultations c JOIN requirements r ON r.consultation_id=c.id WHERE c.id=$1',[consultation.id]);assert.equal(persisted.rows[0].infrastructure,'Existing cloud');assert.equal(persisted.rows[0].description,'Define recovery objective');
  await assert.rejects(pool.query('INSERT INTO consultations(id,organization_id,prospect_id,created_by,title) VALUES($1,$2,$3,$4,$5)',[randomUUID(),orgB,prospectRecord.id,userB,'Invalid cross-tenant FK']), (e:any)=>e.code==='23503');
  assert.equal((await req('/logout','POST',{},a)).status,201);assert.equal((await req('/overview','GET',undefined,a)).status,401);
  const session=await pool.query('SELECT count(*)::int AS count FROM user_sessions WHERE user_id=$1',[userA]);assert.equal(session.rows[0].count,0);
 } finally {process?.kill('SIGTERM');await pool.end();}
});
