import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {describe,expect,it} from 'vitest'

describe('hosted build environment contract',()=>{
  it('declares every configured Supabase and Postgres variable to Turbo',()=>{
    const config=JSON.parse(readFileSync(resolve(process.cwd(),'../../turbo.json'),'utf8')) as {tasks:{build:{env:string[]}}}
    const declared=new Set(config.tasks.build.env)
    for(const name of [
      'POSTGRES_DATABASE','POSTGRES_HOST','POSTGRES_PASSWORD','POSTGRES_PRISMA_URL','POSTGRES_URL','POSTGRES_URL_NON_POOLING','POSTGRES_USER',
      'SUPABASE_ANON_KEY','SUPABASE_JWT_SECRET','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SECRET_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY','NEXT_PUBLIC_SUPABASE_URL',
    ])expect(declared.has(name),name).toBe(true)
  })
})
