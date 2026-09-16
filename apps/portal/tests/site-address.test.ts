import {describe,expect,it} from 'vitest'
import {verifiedAddressCandidates} from '../lib/mission-control/site-address'

describe('public site address search custody',()=>{
  it('keeps only structurally valid candidates backed by returned search URLs',()=>{
    const input={candidates:[
      {address:'1 Broadway, Everett, MA 02149',source_url:'https://official.example/location',source_title:'Official location'},
      {address:'Encore Boston Harbor',source_url:'https://official.example/location',source_title:'Official location'},
      {address:'2 Invented Road, Boston, MA',source_url:'https://invented.example',source_title:'Invented'},
    ]}
    expect(verifiedAddressCandidates(input,new Set(['https://official.example/location']))).toEqual([{address:'1 Broadway, Everett, MA 02149',source_url:'https://official.example/location',source_title:'Official location'}])
  })
})
