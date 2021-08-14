package com.orange.demo.webadmin.app.dto;

import com.orange.demo.common.core.validator.UpdateGroup;
import com.orange.demo.common.core.validator.ConstDictRef;
import com.orange.demo.webadmin.app.model.constant.ClassLevel;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.*;

/**
 * StudentClassDto对象。
 *
 * @author Jerry
 * @date 2020-09-24
 */
@ApiModel("StudentClassDto对象")
@Data
public class StudentClassDto {

    /**
     * 班级Id。
     */
    @ApiModelProperty(value = "班级Id", required = true)
    @NotNull(message = "数据验证失败，班级Id不能为空！", groups = {UpdateGroup.class})
    private Long classId;

    /**
     * 班级名称。
     */
    @ApiModelProperty(value = "班级名称", required = true)
    @NotBlank(message = "数据验证失败，班级名称不能为空！")
    private String className;

    /**
     * 学校Id。
     */
    @ApiModelProperty(value = "学校Id", required = true)
    @NotNull(message = "数据验证失败，所属校区不能为空！")
    private Long schoolId;

    /**
     * 学生班长Id。
     */
    @ApiModelProperty(value = "学生班长Id", required = true)
    @NotNull(message = "数据验证失败，学生班长不能为空！")
    private Long leaderId;

    /**
     * 已完成课时数量。
     */
    @ApiModelProperty(value = "已完成课时数量", required = true)
    @NotNull(message = "数据验证失败，已完成课时不能为空！", groups = {UpdateGroup.class})
    private Integer finishClassHour;

    /**
     * 班级级别(0: 初级班 1: 培优班 2: 冲刺提分班 3: 竞赛班)。
     */
    @ApiModelProperty(value = "班级级别(0: 初级班 1: 培优班 2: 冲刺提分班 3: 竞赛班)", required = true)
    @NotNull(message = "数据验证失败，班级级别不能为空！")
    @ConstDictRef(constDictClass = ClassLevel.class, message = "数据验证失败，班级级别为无效值！")
    private Integer classLevel;
}
