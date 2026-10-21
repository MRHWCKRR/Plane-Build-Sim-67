export const DEPARTURE_DURATION = 30000;
export const DEPARTURE_SOURCE = 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook';

export function departureSteps(id) {
  const fighter = ['hornet', 'f16'].includes(id);
  const stick = id === 'a220' || id === 'f16' ? 'sidestick' : id === 'hornet' ? 'control stick' : 'control yoke';
  return [
    {id:'preparing', at:0, label:'Controls', title:'Flight controls: free and correct', view:'cockpit', detail:`The pilot checks the ${stick} and rudder pedals. Roll, pitch and yaw controls must respond in the correct direction before departure.`},
    {id:'flaps', at:3500, label:'Flaps set', title: fighter ? 'Set the takeoff wing configuration' : 'Set takeoff flaps and leading-edge devices', view:'exterior', detail: id === 'f16' ? 'The F-16 uses leading-edge flaps and flaperons. Its flight-control system schedules wing surfaces for takeoff; it does not use an airliner’s flap-and-slat arrangement.' : fighter ? 'The Hornet uses a takeoff flap setting. Its flight-control system coordinates the wing surfaces to help produce lift at lower speeds.' : 'Takeoff flaps reshape the wing to produce more lift at lower speeds. Leading-edge devices also help; the chosen setting depends on the aircraft and departure conditions.'},
    {id:'ready', at:7000, label:'Ready', title: fighter ? 'Pilot secure. Runway ready.' : 'Cabin secure. Runway ready.', view:'cockpit', detail: fighter ? 'The pilot checks the harness, canopy and instruments. Before the runway roll, the departure plan and takeoff clearance are confirmed.' : 'The crew confirms the cabin is secure, checks instruments and reviews the departure plan. Takeoff clearance is confirmed before starting the runway roll.'},
    {id:'thrust', at:9500, label:'Thrust', title:'Engines stabilised. Takeoff thrust set.', view:'cockpit', detail: `The ${id === 'f16' ? 'throttle controls the single engine' : id === '747' ? 'four thrust levers control the four engines' : 'thrust levers control the engines'}. The pilot checks engine indications as takeoff power builds.`},
    {id:'rolling', at:12000, label:'Runway roll', title:'Accelerate along the centreline', view:'exterior', detail:'Engine thrust accelerates the aircraft. Airflow over the wings increases as speed builds. The pilot monitors airspeed and keeps the aircraft aligned with the runway.'},
    {id:'rotating', at:16000, label:'Rotate', title:'Rotate: gently raise the nose', view:'tail', detail:`At the planned rotation speed, the pilot uses the ${stick} to command pitch. ${fighter ? 'The stabilators' : 'The elevators'} help raise the nose, increasing the wing’s angle to the airflow.`},
    {id:'climbing', at:19000, label:'Climb', title:'Liftoff. Confirm a positive climb.', view:'exterior', detail:'The wheels leave the runway as the wings support the aircraft. The crew checks that the aircraft is gaining altitude: a positive rate of climb. The gear stays down until that climb is confirmed.'},
    {id:'gear', at:22000, label:'Gear up', title:'Positive climb: retract the landing gear', view:'exterior', detail:'Once safely climbing and clear of the runway, the crew selects gear up. The wheels and struts fold into their bays, reducing drag. Gear indications confirm retraction.'},
    {id:'cleanup', at:25000, label: fighter ? 'Climb config' : 'Flaps up', title: fighter ? 'Wing surfaces adjust for the climb' : 'Accelerate, then retract flaps in stages', view:'exterior', detail: fighter ? 'As the fighter accelerates, its wing configuration changes for the climb. The flight-control system helps schedule the surfaces; the exact sequence differs from an airliner.' : 'Flaps stay out while their extra lift is needed. At the appropriate speed and height, the crew retracts them in stages and checks climb power, reducing drag as speed increases.'},
    {id:'airborne', at:28000, label:'Airborne', title:'You’re airborne!', view:'exterior', detail:'Gear up, departure checks complete. The aircraft continues its climb with the wing configuration and engine power suited to the next part of the flight.'},
  ];
}
export function departureIndex(steps, time) {
  for (let i = steps.length - 1; i >= 0; i--) if (time >= steps[i].at) return i;
  return 0;
}
