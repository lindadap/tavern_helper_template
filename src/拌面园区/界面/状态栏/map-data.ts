import type { CompanyLocation } from '../../schema';

export type RoomIconKey = 'office' | 'bedroom' | 'dorm' | 'desk' | 'dining' | 'medical' | 'arena';

export interface CompanyRoomSpec {
  id: CompanyLocation;
  floor: '3F' | '2F' | '1F' | 'B1';
  shortTitle: string;
  description: string;
  icon: RoomIconKey;
  /** Optional 2D room illustration URL; leave empty to use the CSS blueprint style. */
  imageUrl?: string;
}

export interface FloorBandSpec {
  code: '3F' | '2F' | '1F' | 'B1';
  label: string;
  columns: 1 | 2 | 3;
  rooms: readonly CompanyRoomSpec[];
}

export interface MapOccupant {
  id: string;
  name: string;
  kind: 'player' | 'npc';
  location: string;
}

export const COMPANY_FLOORS: readonly FloorBandSpec[] = [
  {
    code: '3F',
    label: '顶层专属',
    columns: 1,
    rooms: [
      {
        id: '老板办公室',
        floor: '3F',
        shortTitle: '老板办公室',
        description: '顶层专属办公与机密处理空间，安静私密。',
        icon: 'office',
      },
    ],
  },
  {
    code: '2F',
    label: '生活起居',
    columns: 2,
    rooms: [
      {
        id: '老板卧室',
        floor: '2F',
        shortTitle: '老板卧室',
        description: '宽敞私人居所，配柔软大床与独立浴室。',
        icon: 'bedroom',
      },
      {
        id: '异种娘宿舍',
        floor: '2F',
        shortTitle: '异种娘宿舍',
        description: '每人独立的温馨小房间，远胜异种星球百倍。',
        icon: 'dorm',
      },
    ],
  },
  {
    code: '1F',
    label: '日常公共',
    columns: 3,
    rooms: [
      {
        id: '办公区',
        floor: '1F',
        shortTitle: '办公区',
        description: '日常档案翻阅与公司事务处理区域。',
        icon: 'desk',
      },
      {
        id: '餐厅',
        floor: '1F',
        shortTitle: '餐厅',
        description: '明亮用餐区，常飘着现代美食的香气。',
        icon: 'dining',
      },
      {
        id: '医疗室',
        floor: '1F',
        shortTitle: '医疗室',
        description: '尖端纳米修复与外科治疗室，略带消毒水味。',
        icon: 'medical',
      },
    ],
  },
  {
    code: 'B1',
    label: '地下防爆',
    columns: 1,
    rooms: [
      {
        id: '训练场/斗兽场',
        floor: 'B1',
        shortTitle: '训练场 / 斗兽场',
        description: '地下防爆对练场与专属观战台，用于新人训诫与切磋。',
        icon: 'arena',
      },
    ],
  },
] as const;

export const COMPANY_ROOM_MAP: Record<CompanyLocation, CompanyRoomSpec> = COMPANY_FLOORS.flatMap(
  floor => floor.rooms,
).reduce(
  (acc, room) => {
    acc[room.id] = room;
    return acc;
  },
  {} as Record<CompanyLocation, CompanyRoomSpec>,
);
