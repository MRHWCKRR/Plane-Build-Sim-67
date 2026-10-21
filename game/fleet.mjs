import { parts, views } from './data.mjs';
export const aircraft = [
  { id: '737', name: 'Boeing 737', short: '737', description: 'Single-aisle airliner', folder: '/assets/game' },
  { id: '787', name: 'Boeing 787', short: '787', description: 'Long-haul Dreamliner', folder: '/assets/game/787' },
  { id: 'a220', name: 'Airbus A220', short: 'A220', description: 'Compact passenger jet', folder: '/assets/game/a220' },
  { id: '747', name: 'Boeing 747-400', short: '747', description: 'Four-engine jumbo jet', folder: '/assets/game/747' },
  { id: 'f16', name: 'F-16 Fighting Falcon', short: 'F16', description: 'Single-engine fighter', folder: '/assets/game/f16' },
  { id: 'hornet', name: 'F/A-18 Hornet', short: 'F18', description: 'Twin-engine fighter', folder: '/assets/game/hornet' },
];
export const getAircraft = id => aircraft.find(plane => plane.id === id) || aircraft[0];
export const getViews = id => views.filter(view => !['hornet', 'f16'].includes(id) || view.id !== 'cabin').map(view => {
  if (!['hornet', 'f16'].includes(id)) return view;
  const alt = {
    exterior: 'Gray fighter aircraft parked on an apron, viewed from the front left.',
    cockpit: 'Fighter cockpit with a helmeted pilot, flight displays and hand controls.',
    tail: 'Fighter tail assembly with vertical fin, horizontal stabilators and engine exhaust.',
  };
  return { ...view, alt: alt[view.id] };
});
export const sceneBase = (id, view) => `${getAircraft(id).folder}/${view}`;
const point = (x, y, dx, dy) => ({ x, y, dx, dy });
export const positions = {
  f16: {
    'vertical-stabilizer': point(50,30,-13,-5), rudder: point(57,30,11,2), 'horizontal-stabilizer': point(26,73,-7,12),
    pilot: point(13,34,1,15), seats: point(12,73,7,8), yoke: point(80,68,7,11), throttle: point(36,58,-5,12), display: point(47,45,1,-12), lights: point(84,56,7,-11),
    aileron: point(84,52,4,11), slats: point(76,48,-3,12), cockpit: point(34,44,-12,0),
    windows: point(38,39,0,-13), fuselage: point(52,47,0,-13), 'landing-gear': point(40,77,7,7),
  },
  '747': {
    aileron: point(87,54,3,12), slats: point(80,54,0,-10), flaps: point(69,58,0,14), spoiler: point(70,56,-7,-10),
    winglets: point(97,48,-4,4), cockpit: point(18,51,-8,-10), fuselage: point(46,48,0,-12), windows: point(34,57,-5,-11),
    'landing-gear': point(19,74,6,9), engines: point(55,66,0,12),
    seats: point(43,75,6,-11), lights: point(21,27,-7,-8),
    pilot: point(17,57,0,14), yoke: point(80,60,4,13), throttle: point(49,73,5,13), display: point(75,50,-6,-12),
    'vertical-stabilizer': point(48,35,-13,-5), rudder: point(60,36,11,2),
    'horizontal-stabilizer': point(24,58,-12,-8), elevator: point(29,65,6,12),
  },
  '787': {
    aileron: point(83,52,5,11), slats: point(76,51,2,-10), flaps: point(69,56,1,14), spoiler: point(71,53,-6,-10),
    winglets: point(97,47,-3,3), cockpit: point(12,61,-4,-12), fuselage: point(48,47,0,-12), windows: point(38,56,-7,-12),
    'landing-gear': point(15,79,8,5), engines: point(59,65,-5,14),
    'vertical-stabilizer': point(56,25,-13,-5), rudder: point(60,28,11,3),
    'horizontal-stabilizer': point(39,49,-13,0), elevator: point(41,56,5,12),
    seats: point(45,78,5,-12), lights: point(19,26,-7,-8),
    pilot: point(20,55,0,14), yoke: point(80,61,5,12), throttle: point(50,74,6,11), display: point(73,48,-7,-12),
  },
  a220: {
    aileron: point(86,49,2,12), slats: point(77,49,1,-10), flaps: point(70,54,-1,15), spoiler: point(73,51,-7,-11),
    winglets: point(98,44,-4,6), cockpit: point(22,56,-12,-9), fuselage: point(53,43,0,-11), windows: point(40,53,-6,-10),
    'landing-gear': point(22,80,7,5), engines: point(61,65,-7,14),
    pilot: point(17,56,3,14), yoke: point(91,62,-6,12), throttle: point(50,73,8,12), display: point(75,48,-8,-12),
    'vertical-stabilizer': point(55,25,-13,-5), rudder: point(60,28,11,3),
    'horizontal-stabilizer': point(37,54,-13,-3), elevator: point(44,59,2,12),
    lights: point(18,19,-6,7),
  },
  hornet: {
    aileron: point(86,55,3,11), flaps: point(65,51,2,14), cockpit: point(28,47,-10,-10), fuselage: point(48,44,0,-12),
    windows: point(36,40,0,-14), 'landing-gear': point(36,74,4,10), engines: point(52,55,5,15),
    pilot: point(15,47,-2,16), yoke: point(62,78,14,5), throttle: point(34,67,0,13), display: point(53,65,11,-14),
    seats: point(13,79,8,2), lights: point(75,56,9,-13),
    'vertical-stabilizer': point(37,30,-12,-8), rudder: point(44,34,10,-3), 'horizontal-stabilizer': point(35,69,-3,10),
  },
};

