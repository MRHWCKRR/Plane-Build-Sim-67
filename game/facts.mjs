const nasa = 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/airplane-parts-function/';
const faa = 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation';
const controls = 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/aircraft-control-1902-glider/';
const cabin = 'https://www.airbus.com/en/products-services/commercial-aircraft/cabin-and-comfort/welcome-to-airspace-cabin/a220-cabin';
const winglets = 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/winglets/';
export const partFacts = {
  aileron: ['Early aircraft used wing-warping before hinged roll controls became common.', 'The left and right ailerons normally move in opposite directions.', controls],
  slats: ['High-lift devices helped larger aircraft fly safely at lower speeds.', 'Slats and flaps work on different edges of the wing.', nasa],
  flaps: ['Flaps helped heavier aircraft land at slower speeds.', 'Extending them usually adds drag as well as lift.', nasa],
  spoiler: ['Lift-dumping panels became a useful feature of jet airliners.', 'Some aircraft also use spoilers to help control roll.', controls],
  winglets: ['NASA refined modern winglets during the 1970s.', 'Reducing wingtip drag can help save fuel.', winglets],
  cockpit: ['Open-air pilot stations came before enclosed flight decks.', 'Modern flight decks mix screens with physical controls.', faa],
  fuselage: ['Early aircraft bodies often used frames covered with fabric.', '“Fuselage” comes from a French word meaning spindle-shaped.', 'https://www.nasa.gov/wp-content/uploads/2023/06/parts-of-an-airplane-9-12.pdf'],
  windows: ['Cabin windows evolved alongside pressurised passenger aircraft.', 'Large cabin windows bring natural light into the passenger space.', cabin],
  'landing-gear': ['Some early aeroplanes landed on skids rather than wheels.', 'Other aircraft use floats or skis instead of wheels.', faa],
  engines: ['Jet propulsion transformed air travel during the twentieth century.', 'A turbofan sends some air around, rather than through, its engine core.', 'https://www.grc.nasa.gov/www/k-12/airplane/Animation/turbtyp/etft.html'],
  pilot: ['Early aviators flew without today’s electronic flight instruments.', 'Airline crews use checklists to keep routine tasks consistent.', faa],
  yoke: ['Aircraft controls evolved from mechanical connections to electronic systems.', 'Some aircraft use a stick instead of a control wheel.', 'https://www.airbus.com/en/products-services/commercial-aircraft/cockpits'],
  throttle: ['Engine controls developed from simple mechanical linkages.', 'A twin-engine airliner usually has one thrust lever for each engine.', faa],
  display: ['Electronic screens gradually replaced many separate analogue gauges.', 'One display can combine attitude, airspeed and altitude.', faa],
  seats: ['Passenger seating developed as aircraft began carrying travellers.', 'Seat layouts can differ between airlines, even on the same aircraft type.', cabin],
  lights: ['Cabin lighting has evolved from bulbs to LED systems.', 'Modern cabin lighting can change colour.', cabin],
  'vertical-stabilizer': ['Early aviators studied tail surfaces to improve stability.', 'Some aircraft, including the Hornet, have two vertical fins.', nasa],
  'horizontal-stabilizer': ['Tailplanes helped aircraft become more stable in pitch.', 'Some aircraft use a similar surface ahead of the wings instead.', nasa],
  rudder: ['The Wright brothers used a movable rudder on their 1902 glider.', 'Yaw is the side-to-side turning of the aircraft’s nose.', controls],
  elevator: ['Pitch control was central to the Wright brothers’ early designs.', 'Their early pitch-control surface was ahead of the wings.', controls],
};
export function factsFor(part, aircraft) {
  const falcon = 'https://www.lockheedmartin.org/en-us/news/features/history/f16.html';
  if (aircraft === 'f16' && part.id === 'yoke') return ['The F-16 adopted a side-mounted control stick and electronic flight controls.', 'Its stick sits on the pilot’s right console.', falcon];
  if (aircraft === 'f16' && part.id === 'aileron') return ['Designers combined flap and aileron functions in a single surface.', '“Flaperon” combines the words flap and aileron.', faa];
  if (aircraft === 'f16' && part.id === 'slats') return ['Movable leading edges helped fast aircraft manage airflow.', 'Leading-edge flaps change the shape at the front of the wing.', faa];
  if (aircraft === 'f16' && part.id === 'throttle') return ['Engine thrust controls evolved alongside jet propulsion.', 'This single-engine fighter uses one throttle.', falcon];
  if (aircraft === '747' && part.id === 'throttle') return ['Multi-engine aircraft developed separate controls for each engine.', 'The 747 has four thrust levers, one for each engine.', faa];
  if (['hornet', 'f16'].includes(aircraft) && part.id === 'windows') return ['Fighter canopies developed from earlier open pilot stations.', 'A clear canopy gives the pilot a wide view.', 'https://www.nasa.gov/reference/f-18-harv/'];
  if (aircraft === '787' && part.id === 'winglets') return ['Designers have explored many ways to improve wingtip efficiency.', 'An efficient wingtip does not have to stand upright.', winglets];
  if (['hornet', 'f16'].includes(aircraft) && part.id === 'horizontal-stabilizer') return ['Fast jets adopted all-moving horizontal tail surfaces.', 'A stabilator combines the jobs of a stabilizer and elevator.', 'https://www.nasa.gov/reference/f-18-harv/'];
  if (['hornet', 'f16'].includes(aircraft) && part.id === 'seats') return ['Ejection seats were developed to help crews escape fast aircraft.', 'This is emergency equipment, not an ordinary passenger seat.', faa];
  if (['hornet', 'f16'].includes(aircraft) && part.id === 'lights') return ['Cockpit lighting evolved alongside illuminated flight instruments.', 'Instrument lighting helps pilots read their controls after dark.', faa];
  return partFacts[part.id];
}
