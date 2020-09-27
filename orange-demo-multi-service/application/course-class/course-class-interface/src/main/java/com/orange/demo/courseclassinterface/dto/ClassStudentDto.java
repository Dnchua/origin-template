package com.orange.demo.courseclassinterface.dto;

import com.orange.demo.common.core.validator.UpdateGroup;

import lombok.Data;

import javax.validation.constraints.*;

/**
 * ClassStudentDto对象。
 *
 * @author Jerry
 * @date 2020-09-27
 */
@Data
public class ClassStudentDto {

    /**
     * 班级Id。
     */
    @NotNull(message = "数据验证失败，班级Id不能为空！", groups = {UpdateGroup.class})
    private Long classId;

    /**
     * 学生Id。
     */
    @NotNull(message = "数据验证失败，学生Id不能为空！", groups = {UpdateGroup.class})
    private Long studentId;
}
