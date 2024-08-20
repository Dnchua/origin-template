export default interface Course {
  // 主键Id
  courseId?: string | number;
  // 课程名称
  courseName?: string;
  // 课程价格
  price?: number;
  // 课程描述
  description?: string;
  // 主讲老师
  teacherId?: string | number;
  // 课程难度
  difficulty?: number | string;
  // 是否上架
  online?: boolean;
  // 所属年级
  gradeId?: number | string;
  // 所属科目
  subjectId?: number | string;
  // 课程分类
  categoryId?: number | string;
  // 课时数量
  classHour?: number;
  // 封面图
  pictureUrl?: string;
  // 所属校区
  schoolId?: string | number;
  // 创建用户Id
  createUserId?: string | number;
  // 创建时间
  createTime?: string | Date | number;
  // 最后修改时间
  updateTime?: string | Date | number;
}
