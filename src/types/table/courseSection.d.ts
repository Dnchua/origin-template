export default interface CourseSection {
  // 主键Id
  sectionId: undefined;
  // 章节名称
  sectionName: undefined;
  // 显示顺序
  showOrder: undefined;
  // 课程Id
  courseId: undefined;
  // 课时数量
  classHour: undefined;
  // 课程附件地址
  attachmentUrl: undefined;
  // 用户Id
  createUserId: undefined;
  // 创建时间
  createTime: undefined;
  // 更新时间
  updateTime: undefined;
  // 级联更新临时id
  __cascade_add_temp_id__: number | string | undefined;
}
