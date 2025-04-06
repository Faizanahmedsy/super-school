export const colorSchemes = [
  { baseColor: '#3DB047', hoverColor: '#1B7C22' }, // Lighter Green
  { baseColor: '#E6BC66', hoverColor: '#C49E44' }, // Lighter Dark Yellow
  { baseColor: '#C34141', hoverColor: '#950707' }, // Lighter Brown
  { baseColor: '#D47E33', hoverColor: '#BE6518' }, // Lighter Brown
  { baseColor: '#FFA552', hoverColor: '#F67820' }, // Lighter Brown
];

const tileColorSchemes = [
  { color: 'bg-[#1B7C22]', lightColor: 'bg-[#3DB047]' },
  { color: 'bg-[#C49E44]', lightColor: 'bg-[#E6BC66]' },
  { color: 'bg-[#950707]', lightColor: 'bg-[#C34141]' },
  { color: 'bg-[#BE6518]', lightColor: 'bg-[#D47E33]' },
  { color: 'bg-[#F67820]', lightColor: 'bg-[#FFA552]' },
];


const graphColor = [
  { color: '#1B7C22', lightColor: '#3DB047' },
  { color: '#C49E44', lightColor: '#E6BC66' },
  { color: '#950707', lightColor: '#C34141' },
  { color: '#BE6518', lightColor: '#D47E33' },
  { color: '#F67820', lightColor: '#FFA552' },
];

export const getColorScheme = (index: number) => {
  return tileColorSchemes[index % tileColorSchemes.length];
};

export const getGraphColorScheme = (index: number) => {
  return graphColor[index % graphColor.length];
};