import test from 'node:test';
import assert from 'node:assert/strict';
import {contrast} from '../src/core/logic.js';
test('pares usados para texto de status atendem AA',()=>{for(const color of ['#246C44','#83520A','#C0392B'])assert.ok(contrast(color,'#F3F8FB')>=4.5,color);assert.ok(contrast('#E8A33D','#F3F8FB')<4.5);assert.ok(contrast('#FFFFFF','#1D7396')>=4.5);});
