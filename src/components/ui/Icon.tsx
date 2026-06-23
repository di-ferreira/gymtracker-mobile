import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import type { ComponentProps } from 'react';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IoniconsName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color }: IconProps) {
  return <Ionicons name={name} size={size} color={color ?? colors.fg} />;
}
