export interface Asteroid {
  id: string;
  name: string;
  designation: string;
  diameter: number; // meters
  velocity: number; // km/s
  distance: number; // million km
  impactProbability: number; // 0-1
  closeApproachDate: string;
  mass: number; // kg (calculated from diameter assuming density of 2000 kg/m³)
  discoveryDate: string;
  orbitalPeriod: number; // years
  semiMajorAxis: number; // AU (astronomical units from Sun)
  eccentricity: number; // orbital eccentricity (0 = circular, closer to 1 = more elliptical)
  inclination: number; // degrees from ecliptic plane
  torinoScale: number;
  palermoScale: number;
  isCustom?: boolean; // flag for user-created asteroids
}

export interface DefenseStrategy {
  id: string;
  name: string;
  code: string;
  successRate: number; // 0-1
  leadTime: number; // years required
  costBillion: number; // USD billions
  description: string;
  pros: string[];
  cons: string[];
  effectiveness: {
    small: number; // <100m
    medium: number; // 100-500m
    large: number; // >500m
  };
  techReadiness: number; // 1-9 TRL scale
}

export interface SpaceAgency {
  id: string;
  name: string;
  code: string;
  contribution: number; // percentage
  color: string;
  headquarters: string;
  capabilities: string[];
}

// Calculate mass from diameter (assuming spherical asteroid with density 2000 kg/m³)
export const calculateMass = (diameter: number): number => {
  const radius = diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  return volume * 2000; // 2000 kg/m³ density
};

export const asteroids: Asteroid[] = [
  {
    id: "2024-yr4",
    name: "2024 YR4",
    designation: "2024 YR4",
    diameter: 55,
    velocity: 18.5,
    distance: 0.0038,
    impactProbability: 0.012,
    closeApproachDate: "2032-12-22",
    mass: calculateMass(55),
    discoveryDate: "2024-12-27",
    orbitalPeriod: 2.47,
    semiMajorAxis: 1.83, // AU - Apollo-type orbit
    eccentricity: 0.52,
    inclination: 3.4,
    torinoScale: 3,
    palermoScale: -1.8,
  },
  {
    id: "apophis",
    name: "Apophis",
    designation: "99942 Apophis",
    diameter: 370,
    velocity: 30.7,
    distance: 0.031,
    impactProbability: 0.000027,
    closeApproachDate: "2029-04-13",
    mass: calculateMass(370),
    discoveryDate: "2004-06-19",
    orbitalPeriod: 0.89,
    semiMajorAxis: 0.92, // AU - Aten-type, inside Earth orbit
    eccentricity: 0.19,
    inclination: 3.3,
    torinoScale: 0,
    palermoScale: -3.2,
  },
  {
    id: "2023-dw",
    name: "2023 DW",
    designation: "2023 DW",
    diameter: 50,
    velocity: 24.6,
    distance: 0.0012,
    impactProbability: 0.0029,
    closeApproachDate: "2046-02-14",
    mass: calculateMass(50),
    discoveryDate: "2023-02-26",
    orbitalPeriod: 1.59,
    semiMajorAxis: 1.36, // AU - Apollo-type
    eccentricity: 0.29,
    inclination: 0.6,
    torinoScale: 1,
    palermoScale: -2.4,
  },
  {
    id: "2021-qm1",
    name: "2021 QM1",
    designation: "2021 QM1",
    diameter: 50,
    velocity: 19.8,
    distance: 0.0052,
    impactProbability: 0.00014,
    closeApproachDate: "2052-04-02",
    mass: calculateMass(50),
    discoveryDate: "2021-08-28",
    orbitalPeriod: 1.23,
    semiMajorAxis: 1.15, // AU - Apollo-type
    eccentricity: 0.22,
    inclination: 8.5,
    torinoScale: 1,
    palermoScale: -2.8,
  },
  {
    id: "2018-vp1",
    name: "2018 VP1",
    designation: "2018 VP1",
    diameter: 2,
    velocity: 9.7,
    distance: 0.0042,
    impactProbability: 0.0041,
    closeApproachDate: "2024-11-02",
    mass: calculateMass(2),
    discoveryDate: "2018-11-03",
    orbitalPeriod: 2.0,
    semiMajorAxis: 1.59, // AU - Apollo-type
    eccentricity: 0.43,
    inclination: 2.1,
    torinoScale: 0,
    palermoScale: -8.5,
  },
  {
    id: "bennu",
    name: "Bennu",
    designation: "101955 Bennu",
    diameter: 492,
    velocity: 28.0,
    distance: 0.0037,
    impactProbability: 0.00037,
    closeApproachDate: "2182-09-24",
    mass: calculateMass(492),
    discoveryDate: "1999-09-11",
    orbitalPeriod: 1.20,
    semiMajorAxis: 1.13, // AU - Apollo-type
    eccentricity: 0.20,
    inclination: 6.0,
    torinoScale: 0,
    palermoScale: -1.7,
  },
];

