package com.orangeforms.webadmin.upms.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 数据权限与菜单关联Dto。
 *
 * @author Jerry
 * @date 2024-07-02
 */
@Schema(description = "数据权限与菜单关联Dto")
@Data
public class SysDataPermMenuDto {

    /**
     * 数据权限Id。
     */
    @Schema(description = "数据权限Id", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long dataPermId;

    /**
     * 关联菜单Id。
     */
    @Schema(description = "关联菜单Id", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long menuId;
}