import React from "react";
import {
  HomeIcon, GridIcon, CalendarIcon, MessageIcon, UserIcon, PlusIcon,
  SearchIcon, XIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon,
  StarIcon, MapPinIcon, PhoneIcon, SettingsIcon, LogOutIcon, GiftIcon,
  HelpCircleIcon, InfoIcon, EditIcon, TrashIcon, ClockIcon, CameraIcon,
  UploadCloudIcon, AlertCircleIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon,
  SendIcon, ArrowLeftIcon, ArrowRightIcon, SlidersIcon, FilterIcon, CheckIcon,
  CheckCircleIcon, XCircleIcon, TrendingUpIcon, AwardIcon, MailIcon, ToolIcon,
  ImageIcon, RefreshCwIcon, MinusIcon, ExternalLinkIcon, TagIcon, DollarSignIcon,
  ShieldIcon, BoxIcon, ZapIcon
} from "./TabBarIcons";

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  home: HomeIcon,
  grid: GridIcon,
  calendar: CalendarIcon,
  message: MessageIcon,
  "message-circle": MessageIcon,
  "message-square": MessageIcon,
  user: UserIcon,
  plus: PlusIcon,
  search: SearchIcon,
  x: XIcon,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-up": ChevronUpIcon,
  star: StarIcon,
  "map-pin": MapPinIcon,
  phone: PhoneIcon,
  settings: SettingsIcon,
  "log-out": LogOutIcon,
  gift: GiftIcon,
  "help-circle": HelpCircleIcon,
  info: InfoIcon,
  edit: EditIcon,
  "edit-2": EditIcon,
  "edit-3": EditIcon,
  trash: TrashIcon,
  "trash-2": TrashIcon,
  clock: ClockIcon,
  camera: CameraIcon,
  "upload-cloud": UploadCloudIcon,
  "alert-circle": AlertCircleIcon,
  "alert-triangle": AlertTriangleIcon,
  eye: EyeIcon,
  "eye-off": EyeOffIcon,
  send: SendIcon,
  "arrow-left": ArrowLeftIcon,
  "arrow-right": ArrowRightIcon,
  sliders: SlidersIcon,
  filter: FilterIcon,
  check: CheckIcon,
  "check-circle": CheckCircleIcon,
  "x-circle": XCircleIcon,
  "trending-up": TrendingUpIcon,
  award: AwardIcon,
  mail: MailIcon,
  tool: ToolIcon,
  image: ImageIcon,
  "refresh-cw": RefreshCwIcon,
  minus: MinusIcon,
  "external-link": ExternalLinkIcon,
  tag: TagIcon,
  "dollar-sign": DollarSignIcon,
  shield: ShieldIcon,
  box: BoxIcon,
  package: BoxIcon,
  zap: ZapIcon,
  wrench: ToolIcon,
  hammer: ToolIcon,
  truck: BoxIcon,
  paintbrush: ToolIcon,
  "paint-bucket": ToolIcon,
  layers: GridIcon,
  cpu: BoxIcon,
  droplet: BoxIcon,
  scissors: ToolIcon,
  briefcase: BoxIcon,
};

export function DynamicIcon({ name, size = 24, color = "#000" }: DynamicIconProps) {
  const IconComponent = iconMap[name] || GridIcon;
  return <IconComponent size={size} color={color} />;
}
