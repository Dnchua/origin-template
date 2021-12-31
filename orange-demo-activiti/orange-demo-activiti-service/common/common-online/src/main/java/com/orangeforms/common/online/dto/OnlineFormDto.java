package com.orangeforms.common.online.dto;

import com.orangeforms.common.core.validator.ConstDictRef;
import com.orangeforms.common.core.validator.UpdateGroup;
import com.orangeforms.common.online.model.constant.FormKind;
import com.orangeforms.common.online.model.constant.FormType;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

/**
 * 在线表单Dto对象。
 *
 * @author Jerry
 * @date 2021-06-06
 */
@ApiModel("在线表单Dto对象")
@Data
public class OnlineFormDto {

    /**
     * 主键Id。
     */
    @ApiModelProperty(value = "主键Id")
    @NotNull(message = "数据验证失败，主键Id不能为空！", groups = {UpdateGroup.class})
    private Long formId;

    /**
     * 页面id。
     */
    @ApiModelProperty(value = "页面id")
    @NotNull(message = "数据验证失败，页面id不能为空！")
    private Long pageId;

    /**
     * 表单编码。
     */
    @ApiModelProperty(value = "表单编码")
    private String formCode;

    /**
     * 表单名称。
     */
    @ApiModelProperty(value = "表单名称")
    @NotBlank(message = "数据验证失败，表单名称不能为空！")
    private String formName;

    /**
     * 表单类别。
     */
    @ApiModelProperty(value = "表单类别")
    @NotNull(message = "数据验证失败，表单类别不能为空！")
    @ConstDictRef(constDictClass = FormKind.class, message = "数据验证失败，表单类别为无效值！")
    private Integer formKind;

    /**
     * 表单类型。
     */
    @ApiModelProperty(value = "表单类型")
    @NotNull(message = "数据验证失败，表单类型不能为空！")
    @ConstDictRef(constDictClass = FormType.class, message = "数据验证失败，表单类型为无效值！")
    private Integer formType;

    /**
     * 表单主表id。
     */
    @ApiModelProperty(value = "表单主表id")
    @NotNull(message = "数据验证失败，表单主表id不能为空！")
    private Long masterTableId;

    /**
     * 当前表单关联的数据源Id集合。
     */
    @ApiModelProperty(value = "当前表单关联的数据源Id集合")
    private List<Long> datasourceIdList;

    /**
     * 表单组件JSON。
     */
    @ApiModelProperty(value = "表单组件JSON")
    private String widgetJson;

    /**
     * 表单参数JSON。
     */
    @ApiModelProperty(value = "表单参数JSON")
    private String paramsJson;
}
