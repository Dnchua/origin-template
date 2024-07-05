package com.orangeforms.common.online.dto;

import com.orangeforms.common.online.model.constant.FieldFilterType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.util.Set;

/**
 * 在线表单数据过滤参数对象。
 *
 * @author Jerry
 * @date 2024-07-02
 */
@Schema(description = "在线表单数据过滤参数对象")
@Data
public class OnlineFilterDto {

    /**
     * 表名。
     */
    @Schema(description = "表名")
    private String tableName;

    /**
     * 过滤字段名。
     */
    @Schema(description = "过滤字段名")
    private String columnName;

    /**
     * 过滤值。
     */
    @Schema(description = "过滤值")
    private Object columnValue;

    /**
     * 范围比较的最小值。
     */
    @Schema(description = "范围比较的最小值")
    private Object columnValueStart;

    /**
     * 范围比较的最大值。
     */
    @Schema(description = "范围比较的最大值")
    private Object columnValueEnd;

    /**
     * 仅当操作符为IN的时候使用。
     */
    @Schema(description = "仅当操作符为IN的时候使用")
    private Set<Serializable> columnValueList;

    /**
     * 过滤类型，参考FieldFilterType常量对象。缺省值就是等于过滤了。
     */
    @Schema(description = "过滤类型")
    private Integer filterType = FieldFilterType.EQUAL_FILTER;

    /**
     * 是否为字典多选。
     */
    @Schema(description = "是否为字典多选")
    private Boolean dictMultiSelect = false;

    /**
     * 是否为Oracle的日期类型。
     */
    private Boolean isOracleDate = false;
}