export const defenseStrategies: DefenseStrategy[] = [
  {
    id: "kinetic",
    name: "Kinetic Impactor",
    code: "DART",
    successRate: 0.85,
    leadTime: 5,
    costBillion: 0.33,
    description: "High-velocity spacecraft impact to alter asteroid trajectory through momentum transfer. Proven technology from NASA's DART mission.",
    pros: [
      "Proven technology (DART mission success)",
      "Relatively low cost",
      "No nuclear materials required",
      "Can be scaled for different targets",
    ],
    cons: [
      "Requires years of lead time",
      "Less effective on large asteroids",
      "May fragment rubble-pile asteroids",
      "Single-shot approach",
    ],
    effectiveness: { small: 0.95, medium: 0.75, large: 0.35 },
    techReadiness: 9,
  },
  {
    id: "gravity",
    name: "Gravity Tractor",
    code: "GRAV",
    successRate: 0.72,
    leadTime: 20,
    costBillion: 1.2,
    description: "Spacecraft maintains position near asteroid, using gravitational attraction to slowly alter its trajectory over extended periods.",
    pros: [
      "Non-destructive approach",
      "Precise trajectory control",
      "Works on any asteroid type",
      "No risk of fragmentation",
    ],
    cons: [
      "Requires decades of lead time",
      "High fuel requirements",
      "Slow deflection rate",
      "Complex station-keeping",
    ],
    effectiveness: { small: 0.90, medium: 0.65, large: 0.40 },
    techReadiness: 5,
  },
  {
    id: "nuclear",
    name: "Nuclear Deflection",
    code: "NUKE",
    successRate: 0.78,
    leadTime: 2,
    costBillion: 5.0,
    description: "Nuclear detonation near asteroid surface vaporizes material, creating thrust to deflect trajectory. Last resort for short-warning scenarios.",
    pros: [
      "Works with short lead time",
      "High energy delivery",
      "Effective on large asteroids",
      "Can handle emergencies",
    ],
    cons: [
      "Political/legal challenges",
      "Risk of fragmentation",
      "Untested on asteroids",
      "Radiation concerns",
    ],
    effectiveness: { small: 0.70, medium: 0.85, large: 0.80 },
    techReadiness: 4,
  },
  {
    id: "laser",
    name: "Laser Ablation",
    code: "LASR",
    successRate: 0.65,
    leadTime: 10,
    costBillion: 8.5,
    description: "Concentrated laser beams vaporize asteroid surface material, creating continuous thrust through mass ejection.",
    pros: [
      "Continuous thrust application",
      "No physical contact needed",
      "Can adjust deflection in real-time",
      "Scalable power systems",
    ],
    cons: [
      "Power generation challenges",
      "Distance limitations",
      "Unproven at scale",
      "High development cost",
    ],
    effectiveness: { small: 0.85, medium: 0.55, large: 0.25 },
    techReadiness: 3,
  },
];

