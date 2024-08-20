export type loginParam = {
  loginName: string;
  password: string | null | undefined;
  captchaVerification: string | null | undefined;
};

export interface LoginUserInfo {
  showName: string;
  permCodeList: Array<string>;
  menuList?: Array<MenuItem>;
  userType: number;
  isAdmin: boolean;
  deptName: string;
  tokenData?: string;
  headImageUrl: (string & { downloadUri: string; filename: string }) | null;
}