export function getParts(id = '737') {
  let result = parts.map(part => ({ ...part, ...(positions[id]?.[part.id] || {}) }));
  if (id === '787') result = result.map(part => part.id === 'winglets' ? { ...part, name: 'Raked wingtips', definition: 'Swept wingtip extensions that help reduce induced drag.', hint: 'Find the swept-back outer tip of the wing.' } : part);
  if (id === 'a220') result = result.map(part => part.id === 'yoke' ? { ...part, name: 'Sidestick', definition: 'A side-mounted hand control that commands pitch and roll.', hint: 'Look for the short stick beside the right pilot seat.' } : part);
  if (id === '747') result = result.map(part => part.id === 'throttle' ? { ...part, hint: 'Find the four thrust levers in the centre pedestal.' } : part);
  if (['hornet', 'f16'].includes(id)) {
    result = result.filter(part => !['slats', 'spoiler', 'winglets', 'elevator'].includes(part.id));
    result = result.map(part => {
      if (part.id === 'yoke') return { ...part, name: 'Control stick', definition: 'A central hand control for pitch and roll.', hint: 'Find the stick low in front of the pilot.' };
      if (part.id === 'horizontal-stabilizer') return { ...part, name: 'Stabilator', definition: 'An all-moving horizontal tail surface that controls pitch.', hint: 'Find a whole horizontal tail surface that can pivot.' };
      if (part.id === 'vertical-stabilizer') return { ...part, hint: 'Find an upright gray tail fin.' };
      if (part.id === 'windows') return { ...part, name: 'Canopy', definition: 'The transparent cover over a fighter cockpit.', hint: 'Find the clear bubble over the pilot.' };
      if (part.id === 'engines') return { ...part, view: 'tail', x: 69, y: 68, dx: 14, dy: 10, hint: 'Find the pair of engine exhausts at the back.' };
      if (part.id === 'display') return { ...part, name: 'Flight display', definition: 'An electronic screen showing flight information to the pilot.', hint: 'Find an electronic screen on the main instrument panel.' };
      if (part.id === 'seats') return { ...part, view: 'cockpit', name: 'Ejection seat', definition: 'A seat designed to help a pilot escape in an emergency.', hint: 'Find the pilot’s seat and harness.' };
      if (part.id === 'lights') return { ...part, view: 'cockpit', name: 'Cockpit lighting', definition: 'Lighting that makes instruments readable in dim conditions.', hint: 'Find the lit instrument panel.' };
      return part;
    });
  }
  if (id === 'f16') {
    result = result.filter(part => part.id !== 'flaps');
    result = result.map(part => {
      if (part.id === 'aileron') return { ...part, name: 'Flaperons', definition: 'Wing trailing-edge surfaces that combine flap and aileron functions.', hint: 'Find the movable back edge of the wing.' };
      if (part.id === 'yoke') return { ...part, name: 'Sidestick', definition: 'A side-mounted hand control that commands pitch and roll.', hint: 'Find the short control stick on the right console.' };
      if (part.id === 'engines') return { ...part, name: 'Turbofan engine', x: 58, y: 72, dx: 13, dy: 13, definition: 'A fan-driven jet engine that produces thrust.', hint: 'Find the single circular exhaust below the tail.' };
      if (part.id === 'throttle') return { ...part, name: 'Throttle', definition: 'A lever that sets engine thrust.', hint: 'Find the throttle on the pilot’s left console.' };
      if (part.id === 'pilot') return { ...part, hint: 'Find the helmeted person in the cockpit.' };
      return part;
    });
    result.push({ ...parts.find(part => part.id === 'slats'), ...(positions.f16?.slats || {}), name: 'Leading-edge flaps', definition: 'Movable wing leading edges that adjust airflow for different flight conditions.', hint: 'Look along the front edge of the fighter’s wing.' });
  }
  return result;
}
