/**
 * 部门
 */
export interface SysDept {
  deptId: string;
  deptName: string;
  showOrder: number;
  parentId: string;
}
/**
 * 部门岗位
 */
export interface SysDeptPost {
  postId: string;
  postName: string;
  postLevel: number;
  sysDeptPost: {
    postShowName: string;
    deptId: string;
    deptPostId: string;
    postId: string;
    postShowName: string;
  };
  leaderPost: boolean;
  createTime: string;
}
