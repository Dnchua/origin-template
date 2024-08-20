export interface DictCode {
  dictCode: string;
  dictId: string;
  dictName: string;
}

export interface DictCodeItem {
  name: string;
  itemId: string;
  showOrder: number;
  id: string;
  status: number;
  parentId?: string;
}
