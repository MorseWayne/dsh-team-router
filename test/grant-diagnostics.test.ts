import assert from 'node:assert/strict';
import { it } from 'node:test';
import { CODEX_SUBAGENT, readGrantEvidence, type InventoryReader } from '../src/ui/grant-diagnostics.ts';
import { MODEL_AUTHORIZATION_ENTRY, planModelGrant } from '../src/ui/model-grants.ts';

const row = {entryId: `include:${MODEL_AUTHORIZATION_ENTRY}`, moduleName: '@deepseek-ai/dsh-tool-subagent/model-selection-settings', enabled: false, fiberPhase: null};
const mismatch = {name: CODEX_SUBAGENT, installed: true, version: '0.2.2-rc.3', installTarget: {version: '0.2.2-rc.5'}, error: {code: 'incompatible-version', incompatible: [{name: CODEX_SUBAGENT, version: '0.2.2-rc.3', runtimeVersion: '0.2.2-rc.5'}]}};
function inventory(plugins = [row], bundles = [mismatch]): InventoryReader {
  return {listPlugins: async () => ({ok: true, value: plugins}), listBundles: async () => ({ok: true, value: bundles})};
}
it('shows exact installed, Host and offered versions only for a reported related incompatibility', async () => {
  assert.deepEqual(await readGrantEvidence(inventory()), {component:'disabled', conflict:{name:CODEX_SUBAGENT, installed:'0.2.2-rc.3', runtime:'0.2.2-rc.5', offered:'0.2.2-rc.5'}});
  for (const b of [{...mismatch, installed:false}, {...mismatch, name:'unrelated'}, {...mismatch, error:{...mismatch.error, code:'network'}}, {...mismatch, version:'0.2.2-rc.5'}]) {
    assert.deepEqual(await readGrantEvidence(inventory([row], [b])), {component:'disabled'});
  }
});
it('distinguishes missing, failed, active and inaccessible components; preserves partial evidence', async () => {
  assert.deepEqual(await readGrantEvidence(inventory([])), {component:'missing'});
  for (const phase of ['active', 'failed']) {
    const r: InventoryReader = {...inventory(), listPlugins: async () => ({ok:true,value:[{...row,enabled:true,fiberPhase:phase}]}), listBundles: async () => {throw Error('sensitive');}};
    assert.deepEqual(await readGrantEvidence(r), {component:phase});
  }
  assert.deepEqual(await readGrantEvidence(), {component:'unknown'});
  assert.deepEqual(await readGrantEvidence({...inventory(),listPlugins:async()=>({ok:false})}), {component:'unknown'});
});
it('separates loading, unavailable and malformed settings without blocking inherited routes', () => {
  const required = [{provider:'p',model:'m'}];
  for (const [status, reason] of [['loading','loading'],['unavailable','unserved'],['ready','invalid']] as const) {
    const snapshot = {status, writable:true, revision:1, value:{enabled:true,allowedModels:[null as never]}};
    assert.deepEqual(planModelGrant(required,snapshot), {kind:'unavailable',reason});
    assert.deepEqual(planModelGrant([],snapshot), {kind:'complete'});
  }
});
