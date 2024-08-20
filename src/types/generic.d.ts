/**
 * 解决eslint不支持{generic}语法的问题
 */
export type T = ANY_OBJECT;

export type ANY_OBJECT = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
