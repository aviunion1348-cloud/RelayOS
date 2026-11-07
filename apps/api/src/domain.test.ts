import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {prospectSchema,projectSchema,taskSchema,taskUpdateSchema} from './domain';
test('prospect emails are normalized for duplicate detection',()=>{assert.equal(prospectSchema.parse({name:' A ',company:' B ',email:'USER@example.com'}).email,'user@example.com')});
test('invalid and extra fields are rejected',()=>{assert.equal(projectSchema.safeParse({name:' ',client:'C'}).success,false);assert.equal(projectSchema.safeParse({name:'P',client:'C',organizationId:'other'}).success,false)});
test('task status and priority are constrained',()=>{assert.equal(taskUpdateSchema.safeParse({status:'Approved'}).success,false);assert.equal(taskSchema.safeParse({title:'Task',projectId:'p',priority:'Urgent'}).success,true)});
