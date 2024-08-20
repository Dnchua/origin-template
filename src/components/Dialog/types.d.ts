export interface DialogProp<T> {
  index: string;
  cancel: () => void;
  submit: (data: T) => void;
}
