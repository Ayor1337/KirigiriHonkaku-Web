import type {
  SceneMapSnapshot,
  SceneLocation,
  ReachableLocation,
} from "../types/api";

export const mockMapSnapshot: SceneMapSnapshot = {
  map_name: "雾切洋馆",
  locations: [
    {
      key: "hall",
      name: "大厅",
      view_x: 0,
      view_y: 0,
      view_icon: "◎",
      is_locked: false,
    },
    {
      key: "study",
      name: "书房",
      view_x: 160,
      view_y: -80,
      view_icon: "◆",
      is_locked: false,
    },
    {
      key: "garden",
      name: "庭院",
      view_x: -140,
      view_y: 80,
      view_icon: "◆",
      is_locked: false,
    },
    {
      key: "basement",
      name: "地下室",
      view_x: 120,
      view_y: 140,
      view_icon: "◆",
      is_locked: true,
    },
    {
      key: "tower",
      name: "塔楼",
      view_x: -60,
      view_y: -140,
      view_icon: "◆",
      is_locked: false,
    },
  ],
  connections: [
    {
      from_key: "hall",
      to_key: "study",
      connection_type: "main",
      is_locked: false,
    },
    {
      from_key: "hall",
      to_key: "garden",
      connection_type: "main",
      is_locked: false,
    },
    {
      from_key: "hall",
      to_key: "basement",
      connection_type: "locked",
      is_locked: true,
    },
    {
      from_key: "hall",
      to_key: "tower",
      connection_type: "main",
      is_locked: false,
    },
    {
      from_key: "study",
      to_key: "tower",
      connection_type: "secret",
      is_locked: false,
    },
  ],
};

export const mockCurrentLocation: SceneLocation = {
  key: "hall",
  name: "大厅",
  description: "洋馆的核心区域",
};

export const mockReachableLocations: ReachableLocation[] = [
  { key: "study", name: "书房" },
  { key: "garden", name: "庭院" },
];
