export interface Dealer {
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export const DEALERS: Dealer[] = [
  {
    name: 'Ford Morumbi',
    address: 'Av. das Nações Unidas, 12995, São Paulo, SP',
    lat: -23.6197,
    lng: -46.6997,
    phone: '(11) 3000-1234',
    hours: 'Mon–Fri 8am–6pm, Sat 8am–1pm',
  },
  {
    name: 'Ford Santo André',
    address: 'Av. Industrial, 600, Santo André, SP',
    lat: -23.6654,
    lng: -46.5285,
    phone: '(11) 4444-5678',
    hours: 'Mon–Fri 8am–6pm, Sat 8am–1pm',
  },
  {
    name: 'Ford Tatuapé',
    address: 'R. Tuiuti, 3155, São Paulo, SP',
    lat: -23.5403,
    lng: -46.5731,
    phone: '(11) 2222-3456',
    hours: 'Mon–Fri 8am–6pm, Sat 8am–1pm',
  },
];
