import { describe,expect,it } from 'vitest'
import { normalizeSectionCollection, recoverSectionCollection } from '../lib/apollo/orchestrate'

const args={
  module:{sections:[{key:'summary',label:'Summary',required:true},{key:'actions',label:'Actions',required:true}]},
} as Parameters<typeof normalizeSectionCollection>[0]

describe('orchestrator section normalization',()=>{
  const sections=[{key:'summary',label:'Summary',content:'Facts'},{key:'actions',label:'Actions',content:'Act'}]

  it('parses a JSON-encoded section array emitted inside the tool input',()=>{
    expect(normalizeSectionCollection(args,{title:'Review',sections:JSON.stringify(sections)}).sections).toEqual(sections)
  })

  it('unwraps a nested deliverable object before validation',()=>{
    const normalized=normalizeSectionCollection(args,{deliverable:{title:'Review',sections}})
    expect(normalized.title).toBe('Review')
    expect(normalized.sections).toEqual(sections)
    expect(normalized).not.toHaveProperty('deliverable')
  })

  it('converts a keyed section object into the canonical ordered array',()=>{
    expect(normalizeSectionCollection(args,{sections:{actions:'Act',summary:'Facts'}}).sections).toEqual(sections)
  })

  it('assembles complementary section attempts in canonical order',()=>{
    expect(recoverSectionCollection(args,[{title:'Review',sections:[sections[0]]},{title:'Review',sections:[sections[1]]}]).sections).toEqual(sections)
  })
})
