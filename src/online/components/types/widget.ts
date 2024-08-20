import { ANY_OBJECT } from '@/types/generic';

export interface WidgetProps {
  widget: ANY_OBJECT;
  isEdit?: boolean;
}

export interface WidgetEmit {
  (event: 'widgetClick', value: ANY_OBJECT | null): void;
  (event: 'update:widget', value: ANY_OBJECT | ANY_OBJECT[]): void;
}
