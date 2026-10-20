export const views = [
  { id: 'exterior', name: 'Exterior', subtitle: 'Around the aircraft', short: 'Outside', icon: '↗', description: 'Start with the big picture. Discover the body, wings and engines.', alt: 'White and blue passenger jet on an airport apron, seen from the front left.' },
  { id: 'cockpit', name: 'Cockpit', subtitle: 'Take the front seat', short: 'Flight deck', icon: '◉', description: 'Step onto the flight deck and get to know the pilot’s controls.', alt: 'Passenger jet cockpit with a pilot, control yokes, thrust levers and flight displays.' },
  { id: 'cabin', name: 'Cabin', subtitle: 'Make yourself at home', short: 'Passenger cabin', icon: '▤', description: 'A comfortable flight starts with the details inside.', alt: 'Bright passenger cabin with blue seats and overhead reading lights.' },
  { id: 'tail', name: 'Tail', subtitle: 'The finer details', short: 'Tail assembly', icon: '⊥', description: 'Explore the surfaces that keep an aircraft steady and steer its nose.', alt: 'Close-up of a blue vertical tail and white horizontal tail surfaces.' },
];

// Coordinates are percentages of the full 3:2 source image, shared by artwork and markers.
export const parts = [
  { id: 'aileron', name: 'Aileron', view: 'exterior', x: 83, y: 54, dx: 5, dy: 9, definition: 'Moves on the outer wing’s trailing edge to control roll.', hint: 'Find the movable panel near the outer back edge of the wing.' },
  { id: 'slats', name: 'Slats', view: 'exterior', x: 75, y: 53, dx: 3, dy: -10, definition: 'Leading-edge devices that help the wing lift at low speeds.', hint: 'Look along the front edge of the wing.' },
  { id: 'flaps', name: 'Flaps', view: 'exterior', x: 64, y: 58, dx: 6, dy: 13, definition: 'Trailing-edge panels that increase lift and drag at low speeds.', hint: 'Look behind the wing, closer to the fuselage than the aileron.' },
  { id: 'spoiler', name: 'Spoiler', view: 'exterior', x: 67, y: 55, dx: -1, dy: -11, definition: 'A wing-top panel that reduces lift and increases drag.', hint: 'Find a panel on the top surface of the wing.' },
  { id: 'winglets', name: 'Winglets', view: 'exterior', x: 95, y: 45, dx: -1, dy: -5, definition: 'Wingtip extensions that reduce drag caused by wingtip vortices.', hint: 'Find the upturned tip at the end of the wing.' },
  { id: 'cockpit', name: 'Cockpit', view: 'exterior', x: 15, y: 60, dx: -7, dy: -9, definition: 'The forward compartment where pilots operate the aircraft.', hint: 'Look at the windshield near the nose.' },
  { id: 'fuselage', name: 'Fuselage', view: 'exterior', x: 45, y: 49, dx: 0, dy: -12, definition: 'The main body holding the cockpit, cabin and cargo.', hint: 'Find the long central body of the aircraft.' },
  { id: 'windows', name: 'Windows', view: 'exterior', x: 35, y: 55, dx: -5, dy: -10, definition: 'Glazed openings that let people see outside.', hint: 'Look for the row of small openings along the body.' },
  { id: 'landing-gear', name: 'Landing gear', view: 'exterior', x: 17, y: 78, dx: 6, dy: 6, definition: 'Wheels and supports used on the ground.', hint: 'Look underneath the aircraft for its wheels.' },
  { id: 'engines', name: 'Turbofan engines', view: 'exterior', x: 51, y: 66, dx: 0, dy: 12, definition: 'Fan-driven jet engines that produce thrust to move the aircraft.', hint: 'Find the large round engine beneath a wing.' },
  { id: 'pilot', name: 'Pilot', view: 'cockpit', x: 17, y: 55, dx: 3, dy: 14, definition: 'The trained person who operates and flies the aircraft.', hint: 'Look for the person sitting at the left controls.' },
  { id: 'yoke', name: 'Control yoke', view: 'cockpit', x: 75, y: 56, dx: 8, dy: 13, definition: 'A hand control for pitch and roll.', hint: 'Find the wheel-shaped control in front of the right seat.' },
  { id: 'throttle', name: 'Thrust levers', view: 'cockpit', x: 50, y: 70, dx: 5, dy: 14, definition: 'Levers that set engine thrust.', hint: 'Look for the paired levers between the two pilot seats.' },
  { id: 'display', name: 'Primary flight display', view: 'cockpit', x: 72, y: 46, dx: -6, dy: -11, definition: 'Shows key flight information such as attitude, airspeed and altitude.', hint: 'Look for the screen in front of a pilot with a blue and brown horizon.' },
  { id: 'seats', name: 'Seats', view: 'cabin', x: 25, y: 73, dx: 6, dy: -9, definition: 'Support passengers while seated during a flight.', hint: 'Find a blue passenger seat near the camera.' },
  { id: 'lights', name: 'Cabin lights', view: 'cabin', x: 21, y: 18, dx: -7, dy: 4, definition: 'Illuminate the passenger area for comfort and visibility.', hint: 'Look above the seats, near the overhead panels.' },
  { id: 'vertical-stabilizer', name: 'Vertical stabilizer', view: 'tail', x: 50, y: 30, dx: -13, dy: -4, definition: 'The upright tail surface that provides directional stability.', hint: 'Find the large upright blue fin.' },
  { id: 'horizontal-stabilizer', name: 'Horizontal stabilizer', view: 'tail', x: 25, y: 74, dx: -11, dy: -13, definition: 'The horizontal tail surface that provides pitch stability.', hint: 'Find a fixed horizontal surface extending out from the tail.' },
  { id: 'rudder', name: 'Rudder', view: 'tail', x: 56, y: 33, dx: 12, dy: 5, definition: 'The movable vertical-tail surface that controls yaw.', hint: 'Find the movable trailing edge of the upright tail.' },
  { id: 'elevator', name: 'Elevator', view: 'tail', x: 26, y: 82, dx: 11, dy: -2, definition: 'The movable horizontal-tail surface that controls pitch.', hint: 'Look for the hinged trailing edge of a horizontal tail surface.' },
];

export const TOTAL_MATCHES = parts.length * 2;
export const SOURCE_URL = 'https://www.faa.gov/regulations_policies/handbooks_manuals/aviation';