export const spaceAgencies: SpaceAgency[] = [
  {
    id: "nasa",
    name: "National Aeronautics and Space Administration",
    code: "NASA",
    contribution: 45,
    color: "hsl(210, 100%, 50%)",
    headquarters: "Washington D.C., USA",
    capabilities: ["Kinetic Impactor", "Deep Space Tracking", "Mission Control"],
  },
  {
    id: "esa",
    name: "European Space Agency",
    code: "ESA",
    contribution: 30,
    color: "hsl(45, 100%, 50%)",
    headquarters: "Paris, France",
    capabilities: ["Hera Mission", "Radar Tracking", "Trajectory Analysis"],
  },
  {
    id: "jaxa",
    name: "Japan Aerospace Exploration Agency",
    code: "JAXA",
    contribution: 15,
    color: "hsl(0, 100%, 50%)",
    headquarters: "Tokyo, Japan",
    capabilities: ["Sample Return", "Ion Propulsion", "Surface Analysis"],
  },
  {
    id: "isro",
    name: "Indian Space Research Organisation",
    code: "ISRO",
    contribution: 5,
    color: "hsl(30, 100%, 50%)",
    headquarters: "Bengaluru, India",
    capabilities: ["Cost-Effective Launches", "Orbital Mechanics", "Communications"],
  },
  {
    id: "roscosmos",
    name: "Roscosmos State Corporation",
    code: "ROSCOSMOS",
    contribution: 5,
    color: "hsl(120, 100%, 35%)",
    headquarters: "Moscow, Russia",
    capabilities: ["Heavy Lift", "Nuclear Systems", "EVA Operations"],
  },
];

// Physics calculations
export const calculateImpactEnergy = (mass: number, velocity: number): number => {
  // E = 0.5 × mass × velocity² in Joules, convert to Megatons TNT
  const velocityMs = velocity * 1000; // km/s to m/s
  const energyJoules = 0.5 * mass * velocityMs * velocityMs;
  const megatonsTNT = energyJoules / (4.184e15); // 1 megaton = 4.184e15 J
  return megatonsTNT;
};

export const calculateDamageRadius = (energyMT: number): number => {
  // Simplified damage radius calculation in km
  // Based on nuclear weapon scaling: R ∝ E^(1/3)
  return Math.pow(energyMT, 1/3) * 2.5;
};

export const getTorinoDescription = (scale: number): string => {
  const descriptions: Record<number, string> = {
    0: "No hazard - likelihood of collision zero or well below chance of random object striking Earth",
    1: "Normal - a routine discovery with pass near Earth posing no unusual level of danger",
    2: "Meriting attention - somewhat close but not highly unusual encounter; collision very unlikely",
    3: "Meriting attention - close encounter with 1% or greater chance of collision causing local destruction",
    4: "Meriting attention - close encounter with 1% or greater chance of regional devastation",
    5: "Threatening - close encounter with significant threat of regional devastation",
    6: "Threatening - close encounter with significant threat of global catastrophe",
    7: "Threatening - very close encounter with extremely significant threat of global catastrophe",
    8: "Certain collision - collision capable of causing localized destruction",
    9: "Certain collision - collision capable of causing unprecedented regional devastation",
    10: "Certain collision - collision capable of causing global climatic catastrophe",
  };
  return descriptions[scale] || "Unknown classification";
};

export const getMissionPhases = () => [
  { id: 1, name: "DETECTION", duration: "T-5 Years", description: "Asteroid identified and tracked by global observation network" },
  { id: 2, name: "ASSESSMENT", duration: "T-4 Years", description: "Threat analysis and international coordination initiated" },
  { id: 3, name: "PREPARATION", duration: "T-3 Years", description: "Defense mission designed and spacecraft constructed" },
  { id: 4, name: "LAUNCH", duration: "T-1 Year", description: "Deflection spacecraft launched toward intercept trajectory" },
  { id: 5, name: "INTERCEPT", duration: "T-0", description: "Defense system engages target asteroid" },
];
