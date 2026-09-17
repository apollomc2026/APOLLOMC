import { describe,expect,it } from 'vitest'
import { createMissionFact } from '../lib/mission-control/contracts'
import { interpretMission } from '../lib/mission-control/interpreter'
import { flightDisplayIdentity,missionDisplayIdentity } from '../lib/mission-control/display-identity'

describe('operational mission identity',()=>{
  it('distinguishes a site FSR from generic and archived copies at a glance',()=>{
    const specification=interpretMission('Create a Field Service Report.').specification
    specification.artifact.recommended_type='fsr'
    specification.mission.title='Field Service Report'
    specification.content.facts.push(createMissionFact({key:'site_name',label:'Site name',value:'Encore Boston Harbor',source:'evidence',source_reference:'service-record',confidence:1}))
    specification.content.facts.push(createMissionFact({key:'visit_date',label:'Visit date',value:'September 15, 2026',source:'evidence',source_reference:'service-record',confidence:1}))
    specification.content.facts.push(createMissionFact({key:'site_address',label:'Site address',value:'1 Broadway, Everett, MA 02149',source:'user',confidence:1}))
    expect(missionDisplayIdentity(specification)).toMatchObject({displayTitle:'Encore Boston Harbor · Field Service Report',subject:'Encore Boston Harbor',context:'September 15, 2026 · 1 Broadway, Everett, MA 02149'})
  })

  it('names each reflight with mission, sequence, and purpose',()=>{
    const specification=interpretMission('Create a quote for US Foods.').specification
    specification.artifact.recommended_type='quote'
    specification.mission.title='Quote'
    specification.content.facts.push(createMissionFact({key:'customer_name',label:'Customer',value:'US Foods',source:'evidence',source_reference:'estimate',confidence:1}))
    const workOrder={fields:{revision_of:'prior-job',artifact_version:3,revision_instruction:'Increase visual hierarchy without changing prices.'}}
    expect(flightDisplayIdentity({specification,workOrder,sequence:3})).toEqual({flightLabel:'Reflight 02',flightName:'US Foods · Quote / Estimate · Reflight 02',purpose:'Increase visual hierarchy without changing prices.'})
  })
})
